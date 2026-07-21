/**
 * Curation for AI Event Recaps — "your event in 90 seconds."
 *
 * There is no generative-AI model here: this picks and orders a subset of an
 * event's own already-uploaded media using signals already in the database
 * (views, face count as a group-shot proxy, hashtag diversity, upload time).
 * See src/lib/faces.ts for the one AI vendor this app actually integrates —
 * this file deliberately doesn't touch it beyond reading media_faces counts.
 *
 * Pure functions only: no Supabase/Cloudinary calls, so this is unit-testable
 * without mocking a DB client (mirrors qr-pack.ts's pure-helpers shape).
 */

export type CandidateMedia = {
  id: string
  type: 'image' | 'video'
  url: string
  views: number
  hashtags: string[]
  created_at: string
  batch_id: string | null
  /** Count of media_faces rows for this media id — a group-shot proxy, not identity. */
  faceCount: number
}

export type RecapItem = {
  mediaId: string
  position: number
  score: number
  durationSecs: number
}

export type CurateOptions = {
  maxItems?: number
  targetTotalSecs?: number
  minItemSecs?: number
  maxItemSecs?: number
}

const DEFAULT_MAX_ITEMS = 16
const DEFAULT_TARGET_TOTAL_SECS = 90
const DEFAULT_MIN_ITEM_SECS = 3
const DEFAULT_MAX_ITEM_SECS = 6

/** Minimum candidates required to bother generating a recap at all. */
export const MIN_CANDIDATES = 3

/**
 * Score weights are a documented starting point, not tuned against real
 * traffic — same posture as MATCH_THRESHOLD in faces.ts. Raise or lower once
 * real recaps are observable.
 */
function scoreItem(item: CandidateMedia): number {
  const viewScore = Math.log1p(Math.max(0, item.views)) // diminishing returns — no single viral photo dominates
  const faceScore = Math.min(item.faceCount, 8) / 8       // group-shot proxy, capped so a crowd shot doesn't fully dominate
  const tagScore = Math.min(item.hashtags.length, 3) / 3   // rewards contextualised photos over bare uploads
  // Flat base so a 0-view, 0-face photo can still be picked to fill a quiet
  // stretch of the timeline rather than being scored out entirely.
  const base = 0.1
  return viewScore * 0.35 + faceScore * 0.4 + tagScore * 0.15 + base
}

/**
 * Collapses a multi-file guest upload (shared batch_id) down to its single
 * best-scoring representative, so a burst of ten near-identical shots from
 * one moment doesn't crowd out the rest of the event.
 */
function collapseBatches(candidates: CandidateMedia[]): CandidateMedia[] {
  const groups = new Map<string, CandidateMedia[]>()
  const singles: CandidateMedia[] = []

  for (const item of candidates) {
    if (!item.batch_id) {
      singles.push(item)
      continue
    }
    const group = groups.get(item.batch_id)
    if (group) group.push(item)
    else groups.set(item.batch_id, [item])
  }

  const representatives = [...groups.values()].map(group =>
    group.reduce((best, item) => (scoreItem(item) > scoreItem(best) ? item : best))
  )

  return [...singles, ...representatives]
}

/**
 * Buckets the event's time range into `bucketCount` equal-width windows and
 * round-robins the best-scoring candidate from each bucket, then each
 * bucket's next-best, and so on — rather than a naive top-N by score, which
 * could pick every item from one ten-minute burst (e.g. cake-cutting) and
 * miss the rest of the event entirely. This is what makes the result read as
 * a "memory timeline" spanning the whole event, not just its loudest moment.
 */
function selectWithTemporalSpread(
  candidates: CandidateMedia[],
  bucketCount: number
): CandidateMedia[] {
  if (candidates.length <= bucketCount) return candidates

  const times = candidates.map(c => new Date(c.created_at).getTime())
  const min = Math.min(...times)
  const max = Math.max(...times)
  const span = max - min

  const buckets: CandidateMedia[][] = Array.from({ length: bucketCount }, () => [])
  for (const item of candidates) {
    const t = new Date(item.created_at).getTime()
    const ratio = span === 0 ? 0 : (t - min) / span
    const idx = Math.min(bucketCount - 1, Math.floor(ratio * bucketCount))
    buckets[idx].push(item)
  }
  for (const bucket of buckets) {
    bucket.sort((a, b) => scoreItem(b) - scoreItem(a))
  }

  const selected: CandidateMedia[] = []
  let round = 0
  while (selected.length < bucketCount) {
    let addedThisRound = false
    for (const bucket of buckets) {
      if (selected.length >= bucketCount) break
      if (bucket[round]) {
        selected.push(bucket[round])
        addedThisRound = true
      }
    }
    if (!addedThisRound) break
    round++
  }

  return selected
}

/**
 * Picks and orders the media for an event's recap. Deterministic given the
 * same inputs — "regenerate" only changes the result when new media, views,
 * or face counts have changed, not on every call.
 */
export function curateRecap(candidates: CandidateMedia[], opts: CurateOptions = {}): RecapItem[] {
  const maxItems = opts.maxItems ?? DEFAULT_MAX_ITEMS
  const targetTotalSecs = opts.targetTotalSecs ?? DEFAULT_TARGET_TOTAL_SECS
  const minItemSecs = opts.minItemSecs ?? DEFAULT_MIN_ITEM_SECS
  const maxItemSecs = opts.maxItemSecs ?? DEFAULT_MAX_ITEM_SECS

  if (candidates.length < MIN_CANDIDATES) return []

  const pool = collapseBatches(candidates)
  const selected = selectWithTemporalSpread(pool, maxItems)

  // A memory timeline reads start-to-end, not score-sorted.
  selected.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const count = selected.length
  const durationSecs = count === 0
    ? minItemSecs
    : Math.min(maxItemSecs, Math.max(minItemSecs, targetTotalSecs / count))

  return selected.map((item, index) => ({
    mediaId: item.id,
    position: index,
    score: scoreItem(item),
    durationSecs,
  }))
}
