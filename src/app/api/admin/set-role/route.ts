import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { logAudit } from '@/lib/audit'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
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

    const { targetId, isSuperAdmin } = await request.json()
    if (!targetId || typeof isSuperAdmin !== 'boolean') {
      return NextResponse.json({ error: 'Missing targetId or isSuperAdmin' }, { status: 400 })
    }

    if (targetId === user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    const { error } = await adminClient
      .from('hosts')
      .update({ is_super_admin: isSuperAdmin })
      .eq('id', targetId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({
      event_type: isSuperAdmin ? 'admin_promoted' : 'admin_demoted',
      user_id: user.id,
      ip,
      metadata: { target_id: targetId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/set-role]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
