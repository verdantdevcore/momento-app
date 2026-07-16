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

// ─── Timezones ──────────────────────────────────────────────────────────────

// An event happens at a place, so its date and time are a wall clock at that
// place — not an instant. The zone is what converts between the two. Without
// it, "24 hours after the event starts" was resolved using whatever zone the
// host's browser happened to be in, so a Lagos-based host scheduling a Toronto
// wedding closed the feed five hours early.

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function supportedTimezones(): string[] {
  try {
    // supportedValuesOf is widely available but not in every TS lib target.
    const values = (Intl as { supportedValuesOf?: (k: string) => string[] })
      .supportedValuesOf?.('timeZone')
    if (values?.length) return values
  } catch {
    // fall through to the minimal list
  }
  return Array.from(new Set([detectTimezone(), 'UTC'])).sort()
}

/**
 * The offset in ms between UTC and `timeZone`'s wall clock at `instant` —
 * what you add to UTC to get the local time there.
 */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const parts: Record<string, string> = {}
  for (const { type, value } of dtf.formatToParts(instant)) parts[type] = value
  // Some ICU builds render midnight as hour 24 under hour12:false.
  const hour = Number(parts.hour) % 24
  const wallAsUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    hour, Number(parts.minute), Number(parts.second)
  )
  // formatToParts carries no sub-second precision, so compare like for like.
  return wallAsUtc - Math.floor(instant.getTime() / 1000) * 1000
}

/**
 * Resolves a wall clock ("YYYY-MM-DDTHH:mm") in `timeZone` to the instant it
 * names, or null if it can't be parsed.
 *
 * Two passes: the first offset has to be measured at the wrong instant, since
 * the right one isn't known yet. That only matters within a few hours of a DST
 * change, and re-measuring at the corrected instant settles it. Wall clocks
 * that DST skips or repeats are genuinely ambiguous — this resolves them
 * consistently rather than throwing.
 */
export function zonedWallClockToInstant(wallClock: string, timeZone: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(wallClock)
  if (!match) return null
  const [, year, month, day, hour, minute] = match
  const pseudoUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 0)
  try {
    const firstPass = pseudoUtc - zoneOffsetMs(new Date(pseudoUtc), timeZone)
    return new Date(pseudoUtc - zoneOffsetMs(new Date(firstPass), timeZone))
  } catch {
    return null
  }
}

/**
 * Inverse of the above: renders an instant as the wall clock `timeZone` shows
 * at that moment, in the "YYYY-MM-DDTHH:mm" form <input type="datetime-local">
 * expects.
 */
export function instantToZonedWallClock(iso: string | null, timeZone: string): string {
  if (!iso) return ''
  const instant = new Date(iso)
  if (Number.isNaN(instant.getTime())) return ''
  try {
    // Shifting by the offset makes the instant's UTC face read as the target
    // zone's wall clock, so toISOString can just be sliced.
    const shifted = new Date(instant.getTime() + zoneOffsetMs(instant, timeZone))
    return shifted.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

/**
 * A wall clock resolved in the event's zone, falling back to the browser's zone
 * for events created before zones existed — which is exactly what those events
 * already did, so their behaviour is unchanged.
 */
function wallClockToInstant(wallClock: string, timeZone: string | null): Date | null {
  if (timeZone) return zonedWallClockToInstant(wallClock, timeZone)
  const parsed = new Date(wallClock)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * "2:00 PM EDT" — the time at the venue with its zone, the way an invitation
 * prints it, so every guest sees the same thing wherever they are. Events with
 * no zone keep showing their raw stored time.
 */
export function formatEventTime(
  eventDate: string | null,
  eventTime: string | null,
  timeZone: string | null
): string {
  if (!eventTime) return ''
  if (!timeZone || !eventDate) return eventTime
  const instant = zonedWallClockToInstant(`${eventDate}T${eventTime}`, timeZone)
  if (!instant) return eventTime
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone, hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
    }).format(instant)
  } catch {
    return eventTime
  }
}

/** "America/Toronto · EDT", for the host-facing picker summary. */
export function timezoneLabel(timeZone: string, at: Date = new Date()): string {
  if (!timeZone) return ''
  try {
    const abbr = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
      .formatToParts(at)
      .find(p => p.type === 'timeZoneName')?.value
    return abbr ? `${timeZone} · ${abbr}` : timeZone
  } catch {
    return timeZone
  }
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
//
// Every wall clock here is resolved in the *event's* zone. Resolving them in
// the host's browser zone instead is what made a remotely-organised event's
// feed open and close at the wrong moment.
export function computeFeedClosesAt(
  eventDate: string | null,
  eventTime: string | null,
  closeMode: FeedCloseMode,
  customDateTime: string | null,
  timeZone: string | null
): string | null {
  if (closeMode === 'none') return null
  if (closeMode === 'custom') {
    if (!customDateTime) return null
    return wallClockToInstant(customDateTime, timeZone)?.toISOString() ?? null
  }

  const durationMs = FEED_CLOSE_DURATIONS_MS[closeMode]
  if (!durationMs || !eventDate) return null
  const start = wallClockToInstant(`${eventDate}T${eventTime || '00:00'}`, timeZone)
  if (!start) return null
  return new Date(start.getTime() + durationMs).toISOString()
}

/** feed_opens_at, resolved the same way. */
export function computeFeedOpensAt(wallClock: string | null, timeZone: string | null): string | null {
  if (!wallClock) return null
  return wallClockToInstant(wallClock, timeZone)?.toISOString() ?? null
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