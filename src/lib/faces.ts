import FaceClient, { isUnexpected } from '@azure-rest/ai-vision-face'
import { AzureKeyCredential } from '@azure/core-auth'
import { createHash } from 'crypto'
import { CLOUDINARY_ROOT } from '@/lib/cloudinary'

/**
 * Face matching for "upload a selfie, find every photo you're in".
 *
 * Face templates live in Azure AI Face, one LargeFaceList per event, and
 * never in our database — Postgres only holds the pointer from a face id
 * back to the media row (see supabase/migrations/002_face_discovery.sql and
 * 003_face_azure_migration.sql).
 *
 * Two properties of this design are load-bearing for the privacy posture and
 * should survive any refactor:
 *
 *  1. The searcher's selfie is never stored or indexed. It is detected inline
 *     and the resulting faceId (not the image) is handed to FindSimilar; the
 *     selfie bytes exist for the life of one request and are written nowhere.
 *
 *  2. Lists are per-event, so a face indexed at one event can never match
 *     against another, and tearing an event down is one DeleteLargeFaceList
 *     call rather than a hunt for individual faces.
 *
 * One property that does *not* carry over from the old Rekognition design:
 * indexing is no longer instantly searchable. Azure requires an explicit
 * Train step before a LargeFaceList's newest faces show up in FindSimilar —
 * searchBySelfie() pays that cost synchronously (see ensureTrained below)
 * rather than serving stale results.
 */

const ENDPOINT = process.env.AZURE_FACE_ENDPOINT
const API_KEY  = process.env.AZURE_FACE_API_KEY

/**
 * False when Azure isn't configured. Every caller checks this and degrades to
 * a no-op rather than throwing: face search is an add-on, and a missing key
 * must never take uploads or feeds down with it.
 */
export function facesConfigured(): boolean {
  return Boolean(ENDPOINT && API_KEY)
}

let client: ReturnType<typeof FaceClient> | null = null
function face(): ReturnType<typeof FaceClient> {
  if (!client) {
    client = FaceClient(ENDPOINT!, new AzureKeyCredential(API_KEY!))
  }
  return client
}

/**
 * One LargeFaceList per event. Azure caps list ids at 64 characters of
 * [a-z0-9_-] — our slugs alone can run to ~67 (a 50-char title plus a 16-char
 * random suffix, see generateSlug in lib/utils.ts), so the id is a hash of
 * the slug rather than the slug itself. Deterministic: the same slug always
 * yields the same list id, which is all that's required since it's never
 * shown to anyone.
 */
export function eventCollection(slug: string): string {
  const hash = createHash('sha256').update(slug).digest('hex').slice(0, 48)
  return `${CLOUDINARY_ROOT.toLowerCase()}-${hash}`
}

// 'detection_03' reads small and rotated faces better than the default model;
// 'recognition_04' is Azure's current most accurate recognizer. Both must
// stay consistent between indexing and search: recognitionModel is fixed on
// a list at creation time, and FindSimilar rejects a probe face that was
// detected under a different one.
const DETECTION_MODEL   = 'detection_03'
const RECOGNITION_MODEL = 'recognition_04'

/**
 * Match confidence floor, on Azure's 0..1 scale (Rekognition's was 0..100).
 * FindSimilar's 'matchPerson' mode already biases toward precision — it
 * returns nothing for a face that doesn't clear Azure's own same-person
 * threshold — so this is a second, same-spirit backstop rather than the
 * primary filter. Unverified against real traffic; there's no live Face
 * resource to tune it against yet, so treat 0.5 as a starting point to raise
 * or lower once real searches are observable.
 */
const MATCH_THRESHOLD = 0.5

// Group shots are the whole point of the feature, so this is generous.
// Detect returns up to 100 faces; anything past the cap is dropped
// largest-first, same as the old Rekognition behaviour.
const MAX_FACES_PER_PHOTO = 30

// How long searchBySelfie will wait for an event's list to finish training
// before giving up and querying it anyway. See ensureTrained.
const TRAIN_POLL_INTERVAL_MS = 500
const TRAIN_POLL_TIMEOUT_MS  = 15_000

export type IndexedFace = {
  faceId: string
  boundingBox: unknown
  confidence: number | null
}

/** Creates the event's face list. Safe to call repeatedly. */
export async function ensureCollection(collectionId: string): Promise<void> {
  const res = await face()
    .path('/largefacelists/{largeFaceListId}', collectionId)
    .put({ body: { name: collectionId, recognitionModel: RECOGNITION_MODEL } })

  if (isUnexpected(res)) {
    // Azure's "list already exists" error has no dedicated HTTP status of its
    // own to match on — it's a 400 like most other validation failures — so
    // this checks the error code for "exist" rather than the status alone.
    // Not verified against a live resource; tighten if this proves too loose.
    if (res.status === '400' && /exist/i.test(res.body.error.code)) return
    throw new Error(`[faces] create list failed: ${res.body.error.code} ${res.body.error.message}`)
  }
}

