import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = 'Momento <onboarding@sharemomento.app>'
const ONBOARDING_TEAM_EMAIL = 'onboarding@sharemomento.app'

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send:', { to, subject })
    return
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) console.error('[email] send failed:', { to, subject, error })
}

function wrapper(bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <p style="font-weight: 700; font-size: 1.25rem; margin: 0 0 1.5rem; color: #556B2F;">Momento</p>
      ${bodyHtml}
    </div>
  `
}

export async function sendNewHostSignupNotice(host: { email: string; fullName: string | null }) {
  await send(
    ONBOARDING_TEAM_EMAIL,
    `New host signed up: ${host.fullName ?? host.email}`,
    wrapper(`
      <p>A new host just verified their account.</p>
      <p><strong>Name:</strong> ${host.fullName ?? '—'}<br/><strong>Email:</strong> ${host.email}</p>
    `)
  )
}

export async function sendHostReminderEmail(host: { email: string; fullName: string | null }, checkpoint: '24h' | '72h' | '7d') {
  const copyByCheckpoint: Record<'24h' | '72h' | '7d', { subject: string; body: string }> = {
    '24h': { subject: 'Create your first event on Momento', body: "You signed up yesterday but haven't created an event yet. It only takes a minute to get started." },
    '72h': { subject: 'Still thinking about your first event?', body: "It's been a few days since you joined Momento. Ready to set up your first event and start collecting photos from your guests?" },
    '7d': { subject: "We're here when you're ready", body: "It's been a week since you signed up. If you need a hand getting your first event set up, just reply to this email." },
  }
  const copy = copyByCheckpoint[checkpoint]

  await send(
    host.email,
    copy.subject,
    wrapper(`
      <p>Hi ${host.fullName ?? 'there'},</p>
      <p>${copy.body}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#556B2F;color:#F7E7CE;padding:0.75rem 1.25rem;border-radius:0.5rem;text-decoration:none;font-weight:600;">Create your event</a></p>
    `)
  )
}

export async function sendAdminFollowupNotice(host: { email: string; fullName: string | null; createdAt: string }, checkpoint: '72h' | '7d') {
  await send(
    ONBOARDING_TEAM_EMAIL,
    `Host inactive ${checkpoint === '72h' ? '72 hours' : '1 week'} after signup: ${host.fullName ?? host.email}`,
    wrapper(`
      <p>This host still has not created an event ${checkpoint === '72h' ? '72 hours' : '7 days'} after signing up. Consider a follow-up.</p>
      <p><strong>Name:</strong> ${host.fullName ?? '—'}<br/><strong>Email:</strong> ${host.email}<br/><strong>Signed up:</strong> ${host.createdAt}</p>
    `)
  )
}
