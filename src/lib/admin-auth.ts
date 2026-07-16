import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

type AdminGuardResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }

/**
 * Verifies the caller is a signed-in super admin.
 *
 * Returns a discriminated result rather than throwing so routes stay explicit
 * about their failure responses.
 */
export async function requireSuperAdmin(): Promise<AdminGuardResult> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }) }
  }

  const { data: caller } = await adminClient
    .from('hosts')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!caller?.is_super_admin) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true, userId: user.id }
}

/** Resolves a host's email + name for account-action notification emails. */
export async function getHostContact(hostId: string): Promise<{ email: string; fullName: string | null } | null> {
  const [{ data: hostRow }, { data: authUser }] = await Promise.all([
    adminClient.from('hosts').select('full_name').eq('id', hostId).single(),
    adminClient.auth.admin.getUserById(hostId),
  ])
  const email = authUser?.user?.email
  if (!email) return null
  return { email, fullName: hostRow?.full_name ?? null }
}