/**
 * Indexes every face in one event photo.
 *
 * Azure has no bulk equivalent of Rekognition's IndexFaces — Add Face to a
 * LargeFaceList takes only one face per call, addressed by its bounding box.
 * So this detects every face in the photo first, then adds each one that
 * clears the recognition-quality bar individually. A busy group photo can
 * mean dozens of sequential Azure calls for one upload; they're awaited one
 * at a time rather than in parallel to stay under the resource's per-second
 * rate limit.
 */
export async function indexPhotoFaces(params: {
  collectionId: string
  bytes: Uint8Array
  externalImageId: string
}): Promise<IndexedFace[]> {
  const detectRes = await face().path('/detect').post({
    contentType: 'application/octet-stream',
    queryParameters: {
      detectionModel:       DETECTION_MODEL,
      recognitionModel:     RECOGNITION_MODEL,
      returnFaceId:         false,
      returnFaceAttributes: ['qualityForRecognition'],
    },
    body: params.bytes,
  })
  if (isUnexpected(detectRes)) {
    throw new Error(`[faces] detect failed: ${detectRes.body.error.code} ${detectRes.body.error.message}`)
  }

  // Drops faces too blurry, small or side-on to match reliably — Azure's
  // recognition-quality signal, and the closest analogue to Rekognition's
  // QualityFilter: 'AUTO'.
  const candidates = detectRes.body
    .filter(f => f.faceAttributes?.qualityForRecognition !== 'low')
    .sort((a, b) =>
      b.faceRectangle.width * b.faceRectangle.height - a.faceRectangle.width * a.faceRectangle.height
    )
    .slice(0, MAX_FACES_PER_PHOTO)

  const indexed: IndexedFace[] = []
  for (const candidate of candidates) {
    const { top, left, width, height } = candidate.faceRectangle
    const addRes = await face()
      .path('/largefacelists/{largeFaceListId}/persistedfaces', params.collectionId)
      .post({
        contentType: 'application/octet-stream',
        queryParameters: {
          targetFace:     [left, top, width, height],
          detectionModel: DETECTION_MODEL,
          // Ties every face back to the media row, which is what search
          // resolves through (see searchBySelfie).
          userData: params.externalImageId,
        },
        body: params.bytes,
      })
    if (isUnexpected(addRes)) {
      throw new Error(`[faces] add face failed: ${addRes.body.error.code} ${addRes.body.error.message}`)
    }
    indexed.push({
      faceId: addRes.body.persistedFaceId,
      boundingBox: {
        faceRectangle:        candidate.faceRectangle,
        qualityForRecognition: candidate.faceAttributes?.qualityForRecognition ?? null,
      },
      confidence: null,
    })
  }
  return indexed
}

export class NoFaceInSelfieError extends Error {
  constructor() {
    super('No face detected in the uploaded selfie')
    this.name = 'NoFaceInSelfieError'
  }
}

/**
 * Blocks until an event's list has finished training on its current faces,
 * so a photo indexed moments ago is guaranteed to be searchable — the
 * tradeoff chosen over Rekognition's instant index-then-search, since
 * FindSimilar only ever reflects a list's last completed training run.
 *
 * Bounded: a list that hasn't finished inside the timeout is queried anyway
 * rather than blocking the guest indefinitely, on the theory that a possibly
 * slightly-stale search beats a failed one.
 *
 * Returns false if the list doesn't exist yet, i.e. nothing has been indexed
 * for this event.
 */
async function ensureTrained(collectionId: string): Promise<boolean> {
  const trainRes = await face()
    .path('/largefacelists/{largeFaceListId}/train', collectionId)
    .post()
  if (isUnexpected(trainRes)) {
    if (trainRes.status === '404') return false
    // A second search arriving while another's training is still in flight
    // is expected to conflict (409) rather than fail outright — poll the
    // job already running instead of treating that as fatal. Not verified
    // against a live resource.
    if (trainRes.status !== '409') {
      throw new Error(`[faces] train failed: ${trainRes.body.error.code} ${trainRes.body.error.message}`)
    }
  }

  const deadline = Date.now() + TRAIN_POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    const statusRes = await face()
      .path('/largefacelists/{largeFaceListId}/training', collectionId)
      .get()
    if (isUnexpected(statusRes)) {
      if (statusRes.status === '404') return false
      throw new Error(`[faces] training status failed: ${statusRes.body.error.code} ${statusRes.body.error.message}`)
    }
    if (statusRes.body.status === 'succeeded' || statusRes.body.status === 'failed') break
    await new Promise(resolve => setTimeout(resolve, TRAIN_POLL_INTERVAL_MS))
  }
  return true
}

