import { NextRequest, NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { adminClient, requireSuperAdmin } from '@/lib/admin-auth'
import { purgeHostAccount } from '@/lib/events'

// Runs the 30-day purge right now, for an admin who doesn't want to wait.
// Irreversible: the account's Cloudinary assets, events, media, hosts row and
// auth user are all destroyed. The soft delete is deliberately kept as the
// separate default — this is the escape hatch, not the main path.
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
    const guard = await requireSuperAdmin()
    if (!guard.ok) return guard.response

    const { targetId } = await request.json()
    if (!targetId) return NextResponse.json({ error: 'Missing targetId' }, { status: 400 })
    if (targetId === guard.userId) {
      return NextResponse.json({ error: 'You cannot purge your own account' }, { status: 400 })
    }

    const { data: target } = await adminClient
      .from('hosts')
      .select('id, is_super_admin, deleted_at')
      .eq('id', targetId)
      .single()

    if (!target) return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    if (target.is_super_admin) {
      return NextResponse.json(
        { error: 'Cannot purge another admin. Remove their admin role first.' },
        { status: 400 }
      )
    }
    // Requiring the soft delete first keeps this two-step: an admin has already
    // seen the delete confirmation, and the host has already been emailed. One
    // misclick should never be able to destroy a customer's photos outright.
    if (!target.deleted_at) {
      return NextResponse.json(
        { error: 'Delete this account first, then purge it.' },
        { status: 400 }
      )
    }

    // Logged before the fact: purgeHostAccount removes the hosts row, and a
    // failure partway through still needs to leave a trace of who asked.
    await logAudit({
      event_type: 'account_purge_requested',
      user_id: guard.userId,
      ip,
      metadata: { target_id: targetId },
    })

    const assets = await purgeHostAccount(targetId)

    await logAudit({
      event_type: 'account_purged',
      user_id: guard.userId,
      ip,
      metadata: {
        target_id:      targetId,
        assets_deleted: assets.deleted,
        assets_failed:  assets.failed,
        immediate:      true,
      },
    })

    return NextResponse.json({ success: true, assetsDeleted: assets.deleted, assetsFailed: assets.failed })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[admin/purge-user]', err)
    await logAudit({
      event_type: 'account_purge_failed',
      ip,
      metadata: { error: message },
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
