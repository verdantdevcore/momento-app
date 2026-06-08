import { v2 as cloudinary } from 'cloudinary'
import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@supabase/supabase-js'
import { logAudit } from '@/lib/audit'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '5 m'),
  analytics: false,
})

// Normalise a URL to just its origin (scheme + host, no trailing slash)
function toOrigin(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

// Given an origin, return both the apex and www variants so requests
// from either host are accepted (e.g. sharemomento.app + www.sharemomento.app)
function withWwwVariants(origin: string | null): string[] {
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

const ALLOWED_ORIGINS: string[] = [
  ...withWwwVariants(toOrigin(process.env.NEXT_PUBLIC_APP_URL)),
  ...withWwwVariants(toOrigin('http://localhost:3000')),
  // Add any Vercel preview pattern you want to allow:
  // 'https://momento-*.vercel.app',  ← add if you use preview deployments
].filter(Boolean) as string[]

const ALLOWED_MIME_TYPES = [
  'image/jpeg','image/jpg','image/png','image/webp',
  'image/gif','image/heic','image/heif','image/avif',
  'image/tiff','image/bmp',
  'video/mp4','video/quicktime','video/webm',
  'video/x-msvideo','video/mpeg','video/3gpp',
]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_SIZE_MB = 50

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true // same-origin server-side calls have no Origin header
  const requestOrigin = toOrigin(origin) ?? origin
  return ALLOWED_ORIGINS.includes(requestOrigin)
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  // Origin validation
  const origin = request.headers.get('origin')
  if (!isOriginAllowed(origin)) {
    await logAudit({ event_type: 'upload_blocked_origin', ip, metadata: { origin, allowed: ALLOWED_ORIGINS } })
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
  }

  // Rate limiting
  const { success, limit, remaining, reset } = await ratelimit.limit(ip)
  if (!success) {
    await logAudit({ event_type: 'upload_rate_limited', ip })
    return NextResponse.json(
      { error: 'Too many uploads. Please wait a few minutes before trying again.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit':     String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset':     String(reset),
          'Retry-After':           String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }

  try {
    const formData = await request.formData()
    const file       = formData.get('file')       as File
    const eventId    = formData.get('eventId')    as string
    const uploadedBy = formData.get('uploadedBy') as string | null
    const batchId    = formData.get('batchId')    as string | null
    const hashtagsRaw = formData.get('hashtags')  as string | null
    const hashtags: string[] = hashtagsRaw ? JSON.parse(hashtagsRaw) : []

    if (!file || !eventId) {
      return NextResponse.json({ error: 'Missing file or eventId' }, { status: 400 })
    }

    if (!UUID_RE.test(eventId)) {
      return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 })
    }

    if (uploadedBy && uploadedBy.length > 100) {
      return NextResponse.json({ error: 'Name too long (max 100 characters)' }, { status: 400 })
    }
    if (hashtags.length > 10) {
      return NextResponse.json({ error: 'Too many hashtags (max 10)' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_SIZE_MB}MB.` },
        { status: 400 }
      )
    }

    const mimeType = file.type.toLowerCase()
    const fileName  = file.name.toLowerCase()
    const isHeic    = mimeType === 'image/heic' || mimeType === 'image/heif' ||
                      fileName.endsWith('.heic') || fileName.endsWith('.heif')
    const isVideo   = mimeType.startsWith('video/')
    const allowed   = ALLOWED_MIME_TYPES.includes(mimeType) || isHeic

    if (!allowed) {
      return NextResponse.json(
        { error: `File type not supported: ${mimeType || file.name}` },
        { status: 400 }
      )
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let cloudinaryResult: any
    try {
      cloudinaryResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder:        'Momento/AdimandJojo26',
            resource_type: isVideo ? 'video' : 'image',
            ...(isHeic && { format: 'jpg' }),
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })
    } catch (cdnErr: any) {
      await logAudit({
        event_type: 'upload_cloudinary_failed',
        ip,
        metadata: { event_id: eventId, error: cdnErr.message },
      })
      return NextResponse.json({ error: 'Upload to storage failed. Please try again.' }, { status: 500 })
    }

    const { data: mediaRecord, error: dbErr } = await adminClient
      .from('media')
      .insert({
        event_id:    eventId,
        url:         cloudinaryResult.secure_url,
        type:        isVideo ? 'video' : 'image',
        uploaded_by: uploadedBy || null,
        hashtags:    hashtags,
        batch_id:    batchId || null,
        views:       0,
      })
      .select('id')
      .single()

    if (dbErr) {
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, {
          resource_type: isVideo ? 'video' : 'image',
        })
      } catch (cleanupErr) {
        console.error('[upload] Cloudinary cleanup after DB failure failed:', cleanupErr)
      }
      await logAudit({
        event_type: 'upload_db_failed',
        ip,
        metadata: { event_id: eventId, error: dbErr.message },
      })
      return NextResponse.json({ error: 'Failed to save upload record' }, { status: 500 })
    }

    await logAudit({
      event_type: 'upload_success',
      ip,
      metadata: {
        event_id:    eventId,
        media_id:    mediaRecord.id,
        type:        isVideo ? 'video' : 'image',
        size_bytes:  file.size,
        uploaded_by: uploadedBy || null,
      },
    })

    return NextResponse.json({
      url:     cloudinaryResult.secure_url,
      type:    isVideo ? 'video' : 'image',
      mediaId: mediaRecord.id,
    })

  } catch (error: any) {
    console.error('[upload] error:', error)
    await logAudit({ event_type: 'upload_error', ip, metadata: { error: error.message } })
    return NextResponse.json(
      { error: error.message ?? 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}