import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { UUID_RE } from '@/lib/upload-security'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/**
 * Host-only. Marks a photo request done, dropping it from the guest feed
 * banner and the dashboard's live list. Soft delete (dismissed_at, never
 * cleared) rather than a row delete — same idempotency shape as the rest of
 * this route family, and there's no scenario where a dismissed request
 * needs reopening rather than just creating a new one.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { eventId, requestId } = await request.json() as { eventId?: string; requestId?: string }
    if (!eventId || !UUID_RE.test(eventId) || !requestId || !UUID_RE.test(requestId)) {
      return NextResponse.json({ error: 'Invalid eventId or requestId' }, { status: 400 })
    }

    const { data: event } = await adminClient
      .from('events')
      .select('id, host_id')
      .eq('id', eventId)
      .maybeSingle()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    if (event.host_id !== user.id) {
      await logAudit({
        event_type: 'photo_request_dismiss_unauthorised',
        user_id: user.id,
        ip,
        metadata: { event_id: eventId, owner: event.host_id },
      })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: host } = await adminClient
      .from('hosts')
      .select('restricted_at, deleted_at')
      .eq('id', user.id)
      .maybeSingle()
    if (host?.restricted_at || host?.deleted_at) {
      return NextResponse.json({ error: 'This account is no longer active.' }, { status: 403 })
    }

    const { data: existing } = await adminClient
      .from('event_photo_requests')
      .select('id')
      .eq('id', requestId)
      .eq('event_id', eventId)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Photo request not found' }, { status: 404 })
    }

    await adminClient
      .from('event_photo_requests')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', requestId)

    await logAudit({
      event_type: 'photo_request_dismissed',
      user_id: user.id,
      ip,
      metadata: { event_id: eventId, request_id: requestId },
    })

    return NextResponse.json({ dismissed: true })
  } catch (err) {
    console.error('[photo-requests-dismiss] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
