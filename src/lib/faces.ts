import {
  RekognitionClient,
  CreateCollectionCommand,
  DeleteCollectionCommand,
  DeleteFacesCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
} from '@aws-sdk/client-rekognition'
import { CLOUDINARY_ROOT } from '@/lib/cloudinary'

/**
 * Face matching for "upload a selfie, find every photo you're in".
 *
 * Face templates live in AWS Rekognition, one collection per event, and never
 * in our database — Postgres only holds the pointer from a face id back to the
 * media row (see supabase/migrations/002_face_discovery.sql).
 *
 * Two properties of this design are load-bearing for the privacy posture and
 * should survive any refactor:
 *
 *  1. The searcher's selfie is never stored or indexed. SearchFacesByImage
 *     takes the probe bytes inline and returns matches; the selfie exists for
 *     the life of one request and is written nowhere.
 *
 *  2. Collections are per-event, so a face indexed at one event can never match
 *     against another, and tearing an event down is one DeleteCollection call
 *     rather than a hunt for individual faces.
 */

// Vercel functions run on Lambda, whose runtime already defines AWS_REGION,
// AWS_ACCESS_KEY_ID and friends for the function's own role — Vercel therefore
// rejects project env vars with those names. Hence the prefix.
const REGION     = process.env.MOMENTO_AWS_REGION
const ACCESS_KEY = process.env.MOMENTO_AWS_ACCESS_KEY_ID
const SECRET_KEY = process.env.MOMENTO_AWS_SECRET_ACCESS_KEY

/**
 * False when AWS isn't configured. Every caller checks this and degrades to a
 * no-op rather than throwing: face search is an add-on, and a missing key must
 * never take uploads or feeds down with it.
 */
export function facesConfigured(): boolean {
  return Boolean(REGION && ACCESS_KEY && SECRET_KEY)
}

let client: RekognitionClient | null = null
function rekognition(): RekognitionClient {
  if (!client) {
    client = new RekognitionClient({
      region: REGION!,
      credentials: { accessKeyId: ACCESS_KEY!, secretAccessKey: SECRET_KEY! },
    })
  }
  return client
}

/**
 * One collection per event, keyed by slug to mirror eventFolder() in
 * cloudinary.ts. Slugs are unique, are never rewritten on edit, and are already
 * constrained to [a-z0-9-] — which is inside Rekognition's allowed character
 * set — so no escaping is needed.
 */
export function eventCollection(slug: string): string {
  return `${CLOUDINARY_ROOT.toLowerCase()}-events-${slug}`
}

/**
 * A match below this is not shown. Rekognition defaults to 80, which is tuned
 * for "probably the same person"; here a false positive means showing a guest
 * a stranger's photo because it looks a bit like them, so the bar is higher.
 * Raise it before lowering it.
 */
const MATCH_THRESHOLD = 90

// Group shots are the whole point of the feature, so this is generous. Faces
// beyond the cap are dropped largest-first by Rekognition.
const MAX_FACES_PER_PHOTO = 30

export type IndexedFace = {
  faceId: string
  boundingBox: unknown
  confidence: number | null
}

/** The SDK signals every expected condition through the error's name. */
function isAwsError(err: unknown, name: string): boolean {
  return typeof err === 'object' && err !== null && (err as { name?: unknown }).name === name
}

/** Creates the event's collection. Safe to call repeatedly. */
export async function ensureCollection(collectionId: string): Promise<void> {
  try {
    await rekognition().send(new CreateCollectionCommand({ CollectionId: collectionId }))
  } catch (err) {
    if (!isAwsError(err, 'ResourceAlreadyExistsException')) throw err
  }
}

/**
 * Indexes every face in one event photo.
 *
 * DetectionAttributes is left empty on purpose: Rekognition can also return
 * estimated age, gender and emotion, and we neither need nor want to be holding
 * any of that.
 */
export async function indexPhotoFaces(params: {
  collectionId: string
  bytes: Uint8Array
  externalImageId: string
}): Promise<IndexedFace[]> {
  const res = await rekognition().send(new IndexFacesCommand({
    CollectionId:        params.collectionId,
    Image:               { Bytes: params.bytes },
    ExternalImageId:     params.externalImageId,
    MaxFaces:            MAX_FACES_PER_PHOTO,
    // Drops faces too blurry, small or side-on to match reliably. Indexing them
    // would mostly generate false positives later.
    QualityFilter:       'AUTO',
    DetectionAttributes: [],
  }))

  return (res.FaceRecords ?? []).flatMap(record => {
    const faceId = record.Face?.FaceId
    if (!faceId) return []
    return [{
      faceId,
      boundingBox: record.Face?.BoundingBox ?? null,
      confidence:  record.Face?.Confidence ?? null,
    }]
  })
}

export class NoFaceInSelfieError extends Error {
  constructor() {
    super('No face detected in the uploaded selfie')
    this.name = 'NoFaceInSelfieError'
  }
}

/**
 * Returns the ExternalImageIds (media ids) of every indexed photo matching the
 * face in the selfie. The selfie is not stored, indexed, or logged.
 *
 * Rekognition matches on the *largest* face in the probe image, so a selfie
 * with someone else looming in the frame searches for them instead — the UI
 * asks for a photo of just the guest for this reason.
 */
export async function searchBySelfie(params: {
  collectionId: string
  bytes: Uint8Array
}): Promise<string[]> {
  try {
    const res = await rekognition().send(new SearchFacesByImageCommand({
      CollectionId:       params.collectionId,
      Image:              { Bytes: params.bytes },
      FaceMatchThreshold: MATCH_THRESHOLD,
      // Defaults to 1 — without this the guest finds exactly one of their photos.
      MaxFaces:           1000,
    }))

    const ids = new Set<string>()
    for (const match of res.FaceMatches ?? []) {
      const externalId = match.Face?.ExternalImageId
      if (externalId) ids.add(externalId)
    }
    return [...ids]
  } catch (err) {
    // What Rekognition raises when it can't find a face to search with.
    if (isAwsError(err, 'InvalidParameterException')) throw new NoFaceInSelfieError()
    // An event whose collection was never created has simply indexed nothing.
    if (isAwsError(err, 'ResourceNotFoundException')) return []
    throw err
  }
}

/** Removes specific faces, e.g. when a host deletes one photo. */
export async function deleteFaces(collectionId: string, faceIds: string[]): Promise<void> {
  if (faceIds.length === 0) return
  try {
    // DeleteFaces caps at 1000 ids per call.
    for (let i = 0; i < faceIds.length; i += 1000) {
      await rekognition().send(new DeleteFacesCommand({
        CollectionId: collectionId,
        FaceIds:      faceIds.slice(i, i + 1000),
      }))
    }
  } catch (err) {
    if (isAwsError(err, 'ResourceNotFoundException')) return
    throw err
  }
}

/**
 * Destroys an event's entire face index. Called from the event purge path — the
 * biometric data must not outlive the photos it was derived from.
 */
export async function deleteEventCollection(slug: string): Promise<boolean> {
  if (!facesConfigured()) return false
  try {
    await rekognition().send(new DeleteCollectionCommand({ CollectionId: eventCollection(slug) }))
    return true
  } catch (err) {
    // Never had face search turned on, so nothing to delete.
    if (isAwsError(err, 'ResourceNotFoundException')) return false
    // Non-fatal by design: a stuck collection must not make an event
    // undeletable. Surfaces in the audit log for manual cleanup.
    console.error('[faces] collection delete failed:', { slug, err })
    return false
  }
}
