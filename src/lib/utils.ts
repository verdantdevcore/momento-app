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