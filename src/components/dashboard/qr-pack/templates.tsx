'use client'

// The three print-pack designs, authored as pure SVG so they double as the
// on-screen preview AND the export source (see lib/qr-pack.ts). Everything uses
// inline presentation attributes and system font stacks — no external CSS or
// fonts — so serializing the node to a string rasterizes faithfully in every
// browser. Coordinates are in millimetres: the viewBox equals the physical
// piece size.

import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { PackData, PackVariant } from '@/lib/qr-pack'

type Palette = { bg: string; ink: string; sub: string; faint: string; line: string }

const PALETTES: Record<PackVariant, Palette> = {
  cream: { bg: '#F7E7CE', ink: '#556B2F', sub: '#6f7d4c', faint: '#aab488', line: '#cdbd93' },
  olive: { bg: '#556B2F', ink: '#F7E7CE', sub: '#d8e2bf', faint: '#8fa06a', line: '#77875250' },
}

// Geometric-ish stack for display type; plain sans for labels. Both fall back
// cleanly to Helvetica/Arial so rasterization never depends on a web font.
const DISPLAY = "'Gill Sans', 'Gill Sans MT', 'Century Gothic', 'Helvetica Neue', Arial, sans-serif"
const SANS = "'Helvetica Neue', Arial, system-ui, sans-serif"

// The QR is always dark olive on a white card, never on the coloured ground —
// scanners need the contrast and quiet zone.
const QR_FG = '#556B2F'

export interface TemplateProps {
  data: PackData
  variant: PackVariant
  qrValue: string
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

/** A leafy sprig drawn in a ~40×120 box, stem rising from the bottom-centre. */
function Sprig({ color }: { color: string }) {
  const leaves = []
  const n = 8
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const y = 118 - t * 112
    const s = 1 - t * 0.45
    const off = 7 * s + 2
    leaves.push(<ellipse key={`a${i}`} cx={20 - off} cy={y} rx={4.2 * s} ry={9 * s} transform={`rotate(-38 ${20 - off} ${y})`} fill={color} />)
    leaves.push(<ellipse key={`b${i}`} cx={20 + off} cy={y - 4} rx={4.2 * s} ry={9 * s} transform={`rotate(38 ${20 + off} ${y - 4})`} fill={color} />)
  }
  leaves.push(<ellipse key="tip" cx={20} cy={2} rx={3} ry={6.5} fill={color} />)
  return (
    <g>
      <path d="M20 120 C 20 90 20 40 20 4" stroke={color} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      {leaves}
    </g>
  )
}

function QrBlock({ x, y, cardSize, value }: { x: number; y: number; cardSize: number; value: string }) {
  const pad = cardSize * 0.1
  const qs = cardSize - pad * 2
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={cardSize} height={cardSize} rx={cardSize * 0.08} fill="#FFFFFF" />
      <g transform={`translate(${pad} ${pad})`}>
        <QRCodeSVG value={value} size={qs} bgColor="#FFFFFF" fgColor={QR_FG} level="M" marginSize={0} />
      </g>
    </g>
  )
}

interface LinesProps extends React.SVGProps<SVGTextElement> {
  lines: string[]
  cx: number
  y: number
  lineHeight: number
}

function CenteredLines({ lines, cx, y, lineHeight, ...rest }: LinesProps) {
  return (
    <text x={cx} y={y} textAnchor="middle" {...rest}>
      {lines.map((ln, i) => (
        <tspan key={i} x={cx} dy={i === 0 ? 0 : lineHeight}>{ln}</tspan>
      ))}
    </text>
  )
}

