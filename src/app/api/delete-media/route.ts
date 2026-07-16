import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { cloudinary, extractPublicId } from '@/lib/cloudinary'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

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
      .select('id, url, type, event_id, events!inner(host_id)')
      .eq('id', mediaId)
      .single()

    if (fetchErr || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const hostId = (media as any).events?.host_id
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

    // 2. Delete from Supabase
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
      metadata: { media_id: mediaId, cloudinary_deleted: cloudinaryDeleted },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[delete-media] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}