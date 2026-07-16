import { createClient } from '@supabase/supabase-js'
import { deleteEventAssets, eventFolder, type AssetDeletionResult } from '@/lib/cloudinary'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/**
 * Purges one event's Cloudinary assets and then the event row itself.
 *
 * Order matters: the media rows are the only record of where an event's assets
 * live, and deleting the event cascades them away — so the assets must go while
 * their URLs are still readable, or they are orphaned in Cloudinary forever.
 *
 * Shared by the host/admin delete route and the account-purge cron so both
 * paths tear down identically.
 */
export async function purgeEvent(event: { id: string; slug: string }): Promise<AssetDeletionResult> {
  const { data: media } = await adminClient
    .from('media')
    .select('url, type')
    .eq('event_id', event.id)

  const result = await deleteEventAssets(media ?? [], eventFolder(event.slug))

  // Drop the row even if some destroys failed, otherwise one stuck asset makes
  // the event permanently undeletable. Failures surface in the audit log for
  // manual cleanup.
  const { error } = await adminClient.from('events').delete().eq('id', event.id)
  if (error) throw new Error(`Failed to delete event row: ${error.message}`)

  return result
}

/** Purges every event belonging to a host. Used by the account-purge cron. */
export async function purgeHostEvents(hostId: string): Promise<AssetDeletionResult> {
  const { data: events } = await adminClient
    .from('events')
    .select('id, slug')
    .eq('host_id', hostId)

  const totals: AssetDeletionResult = { deleted: 0, failed: 0, folderRemoved: false }
  for (const event of events ?? []) {
    const result = await purgeEvent(event)
    totals.deleted += result.deleted
    totals.failed  += result.failed
    totals.folderRemoved = totals.folderRemoved || result.folderRemoved
  }
  return totals
}
