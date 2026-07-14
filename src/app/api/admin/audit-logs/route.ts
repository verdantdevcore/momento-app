import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: host } = await adminClient
      .from('hosts')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    if (!host?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '100')

    const { data: logs, error } = await adminClient
      .from('audit_logs')
      .select('id, event_type, user_id, ip_address, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 500))

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Enrich with email where user_id is present
    const userIds = [...new Set((logs ?? []).map(l => l.user_id).filter(Boolean))] as string[]
    let emailMap: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: hostRows } = await adminClient
        .from('hosts')
        .select('id, email')
        .in('id', userIds)
      emailMap = Object.fromEntries((hostRows ?? []).map(h => [h.id, h.email]))
    }

    const enriched = (logs ?? []).map(l => ({
      ...l,
      user_email: l.user_id ? (emailMap[l.user_id] ?? null) : null,
    }))

    return NextResponse.json({ logs: enriched })
  } catch (err) {
    console.error('[admin/audit-logs]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
