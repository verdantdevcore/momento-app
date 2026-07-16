import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { purgeEvent } from '@/lib/events'
import { UUID_RE } from '@/lib/upload-security'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Deleting an event must also delete its Cloudinary assets. The DB cascade
// removes the media rows, which are the only record of where the assets live —
// so the assets have to go first, while their URLs are still readable.
export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { eventId } = await request.json()
    if (!eventId || !UUID_RE.test(eventId)) {
      return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 })
    }

    const { data: event, error: fetchErr } = await adminClient
      .from('events')
      .select('id, slug, title, host_id')
      .eq('id', eventId)
      .single()

    if (fetchErr || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const { data: caller } = await adminClient
      .from('hosts')
      .select('is_super_admin, restricted_at, deleted_at')
      .eq('id', user.id)
      .single()

    const isOwner = event.host_id === user.id
    const isAdmin = Boolean(caller?.is_super_admin)
    if (!isOwner && !isAdmin) {
      await logAudit({
        event_type: 'event_delete_unauthorised',
        user_id: user.id,
        ip,
        metadata: { event_id: eventId, owner: event.host_id },
      })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // A restricted or soft-deleted host is locked out of /dashboard by the
    // proxy, but still holds a valid access token and could call this route
    // directly. Letting them through would destroy the very content they were
    // restricted over, and would blow away media the 30-day grace period is
    // meant to keep restorable.
    if (!isAdmin && (caller?.restricted_at || caller?.deleted_at)) {
      await logAudit({
        event_type: 'event_delete_blocked_inactive_host',
        user_id: user.id,
        ip,
        metadata: { event_id: eventId },
      })
      return NextResponse.json({ error: 'This account is no longer active.' }, { status: 403 })
    }

    const result = await purgeEvent(event)

    await logAudit({
      event_type: 'event_deleted',
      user_id: user.id,
      ip,
      metadata: {
        event_id:      eventId,
        title:         event.title,
        by_admin:      isAdmin && !isOwner,
        assets_deleted: result.deleted,
        assets_failed:  result.failed,
      },
    })

    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[delete-event] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
