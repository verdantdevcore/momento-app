import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = 'Momento <onboarding@sharemomento.app>'
const ONBOARDING_TEAM_EMAIL = 'onboarding@sharemomento.app'
const SUPPORT_EMAIL = 'support@sharemomento.app'

// Account-action emails are the user's only notice that their account changed
// state, so escape anything interpolated into them — full_name is user-supplied
// and would otherwise be an HTML injection vector into an email we send.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send:', { to, subject })
    return
  }
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) console.error('[email] send failed:', { to, subject, error })
  else console.log('[email] sent:', { to, subject, id: data?.id })
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

function supportLine(): string {
  return `<p style="color:#555;">If you believe this was a mistake, or you'd like more information, contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#556B2F;">${SUPPORT_EMAIL}</a>.</p>`
}

export async function sendAccountRestrictedEmail(
  host: { email: string; fullName: string | null },
  reason: string | null
) {
  const greeting = host.fullName ? escapeHtml(host.fullName) : 'there'
  await send(
    host.email,
    'Your Momento account has been restricted',
    wrapper(`
      <p>Hi ${greeting},</p>
      <p>Your Momento account has been restricted. You can no longer sign in, and your event feeds are no longer accepting or displaying uploads.</p>
      ${reason ? `<p><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : ''}
      ${supportLine()}
    `)
  )
}

export async function sendAccountUnrestrictedEmail(host: { email: string; fullName: string | null }) {
  const greeting = host.fullName ? escapeHtml(host.fullName) : 'there'
  await send(
    host.email,
    'Your Momento account has been restored',
    wrapper(`
      <p>Hi ${greeting},</p>
      <p>The restriction on your Momento account has been lifted. You can sign in again, and your event feeds are live.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#556B2F;color:#F7E7CE;padding:0.75rem 1.25rem;border-radius:0.5rem;text-decoration:none;font-weight:600;">Go to your dashboard</a></p>
      ${supportLine()}
    `)
  )
}

export async function sendAccountDeletedEmail(
  host: { email: string; fullName: string | null },
  reason: string | null,
  purgeAfter: Date
) {
  const greeting = host.fullName ? escapeHtml(host.fullName) : 'there'
  const purgeDate = purgeAfter.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  await send(
    host.email,
    'Your Momento account has been deleted',
    wrapper(`
      <p>Hi ${greeting},</p>
      <p>Your Momento account has been deleted. You can no longer sign in, and your event feeds are offline.</p>
      ${reason ? `<p><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : ''}
      <p>Your events, photos and videos will be permanently erased on <strong>${purgeDate}</strong>. Until then, they can still be recovered if this was a mistake.</p>
      ${supportLine()}
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