/** Greedy word-wrap by an approximate character budget (sans ≈ 0.52em wide). */
function wrap(text: string, maxWidthMm: number, fontSizeMm: number, maxLines = 3): string[] {
  const maxChars = Math.max(6, Math.floor(maxWidthMm / (fontSizeMm * 0.52)))
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (next.length > maxChars && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = next
    }
  }
  if (cur) lines.push(cur)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[.,;:]?$/, '')}…`
    return kept
  }
  return lines
}

function dateTimeLine(data: PackData): string {
  return [data.dateLabel, data.timeLabel].filter(Boolean).join('  ·  ')
}

// ─── Welcome sign (A4, 210×297) ───────────────────────────────────────────────

export const WelcomeSign = forwardRef<SVGSVGElement, TemplateProps>(function WelcomeSign(
  { data, variant, qrValue }, ref,
) {
  const p = PALETTES[variant]
  const W = 210, H = 297, cx = W / 2

  const headingFs = 18
  const headingLines = wrap(data.heading, 176, headingFs, 3)
  const headingBottom = 62 + (headingLines.length - 1) * (headingFs * 1.05)

  const msgFs = 4.7
  const msgLines = wrap(data.message, 150, msgFs, 3)
  const msgTop = headingBottom + 16

  const card = 86
  const cardY = msgTop + msgLines.length * (msgFs * 1.35) + 12

  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <rect width={W} height={H} fill={p.bg} />
      <rect x={9} y={9} width={W - 18} height={H - 18} rx={4} fill="none" stroke={p.line} strokeWidth={0.6} />

      <g transform="translate(6 4) scale(0.9)"><Sprig color={p.faint} /></g>
      <g transform={`translate(${W - 6} ${H - 4}) rotate(180) scale(0.9)`}><Sprig color={p.faint} /></g>

      <text x={cx} y={44} textAnchor="middle" fontFamily={SANS} fontSize={4} letterSpacing={4} fill={p.sub}>WELCOME TO</text>

      <CenteredLines lines={headingLines} cx={cx} y={62} lineHeight={headingFs * 1.05}
        fontFamily={DISPLAY} fontSize={headingFs} fontWeight={500} fill={p.ink} />

      <CenteredLines lines={msgLines} cx={cx} y={msgTop} lineHeight={msgFs * 1.35}
        fontFamily={SANS} fontSize={msgFs} fill={p.sub} />

      <QrBlock x={cx - card / 2} y={cardY} cardSize={card} value={qrValue} />

      <text x={cx} y={cardY + card + 14} textAnchor="middle" fontFamily={SANS} fontSize={4.2} letterSpacing={3} fill={p.ink}>
        SCAN&nbsp;&nbsp;·&nbsp;&nbsp;UPLOAD&nbsp;&nbsp;·&nbsp;&nbsp;SHARE
      </text>

      {dateTimeLine(data) && (
        <text x={cx} y={cardY + card + 26} textAnchor="middle" fontFamily={DISPLAY} fontSize={5.4} fill={p.sub}>
          {dateTimeLine(data)}
        </text>
      )}
      {data.location && (
        <text x={cx} y={cardY + card + 34} textAnchor="middle" fontFamily={SANS} fontSize={3.8} letterSpacing={1} fill={p.faint}>
          {data.location}
        </text>
      )}

      <text x={cx} y={H - 15} textAnchor="middle" fontFamily={SANS} fontSize={3} letterSpacing={2.5} fill={p.faint}>
        POWERED BY MOMENTO
      </text>
    </svg>
  )
})

// ─── Table card (A6, 105×148) ─────────────────────────────────────────────────

export const TableCard = forwardRef<SVGSVGElement, TemplateProps>(function TableCard(
  { data, variant, qrValue }, ref,
) {
  const p = PALETTES[variant]
  const W = 105, H = 148, cx = W / 2

  const headingFs = 9
  const headingLines = wrap(data.heading, 88, headingFs, 2)
  const label = (data.label || '').trim()
  const card = 50

  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <rect width={W} height={H} fill={p.bg} />
      <rect x={6} y={6} width={W - 12} height={H - 12} rx={3} fill="none" stroke={p.line} strokeWidth={0.5} />

      <g transform="translate(1 1) scale(0.3)"><Sprig color={p.faint} /></g>
      <g transform={`translate(${W - 1} ${H - 1}) rotate(180) scale(0.3)`}><Sprig color={p.faint} /></g>

      {label && (
        <text x={cx} y={22} textAnchor="middle" fontFamily={SANS} fontSize={4} letterSpacing={3} fill={p.sub}>
          {label.toUpperCase()}
        </text>
      )}

      <CenteredLines lines={headingLines} cx={cx} y={label ? 34 : 30} lineHeight={headingFs * 1.05}
        fontFamily={DISPLAY} fontSize={headingFs} fontWeight={500} fill={p.ink} />

      <QrBlock x={cx - card / 2} y={46} cardSize={card} value={qrValue} />

      <CenteredLines lines={wrap(data.message, 78, 3.6, 2)} cx={cx} y={109} lineHeight={5}
        fontFamily={SANS} fontSize={3.6} fill={p.sub} />

      {dateTimeLine(data) && (
        <text x={cx} y={128} textAnchor="middle" fontFamily={DISPLAY} fontSize={4} fill={p.sub}>
          {dateTimeLine(data)}
        </text>
      )}

      <text x={cx} y={H - 11} textAnchor="middle" fontFamily={SANS} fontSize={2.6} letterSpacing={2} fill={p.faint}>
        POWERED BY MOMENTO
      </text>
    </svg>
  )
})

// ─── Reception poster (A3, 297×420) ───────────────────────────────────────────

export const ReceptionPoster = forwardRef<SVGSVGElement, TemplateProps>(function ReceptionPoster(
  { data, variant, qrValue }, ref,
) {
  const p = PALETTES[variant]
  const W = 297, H = 420, cx = W / 2

  const headingFs = 32
  const headingLines = wrap(data.heading, 244, headingFs, 3)
  const headingBottom = 96 + (headingLines.length - 1) * (headingFs * 1.05)

  const msgFs = 6.4
  const msgLines = wrap(data.message, 210, msgFs, 3)
  const msgTop = headingBottom + 22

  const card = 120
  const cardY = msgTop + msgLines.length * (msgFs * 1.35) + 16

  const corner = (x: number, y: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(0.95)`}><Sprig color={p.faint} /></g>
  )

  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <rect width={W} height={H} fill={p.bg} />
      <rect x={11} y={11} width={W - 22} height={H - 22} rx={5} fill="none" stroke={p.line} strokeWidth={0.7} />

      {corner(10, 6, 25)}
      {corner(W - 10, 6, -25)}
      {corner(10, H - 6, 155)}
      {corner(W - 10, H - 6, 205)}

      <text x={cx} y={62} textAnchor="middle" fontFamily={SANS} fontSize={5.5} letterSpacing={5} fill={p.sub}>
        A LITTLE INVITATION
      </text>

      <CenteredLines lines={headingLines} cx={cx} y={96} lineHeight={headingFs * 1.05}
        fontFamily={DISPLAY} fontSize={headingFs} fontWeight={500} fill={p.ink} />

      <text x={cx} y={headingBottom + 20} textAnchor="middle" fontFamily={SANS} fontSize={5} letterSpacing={4} fill={p.ink}>
        SNAP&nbsp;&nbsp;·&nbsp;&nbsp;SCAN&nbsp;&nbsp;·&nbsp;&nbsp;UPLOAD
      </text>

      <CenteredLines lines={msgLines} cx={cx} y={msgTop + 10} lineHeight={msgFs * 1.35}
        fontFamily={SANS} fontSize={msgFs} fill={p.sub} />

      <QrBlock x={cx - card / 2} y={cardY} cardSize={card} value={qrValue} />

      {dateTimeLine(data) && (
        <text x={cx} y={cardY + card + 24} textAnchor="middle" fontFamily={DISPLAY} fontSize={7.5} fill={p.sub}>
          {dateTimeLine(data)}
        </text>
      )}
      {data.location && (
        <text x={cx} y={cardY + card + 35} textAnchor="middle" fontFamily={SANS} fontSize={5} letterSpacing={1.5} fill={p.faint}>
          {data.location}
        </text>
      )}

      <text x={cx} y={H - 22} textAnchor="middle" fontFamily={SANS} fontSize={4} letterSpacing={3} fill={p.faint}>
        POWERED BY MOMENTO
      </text>
    </svg>
  )
})

// ─── Registry ─────────────────────────────────────────────────────────────────

export const TEMPLATE_COMPONENTS = {
  welcome: WelcomeSign,
  table: TableCard,
  poster: ReceptionPoster,
} as const
