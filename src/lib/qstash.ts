import { Client } from '@upstash/qstash'

const qstash = process.env.QSTASH_TOKEN ? new Client({ token: process.env.QSTASH_TOKEN }) : null

export type OnboardingCheckpoint = '24h' | '72h' | '7d'

const DELAY_SECONDS: Record<OnboardingCheckpoint, number> = {
  '24h': 24 * 60 * 60,
  '72h': 72 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
}

// Schedules the full reminder sequence for a newly-verified host. Each
// delayed call lands on /api/cron/onboarding-check, which no-ops if the
// host has since created an event.
export async function scheduleOnboardingChecks(hostId: string) {
  if (!qstash) {
    console.warn('[qstash] QSTASH_TOKEN not set — skipping onboarding reminder scheduling for', hostId)
    return
  }
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/cron/onboarding-check`
  const results = await Promise.all(
    (Object.keys(DELAY_SECONDS) as OnboardingCheckpoint[]).map(checkpoint =>
      qstash!.publishJSON({ url, body: { hostId, checkpoint }, delay: DELAY_SECONDS[checkpoint] })
        .then(res => ({ checkpoint, messageId: res.messageId }))
    )
  )
  console.log('[qstash] scheduled onboarding checks for', hostId, results)
}
