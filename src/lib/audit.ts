import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function logAudit(params: {
  event_type: string
  user_id?: string | null
  ip?: string | null
  metadata?: Record<string, unknown>
}) {
  try {
    await adminClient.from('audit_logs').insert({
      event_type:  params.event_type,
      user_id:     params.user_id    ?? null,
      ip_address:  params.ip         ?? null,
      metadata:    params.metadata   ?? null,
    })
  } catch (e) {
    // Non-blocking — audit failure must never break app flow
    console.error('[audit] log failed:', e)
  }
}