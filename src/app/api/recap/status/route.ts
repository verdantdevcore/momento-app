import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

type EventRow = {
  id: string
  recap_status: string
  recap_generated_at: string | null
  recap_render_mode: string | null
  recap_video_url: string | null
  recap_item_count: number | null
  recap_error: string | null
}

type RecapItemRow = {
  position: number
  duration_secs: number
  media: { id: string; url: string; type: string } | null
}

/**
 * Public recap status/read. No auth required — event_recap_items has RLS on
 * with no anon/authenticated policies (service-role only, same posture as
 * media_faces), so this route is the only way to read a recap; a guest can
 * only ever see media they could already see in the event feed itself.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')
  const slug = searchParams.get('slug')

  if (!eventId && !slug) {
    return NextResponse.json({ error: 'Missing eventId or slug' }, { status: 400 })
  }

  const query = adminClient
    .from('events')
    .select('id, recap_status, recap_generated_at, recap_render_mode, recap_video_url, recap_item_count, recap_error')

  const { data: event } = await (eventId ? query.eq('id', eventId) : query.eq('slug', slug!))
    .maybeSingle<EventRow>()

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  let items: { mediaId: string; url: string; type: string; durationSecs: number }[] = []
  if (event.recap_status === 'ready') {
    const { data: rows } = await adminClient
      .from('event_recap_items')
      .select('position, duration_secs, media:media_id(id, url, type)')
      .eq('event_id', event.id)
      .order('position', { ascending: true })
      .returns<RecapItemRow[]>()

    items = (rows ?? [])
      .filter((row): row is RecapItemRow & { media: NonNullable<RecapItemRow['media']> } => row.media !== null)
      .map(row => ({
        mediaId: row.media.id,
        url: row.media.url,
        type: row.media.type,
        durationSecs: row.duration_secs,
      }))
  }

  return NextResponse.json({
    status: event.recap_status,
    itemCount: event.recap_item_count,
    generatedAt: event.recap_generated_at,
    renderMode: event.recap_render_mode,
    videoUrl: event.recap_video_url,
    error: event.recap_error,
    items,
  })
}
