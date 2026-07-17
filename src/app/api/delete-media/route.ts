import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { cloudinary, extractPublicId } from '@/lib/cloudinary'
import { deleteFaces, eventCollection } from '@/lib/faces'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// The embedded events row comes back as an object for an !inner join on a
// to-one relation, which the generated types don't narrow to.
type MediaWithEvent = {
  id: string
  url: string
  type: string
  event_id: string
  events: { host_id: string; slug: string }
}

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { mediaId } = await request.json()
    if (!mediaId) {
      return NextResponse.json({ error: 'Missing mediaId' }, { status: 400 })
    }

    // Fetch the media record and verify host owns the event
    const { data: media, error: fetchErr } = await adminClient
      .from('media')
      .select('id, url, type, event_id, events!inner(host_id, slug)')
      .eq('id', mediaId)
      .single<MediaWithEvent>()

    if (fetchErr || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const hostId = media.events?.host_id
    if (hostId !== user.id) {
      await logAudit({
        event_type: 'media_delete_unauthorised',
        user_id: user.id,
        ip,
        metadata: { media_id: mediaId, owner: hostId },
      })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Delete from Cloudinary
    const publicId = extractPublicId(media.url)
    let cloudinaryDeleted = false
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: media.type === 'video' ? 'video' : 'image',
        })
        cloudinaryDeleted = true
      } catch (cdnErr) {
        console.error('[delete-media] Cloudinary destroy failed:', cdnErr)
        await logAudit({
          event_type: 'cloudinary_delete_failed',
          user_id: user.id,
          ip,
          metadata: { media_id: mediaId, public_id: publicId },
        })
        // Continue — still delete DB record
      }
    }

    // 2. Drop this photo's faces from the event's Rekognition collection.
    //    Must happen before the media row goes, since media_faces cascades off
    //    it and those rows are the only record of which faces came from this
    //    photo — losing them would strand the face templates in the collection
    //    with nothing left to delete them by.
    let facesDeleted = 0
    const { data: faceRows } = await adminClient
      .from('media_faces')
      .select('rekognition_face_id')
      .eq('media_id', mediaId)

    if (faceRows && faceRows.length > 0) {
      try {
        await deleteFaces(eventCollection(media.events.slug), faceRows.map(f => f.rekognition_face_id))
        facesDeleted = faceRows.length
      } catch (faceErr) {
        console.error('[delete-media] Rekognition face delete failed:', faceErr)
        await logAudit({
          event_type: 'face_delete_failed',
          user_id: user.id,
          ip,
          metadata: { media_id: mediaId, face_count: faceRows.length },
        })
        // Continue — same posture as the Cloudinary failure above. The search
        // endpoint resolves matches through the media table, so a face left
        // behind here returns nothing rather than a broken result.
      }
    }

    // 3. Delete from Supabase (media_faces cascades)
    const { error: dbErr } = await adminClient
      .from('media')
      .delete()
      .eq('id', mediaId)

    if (dbErr) {
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 })
    }

    await logAudit({
      event_type: 'media_deleted',
      user_id: user.id,
      ip,
      metadata: { media_id: mediaId, cloudinary_deleted: cloudinaryDeleted, faces_deleted: facesDeleted },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[delete-media] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}