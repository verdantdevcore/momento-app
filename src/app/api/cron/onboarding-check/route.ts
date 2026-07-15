import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { createClient } from '@supabase/supabase-js'
import { sendHostReminderEmail, sendAdminFollowupNotice } from '@/lib/email'
import type { OnboardingCheckpoint } from '@/lib/qstash'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const REMINDER_COLUMN: Record<OnboardingCheckpoint, 'reminder_24h_sent_at' | 'reminder_72h_sent_at' | 'reminder_7d_sent_at'> = {
  '24h': 'reminder_24h_sent_at',
  '72h': 'reminder_72h_sent_at',
  '7d': 'reminder_7d_sent_at',
}

// Triggered by a delayed QStash message scheduled at signup (see
// lib/qstash.ts). No-ops if the host has since created an event, and is
// idempotent per checkpoint via the *_sent_at columns in case QStash retries.
async function handler(request: Request) {
  const body = await request.json() as { hostId?: string; checkpoint?: OnboardingCheckpoint }
  const { hostId, checkpoint } = body
  if (!hostId || !checkpoint || !REMINDER_COLUMN[checkpoint]) {
    return NextResponse.json({ error: 'Missing or invalid hostId/checkpoint' }, { status: 400 })
  }
  console.log('[onboarding-check] received', { hostId, checkpoint })

  const { data: existingEvent } = await adminClient
    .from('events')
    .select('id')
    .eq('host_id', hostId)
    .limit(1)
    .maybeSingle()

  if (existingEvent) {
    console.log('[onboarding-check] skipped — host already created an event', { hostId, checkpoint })
    return NextResponse.json({ skipped: 'host already created an event' })
  }

  const [{ data: hostRow }, { data: authUser }] = await Promise.all([
    adminClient
      .from('hosts')
      .select('full_name, reminder_24h_sent_at, reminder_72h_sent_at, reminder_7d_sent_at, admin_followup_72h_sent_at, admin_followup_7d_sent_at')
      .eq('id', hostId)
      .single(),
    adminClient.auth.admin.getUserById(hostId),
  ])

  const email = authUser?.user?.email
  if (!hostRow || !email) {
    return NextResponse.json({ error: 'Host not found' }, { status: 404 })
  }

  const reminderColumn = REMINDER_COLUMN[checkpoint]
  if (!hostRow[reminderColumn]) {
    await sendHostReminderEmail({ email, fullName: hostRow.full_name }, checkpoint)
    await adminClient.from('hosts').update({ [reminderColumn]: new Date().toISOString() }).eq('id', hostId)
  }

  if (checkpoint === '72h' || checkpoint === '7d') {
    const followupColumn = checkpoint === '72h' ? 'admin_followup_72h_sent_at' : 'admin_followup_7d_sent_at'
    if (!hostRow[followupColumn]) {
      await sendAdminFollowupNotice(
        { email, fullName: hostRow.full_name, createdAt: authUser.user!.created_at },
        checkpoint
      )
      await adminClient.from('hosts').update({ [followupColumn]: new Date().toISOString() }).eq('id', hostId)
    }
  }

  console.log('[onboarding-check] processed', { hostId, checkpoint })
  return NextResponse.json({ ok: true })
}

export const POST = verifySignatureAppRouter(handler)
