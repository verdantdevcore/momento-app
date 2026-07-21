import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { createClient } from '@supabase/supabase-js'
import { curateRecap, MIN_CANDIDATES, type CandidateMedia } from '@/lib/recap'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

type MediaRow = {
  id: string
  type: string
  url: string
  views: number | null
  hashtags: string[] | null
  created_at: string
  batch_id: string | null
}

/**
 * Curates and snapshots one event's AI recap. Queued by /api/recap/generate
 * via QStash (see enqueueRecapGenerate in lib/qstash.ts).
 *
 * v1 renders nothing server-side: the guest viewer plays a client-side
 * slideshow over the selected media, so this job's only job is picking and
 * ordering that media (curateRecap) and persisting the snapshot.
 *
 * Returns 200 for every "this should not run" outcome — a deleted event, a
 * status that's already moved past 'processing' — because a non-2xx makes
 * QStash retry, and none of those resolve on a retry.
 */
async function handler(request: Request) {
  const { eventId } = await request.json() as { eventId?: string }
  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })
  }

  const { data: event } = await adminClient
    .from('events')
    .select('id, recap_status')
    .eq('id', eventId)
    .maybeSingle()

  if (!event) return NextResponse.json({ skipped: 'event not found' })

  // A retry landing after the job already completed (or after the host
  // toggled something that reset status) has nothing left to do.
  if (event.recap_status !== 'processing') {
    return NextResponse.json({ skipped: 'not in processing state' })
  }

  try {
    const { data: media, error: mediaErr } = await adminClient
      .from('media')
      .select('id, type, url, views, hashtags, created_at, batch_id')
      .eq('event_id', eventId)
      .returns<MediaRow[]>()

    if (mediaErr) throw new Error(mediaErr.message)

    const mediaIds = (media ?? []).map(m => m.id)
    const faceCounts = new Map<string, number>()
    if (mediaIds.length > 0) {
      const { data: faceRows } = await adminClient
        .from('media_faces')
        .select('media_id')
        .in('media_id', mediaIds)
      for (const row of faceRows ?? []) {
        faceCounts.set(row.media_id, (faceCounts.get(row.media_id) ?? 0) + 1)
      }
    }

    const candidates: CandidateMedia[] = (media ?? []).map(m => ({
      id: m.id,
      type: m.type === 'video' ? 'video' : 'image',
      url: m.url,
      views: m.views ?? 0,
      hashtags: m.hashtags ?? [],
      created_at: m.created_at,
      batch_id: m.batch_id,
      faceCount: faceCounts.get(m.id) ?? 0,
    }))

    if (candidates.length < MIN_CANDIDATES) {
      await adminClient
        .from('events')
        .update({ recap_status: 'failed', recap_error: 'Not enough photos yet' })
        .eq('id', eventId)
      return NextResponse.json({ skipped: 'insufficient media' })
    }

    const items = curateRecap(candidates)

    // A regenerate fully replaces the prior snapshot rather than diffing it.
    await adminClient.from('event_recap_items').delete().eq('event_id', eventId)

    if (items.length > 0) {
      const { error: insertErr } = await adminClient.from('event_recap_items').insert(
        items.map(item => ({
          event_id: eventId,
          media_id: item.mediaId,
          position: item.position,
          score: item.score,
          duration_secs: item.durationSecs,
        }))
      )
      if (insertErr) throw new Error(insertErr.message)
    }

    await adminClient
      .from('events')
      .update({
        recap_status: 'ready',
        recap_render_mode: 'client_slideshow',
        recap_generated_at: new Date().toISOString(),
        recap_item_count: items.length,
        recap_video_url: null,
        recap_error: null,
      })
      .eq('id', eventId)

    console.log('[recap-generate-job] generated', { eventId, items: items.length })
    return NextResponse.json({ eventId, items: items.length })
  } catch (err) {
    console.error('[recap-generate-job] failed:', { eventId, err })
    await adminClient
      .from('events')
      .update({ recap_status: 'failed', recap_error: String(err) })
      .eq('id', eventId)
    return NextResponse.json({ error: 'Recap generation failed' }, { status: 500 })
  }
}

// QStash signs every message; this rejects anything that isn't from our queue.
export const POST = verifySignatureAppRouter(handler)
