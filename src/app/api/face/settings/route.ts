import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { enqueueFaceIndexBatch } from '@/lib/qstash'
import { deleteEventCollection, facesConfigured } from '@/lib/faces'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/**
 * Turns face search on or off for one event.
 *
 * Routed through the API rather than a direct table update from the dashboard
 * (as the rest of the edit form does) for one reason: enabling this starts
 * collecting biometric data on the strength of the host's assertion that they
 * have their guests' consent. That assertion needs an audit record naming who
 * made it and when — face_search_attested_at on the row, plus an audit log
 * entry — and a client-side update gives neither.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { eventId, enabled, attested } = await request.json() as {
      eventId?: string
      enabled?: boolean
      attested?: boolean
    }
    if (!eventId || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Missing eventId or enabled' }, { status: 400 })
    }
    if (enabled && !facesConfigured()) {
      return NextResponse.json({ error: 'Face search is unavailable.' }, { status: 503 })
    }
    // The dashboard will not send enabled:true without it, but this is the
    // server-side half of that promise — the attestation is the legal basis for
    // the whole feature, so it cannot be optional here.
    if (enabled && !attested) {
      return NextResponse.json(
        { error: 'You must confirm you have your guests’ consent to enable face search.' },
        { status: 400 }
      )
    }

    const { data: event } = await adminClient
      .from('events')
      .select('id, slug, host_id, face_search_enabled')
      .eq('id', eventId)
      .maybeSingle()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    if (event.host_id !== user.id) {
      await logAudit({
        event_type: 'face_settings_unauthorised',
        user_id: user.id,
        ip,
        metadata: { event_id: eventId, owner: event.host_id },
      })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Restricted or soft-deleted hosts have dark feeds; they must not be able
    // to start indexing faces on the way out.
    const { data: host } = await adminClient
      .from('hosts')
      .select('restricted_at, deleted_at')
      .eq('id', user.id)
      .maybeSingle()
    if (enabled && (host?.restricted_at || host?.deleted_at)) {
      return NextResponse.json({ error: 'This account is no longer active.' }, { status: 403 })
    }

    if (!enabled) {
      // Turning it off destroys the index rather than hiding it. Anything less
      // would mean we keep face templates for an event whose host has
      // explicitly withdrawn them.
      const collectionRemoved = await deleteEventCollection(event.slug)

      await adminClient
        .from('events')
        .update({ face_search_enabled: false, face_search_attested_at: null })
        .eq('id', eventId)

      // media_faces rows are meaningless without the collection they point at,
      // and clearing face_indexed_at lets a later re-enable rebuild from
      // scratch rather than skipping every photo as "already indexed".
      await adminClient.from('media_faces').delete().eq('event_id', eventId)
      await adminClient.from('media').update({ face_indexed_at: null }).eq('event_id', eventId)

      await logAudit({
        event_type: 'face_search_disabled',
        user_id: user.id,
        ip,
        metadata: { event_id: eventId, collection_removed: collectionRemoved },
      })

      return NextResponse.json({ enabled: false, queued: 0 })
    }

    const attestedAt = new Date().toISOString()
    const { error: updateErr } = await adminClient
      .from('events')
      .update({ face_search_enabled: true, face_search_attested_at: attestedAt })
      .eq('id', eventId)

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    // Backfill. A host typically turns this on after the event, once the photos
    // are already in — without this, face search would only ever cover photos
    // uploaded from this moment on, which for most events is none of them.
    const { data: backlog } = await adminClient
      .from('media')
      .select('id')
      .eq('event_id', eventId)
      .eq('type', 'image')
      .is('face_indexed_at', null)

    const queued = await enqueueFaceIndexBatch((backlog ?? []).map(m => m.id))

    await logAudit({
      event_type: 'face_search_enabled',
      user_id: user.id,
      ip,
      // The record of the attestation: who turned it on, when, and how many
      // photos it reached back over.
      metadata: { event_id: eventId, attested_at: attestedAt, backfill_queued: queued },
    })

    return NextResponse.json({ enabled: true, queued })
  } catch (err) {
    console.error('[face-settings] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
