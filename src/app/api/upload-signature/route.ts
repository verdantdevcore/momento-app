import { v2 as cloudinary } from 'cloudinary'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logAudit } from '@/lib/audit'
import { getFeedStatus } from '@/lib/utils'
import {
  isOriginAllowed,
  signatureRatelimit,
  UUID_RE,
  MAX_SIZE_MB,
  classifyFile,
} from '@/lib/upload-security'

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

const UPLOAD_FOLDER = 'Momento/AdimandJojo26'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  const origin = request.headers.get('origin')
  if (!isOriginAllowed(origin)) {
    await logAudit({ event_type: 'upload_blocked_origin', ip, metadata: { origin } })
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
  }

  const { success, limit, remaining, reset } = await signatureRatelimit.limit(ip)
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
    const body = await request.json()
    const eventId  = body.eventId as string
    const fileName = (body.fileName as string) ?? ''
    const fileType = (body.fileType as string) ?? ''
    const fileSize = Number(body.fileSize) || 0

    if (!eventId || !UUID_RE.test(eventId)) {
      return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 })
    }

    const { data: eventRow } = await adminClient
      .from('events')
      .select('feed_opens_at, feed_closes_at')
      .eq('id', eventId)
      .single()

    if (!eventRow || getFeedStatus(eventRow) !== 'open') {
      return NextResponse.json({ error: 'This event is not currently accepting uploads.' }, { status: 403 })
    }

    if (fileSize > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_SIZE_MB}MB.` },
        { status: 400 }
      )
    }

    const { isHeic, isVideo, allowed } = classifyFile(fileType, fileName)
    if (!allowed) {
      return NextResponse.json(
        { error: `File type not supported: ${fileType || fileName}` },
        { status: 400 }
      )
    }

    const timestamp = Math.round(Date.now() / 1000)
    const resourceType = isVideo ? 'video' : 'image'

    // Params must exactly match what the browser sends alongside the
    // signature on the direct-to-Cloudinary upload request.
    const paramsToSign: Record<string, string | number> = {
      folder: UPLOAD_FOLDER,
      timestamp,
      ...(isHeic && { format: 'jpg' }),
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder: UPLOAD_FOLDER,
      resourceType,
      format: isHeic ? 'jpg' : undefined,
    })
  } catch (error: any) {
    console.error('[upload-signature] error:', error)
    await logAudit({ event_type: 'upload_signature_error', ip, metadata: { error: error.message } })
    return NextResponse.json(
      { error: error.message ?? 'Could not start upload. Please try again.' },
      { status: 500 }
    )
  }
}
