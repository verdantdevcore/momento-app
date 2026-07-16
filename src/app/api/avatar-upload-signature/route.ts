import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { cloudinary, CLOUDINARY_ROOT } from '@/lib/cloudinary'
import {
  isOriginAllowed,
  avatarRatelimit,
  MAX_AVATAR_SIZE_MB,
  classifyFile,
} from '@/lib/upload-security'

const AVATAR_FOLDER = `${CLOUDINARY_ROOT}/avatars`

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  const origin = request.headers.get('origin')
  if (!isOriginAllowed(origin)) {
    await logAudit({ event_type: 'avatar_upload_blocked_origin', ip, metadata: { origin } })
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { success, limit, remaining, reset } = await avatarRatelimit.limit(user.id)
  if (!success) {
    await logAudit({ event_type: 'avatar_upload_rate_limited', user_id: user.id, ip })
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
    const fileName = (body.fileName as string) ?? ''
    const fileType = (body.fileType as string) ?? ''
    const fileSize = Number(body.fileSize) || 0

    if (fileSize > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_AVATAR_SIZE_MB}MB.` },
        { status: 400 }
      )
    }

    const { isHeic, isVideo, allowed } = classifyFile(fileType, fileName)
    if (isVideo || !allowed) {
      return NextResponse.json({ error: 'Only image files are supported for profile photos.' }, { status: 400 })
    }

    const timestamp = Math.round(Date.now() / 1000)
    // Fixed public_id per host so re-uploads overwrite the previous avatar
    // instead of accumulating orphaned Cloudinary assets.
    const publicId = user.id

    const paramsToSign: Record<string, string | number | boolean> = {
      folder: AVATAR_FOLDER,
      public_id: publicId,
      overwrite: true,
      invalidate: true,
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
      folder: AVATAR_FOLDER,
      publicId,
      overwrite: true,
      invalidate: true,
      resourceType: 'image',
      format: isHeic ? 'jpg' : undefined,
    })
  } catch (error: any) {
    console.error('[avatar-upload-signature] error:', error)
    await logAudit({ event_type: 'avatar_upload_signature_error', user_id: user.id, ip, metadata: { error: error.message } })
    return NextResponse.json(
      { error: error.message ?? 'Could not start upload. Please try again.' },
      { status: 500 }
    )
  }
}
