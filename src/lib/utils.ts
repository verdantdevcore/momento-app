import { randomBytes } from 'crypto'

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)

  // F-08 fix: cryptographically random suffix — 2^64 combinations
  const suffix = randomBytes(8).toString('hex')
  return `${base}-${suffix}`
}

export function formatTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// Event dates are stored as plain "YYYY-MM-DD" date-only strings (from an
// <input type="date">). `new Date("YYYY-MM-DD")` parses that as UTC
// midnight, so formatting it with `.toLocaleDateString()` in a timezone
// behind UTC (e.g. Canada, US) rolls it back to the previous day. Parse
// the numeric parts directly and build a local-time Date instead, so the
// calendar date the host entered is always the date that's displayed,
// regardless of the viewer's timezone.
export function formatEventDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
  locale = 'en-GB'
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date)
  if (!match) return new Date(date).toLocaleDateString(locale, options)
  const [, year, month, day] = match
  const localDate = new Date(Number(year), Number(month) - 1, Number(day))
  return localDate.toLocaleDateString(locale, options)
}

// ─── Feed visibility ────────────────────────────────────────────────────────

export type FeedCloseMode = 'none' | '24h' | '48h' | '72h' | '7d' | '30d' | '90d' | 'custom'

export const FEED_CLOSE_OPTIONS: { value: FeedCloseMode; label: string }[] = [
  { value: 'none', label: 'Never — feed stays open' },
  { value: '24h', label: '24 hours after event start' },
  { value: '48h', label: '48 hours after event start' },
  { value: '72h', label: '72 hours after event start' },
  { value: '7d', label: '7 days after event start' },
  { value: '30d', label: '30 days after event start' },
  { value: '90d', label: '90 days after event start' },
  { value: 'custom', label: 'Specific date & time' },
]

const FEED_CLOSE_DURATIONS_MS: Partial<Record<FeedCloseMode, number>> = {
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
  '72h': 72 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
}

// Resolves a feed_close_mode + the event's date/time (and an optional custom
// timestamp) into the concrete feed_closes_at value stored on the event row.
export function computeFeedClosesAt(
  eventDate: string | null,
  eventTime: string | null,
  closeMode: FeedCloseMode,
  customDateTime: string | null
): string | null {
  if (closeMode === 'none') return null
  if (closeMode === 'custom') return customDateTime ? new Date(customDateTime).toISOString() : null

  const durationMs = FEED_CLOSE_DURATIONS_MS[closeMode]
  if (!durationMs || !eventDate) return null
  const start = new Date(`${eventDate}T${eventTime || '00:00'}`)
  if (Number.isNaN(start.getTime())) return null
  return new Date(start.getTime() + durationMs).toISOString()
}

export type FeedStatus = 'not_open' | 'open' | 'closed'

export function getFeedStatus(event: { feed_opens_at?: string | null; feed_closes_at?: string | null }): FeedStatus {
  const now = Date.now()
  if (event.feed_opens_at && now < new Date(event.feed_opens_at).getTime()) return 'not_open'
  if (event.feed_closes_at && now > new Date(event.feed_closes_at).getTime()) return 'closed'
  return 'open'
}

export type CountdownPart = { label: string; value: number }

// Breaks a millisecond duration into whole days/hours/minutes/seconds for
// a countdown display. Drops the "Days" unit once it hits zero so a
// same-day countdown doesn't show a permanent "00 Days".
export function countdownParts(ms: number): CountdownPart[] {
  const clamped = Math.max(0, ms)
  const days = Math.floor(clamped / 86_400_000)
  const hours = Math.floor((clamped % 86_400_000) / 3_600_000)
  const minutes = Math.floor((clamped % 3_600_000) / 60_000)
  const seconds = Math.floor((clamped % 60_000) / 1000)
  const parts: CountdownPart[] = []
  if (days > 0) parts.push({ label: 'Days', value: days })
  parts.push({ label: 'Hours', value: hours }, { label: 'Min', value: minutes }, { label: 'Sec', value: seconds })
  return parts
}