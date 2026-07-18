'use client'

// Host-facing UI for the QR print packs. Renders all three SVG templates (the
// active one visibly, the others hidden but mounted so they can still be
// serialized for the full-pack PDF), lets the host tweak the copy / date / time
// and pick a colour, then exports via the helpers in lib/qr-pack.ts. Lazy-loaded
// from the dashboard so jsPDF and the templates only ship when opened.

import { useMemo, useRef, useState } from 'react'
import { formatEventDate, formatEventTime } from '@/lib/utils'
import {
  TEMPLATES, getTemplate, defaultCopy, packFileName, packBundleName,
  svgToPngBlob, buildPackPdf, downloadBlob,
  type TemplateId, type PackVariant, type PackData,
} from '@/lib/qr-pack'
import { TEMPLATE_COMPONENTS } from './templates'

interface EventLike {
  title: string
  slug: string
  event_date: string | null
  event_time: string | null
  timezone: string | null
  location: string | null
}

const VARIANTS: { id: PackVariant; label: string; swatch: string }[] = [
  { id: 'cream', label: 'Cream', swatch: '#F7E7CE' },
  { id: 'olive', label: 'Olive', swatch: '#556B2F' },
]

const label: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
  letterSpacing: '0.03em', textTransform: 'uppercase',
}

const field: React.CSSProperties = {
  width: '100%', backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border)', borderRadius: '0.625rem',
  padding: '0.625rem 0.75rem', color: 'var(--text-primary)',
  fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
}

const actionBtn: React.CSSProperties = {
  flex: 1, border: '1px solid var(--border)', borderRadius: '0.75rem',
  padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600,
  color: 'var(--text-muted)', background: 'none', cursor: 'pointer',
  minHeight: '48px', whiteSpace: 'nowrap',
}

