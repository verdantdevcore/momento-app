import { NextRequest, NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { adminClient, getHostContact, requireSuperAdmin } from '@/lib/admin-auth'
import { sendAccountDeletedEmail } from '@/lib/email'

const MAX_REASON_LENGTH = 500
export const PURGE_GRACE_DAYS = 30

// Soft delete: the host is locked out and their feeds go dark immediately, but
// their events and media survive for a grace period so an erroneous delete can
// be undone. /api/cron/purge-accounts does the irreversible teardown once
// purge_after passes.
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
    const guard = await requireSuperAdmin()
    if (!guard.ok) return guard.response

    const body = await request.json()
    const targetId = body.targetId as string
    const reason = typeof body.reason === 'string' ? body.reason.trim() : null

    if (!targetId) return NextResponse.json({ error: 'Missing targetId' }, { status: 400 })
    if (targetId === guard.userId) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }
    if (reason && reason.length > MAX_REASON_LENGTH) {
      return NextResponse.json({ error: `Reason too long (max ${MAX_REASON_LENGTH} characters)` }, { status: 400 })
    }

    const { data: target } = await adminClient
      .from('hosts')
      .select('id, is_super_admin, deleted_at')
      .eq('id', targetId)
      .single()

    if (!target) return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    if (target.is_super_admin) {
      return NextResponse.json(
        { error: 'Cannot delete another admin. Remove their admin role first.' },
        { status: 400 }
      )
    }
    if (target.deleted_at) {
      return NextResponse.json({ error: 'This account is already deleted' }, { status: 400 })
    }

    // Read the contact before the account is touched — after signOut the row is
    // still fine, but this keeps the notice independent of teardown ordering.
    const contact = await getHostContact(targetId)

    const now = new Date()
    const purgeAfter = new Date(now.getTime() + PURGE_GRACE_DAYS * 24 * 60 * 60 * 1000)

    const { error } = await adminClient
      .from('hosts')
      .update({
        deleted_at:      now.toISOString(),
        deletion_reason: reason,
        purge_after:     purgeAfter.toISOString(),
      })
      .eq('id', targetId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await adminClient.auth.admin.signOut(targetId, 'global')
    } catch (err) {
      console.error('[admin/delete-user] session revoke failed:', err)
    }

    let emailSent = false
    if (contact) {
      try {
        await sendAccountDeletedEmail(contact, reason, purgeAfter)
        emailSent = true
      } catch (err) {
        console.error('[admin/delete-user] notification failed:', err)
      }
    }

    await logAudit({
      event_type: 'account_deleted',
      user_id: guard.userId,
      ip,
      metadata: {
        target_id:   targetId,
        reason,
        purge_after: purgeAfter.toISOString(),
        email_sent:  emailSent,
      },
    })

    return NextResponse.json({ success: true, emailSent, purgeAfter: purgeAfter.toISOString() })
  } catch (err) {
    console.error('[admin/delete-user]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Restores a soft-deleted account before the purge window closes.
export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
    const guard = await requireSuperAdmin()
    if (!guard.ok) return guard.response

    const { targetId } = await request.json()
    if (!targetId) return NextResponse.json({ error: 'Missing targetId' }, { status: 400 })

    const { data: target } = await adminClient
      .from('hosts')
      .select('deleted_at')
      .eq('id', targetId)
      .single()

    if (!target) return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    if (!target.deleted_at) {
      return NextResponse.json({ error: 'This account is not deleted' }, { status: 400 })
    }

    const { error } = await adminClient
      .from('hosts')
      .update({ deleted_at: null, deletion_reason: null, purge_after: null })
      .eq('id', targetId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({
      event_type: 'account_restored',
      user_id: guard.userId,
      ip,
      metadata: { target_id: targetId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/delete-user] restore', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
