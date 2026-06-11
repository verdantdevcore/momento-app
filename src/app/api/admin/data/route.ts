import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS entirely
const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET() {
  try {
    // Verify the caller is authenticated and is a super admin
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: caller } = await adminClient
      .from('hosts')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    if (!caller?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all platform data in parallel using the service-role client
    const [metricsRes, hostsRes, eventsRes, mediaRes] = await Promise.all([
      adminClient.from('platform_metrics').select('*').single(),
      adminClient.from('host_stats').select('*'),
      adminClient
        .from('events')
        .select('id, title, slug, category, event_date, location, created_at, host_id')
        .order('created_at', { ascending: false }),
      adminClient.from('media').select('type, views, event_id'),
    ])

    return NextResponse.json({
      metrics:    metricsRes.data  ?? null,
      hosts:      hostsRes.data    ?? [],
      events:     eventsRes.data   ?? [],
      mediaItems: mediaRes.data    ?? [],
    })
  } catch (err) {
    console.error('[admin/data]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
