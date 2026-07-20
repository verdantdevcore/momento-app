import { createClient } from '@supabase/supabase-js'
import { deleteEventAssets, eventFolder, type AssetDeletionResult } from '@/lib/cloudinary'
import { deleteEventCollection } from '@/lib/faces'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export type EventPurgeResult = AssetDeletionResult & { faceCollectionRemoved: boolean }

/**
 * Purges one event's Cloudinary assets and face index, then the event row.
 *
 * Order matters: the media rows are the only record of where an event's assets
 * live, and deleting the event cascades them away — so the assets must go while
 * their URLs are still readable, or they are orphaned in Cloudinary forever.
 * The media_faces rows cascade with them, which is why the Azure face list is
 * dropped wholesale here rather than face by face.
 *
 * Shared by the host/admin delete route and the account-purge cron so both
 * paths tear down identically.
 */
export async function purgeEvent(event: { id: string; slug: string }): Promise<EventPurgeResult> {
  const { data: media } = await adminClient
    .from('media')
    .select('url, type')
    .eq('event_id', event.id)

  const result = await deleteEventAssets(media ?? [], eventFolder(event.slug))

  // Face templates must not outlive the photos they were derived from. Returns
  // false rather than throwing for an event that never had face search on, and
  // logs-and-continues on a genuine failure so a stuck collection can't make
  // the event undeletable — same posture as the asset deletion above.
  const faceCollectionRemoved = await deleteEventCollection(event.slug)

  // Drop the row even if some destroys failed, otherwise one stuck asset makes
  // the event permanently undeletable. Failures surface in the audit log for
  // manual cleanup.
  const { error } = await adminClient.from('events').delete().eq('id', event.id)
  if (error) throw new Error(`Failed to delete event row: ${error.message}`)

  return { ...result, faceCollectionRemoved }
}

/**
 * Irreversibly tears an account down: Cloudinary assets, events, media, the
 * hosts row and the auth user. Nothing here is recoverable afterwards.
 *
 * Ordering matters. The media rows are the only record of where an event's
 * assets live, so they have to be read before anything cascades them away —
 * purgeHostEvents does the assets first, and only then is the auth user
 * removed.
 *
 * Shared by the 30-day purge cron and the admin's "delete permanently" action
 * so both destroy exactly the same things.
 */
export async function purgeHostAccount(hostId: string): Promise<EventPurgeResult> {
  const assets = await purgeHostEvents(hostId)

  // Usually cascades the hosts row away via its FK to auth.users; the explicit
  // delete below covers schemas where it doesn't.
  const { error } = await adminClient.auth.admin.deleteUser(hostId)
  if (error) throw new Error(`auth delete failed: ${error.message}`)

  await adminClient.from('hosts').delete().eq('id', hostId)

  return assets
}

/** Purges every event belonging to a host. */
export async function purgeHostEvents(hostId: string): Promise<EventPurgeResult> {
  const { data: events } = await adminClient
    .from('events')
    .select('id, slug')
    .eq('host_id', hostId)

  const totals: EventPurgeResult = { deleted: 0, failed: 0, folderRemoved: false, faceCollectionRemoved: false }
  for (const event of events ?? []) {
    const result = await purgeEvent(event)
    totals.deleted += result.deleted
    totals.failed  += result.failed
    totals.folderRemoved = totals.folderRemoved || result.folderRemoved
    totals.faceCollectionRemoved = totals.faceCollectionRemoved || result.faceCollectionRemoved
  }
  return totals
}
