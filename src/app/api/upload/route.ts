import { v2 as cloudinary } from 'cloudinary'
import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// F-02: Rate limiter — 10 uploads per IP per 5 minutes
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '5 m'),
  analytics: false,
})

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif', 'image/heic', 'image/heif', 'image/avif',
  'image/tiff', 'image/bmp',
  'video/mp4', 'video/quicktime', 'video/webm',
  'video/x-msvideo', 'video/mpeg', 'video/3gpp',
]

const MAX_SIZE_MB = 50

export async function POST(request: NextRequest) {
  try {
    // F-02: Enforce rate limit per IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'anonymous'

    const { success, limit, remaining, reset } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait a few minutes before trying again.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const eventId = formData.get('eventId') as string

    if (!file || !eventId) {
      return NextResponse.json(
        { error: 'Missing file or eventId.' },
        { status: 400 }
      )
    }

    // Server-side size check
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_SIZE_MB}MB.` },
        { status: 400 }
      )
    }

    // Server-side type check
    const mimeType = file.type.toLowerCase()
    const fileName = file.name.toLowerCase()
    const isHeic =
      mimeType === 'image/heic' ||
      mimeType === 'image/heif' ||
      fileName.endsWith('.heic') ||
      fileName.endsWith('.heif')
    const isVideo = mimeType.startsWith('video/')

    const allowed = ALLOWED_MIME_TYPES.includes(mimeType) || isHeic
    if (!allowed) {
      return NextResponse.json(
        { error: `File type not supported: ${mimeType || file.name}. Please upload images or videos only.` },
        { status: 400 }
      )
    }

    // Validate eventId is a UUID to prevent injection
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidPattern.test(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'Momento/AdimandJojo26',
          resource_type: isVideo ? 'video' : 'image',
          ...(isHeic && { format: 'jpg' }),
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return NextResponse.json({
      url: result.secure_url,
      type: isVideo ? 'video' : 'image',
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message ?? 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}