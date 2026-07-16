'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/client'
import { formatTimeAgo, formatEventDate, computeFeedClosesAt, FEED_CLOSE_OPTIONS, type FeedCloseMode } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { GreenLogo } from '@/components/landing/Logo'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

type ConfirmState = { message: string; onConfirm: () => void } | null

function ConfirmModal({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  if (!state) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-modal)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          padding: '1.5rem',
          width: '100%', maxWidth: '360px',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
          {state.message}
        </p>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', background: 'none', cursor: 'pointer', fontSize: '0.9rem', minHeight: '48px' }}
          >
            Cancel
          </button>
          <button
            onClick={() => { state.onConfirm(); onClose() }}
            style={{ flex: 1, border: '1px solid #7f1d1d', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, color: '#ef4444', background: 'none', cursor: 'pointer', fontSize: '0.9rem', minHeight: '48px' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function ErrorToast({ message, onClose }: { message: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [message, onClose])
  if (!message) return null
  return (
    <div
      style={{
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1100, backgroundColor: '#1a1a1a', color: '#fff',
        borderRadius: '0.75rem', padding: '0.875rem 1.25rem',
        fontSize: '0.875rem', fontWeight: 500, maxWidth: 'calc(100vw - 2rem)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}
    >
      <span style={{ color: '#ef4444' }}>⚠</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 0.25rem' }}>✕</button>
    </div>
  )
}

const EVENT_CATEGORIES = [
  'Wedding', 'Birthday', 'Anniversary', 'Engagement',
  'Graduation', 'Baby Shower', 'Bridal Shower', 'Corporate', 'Conference',
  'Concert', 'Festival', 'Reunion', 'Outreach', 'Sports', 'Games Night',
  'Vacation', 'Other'
]

type Event = {
  id: string
  title: string
  slug: string
  description: string | null
  location: string | null
  event_date: string | null
  event_time: string | null
  category: string | null
  created_at: string
  feed_opens_at: string | null
  feed_close_mode: FeedCloseMode
  feed_closes_at: string | null
}

// Converts an ISO timestamp to the value a <input type="datetime-local"> expects (local time, no offset).
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type Media = {
  id: string
  url: string
  type: string
  uploaded_by: string | null
  hashtags: string[]
  views: number
  created_at: string
}

const pillButton: React.CSSProperties = {
  height: '44px', paddingLeft: '1rem', paddingRight: '1rem',
  borderRadius: '0.75rem', border: '1px solid var(--border)',
  backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)',
  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '0.375rem', whiteSpace: 'nowrap' as const,
  flexShrink: 0, textDecoration: 'none',
}

const inputStyle: React.CSSProperties = {
  width: '100%', backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border)', borderRadius: '0.75rem',
  padding: '0.875rem 1rem', color: 'var(--text-primary)',
  fontSize: '1rem', outline: 'none', boxSizing: 'border-box', minHeight: '52px',
}

export default function EventDashboardPage() {
  const { eventId } = useParams()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { isMobile } = useWindowWidth()
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 12

  const [event, setEvent] = useState<Event | null>(null)
  const [media, setMedia] = useState<Media[]>([])
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [zipping, setZipping] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editFeedOpensAt, setEditFeedOpensAt] = useState('')
  const [editFeedCloseMode, setEditFeedCloseMode] = useState<FeedCloseMode>('none')
  const [editFeedClosesAtCustom, setEditFeedClosesAtCustom] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<ConfirmState>(null)
  const [errorToast, setErrorToast] = useState<string | null>(null)
  const closeConfirm = useCallback(() => setConfirmModal(null), [])

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')
  ).replace(/\/$/, '')

  const eventUrl = event ? `${appUrl}/e/${event.slug}` : ''

  useEffect(() => {
    async function fetchEvent() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).eq('host_id', session.user.id).single()
      if (!eventData) return router.push('/dashboard')
      setEvent(eventData)
      const { data: mediaData } = await supabase.from('media').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
      if (mediaData) setMedia(mediaData)
    }
    fetchEvent()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/auth/login')
    })
    return () => subscription.unsubscribe()
  }, [eventId, router, supabase])

  async function copyLink() {
    await navigator.clipboard.writeText(eventUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function shareLink() {
    try {
      if (navigator.share) {
        await navigator.share({ title: event?.title, url: eventUrl })
      } else {
        await navigator.clipboard.writeText(eventUrl)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      }
    } catch {}
  }

  function downloadQR() {
    const canvas = qrCanvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${event?.slug ?? 'event'}-qr-code.png`
    a.click()
  }

  function openEdit() {
    if (!event) return
    setEditTitle(event.title)
    setEditDescription(event.description ?? '')
    setEditLocation(event.location ?? '')
    setEditDate(event.event_date ?? '')
    setEditTime(event.event_time ?? '')
    setEditCategory(event.category ?? '')
    setEditFeedOpensAt(toDatetimeLocal(event.feed_opens_at))
    setEditFeedCloseMode(event.feed_close_mode ?? 'none')
    setEditFeedClosesAtCustom(event.feed_close_mode === 'custom' ? toDatetimeLocal(event.feed_closes_at) : '')
    setEditing(true)
  }

  async function handleSaveEdit() {
    if (!editTitle.trim() || !event) return
    const feedClosesAt = computeFeedClosesAt(editDate || null, editTime || null, editFeedCloseMode, editFeedClosesAtCustom || null)
    const { data, error } = await supabase
      .from('events')
      .update({
        title: editTitle, description: editDescription,
        location: editLocation || null,
        event_date: editDate || null,
        event_time: editTime || null,
        category: editCategory || null,
        feed_opens_at: editFeedOpensAt ? new Date(editFeedOpensAt).toISOString() : null,
        feed_close_mode: editFeedCloseMode,
        feed_closes_at: feedClosesAt,
      })
      .eq('id', event.id).select().single()
    if (!error && data) { setEvent(data); setEditing(false) }
  }

  function handleDeleteEvent() {
    if (!event) return
    setConfirmModal({
      message: `Delete "${event.title}"? This will remove all uploads too.`,
      onConfirm: async () => {
        setDeleting(true)
        await supabase.from('events').delete().eq('id', event.id)
        router.push('/dashboard')
      },
    })
  }

  function handleDeleteMedia(item: Media) {
    setConfirmModal({
      message: 'Delete this upload? This cannot be undone.',
      onConfirm: async () => {
        setDeletingMediaId(item.id)
        try {
          const res = await fetch('/api/delete-media', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mediaId: item.id }),
          })
          if (!res.ok) {
            const d = await res.json()
            throw new Error(d.error ?? 'Delete failed')
          }
          setMedia(prev => prev.filter(m => m.id !== item.id))
        } catch (err: any) {
          setErrorToast(err.message ?? 'Failed to delete. Please try again.')
        }
        setDeletingMediaId(null)
      },
    })
  }

  async function handleDownloadAll() {
    if (media.length === 0) return
    setZipping(true)
    try {
      const zip = new JSZip()
      await Promise.all(media.map(async (item, index) => {
        const response = await fetch(item.url)
        const blob = await response.blob()
        const ext = item.type === 'video' ? 'mp4' : 'jpg'
        zip.file(`${String(index + 1).padStart(3, '0')}-${item.uploaded_by ?? 'anonymous'}.${ext}`, blob)
      }))
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${event!.title.replace(/\s+/g, '-').toLowerCase()}-media.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error('Zip failed:', err) }
    setZipping(false)
  }

  if (!event) return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', width: '100%' }}>
      <ConfirmModal state={confirmModal} onClose={closeConfirm} />
      <ErrorToast message={errorToast} onClose={() => setErrorToast(null)} />
      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/dashboard" style={{ ...pillButton, height: '36px', paddingLeft: '0.75rem', paddingRight: '0.75rem', fontSize: '0.825rem', flexShrink: 0 }}>← Back</Link>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
            <p style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.925rem', maxWidth: '100%' }}>
              {event.title}
            </p>
            {event.category && (
              <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {event.category}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.125rem' }}>
            {event.event_date && <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0, whiteSpace: 'nowrap' }}>📅 {formatEventDate(event.event_date)}</p>}
            {event.event_time && <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0, whiteSpace: 'nowrap' }}>🕐 {event.event_time}</p>}
            {event.location && <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {event.location}</p>}
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

        {/* Share card */}
        <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Share with guests</h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.75rem', padding: '0.75rem', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{eventUrl}</p>
            <button onClick={copyLink} style={{ color: copied ? 'var(--text-primary)' : 'var(--text-silver)', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: '0.25rem 0.5rem', minHeight: '44px' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <button onClick={shareLink} style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem', fontSize: '0.875rem', color: 'var(--text-muted)', background: 'none', cursor: 'pointer', minHeight: '52px', fontWeight: 600 }}>
            {linkCopied ? '✓ Link copied!' : '↗ Share event link'}
          </button>

          <button onClick={() => setShowQR(v => !v)} style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem', fontSize: '0.875rem', color: 'var(--text-muted)', background: 'none', cursor: 'pointer', minHeight: '52px', fontWeight: 600 }}>
            {showQR ? 'Hide QR code' : 'Show QR code'}
          </button>

          {showQR && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ backgroundColor: '#F7E7CE', borderRadius: '0.75rem', padding: '1.25rem' }}>
                {/* Visible QR */}
                <QRCodeSVG value={eventUrl} size={200} />
                {/* Hidden canvas for QR download — using ref not getElementById */}
                <div style={{ position: 'absolute', top: 0, left: '-9999px', width: 0, height: 0, overflow: 'hidden', visibility: 'hidden', pointerEvents: 'none' }}>
                  <QRCodeCanvas ref={qrCanvasRef} value={eventUrl} size={400} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem', width: '100%' }}>
                <button
                  onClick={downloadQR}
                  style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem', fontSize: '0.875rem', color: 'var(--text-muted)', background: 'none', cursor: 'pointer', minHeight: '52px', fontWeight: 600 }}
                >
                  ↓ Download QR
                </button>
                <button
                  onClick={async () => {
                    try {
                      await navigator.share({ title: `${event.title} — scan to upload`, url: eventUrl })
                    } catch {
                      await navigator.clipboard.writeText(eventUrl)
                    }
                  }}
                  style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem', fontSize: '0.875rem', color: 'var(--text-muted)', background: 'none', cursor: 'pointer', minHeight: '52px', fontWeight: 600 }}
                >
                  ↗ Share QR
                </button>
              </div>
            </div>
          )}

          <button onClick={handleDownloadAll} disabled={zipping || media.length === 0} style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px', opacity: zipping || media.length === 0 ? 0.4 : 1 }}>
            {zipping ? `Zipping ${media.length} files...` : `↓ Download all (${media.length})`}
          </button>

          <a href={eventUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-input)' }}>
            ↗ Preview guest feed
          </a>
        </div>

        {/* Edit form */}
        {editing && (
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.875rem', overflow: 'hidden' }}>
            <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Edit event</h4>
            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Event title" style={inputStyle} />

            <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ ...inputStyle, appearance: 'none' as any }}>
              <option value="">Select a category</option>
              {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Description" rows={3} style={{ ...inputStyle, minHeight: 'unset', resize: 'none' }} />
            <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Location" style={inputStyle} />

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.625rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: isMobile ? undefined : 1, minWidth: 0 }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark', cursor: 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: isMobile ? undefined : 1, minWidth: 0 }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Time</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Feed visibility</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Open feed at (optional — leave blank to open immediately)</label>
                <input type="datetime-local" value={editFeedOpensAt} onChange={e => setEditFeedOpensAt(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark', cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Close feed</label>
                <select value={editFeedCloseMode} onChange={e => setEditFeedCloseMode(e.target.value as FeedCloseMode)} style={{ ...inputStyle, appearance: 'none' as React.CSSProperties['appearance'] }}>
                  {FEED_CLOSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {editFeedCloseMode === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Close date & time</label>
                  <input type="datetime-local" value={editFeedClosesAtCustom} onChange={e => setEditFeedClosesAtCustom(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark', cursor: 'pointer' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button onClick={handleSaveEdit} disabled={!editTitle.trim()} style={{ flex: 1, backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px', opacity: !editTitle.trim() ? 0.4 : 1 }}>Save changes</button>
              <button onClick={() => setEditing(false)} style={{ padding: '0.875rem 1.25rem', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-muted)', background: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px' }}>Cancel</button>
            </div>
          </div>
        )}

        {!editing && (
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button onClick={openEdit} style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', background: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px' }}>Edit event</button>
            <button onClick={handleDeleteEvent} disabled={deleting} style={{ flex: 1, border: '1px solid #7f1d1d', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, color: '#ef4444', background: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px', opacity: deleting ? 0.4 : 1 }}>
              {deleting ? 'Deleting...' : 'Delete event'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{media.length}</p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total uploads</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{media.reduce((sum, m) => sum + m.views, 0)}</p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total views</p>
          </div>
        </div>

        {/* Media list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>
              Uploads
              <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 400, marginLeft: '0.5rem' }}>
                ({media.length})
              </span>
            </h4>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{ width: '36px', height: '36px', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: viewMode === 'list' ? 'var(--accent)' : 'var(--bg-input)', color: viewMode === 'list' ? '#F7E7CE' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}
              >
                ☰
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{ width: '36px', height: '36px', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: viewMode === 'grid' ? 'var(--accent)' : 'var(--bg-input)', color: viewMode === 'grid' ? '#F7E7CE' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}
              >
                ⊞
              </button>
            </div>
          </div>

          {media.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2.5rem 0' }}>
              No uploads yet. Share the link with your guests.
            </p>
          )}

          {/* Grid view */}
          {viewMode === 'grid' && media.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {media.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(item => (
                <div key={item.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', opacity: deletingMediaId === item.id ? 0.4 : 1 }}>
                  {item.type === 'image' ? (
                    <Image src={item.url} alt="" fill sizes="50vw" style={{ objectFit: 'cover' }} />
                  ) : (
                    <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                  {item.type === 'video' && (
                    <div style={{ position: 'absolute', top: '0.375rem', left: '0.375rem', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '999px', padding: '0.125rem 0.375rem', fontSize: '0.675rem', color: '#fff', fontWeight: 600 }}>▶ video</div>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.5rem', background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p style={{ color: '#fff', fontSize: '0.7rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.uploaded_by ?? 'Anon'}
                    </p>
                    <button onClick={() => handleDeleteMedia(item)} disabled={deletingMediaId === item.id} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0 }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List view */}
          {viewMode === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {media.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(item => (
                <div key={item.id} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden', opacity: deletingMediaId === item.id ? 0.4 : 1 }}>
                  {item.type === 'image' ? (
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                      <Image src={item.url} alt="" fill sizes="(max-width: 512px) 100vw, 512px" style={{ objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <video src={item.url} controls playsInline crossOrigin="anonymous" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                  )}
                  <div style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>
                        {item.uploaded_by ?? 'Anonymous'} · {formatTimeAgo(item.created_at)}
                      </p>
                      {item.hashtags.length > 0 && (
                        <p style={{ color: 'var(--accent-faint)', fontSize: '0.825rem', marginTop: '0.125rem' }}>
                          {item.hashtags.map(t => `#${t}`).join(' ')}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.825rem' }}>{item.views} views</span>
                      <a href={item.url} download style={{ color: 'var(--text-silver)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', padding: '0.5rem', minHeight: '44px', display: 'flex', alignItems: 'center' }}>↓</a>
                      <button onClick={() => handleDeleteMedia(item)} disabled={deletingMediaId === item.id} style={{ color: '#ef4444', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', minHeight: '44px', display: 'flex', alignItems: 'center' }}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {media.length > PAGE_SIZE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', paddingTop: '0.5rem' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ height: '36px', paddingLeft: '0.875rem', paddingRight: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, padding: '0 0.5rem' }}>
                {page} / {Math.ceil(media.length / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(media.length / PAGE_SIZE), p + 1))}
                disabled={page >= Math.ceil(media.length / PAGE_SIZE)}
                style={{ height: '36px', paddingLeft: '0.875rem', paddingRight: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, cursor: page >= Math.ceil(media.length / PAGE_SIZE) ? 'not-allowed' : 'pointer', opacity: page >= Math.ceil(media.length / PAGE_SIZE) ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}