import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

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
