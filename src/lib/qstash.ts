import { Client } from '@upstash/qstash'

const qstash = process.env.QSTASH_TOKEN ? new Client({ token: process.env.QSTASH_TOKEN }) : null

export type OnboardingCheckpoint = '24h' | '48h' | '72h' | '7d'

const DELAY_SECONDS: Record<OnboardingCheckpoint, number> = {
  '24h': 24 * 60 * 60,
  '48h': 48 * 60 * 60,
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

/**
 * Queues face indexing for one freshly-uploaded photo.
 *
 * Off the upload's critical path deliberately: Azure Face indexes a photo with
 * one Detect call plus one Add Face call per face found, which can add up to
 * several seconds for a busy group shot — and a guest uploading twenty photos
 * at a reception should not wait for any of it. Failure here is swallowed — an
 * unindexed photo is missing from face search results, which is a far better
 * outcome than a failed upload.
 */
export async function enqueueFaceIndex(mediaId: string) {
  if (!qstash) {
    console.warn('[qstash] QSTASH_TOKEN not set — skipping face indexing for', mediaId)
    return
  }
  try {
    const res = await qstash.publishJSON({
      url:  faceIndexUrl(),
      body: { mediaId },
      // The job is idempotent via media.face_indexed_at, so retries are safe.
      retries: 3,
    })
    console.log('[qstash] queued face index', { mediaId, messageId: res.messageId })
  } catch (err) {
    console.error('[qstash] failed to queue face index:', { mediaId, err })
  }
}

/**
 * Queues face indexing for a backlog of photos — a host turning face search on
 * after the event, when every photo is already uploaded, which is the common
 * case rather than the edge case.
 *
 * Returns the number queued. Best-effort like the single-photo version: a
 * chunk that fails to queue leaves those photos unindexed, and the host can
 * re-run it by toggling again.
 */
export async function enqueueFaceIndexBatch(mediaIds: string[]): Promise<number> {
  if (!qstash) {
    console.warn('[qstash] QSTASH_TOKEN not set — skipping face index backfill')
    return 0
  }
  const url = faceIndexUrl()
  let queued = 0
  // QStash caps a batch at 100 messages.
  for (let i = 0; i < mediaIds.length; i += 100) {
    const chunk = mediaIds.slice(i, i + 100)
    try {
      await qstash.batchJSON(chunk.map(mediaId => ({ url, body: { mediaId }, retries: 3 })))
      queued += chunk.length
    } catch (err) {
      console.error('[qstash] face index batch failed:', { count: chunk.length, err })
    }
  }
  return queued
}

function faceIndexUrl(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/face/index`
}

/**
 * Queues curation + assembly of one event's AI recap. Off the request path
 * deliberately, same reasoning as face indexing: curation reads every photo
 * in the event and a host clicking "Generate recap" should not wait on that.
 */
export async function enqueueRecapGenerate(eventId: string) {
  if (!qstash) {
    console.warn('[qstash] QSTASH_TOKEN not set — skipping recap generation for', eventId)
    return
  }
  try {
    const res = await qstash.publishJSON({
      url: recapGenerateUrl(),
      body: { eventId },
      // The job is idempotent via events.recap_status, so retries are safe.
      retries: 2,
    })
    console.log('[qstash] queued recap generate', { eventId, messageId: res.messageId })
  } catch (err) {
    console.error('[qstash] failed to queue recap generate:', { eventId, err })
  }
}

function recapGenerateUrl(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/recap/generate-job`
}
