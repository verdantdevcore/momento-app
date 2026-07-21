import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logAudit } from '@/lib/audit'
import { getFeedStatus } from '@/lib/utils'
import { eventCollection, facesConfigured, NoFaceInSelfieError, searchBySelfie } from '@/lib/faces'
import {
  checkRateLimit,
  faceSearchRatelimit,
  isHostInactive,
  isOriginAllowed,
  MAX_SELFIE_SIZE_MB,
} from '@/lib/upload-security'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/**
 * "Upload a selfie, find every photo you're in."
 *
 * Takes selfie bytes, returns the ids of the media in this event containing
 * that face. Guests are anonymous, so this is unauthenticated and gated on the
 * event's own rules instead: the feed must be open, the host must not be
 * restricted, and the host must have turned face search on.
 *
 * The selfie is passed straight to Rekognition and dropped. It is never stored,
 * never indexed into the collection, and never written to the audit log — the
 * only trace a search leaves is a count.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  const origin = request.headers.get('origin')
  if (!isOriginAllowed(origin)) {
    await logAudit({ event_type: 'face_search_blocked_origin', ip, metadata: { origin } })
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
  }

  if (!facesConfigured()) {
    return NextResponse.json({ error: 'Face search is unavailable.' }, { status: 503 })
  }

  const { success, limit, remaining, reset } = await checkRateLimit(faceSearchRatelimit, ip)
  if (!success) {
    await logAudit({ event_type: 'face_search_rate_limited', ip })
    return NextResponse.json(
      { error: 'Too many searches. Please wait a few minutes before trying again.' },
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
    const slug   = body.slug as string
    const selfie = body.selfie as string

    if (!slug || !selfie) {
      return NextResponse.json({ error: 'Missing slug or selfie' }, { status: 400 })
    }

    // Sent as a data URL by the browser; tolerate a bare base64 string too.
    const base64 = selfie.includes(',') ? selfie.slice(selfie.indexOf(',') + 1) : selfie
    let bytes: Uint8Array
    try {
      bytes = new Uint8Array(Buffer.from(base64, 'base64'))
    } catch {
      return NextResponse.json({ error: 'Invalid selfie' }, { status: 400 })
    }
    if (bytes.length === 0) {
      return NextResponse.json({ error: 'Invalid selfie' }, { status: 400 })
    }
    if (bytes.length > MAX_SELFIE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Photo too large. Maximum size is ${MAX_SELFIE_SIZE_MB}MB.` },
        { status: 400 }
      )
    }

    const { data: event } = await adminClient
      .from('events')
      .select('id, slug, host_id, face_search_enabled, feed_opens_at, feed_closes_at')
      .eq('slug', slug)
      .maybeSingle()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    if (!event.face_search_enabled) {
      return NextResponse.json({ error: 'Face search is not enabled for this event.' }, { status: 403 })
    }
    if (getFeedStatus(event) !== 'open') {
      return NextResponse.json({ error: 'This event is not currently available.' }, { status: 403 })
    }
    // Service-role key bypasses the RLS that takes a restricted host's feed
    // dark, so the check is repeated here — same as the upload route.
    if (await isHostInactive(event.host_id)) {
      return NextResponse.json({ error: 'This event is no longer available.' }, { status: 403 })
    }

    let matchedMediaIds: string[]
    try {
      matchedMediaIds = await searchBySelfie({
        collectionId: eventCollection(event.slug),
        bytes,
      })
    } catch (err) {
      if (err instanceof NoFaceInSelfieError) {
        return NextResponse.json(
          { error: "We couldn't find a face in that photo. Try a clear, well-lit photo of just you." },
          { status: 422 }
        )
      }
      throw err
    }

    if (matchedMediaIds.length === 0) {
      await logAudit({ event_type: 'face_search_no_matches', ip, metadata: { event_id: event.id } })
      return NextResponse.json({ mediaIds: [] })
    }

    // Resolve through the media table rather than trusting the collection.
    // Rekognition is the source of truth for *faces*, not for what still
    // exists: a photo deleted while a DeleteFaces call failed would otherwise
    // surface here as a match the feed can't render. Scoping by event_id also
    // means a stale face id from another event can never leak a media id in.
    const { data: liveMedia } = await adminClient
      .from('media')
      .select('id')
      .eq('event_id', event.id)
      .in('id', matchedMediaIds)

    const mediaIds = (liveMedia ?? []).map(m => m.id)

    await logAudit({
      event_type: 'face_search_completed',
      ip,
      // Deliberately just a count — no selfie, no face ids, no media ids.
      metadata: { event_id: event.id, match_count: mediaIds.length },
    })

    return NextResponse.json({ mediaIds })
  } catch (error) {
    console.error('[face-search] error:', error)
    const message = error instanceof Error ? error.message : String(error)
    await logAudit({ event_type: 'face_search_error', ip, metadata: { error: message } })
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 })
  }
}
