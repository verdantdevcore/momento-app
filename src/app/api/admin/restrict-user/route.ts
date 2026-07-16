import { NextRequest, NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { adminClient, getHostContact, requireSuperAdmin } from '@/lib/admin-auth'
import { sendAccountRestrictedEmail, sendAccountUnrestrictedEmail } from '@/lib/email'

const MAX_REASON_LENGTH = 500

// Restricting locks the host out of the dashboard and takes their event feeds
// dark (enforced by the restrictive RLS policies in migration 001, plus an
// explicit check in the service-role upload routes that bypass RLS).
// Reversible — nothing is deleted.
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
    const guard = await requireSuperAdmin()
    if (!guard.ok) return guard.response

    const body = await request.json()
    const targetId = body.targetId as string
    const restrict = body.restrict
    const reason = typeof body.reason === 'string' ? body.reason.trim() : null

    if (!targetId || typeof restrict !== 'boolean') {
      return NextResponse.json({ error: 'Missing targetId or restrict' }, { status: 400 })
    }
    if (targetId === guard.userId) {
      return NextResponse.json({ error: 'You cannot restrict your own account' }, { status: 400 })
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

    // Guards against an admin locking out a peer who could otherwise reverse it,
    // which is how you end up with nobody holding the keys.
    if (target.is_super_admin) {
      return NextResponse.json(
        { error: 'Cannot restrict another admin. Remove their admin role first.' },
        { status: 400 }
      )
    }
    if (target.deleted_at) {
      return NextResponse.json({ error: 'This account is already deleted' }, { status: 400 })
    }

    const { error } = await adminClient
      .from('hosts')
      .update({
        restricted_at:     restrict ? new Date().toISOString() : null,
        restricted_reason: restrict ? reason : null,
      })
      .eq('id', targetId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Revoke live sessions — without this the host keeps a valid access token
    // until it expires and stays signed in despite the restriction.
    if (restrict) {
      try {
        await adminClient.auth.admin.signOut(targetId, 'global')
      } catch (err) {
        console.error('[admin/restrict-user] session revoke failed:', err)
      }
    }

    // The notice is the point of the feature, but a mail failure must not undo
    // the restriction — send.emailSent tells the admin if it needs a manual nudge.
    let emailSent = false
    const contact = await getHostContact(targetId)
    if (contact) {
      try {
        if (restrict) await sendAccountRestrictedEmail(contact, reason)
        else await sendAccountUnrestrictedEmail(contact)
        emailSent = true
      } catch (err) {
        console.error('[admin/restrict-user] notification failed:', err)
      }
    }

    await logAudit({
      event_type: restrict ? 'account_restricted' : 'account_unrestricted',
      user_id: guard.userId,
      ip,
      metadata: { target_id: targetId, reason, email_sent: emailSent },
    })

    return NextResponse.json({ success: true, emailSent })
  } catch (err) {
    console.error('[admin/restrict-user]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