/**
 * Returns the ExternalImageIds (media ids) of every indexed photo matching
 * the face in the selfie. The selfie is not stored, indexed, or logged.
 *
 * Matches on the *largest* face in the probe image, mirroring the old
 * Rekognition behaviour — a selfie with someone else looming in the frame
 * searches for them instead, which is why the UI asks for a photo of just
 * the guest.
 */
export async function searchBySelfie(params: {
  collectionId: string
  bytes: Uint8Array
}): Promise<string[]> {
  const detectRes = await face().path('/detect').post({
    contentType: 'application/octet-stream',
    queryParameters: {
      detectionModel:   DETECTION_MODEL,
      recognitionModel: RECOGNITION_MODEL,
      returnFaceId:     true,
      // Comfortably covers the FindSimilar call that follows immediately
      // after; far under the 24h max, since this id is never reused.
      faceIdTimeToLive: 120,
    },
    body: params.bytes,
  })
  if (isUnexpected(detectRes)) {
    throw new Error(`[faces] selfie detect failed: ${detectRes.body.error.code} ${detectRes.body.error.message}`)
  }
  if (detectRes.body.length === 0) throw new NoFaceInSelfieError()

  const probe = detectRes.body.reduce((largest, f) =>
    f.faceRectangle.width * f.faceRectangle.height >
    largest.faceRectangle.width * largest.faceRectangle.height ? f : largest
  )
  if (!probe.faceId) throw new NoFaceInSelfieError()

  // An event whose list was never created has simply indexed nothing.
  const trained = await ensureTrained(params.collectionId)
  if (!trained) return []

  const findRes = await face().path('/findsimilars').post({
    body: {
      faceId:                      probe.faceId,
      largeFaceListId:             params.collectionId,
      mode:                        'matchPerson',
      maxNumOfCandidatesReturned:  1000,
    },
  })
  if (isUnexpected(findRes)) {
    if (findRes.status === '404') return []
    throw new Error(`[faces] find similar failed: ${findRes.body.error.code} ${findRes.body.error.message}`)
  }

  const matches = findRes.body.filter(m => m.persistedFaceId && m.confidence >= MATCH_THRESHOLD)

  // FindSimilar returns only persistedFaceId + confidence, not the userData
  // stashed at index time — resolve each match back to a media id with a
  // follow-up lookup rather than teaching this module about the database
  // (see media_faces in supabase/migrations for the alternative that isn't
  // used here).
  const mediaIds = new Set<string>()
  for (const match of matches) {
    const faceRes = await face()
      .path(
        '/largefacelists/{largeFaceListId}/persistedfaces/{persistedFaceId}',
        params.collectionId,
        match.persistedFaceId!
      )
      .get()
    if (isUnexpected(faceRes)) {
      if (faceRes.status === '404') continue
      throw new Error(`[faces] face lookup failed: ${faceRes.body.error.code} ${faceRes.body.error.message}`)
    }
    if (faceRes.body.userData) mediaIds.add(faceRes.body.userData)
  }
  return [...mediaIds]
}

/** Removes specific faces, e.g. when a host deletes one photo. */
export async function deleteFaces(collectionId: string, faceIds: string[]): Promise<void> {
  // Azure deletes one persisted face per call — no bulk endpoint like
  // Rekognition's DeleteFaces caps-at-1000 batching.
  for (const faceId of faceIds) {
    const res = await face()
      .path('/largefacelists/{largeFaceListId}/persistedfaces/{persistedFaceId}', collectionId, faceId)
      .delete()
    if (isUnexpected(res) && res.status !== '404') {
      throw new Error(`[faces] delete face failed: ${res.body.error.code} ${res.body.error.message}`)
    }
  }
}

/**
 * Destroys an event's entire face index. Called from the event purge path —
 * the biometric data must not outlive the photos it was derived from.
 */
export async function deleteEventCollection(slug: string): Promise<boolean> {
  if (!facesConfigured()) return false
  try {
    const res = await face()
      .path('/largefacelists/{largeFaceListId}', eventCollection(slug))
      .delete()
    if (isUnexpected(res)) {
      // Never had face search turned on, so nothing to delete.
      if (res.status === '404') return false
      // Non-fatal by design: a stuck list must not make an event
      // undeletable. Surfaces in the audit log for manual cleanup.
      console.error('[faces] collection delete failed:', { slug, code: res.body.error.code })
      return false
    }
    return true
  } catch (err) {
    console.error('[faces] collection delete failed:', { slug, err })
    return false
  }
}
