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

const MAX_PROMPT_LENGTH = 120

type PhotoRequestRow = {
  id: string
  prompt: string
  created_at: string
}

/**
 * Public read of an event's live photo requests. No auth required — same
 * posture as /api/recap/status: event_photo_requests has RLS on with no
 * anon/authenticated policies, so this is the only way to read one, and a
 * guest only ever sees prompt text the host wrote for their own event.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')
  const slug = searchParams.get('slug')

  if (!eventId && !slug) {
    return NextResponse.json({ error: 'Missing eventId or slug' }, { status: 400 })
  }

  const eventQuery = adminClient.from('events').select('id')
  const { data: event } = await (eventId ? eventQuery.eq('id', eventId) : eventQuery.eq('slug', slug!))
    .maybeSingle()

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const { data: rows } = await adminClient
    .from('event_photo_requests')
    .select('id, prompt, created_at')
    .eq('event_id', event.id)
    .is('dismissed_at', null)
    .order('created_at', { ascending: false })
    .returns<PhotoRequestRow[]>()

  return NextResponse.json({
    requests: (rows ?? []).map(row => ({ id: row.id, prompt: row.prompt, createdAt: row.created_at })),
  })
}

/**
 * Host-only. Creates a new live photo request for an event — either one of
 * the dashboard's preset prompts or custom text, both sent as plain `prompt`.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { eventId, prompt } = await request.json() as { eventId?: string; prompt?: string }
    if (!eventId || !UUID_RE.test(eventId)) {
      return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 })
    }
    const trimmedPrompt = prompt?.trim() ?? ''
    if (!trimmedPrompt || trimmedPrompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt must be 1-${MAX_PROMPT_LENGTH} characters` },
        { status: 400 }
      )
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
        event_type: 'photo_request_create_unauthorised',
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

    const { data: created, error: insertErr } = await adminClient
      .from('event_photo_requests')
      .insert({ event_id: eventId, prompt: trimmedPrompt })
      .select('id, prompt, created_at')
      .single<PhotoRequestRow>()

    if (insertErr || !created) {
      return NextResponse.json({ error: 'Failed to create photo request' }, { status: 500 })
    }

    await logAudit({
      event_type: 'photo_request_created',
      user_id: user.id,
      ip,
      metadata: { event_id: eventId, request_id: created.id },
    })

    return NextResponse.json(
      { request: { id: created.id, prompt: created.prompt, createdAt: created.created_at } },
      { status: 201 }
    )
  } catch (err) {
    console.error('[photo-requests] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
