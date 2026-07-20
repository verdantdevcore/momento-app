import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { createClient } from '@supabase/supabase-js'
import { derivedUrl } from '@/lib/cloudinary'
import { ensureCollection, eventCollection, facesConfigured, indexPhotoFaces } from '@/lib/faces'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Azure Face takes image bytes inline and caps them at 6MB. Capping the long
// edge at 1600px keeps every photo well under that while staying far above
// the 200x200px Azure recommends per face for reliable recognition. f_jpg
// normalises the HEIC that iPhones upload, which Azure does not read.
const FACE_API_DERIVATIVE = 'c_limit,w_1600,q_auto:good,f_jpg'

// The embedded events row comes back as an object for an !inner join on a
// to-one relation, which the generated types don't narrow to.
type MediaWithEvent = {
  id: string
  url: string
  type: string
  face_indexed_at: string | null
  event_id: string
  events: { slug: string; face_search_enabled: boolean }
}

/**
 * Indexes one uploaded photo's faces into its event's Azure face list.
 * Queued by /api/upload via QStash (see enqueueFaceIndex in lib/qstash.ts).
 *
 * Returns 200 for every "this photo should not be indexed" outcome — a feed
 * with face search off, a video, an already-indexed photo — because a non-2xx
 * makes QStash retry, and none of those resolve on a retry.
 */
async function handler(request: Request) {
  const { mediaId } = await request.json() as { mediaId?: string }
  if (!mediaId) {
    return NextResponse.json({ error: 'Missing mediaId' }, { status: 400 })
  }

  if (!facesConfigured()) {
    console.warn('[face-index] Azure Face not configured — skipping', mediaId)
    return NextResponse.json({ skipped: 'faces not configured' })
  }

  const { data: media } = await adminClient
    .from('media')
    .select('id, url, type, face_indexed_at, event_id, events!inner(slug, face_search_enabled)')
    .eq('id', mediaId)
    .maybeSingle<MediaWithEvent>()

  // Deleted between upload and this job running.
  if (!media) return NextResponse.json({ skipped: 'media not found' })

  const event = media.events

  // The host's switch. Checked here rather than only at enqueue time so that
  // turning face search off between upload and indexing still stops it.
  if (!event?.face_search_enabled) {
    return NextResponse.json({ skipped: 'face search not enabled for this event' })
  }
  if (media.type !== 'image') {
    return NextResponse.json({ skipped: 'not a photo' })
  }
  // QStash redelivers on any non-2xx and on network blips. Without this guard a
  // redelivery would index every face in this photo a second time.
  if (media.face_indexed_at) {
    return NextResponse.json({ skipped: 'already indexed' })
  }

  const imageUrl = derivedUrl(media.url, FACE_API_DERIVATIVE)
  if (!imageUrl) {
    return NextResponse.json({ skipped: 'not a cloudinary url' })
  }

  const imageRes = await fetch(imageUrl)
  if (!imageRes.ok) {
    // Worth a retry — Cloudinary may still be processing the derivative.
    console.error('[face-index] image fetch failed:', { mediaId, status: imageRes.status })
    return NextResponse.json({ error: 'Image fetch failed' }, { status: 502 })
  }
  const bytes = new Uint8Array(await imageRes.arrayBuffer())

  const collectionId = eventCollection(event.slug)
  await ensureCollection(collectionId)

  const faces = await indexPhotoFaces({
    collectionId,
    bytes,
    // Ties every face back to the media row, which is what search resolves.
    externalImageId: media.id,
  })

  if (faces.length > 0) {
    const { error: insertErr } = await adminClient.from('media_faces').insert(
      faces.map(face => ({
        media_id:          media.id,
        event_id:          media.event_id,
        persisted_face_id: face.faceId,
        bounding_box:      face.boundingBox,
        confidence:        face.confidence,
      }))
    )
    // Leave face_indexed_at null and let QStash retry: the faces are in the
    // list but nothing maps them back to this photo, so a search would match
    // and then resolve to nothing. The unique constraint on
    // (event_id, persisted_face_id) absorbs the duplicate insert on retry.
    if (insertErr) {
      console.error('[face-index] face row insert failed:', { mediaId, error: insertErr.message })
      return NextResponse.json({ error: 'Failed to record faces' }, { status: 500 })
    }
  }

  await adminClient
    .from('media')
    .update({ face_indexed_at: new Date().toISOString() })
    .eq('id', media.id)

  console.log('[face-index] indexed', { mediaId, faces: faces.length })
  return NextResponse.json({ mediaId, faces: faces.length })
}

// QStash signs every message; this rejects anything that isn't from our queue.
export const POST = verifySignatureAppRouter(handler)
