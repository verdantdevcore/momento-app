// QR print packs — turns an event's own data into premium, print-ready
// materials (welcome sign, table cards, reception poster) in the app's
// olive/cream brand. Everything renders client-side: the templates are SVG
// (see components/dashboard/qr-pack/templates.tsx), exported to PNG via canvas
// and to print-sized PDF via jsPDF (lazy-loaded, so it only ships when a host
// actually opens the pack).

export type TemplateId = 'welcome' | 'table' | 'poster'

// ─── Colour ───────────────────────────────────────────────────────────────────

/**
 * Every colour a template paints with, derived from just two host choices.
 *
 * Hosts pick a background and an ink; the three in-between tones (secondary
 * text, botanical sprigs, hairline border) are blends of that pair. Letting
 * hosts set five colours independently would mostly produce prints that don't
 * hang together — this keeps any pairing on-brand by construction.
 */
export interface PackPalette {
  bg: string
  ink: string
  sub: string
  faint: string
  line: string
  /** QR modules. Always dark enough to scan off the white QR card. */
  qr: string
}

export interface PackPreset {
  id: string
  name: string
  bg: string
  ink: string
}

/**
 * One-tap colourways. `cream` and `olive` reproduce the original hand-tuned
 * palettes almost exactly through the blend ratios below, so existing prints
 * are unchanged.
 */
export const PRESETS: PackPreset[] = [
  { id: 'cream',    name: 'Cream',    bg: '#F7E7CE', ink: '#556B2F' },
  { id: 'olive',    name: 'Olive',    bg: '#556B2F', ink: '#F7E7CE' },
  { id: 'blush',    name: 'Blush',    bg: '#F6E5E1', ink: '#8C4A4A' },
  { id: 'navy',     name: 'Navy',     bg: '#10233F', ink: '#E8D9B5' },
  { id: 'sand',     name: 'Sand',     bg: '#EFE7DA', ink: '#3F3A33' },
  { id: 'noir',     name: 'Noir',     bg: '#1A1A1A', ink: '#F2F2F2' },
]

/** Accepts `#abc`, `abc`, `#aabbcc` or `aabbcc`; returns `#aabbcc` or null. */
export function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw.split('').map(c => c + c).join('')}`.toUpperCase()
  }
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`.toUpperCase()
  return null
}

function toRgb(hex: string): [number, number, number] {
  const norm = normalizeHex(hex) ?? '#000000'
  return [
    parseInt(norm.slice(1, 3), 16),
    parseInt(norm.slice(3, 5), 16),
    parseInt(norm.slice(5, 7), 16),
  ]
}

