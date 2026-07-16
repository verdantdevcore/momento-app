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
    const [metricsRes, hostsRes, eventsRes, mediaRes, authUsersRes] = await Promise.all([
      adminClient.from('platform_metrics').select('*').single(),
      // Query hosts table directly — view may have RLS or missing email
      adminClient
        .from('hosts')
        .select('id, full_name, is_super_admin, created_at, restricted_at, restricted_reason, deleted_at, deletion_reason, purge_after'),
      adminClient
        .from('events')
        .select('id, title, slug, category, event_date, location, created_at, host_id')
        .order('created_at', { ascending: false }),
      adminClient.from('media').select('type, views, event_id'),
      // auth.admin.listUsers() is the only reliable way to get every user's email
      adminClient.auth.admin.listUsers({ perPage: 1000 }),
    ])

    // Build an email + created_at map from auth users
    const authUserMap: Record<string, { email: string; created_at: string }> = {}
    for (const u of authUsersRes.data?.users ?? []) {
      authUserMap[u.id] = { email: u.email ?? '', created_at: u.created_at }
    }

    // Merge hosts table rows with auth email data and compute stats from events/media
    const eventsData  = eventsRes.data  ?? []
    const mediaData   = mediaRes.data   ?? []

    const hosts = (hostsRes.data ?? []).map((h: {
      id: string; full_name: string | null; is_super_admin: boolean; created_at: string
      restricted_at: string | null; restricted_reason: string | null
      deleted_at: string | null; deletion_reason: string | null; purge_after: string | null
    }) => {
      const auth        = authUserMap[h.id] ?? { email: '', created_at: h.created_at }
      const hostEvents  = eventsData.filter((e: { host_id: string }) => e.host_id === h.id)
      const eventIds    = new Set(hostEvents.map((e: { id: string }) => e.id))
      const hostMedia   = mediaData.filter((m: { event_id: string }) => eventIds.has(m.event_id))
      const totalViews  = hostMedia.reduce((s: number, m: { views: number }) => s + (m.views ?? 0), 0)
      return {
        id:             h.id,
        email:          auth.email,
        full_name:      h.full_name,
        created_at:     auth.created_at || h.created_at,
        is_super_admin: h.is_super_admin,
        event_count:    hostEvents.length,
        upload_count:   hostMedia.length,
        total_views:    totalViews,
        restricted_at:     h.restricted_at,
        restricted_reason: h.restricted_reason,
        deleted_at:        h.deleted_at,
        deletion_reason:   h.deletion_reason,
        purge_after:       h.purge_after,
      }
    })

    // Recompute platform metrics from raw data so they always reflect reality
    const totalUploads = mediaData.length
    const totalViews   = mediaData.reduce((s: number, m: { views: number }) => s + (m.views ?? 0), 0)
    const catCounts: Record<string, number> = {}
    eventsData.forEach((e: { category: string | null }) => {
      if (e.category) catCounts[e.category] = (catCounts[e.category] ?? 0) + 1
    })
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    const metrics = metricsRes.data ?? {
      total_hosts:   hosts.length,
      total_events:  eventsData.length,
      total_uploads: totalUploads,
      total_views:   totalViews,
      top_category:  topCategory,
    }

    return NextResponse.json({
      metrics,
      hosts,
      events:     eventsData,
      mediaItems: mediaData,
    })
  } catch (err) {
    console.error('[admin/data]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
