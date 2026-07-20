import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logAudit } from '@/lib/audit'
import { getFeedStatus } from '@/lib/utils'
import { cloudinary } from '@/lib/cloudinary'
import { enqueueFaceIndex } from '@/lib/qstash'
import {
  isOriginAllowed,
  isHostInactive,
  saveRatelimit,
  UUID_RE,
} from '@/lib/upload-security'

// cloudinary is used only to clean up an orphaned asset if the DB insert below
// fails after the file has already landed in storage.
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// The browser now uploads the file bytes directly to Cloudinary using a
// short-lived signature from /api/upload-signature. This route only ever
// receives a small JSON payload (the resulting Cloudinary URL + metadata)
// and writes the media record — it never touches raw file bytes. This
// avoids the serverless function request-body limit that was previously
// causing large files (mainly videos) to fail silently before reaching
// this handler.
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  const origin = request.headers.get('origin')
  if (!isOriginAllowed(origin)) {
    await logAudit({ event_type: 'upload_blocked_origin', ip, metadata: { origin } })
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
  }

  const { success, limit, remaining, reset } = await saveRatelimit.limit(ip)
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
    const eventId      = body.eventId as string
    const url          = body.url as string
    const publicId     = body.publicId as string | undefined
    const resourceType = (body.resourceType as string) === 'video' ? 'video' : 'image'
    const uploadedBy   = (body.uploadedBy as string | null) ?? null
    const batchId      = (body.batchId as string | null) ?? null
    const hashtags: string[] = Array.isArray(body.hashtags) ? body.hashtags : []

    if (!url || !eventId) {
      return NextResponse.json({ error: 'Missing url or eventId' }, { status: 400 })
    }

    if (!UUID_RE.test(eventId)) {
      return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 })
    }

    const { data: eventRow } = await adminClient
      .from('events')
      .select('host_id, feed_opens_at, feed_closes_at, face_search_enabled')
      .eq('id', eventId)
      .single()

    if (!eventRow || getFeedStatus(eventRow) !== 'open') {
      return NextResponse.json({ error: 'This event is not currently accepting uploads.' }, { status: 403 })
    }

    // Service-role key bypasses the RLS policies that take restricted hosts'
    // feeds dark, so the check is repeated here.
    if (await isHostInactive(eventRow.host_id)) {
      await logAudit({
        event_type: 'upload_blocked_inactive_host',
        ip,
        metadata: { event_id: eventId },
      })
      return NextResponse.json({ error: 'This event is no longer available.' }, { status: 403 })
    }

    // Only ever trust Cloudinary URLs — this endpoint must not become a
    // way to register arbitrary third-party media records.
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid media URL' }, { status: 400 })
    }
    if (!/(^|\.)res\.cloudinary\.com$/.test(parsedUrl.hostname)) {
      return NextResponse.json({ error: 'Invalid media URL' }, { status: 400 })
    }

    if (uploadedBy && uploadedBy.length > 100) {
      return NextResponse.json({ error: 'Name too long (max 100 characters)' }, { status: 400 })
    }
    if (hashtags.length > 10) {
      return NextResponse.json({ error: 'Too many hashtags (max 10)' }, { status: 400 })
    }

    const { data: mediaRecord, error: dbErr } = await adminClient
      .from('media')
      .insert({
        event_id:    eventId,
        url,
        type:        resourceType,
        uploaded_by: uploadedBy || null,
        hashtags,
        batch_id:    batchId || null,
        views:       0,
      })
      .select('id')
      .single()

    if (dbErr) {
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
        } catch (cleanupErr) {
          console.error('[upload] Cloudinary cleanup after DB failure failed:', cleanupErr)
        }
      }
      await logAudit({
        event_type: 'upload_db_failed',
        ip,
        metadata: { event_id: eventId, error: dbErr.message },
      })
      return NextResponse.json({ error: 'Failed to save upload record' }, { status: 500 })
    }

    // Queue face indexing for photos on events with face search turned on. The
    // job re-checks both conditions, so this is an optimisation to avoid
    // queueing work that would only no-op — not the enforcement point.
    if (resourceType === 'image' && eventRow.face_search_enabled) {
      await enqueueFaceIndex(mediaRecord.id)
    }

    await logAudit({
      event_type: 'upload_success',
      ip,
      metadata: {
        event_id:    eventId,
        media_id:    mediaRecord.id,
        type:        resourceType,
        uploaded_by: uploadedBy || null,
      },
    })

    return NextResponse.json({
      url,
      type:    resourceType,
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
