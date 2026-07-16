import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { createClient } from '@supabase/supabase-js'
import { logAudit } from '@/lib/audit'
import { purgeHostEvents } from '@/lib/events'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Irreversibly tears down accounts whose 30-day grace period has expired.
// Driven by a QStash schedule (see supabase/migrations/README or the setup
// notes) rather than a delayed message, since this sweeps rather than targets.
//
// Ordering per account: Cloudinary assets and events first, then the auth user.
// The media rows are the only record of where assets live, so losing them to a
// cascade before the assets are destroyed would orphan the files permanently.
async function handler() {
  const now = new Date().toISOString()

  const { data: due, error } = await adminClient
    .from('hosts')
    .select('id, purge_after')
    .not('purge_after', 'is', null)
    .lte('purge_after', now)

  if (error) {
    console.error('[purge-accounts] query failed:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  if (!due?.length) {
    console.log('[purge-accounts] nothing due')
    return NextResponse.json({ purged: 0 })
  }

  const results: { hostId: string; ok: boolean; assetsDeleted?: number; error?: string }[] = []

  for (const host of due) {
    try {
      const assets = await purgeHostEvents(host.id)

      // Removes the hosts row too when the FK cascades from auth.users; the
      // explicit delete below covers schemas where it does not.
      const { error: authErr } = await adminClient.auth.admin.deleteUser(host.id)
      if (authErr) throw new Error(`auth delete failed: ${authErr.message}`)

      await adminClient.from('hosts').delete().eq('id', host.id)

      await logAudit({
        event_type: 'account_purged',
        user_id: null,
        metadata: {
          target_id:      host.id,
          assets_deleted: assets.deleted,
          assets_failed:  assets.failed,
        },
      })

      results.push({ hostId: host.id, ok: true, assetsDeleted: assets.deleted })
    } catch (err) {
      // One bad account must not stall the rest of the sweep; it stays due and
      // is retried on the next run.
      const message = err instanceof Error ? err.message : String(err)
      console.error('[purge-accounts] failed for', host.id, err)
      await logAudit({
        event_type: 'account_purge_failed',
        user_id: null,
        metadata: { target_id: host.id, error: message },
      })
      results.push({ hostId: host.id, ok: false, error: message })
    }
  }

  const purged = results.filter(r => r.ok).length
  console.log('[purge-accounts] done', { due: due.length, purged, failed: due.length - purged })
  return NextResponse.json({ purged, failed: due.length - purged, results })
}

export const POST = verifySignatureAppRouter(handler)
