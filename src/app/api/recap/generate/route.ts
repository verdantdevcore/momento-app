import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { enqueueRecapGenerate } from '@/lib/qstash'
import { UUID_RE } from '@/lib/upload-security'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/**
 * Starts (or restarts) curation of an event's AI recap.
 *
 * Host-only, no admin override — unlike event deletion, there's no scenario
 * where an admin needs to trigger this on a host's behalf. No consent/
 * attestation gate either: unlike face search, curation only re-reads media
 * that guests already agreed to share by uploading it, never biometric data.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { eventId } = await request.json() as { eventId?: string }
    if (!eventId || !UUID_RE.test(eventId)) {
      return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 })
    }

    const { data: event } = await adminClient
      .from('events')
      .select('id, host_id, recap_status')
      .eq('id', eventId)
      .maybeSingle()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    if (event.host_id !== user.id) {
      await logAudit({
        event_type: 'recap_generate_unauthorised',
        user_id: user.id,
        ip,
        metadata: { event_id: eventId, owner: event.host_id },
      })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // A restricted or soft-deleted host must not be able to kick off new
    // background work while their account is winding down.
    const { data: host } = await adminClient
      .from('hosts')
      .select('restricted_at, deleted_at')
      .eq('id', user.id)
      .maybeSingle()
    if (host?.restricted_at || host?.deleted_at) {
      return NextResponse.json({ error: 'This account is no longer active.' }, { status: 403 })
    }

    if (event.recap_status === 'processing') {
      return NextResponse.json({ error: 'A recap is already generating.' }, { status: 409 })
    }

    const { error: updateErr } = await adminClient
      .from('events')
      .update({ recap_status: 'processing', recap_requested_at: new Date().toISOString(), recap_error: null })
      .eq('id', eventId)

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to start recap generation' }, { status: 500 })
    }

    await enqueueRecapGenerate(eventId)

    await logAudit({
      event_type: 'recap_generate_requested',
      user_id: user.id,
      ip,
      metadata: { event_id: eventId },
    })

    return NextResponse.json({ status: 'processing' }, { status: 202 })
  } catch (err) {
    console.error('[recap-generate] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