function toHex(rgb: number[]): string {
  return `#${rgb.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

/** Blends `from` toward `to`; t=0 is `from`, t=1 is `to`. */
export function mix(from: string, to: string, t: number): string {
  const a = toRgb(from)
  const b = toRgb(to)
  return toHex(a.map((v, i) => v + (b[i] - v) * t))
}

/** WCAG relative luminance. */
function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Below this, body copy on the print gets hard to read — the host is warned. */
export const MIN_READABLE_CONTRAST = 4.5

/** Ratios that reproduce the original cream/olive palettes from bg + ink. */
const SUB_MIX = 0.18
const FAINT_MIX = 0.56
const LINE_MIX = 0.68

/**
 * The QR always prints on its own white card, so its ink is judged against
 * white rather than the background. A host who picks a pale ink would
 * otherwise get an unscannable code, so pale inks are darkened until they
 * clear this — 5:1, chosen because the original olive (5.95:1) passes
 * untouched.
 */
const QR_MIN_CONTRAST = 5

function scannableInk(ink: string): string {
  let c = ink
  // Each step keeps 80% of the distance to black, so this always converges.
  for (let i = 0; i < 12 && contrastRatio(c, '#FFFFFF') < QR_MIN_CONTRAST; i++) {
    c = mix(c, '#000000', 0.2)
  }
  return c
}

/** Expands a host's background + ink into the full template palette. */
export function buildPalette(bg: string, ink: string): PackPalette {
  const b = normalizeHex(bg) ?? '#F7E7CE'
  const i = normalizeHex(ink) ?? '#556B2F'
  return {
    bg: b,
    ink: i,
    sub: mix(i, b, SUB_MIX),
    faint: mix(i, b, FAINT_MIX),
    line: mix(i, b, LINE_MIX),
    qr: scannableInk(i),
  }
}

/** The preset a colour pair matches, or 'custom' — used to name downloads. */
export function variantName(bg: string, ink: string): string {
  const hit = PRESETS.find(p => p.bg === normalizeHex(bg) && p.ink === normalizeHex(ink))
  return hit ? hit.id : 'custom'
}

/** Physical artwork size of one piece, in millimetres (also the SVG viewBox). */
export interface PackSize {
  widthMm: number
  heightMm: number
}

export interface PackTemplate {
  id: TemplateId
  name: string
  blurb: string
  /** The single piece's artwork size — this is the SVG viewBox and the PNG. */
  piece: PackSize
  /** The sheet the PDF prints on, and how many pieces tile onto it. */
  pdf: { format: 'a4' | 'a3'; cols: number; rows: number }
  /** True when the host can label each piece (table cards). */
  hasLabel: boolean
}

export const A4: PackSize = { widthMm: 210, heightMm: 297 }
export const A3: PackSize = { widthMm: 297, heightMm: 420 }
export const A6: PackSize = { widthMm: 105, heightMm: 148 }

export const TEMPLATES: PackTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome sign',
    blurb: 'A4 sign for the entrance or gift table — the hero piece.',
    piece: A4,
    pdf: { format: 'a4', cols: 1, rows: 1 },
    hasLabel: false,
  },
  {
    id: 'table',
    name: 'Table cards',
    blurb: 'Small cards, 4 to an A4 sheet — one for every table.',
    piece: A6,
    pdf: { format: 'a4', cols: 2, rows: 2 },
    hasLabel: true,
  },
  {
    id: 'poster',
    name: 'Reception poster',
    blurb: 'Large A3 poster for a wall or easel.',
    piece: A3,
    pdf: { format: 'a3', cols: 1, rows: 1 },
    hasLabel: false,
  },
]

export function getTemplate(id: TemplateId): PackTemplate {
  const t = TEMPLATES.find(t => t.id === id)
  if (!t) throw new Error(`Unknown template: ${id}`)
  return t
}

/** The text a host can edit before download. Prefilled from the event. */
export interface PackData {
  heading: string
  message: string
  dateLabel: string
  timeLabel: string
  location: string
  /** Table cards only, e.g. "Table 4". */
  label: string
}

/** Default copy per template. Kept event-type-neutral (not wedding-only). */
export function defaultCopy(id: TemplateId, title: string): Pick<PackData, 'heading' | 'message'> {
  switch (id) {
    case 'welcome':
      return {
        heading: title || 'Our Celebration',
        message: "We're so happy you're here. Scan below to instantly upload your photos and videos.",
      }
    case 'poster':
      return {
        heading: 'Share Your Memories',
        message: 'Help us collect every beautiful memory from today — snap, scan, and upload.',
      }
    case 'table':
      return {
        heading: 'Share the moment',
        message: 'Scan the code to add your photos and videos to our album.',
      }
  }
}

// ─── Filenames ────────────────────────────────────────────────────────────────

export function slugify(s: string): string {
  return (s || 'event').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'event'
}

export function packFileName(slug: string, id: TemplateId, variant: string, ext: string): string {
  return `${slugify(slug)}-${id}-${variant}.${ext}`
}

export function packBundleName(slug: string, variant: string): string {
  return `${slugify(slug)}-qr-print-pack-${variant}.pdf`
}

// ─── Rasterization (SVG → PNG) ────────────────────────────────────────────────

const MM_PER_INCH = 25.4
const PRINT_DPI = 300

/** Pixel width of a piece rendered at print resolution. */
export function pxFor(mm: number, dpi = PRINT_DPI): number {
  return Math.round((mm / MM_PER_INCH) * dpi)
}

/**
 * A serialized <svg> string needs an explicit pixel width/height on its root or
 * Firefox rasterizes it at zero size. This stamps them on without disturbing
 * the viewBox.
 */
function withPixelSize(svg: string, widthPx: number, heightPx: number): string {
  let out = svg.replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '')
  out = out.replace(/<svg\b/, `<svg width="${widthPx}" height="${heightPx}"`)
  if (!/xmlns=/.test(out)) out = out.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"')
  return out
}

async function svgToCanvas(svg: string, widthPx: number, heightPx: number): Promise<HTMLCanvasElement> {
  const prepared = withPixelSize(svg, widthPx, heightPx)
  const url = URL.createObjectURL(new Blob([prepared], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Could not render the design'))
      image.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = widthPx
    canvas.height = heightPx
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is unavailable')
    // Fill white first so any transparent edges rasterize cleanly for print.
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, widthPx, heightPx)
    ctx.drawImage(img, 0, 0, widthPx, heightPx)
    return canvas
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function svgToPngBlob(svg: string, piece: PackSize): Promise<Blob> {
  const canvas = await svgToCanvas(svg, pxFor(piece.widthMm), pxFor(piece.heightMm))
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not create the image'))), 'image/png')
  })
}

async function svgToPngDataUrl(svg: string, piece: PackSize): Promise<string> {
  const canvas = await svgToCanvas(svg, pxFor(piece.widthMm), pxFor(piece.heightMm))
  return canvas.toDataURL('image/png')
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

export interface PdfPiece {
  svg: string
  template: PackTemplate
}

/**
 * Places one piece's PNG onto the current PDF page, tiled cols×rows and centred
 * with a margin and gutter so table cards can be scissor-cut apart.
 */
async function placePiece(
  doc: import('jspdf').jsPDF,
  dataUrl: string,
  template: PackTemplate,
): Promise<void> {
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const { cols, rows } = template.pdf
  const single = cols * rows === 1
  const margin = single ? 0 : 10
  const gutter = single ? 0 : 6

  const cellW = (pageW - margin * 2 - gutter * (cols - 1)) / cols
  const cellH = (pageH - margin * 2 - gutter * (rows - 1)) / rows
  // Preserve the piece's aspect ratio inside each cell.
  const aspect = template.piece.widthMm / template.piece.heightMm
  let w = cellW
  let h = w / aspect
  if (h > cellH) { h = cellH; w = h * aspect }

  const gridW = w * cols + gutter * (cols - 1)
  const gridH = h * rows + gutter * (rows - 1)
  const startX = (pageW - gridW) / 2
  const startY = (pageH - gridH) / 2

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (w + gutter)
      const y = startY + r * (h + gutter)
      doc.addImage(dataUrl, 'PNG', x, y, w, h, undefined, 'FAST')
    }
  }
}

/** Builds a (possibly multi-page) PDF from rendered SVG pieces and saves it. */
export async function buildPackPdf(pieces: PdfPiece[], fileName: string): Promise<void> {
  if (pieces.length === 0) return
  const { jsPDF } = await import('jspdf')
  let doc: import('jspdf').jsPDF | null = null

  for (const piece of pieces) {
    const { format } = piece.template.pdf
    if (!doc) {
      doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format })
    } else {
      doc.addPage(format, 'portrait')
    }
    const dataUrl = await svgToPngDataUrl(piece.svg, piece.template.piece)
    await placePiece(doc, dataUrl, piece.template)
  }

  doc!.save(fileName)
}
