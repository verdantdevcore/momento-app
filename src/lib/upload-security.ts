import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/**
 * True if the host is restricted or soft-deleted, meaning their feeds are dark.
 *
 * The upload routes hold the service-role key, which bypasses the RLS policies
 * that enforce this — so they have to ask explicitly.
 *
 * Deliberately fails *open*. This is defence in depth, not the primary control:
 * the RLS policies already hide a restricted host's events and media from
 * everyone, so an upload that slips through on a transient error lands
 * somewhere nobody can see. Failing closed would instead turn any blip — or
 * deploying this code before migration 001 adds the columns — into a total
 * upload outage for every event on the platform.
 */
export async function isHostInactive(hostId: string): Promise<boolean> {
  const { data, error } = await adminClient
    .from('hosts')
    .select('restricted_at, deleted_at')
    .eq('id', hostId)
    .maybeSingle()

  if (error) {
    console.error('[upload-security] host status lookup failed, allowing upload:', error)
    return false
  }
  return Boolean(data?.restricted_at || data?.deleted_at)
}

// Normalise a URL to just its origin (scheme + host, no trailing slash)
export function toOrigin(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

// Given an origin, return both the apex and www variants so requests
// from either host are accepted (e.g. sharemomento.app + www.sharemomento.app)
export function withWwwVariants(origin: string | null): string[] {
  if (!origin) return []
  try {
    const url = new URL(origin)
    const host = url.hostname
    const variants = new Set<string>([origin])
    if (host.startsWith('www.')) {
      variants.add(`${url.protocol}//${host.slice(4)}`)
    } else {
      variants.add(`${url.protocol}//www.${host}`)
    }
    return [...variants]
  } catch {
    return [origin]
  }
}

export const ALLOWED_ORIGINS: string[] = [
  ...withWwwVariants(toOrigin(process.env.NEXT_PUBLIC_APP_URL)),
  ...withWwwVariants(toOrigin('http://localhost:3000')),
].filter(Boolean) as string[]

export const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif', 'image/heic', 'image/heif', 'image/avif',
  'image/tiff', 'image/bmp',
  'video/mp4', 'video/quicktime', 'video/webm',
  'video/x-msvideo', 'video/mpeg', 'video/3gpp',
]

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const MAX_SIZE_MB = 50

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true // same-origin server-side calls have no Origin header
  const requestOrigin = toOrigin(origin) ?? origin
  return ALLOWED_ORIGINS.includes(requestOrigin)
}

// Two independent limiters (distinct Redis key prefixes) so that
// requesting a signature and confirming a save are rate-limited
// separately rather than sharing one bucket.
export const signatureRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '5 m'),
  analytics: false,
  prefix: 'ratelimit:upload-signature',
})

export const saveRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '5 m'),
  analytics: false,
  prefix: 'ratelimit:upload-save',
})

// Keyed by user id (not ip) since avatar uploads require an authenticated host.
export const avatarRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  analytics: false,
  prefix: 'ratelimit:avatar-upload',
})

// Tighter than the upload limiters: face search is an unauthenticated endpoint
// that costs money per call, and it is the one endpoint where a loose limit
// would let someone bulk-test faces against an event's guest list.
export const faceSearchRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(6, '10 m'),
  analytics: false,
  prefix: 'ratelimit:face-search',
})

// Azure Face rejects inline images above 6MB. The browser downscales before
// sending, so anything near this is a client that skipped that step.
export const MAX_SELFIE_SIZE_MB = 5

export const MAX_AVATAR_SIZE_MB = 8

export function classifyFile(mimeTypeRaw: string, fileNameRaw: string) {
  const mimeType = mimeTypeRaw.toLowerCase()
  const fileName = fileNameRaw.toLowerCase()
  const isHeic = mimeType === 'image/heic' || mimeType === 'image/heif' ||
    fileName.endsWith('.heic') || fileName.endsWith('.heif')
  const isVideo = mimeType.startsWith('video/')
  const allowed = ALLOWED_MIME_TYPES.includes(mimeType) || isHeic
  return { mimeType, isHeic, isVideo, allowed }
}