export default function QrPackModal({ event, qrValue, onClose }: {
  event: EventLike
  qrValue: string
  onClose: () => void
}) {
  const svgRefs = useRef<Record<TemplateId, SVGSVGElement | null>>({ welcome: null, table: null, poster: null })
  const [active, setActive] = useState<TemplateId>('welcome')
  const [variant, setVariant] = useState<PackVariant>('cream')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Per-template heading/message (defaults differ); date/time/location/label are
  // shared across the whole pack.
  const [copy, setCopy] = useState<Record<TemplateId, { heading: string; message: string }>>(() => ({
    welcome: defaultCopy('welcome', event.title),
    table: defaultCopy('table', event.title),
    poster: defaultCopy('poster', event.title),
  }))
  const [dateLabel, setDateLabel] = useState(event.event_date ? formatEventDate(event.event_date) : '')
  const [timeLabel, setTimeLabel] = useState(formatEventTime(event.event_date, event.event_time, event.timezone))
  const [location, setLocation] = useState(event.location ?? '')
  const [tableLabel, setTableLabel] = useState('Table 1')

  const buildData = (id: TemplateId): PackData => ({
    heading: copy[id].heading,
    message: copy[id].message,
    dateLabel, timeLabel, location,
    label: tableLabel,
  })

  const activeTemplate = getTemplate(active)
  const serialize = (id: TemplateId): string | null => {
    const el = svgRefs.current[id]
    return el ? new XMLSerializer().serializeToString(el) : null
  }

  async function run(key: string, fn: () => Promise<void>) {
    setError(null)
    setBusy(key)
    try {
      await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(null)
    }
  }

  const exportPng = () => run('png', async () => {
    const svg = serialize(active)
    if (!svg) throw new Error('The design is not ready yet')
    const blob = await svgToPngBlob(svg, activeTemplate.piece)
    downloadBlob(blob, packFileName(event.slug, active, variant, 'png'))
  })

  const exportPdf = () => run('pdf', async () => {
    const svg = serialize(active)
    if (!svg) throw new Error('The design is not ready yet')
    await buildPackPdf([{ svg, template: activeTemplate }], packFileName(event.slug, active, variant, 'pdf'))
  })

  const exportPack = () => run('pack', async () => {
    const pieces = TEMPLATES.map(t => {
      const svg = serialize(t.id)
      if (!svg) throw new Error('The designs are not ready yet')
      return { svg, template: t }
    })
    await buildPackPdf(pieces, packBundleName(event.slug, variant))
  })

  const tabBtn = (id: TemplateId): React.CSSProperties => ({
    flex: 1, padding: '0.5rem 0.25rem', borderRadius: '0.625rem',
    border: `1px solid ${active === id ? 'var(--accent)' : 'var(--border)'}`,
    background: active === id ? 'var(--accent)' : 'none',
    color: active === id ? '#F7E7CE' : 'var(--text-muted)',
    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', minHeight: '44px',
  })

  const previews = useMemo(() => TEMPLATES.map(t => {
    const Comp = TEMPLATE_COMPONENTS[t.id]
    return (
      <div key={t.id} style={t.id === active ? {} : { display: 'none' }}>
        <Comp
          ref={el => { svgRefs.current[t.id] = el }}
          data={buildData(t.id)}
          variant={variant}
          qrValue={qrValue}
        />
      </div>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [active, variant, qrValue, copy, dateLabel, timeLabel, location, tableLabel])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        className="chrome-surface"
        onClick={e => e.stopPropagation()}
        style={{
          border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem',
          width: '100%', maxWidth: '760px', maxHeight: '92vh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>QR print pack</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
              Print-ready signs, table cards & posters — auto-filled from your event.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem 0.5rem' }}>✕</button>
        </div>

        {/* Template tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={tabBtn(t.id)}>{t.name}</button>
          ))}
        </div>

        <div style={{
          display: 'grid', gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr)',
        }}>
          {/* Preview */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
            background: 'var(--bg-input)', borderRadius: '0.75rem', padding: '1rem',
            border: '1px solid var(--border)',
          }}>
            <div style={{ maxHeight: '46vh', maxWidth: '340px', width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ maxHeight: '46vh', boxShadow: '0 6px 24px rgba(0,0,0,0.18)', borderRadius: '0.25rem', overflow: 'hidden', lineHeight: 0 }}>
                {previews}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <span style={label}>Colour</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {VARIANTS.map(v => (
                  <button key={v.id} onClick={() => setVariant(v.id)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.6rem', borderRadius: '0.625rem', minHeight: '44px', cursor: 'pointer',
                    border: `1px solid ${variant === v.id ? 'var(--accent)' : 'var(--border)'}`,
                    background: variant === v.id ? 'var(--accent)' : 'none',
                    color: variant === v.id ? '#F7E7CE' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem',
                  }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: v.swatch, border: '1px solid rgba(0,0,0,0.2)' }} />
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <span style={label}>Heading</span>
              <input style={field} value={copy[active].heading}
                onChange={e => setCopy(c => ({ ...c, [active]: { ...c[active], heading: e.target.value } }))} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <span style={label}>Message</span>
              <textarea style={{ ...field, resize: 'vertical', minHeight: '58px' }} rows={2} value={copy[active].message}
                onChange={e => setCopy(c => ({ ...c, [active]: { ...c[active], message: e.target.value } }))} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
                <span style={label}>Date</span>
                <input style={field} value={dateLabel} placeholder="e.g. 12 Sept 2026" onChange={e => setDateLabel(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
                <span style={label}>Time</span>
                <input style={field} value={timeLabel} placeholder="e.g. 3:00 PM" onChange={e => setTimeLabel(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
                <span style={label}>Location <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></span>
                <input style={field} value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              {active === 'table' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
                  <span style={label}>Table label</span>
                  <input style={field} value={tableLabel} placeholder="Table 1" onChange={e => setTableLabel(e.target.value)} />
                </div>
              )}
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.75rem' }}>
          {activeTemplate.blurb} {active === 'table' ? 'Prints 4 cards per A4 sheet — change the table label and download one per table.' : ''}
        </p>

        {error && (
          <p style={{ color: 'var(--danger)', margin: 0, fontSize: '0.8rem', fontWeight: 500 }}>⚠ {error}</p>
        )}

        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button onClick={exportPng} disabled={!!busy} style={{ ...actionBtn, opacity: busy ? 0.5 : 1 }}>
            {busy === 'png' ? 'Rendering…' : '↓ PNG'}
          </button>
          <button onClick={exportPdf} disabled={!!busy} style={{ ...actionBtn, opacity: busy ? 0.5 : 1 }}>
            {busy === 'pdf' ? 'Rendering…' : '↓ PDF (print)'}
          </button>
          <button onClick={exportPack} disabled={!!busy} style={{
            flex: '2 1 100%', border: 'none', borderRadius: '0.75rem', padding: '0.875rem',
            fontSize: '0.95rem', fontWeight: 600, color: '#F7E7CE', backgroundColor: 'var(--accent)',
            cursor: 'pointer', minHeight: '52px', opacity: busy ? 0.5 : 1,
          }}>
            {busy === 'pack' ? 'Building pack…' : '↓ Download full pack (PDF)'}
          </button>
        </div>
      </div>
    </div>
  )
}
