import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Everything Momento uploads lives under this root.
export const CLOUDINARY_ROOT = 'Momento'

// Events created before per-event folders existed all uploaded here. Deleting
// such an event must never delete the folder itself — it is shared with every
// other legacy event — so folder-level cleanup is skipped for this path.
export const LEGACY_UPLOAD_FOLDER = 'Momento/AdimandJojo26'

// Each event gets its own folder, keyed by slug. Slugs are unique (generateSlug
// appends 8 random bytes) and are never rewritten on edit, so this is stable for
// the life of the event while staying readable in the Cloudinary console.
export function eventFolder(slug: string): string {
  return `${CLOUDINARY_ROOT}/events/${slug}`
}

export function isLegacyFolder(folder: string): boolean {
  return folder === LEGACY_UPLOAD_FOLDER
}

// Recovers the Cloudinary public_id from a delivery URL, e.g.
// https://res.cloudinary.com/demo/image/upload/v1234/Momento/events/x/abc.jpg
//   -> Momento/events/x/abc
export function extractPublicId(url: string): string | null {
  try {
    const path = new URL(url).pathname
    const uploadIdx = path.indexOf('/upload/')
    if (uploadIdx === -1) return null
    let after = path.slice(uploadIdx + '/upload/'.length)
    if (/^v\d+\//.test(after)) after = after.replace(/^v\d+\//, '')
    return after.replace(/\.[^/.]+$/, '') || null
  } catch {
    return null
  }
}

/**
 * Inserts a transformation into a delivery URL, e.g.
 *   .../upload/v123/Momento/events/x/a.jpg
 *     -> .../upload/c_limit,w_1600/v123/Momento/events/x/a.jpg
 *
 * Returns null for a URL that isn't a Cloudinary delivery URL.
 */
export function derivedUrl(url: string, transformation: string): string | null {
  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(0, idx + marker.length) + transformation + '/' + url.slice(idx + marker.length)
}

type MediaRow = { url: string; type: string }

export type AssetDeletionResult = {
  deleted: number
  failed: number
  folderRemoved: boolean
}

/**
 * Deletes every Cloudinary asset backing a set of media rows, then removes the
 * event's folder.
 *
 * Assets are destroyed by public_id derived from each row's URL rather than by
 * folder prefix, because the URL is the only authoritative record of where an
 * asset actually landed — legacy rows live in the shared folder, and prefix
 * deletion there would take out unrelated events' media.
 */
export async function deleteEventAssets(
  media: MediaRow[],
  folder: string | null
): Promise<AssetDeletionResult> {
  let deleted = 0
  let failed = 0

  const byResourceType: Record<'image' | 'video', string[]> = { image: [], video: [] }
  // Legacy events predate per-event folders and still live in the shared
  // folder, so their assets never sit under the folder we're asked to clean up.
  let anyAssetInFolder = false
  for (const row of media) {
    const publicId = extractPublicId(row.url)
    if (!publicId) { failed++; continue }
    if (folder && publicId.startsWith(`${folder}/`)) anyAssetInFolder = true
    byResourceType[row.type === 'video' ? 'video' : 'image'].push(publicId)
  }

  for (const [resourceType, publicIds] of Object.entries(byResourceType)) {
    // delete_resources caps at 100 ids per call.
    for (let i = 0; i < publicIds.length; i += 100) {
      const batch = publicIds.slice(i, i + 100)
      try {
        const res = await cloudinary.api.delete_resources(batch, {
          resource_type: resourceType as 'image' | 'video',
          invalidate: true,
        })
        for (const id of batch) {
          if (res.deleted?.[id] === 'deleted' || res.deleted?.[id] === 'not_found') deleted++
          else failed++
        }
      } catch (err) {
        console.error('[cloudinary] delete_resources failed:', { resourceType, count: batch.length, err })
        failed += batch.length
      }
    }
  }

  // Remove the now-empty folder so the console doesn't fill with husks. Only
  // safe for per-event folders; the legacy folder is shared. Skipped entirely
  // for an event with media that all lives elsewhere (a legacy event), whose
  // per-event folder was never created and would only 404 here.
  let folderRemoved = false
  const folderMayExist = anyAssetInFolder || media.length === 0
  if (folder && !isLegacyFolder(folder) && folderMayExist) {
    try {
      // Sweeps up any asset uploaded to the folder but never recorded in the
      // media table (e.g. a browser upload whose save request never landed).
      await cloudinary.api.delete_resources_by_prefix(`${folder}/`, { resource_type: 'image' })
      await cloudinary.api.delete_resources_by_prefix(`${folder}/`, { resource_type: 'video' })
      await cloudinary.api.delete_folder(folder)
      folderRemoved = true
    } catch (err) {
      // A folder that never received an upload does not exist server-side and
      // 404s here — harmless, so this stays non-fatal.
      console.error('[cloudinary] folder cleanup failed:', { folder, err })
    }
  }

  return { deleted, failed, folderRemoved }
}
