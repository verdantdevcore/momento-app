import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, jsonRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const serverAuth = vi.hoisted(() => ({ getUser: vi.fn() }))
const destroy = vi.hoisted(() => vi.fn())

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: serverAuth }) }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
// Keep the real extractPublicId; only the network-touching client is stubbed.
vi.mock('@/lib/cloudinary', async (orig) => {
  const actual = await orig<typeof import('@/lib/cloudinary')>()
  return { ...actual, cloudinary: { uploader: { destroy } } }
})

import { DELETE } from './route'
import { logAudit } from '@/lib/audit'

const CLOUD_URL = 'https://res.cloudinary.com/demo/image/upload/v1/Momento/events/e/pic.jpg'

function req(body: unknown) {
  return jsonRequest(body, { method: 'DELETE', headers: { 'x-forwarded-for': '203.0.113.5' } })
}

beforeEach(() => {
  vi.clearAllMocks()
  serverAuth.getUser.mockResolvedValue({ data: { user: { id: 'owner-1' } } })
  destroy.mockResolvedValue({ result: 'ok' })
})

describe('DELETE /api/delete-media', () => {
  it('401 when unauthenticated', async () => {
    serverAuth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await DELETE(req({ mediaId: 'm1' }))).status).toBe(401)
  })

  it('400 when mediaId is missing', async () => {
    expect((await DELETE(req({}))).status).toBe(400)
  })

  it('404 when the media row is not found', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: null, error: { message: 'no rows' } }))
    expect((await DELETE(req({ mediaId: 'm1' }))).status).toBe(404)
  })

  it('403 and audits when caller does not own the event', async () => {
    adminClient.from.mockReturnValueOnce(
      makeChain({ data: { id: 'm1', url: CLOUD_URL, type: 'image', events: { host_id: 'someone-else' } } }),
    )
    const res = await DELETE(req({ mediaId: 'm1' }))
    expect(res.status).toBe(403)
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'media_delete_unauthorised' }),
    )
    expect(destroy).not.toHaveBeenCalled()
  })

  it('deletes from Cloudinary and DB, then audits, for the owner', async () => {
    adminClient.from
      .mockReturnValueOnce(
        makeChain({ data: { id: 'm1', url: CLOUD_URL, type: 'image', events: { host_id: 'owner-1' } } }),
      )
      .mockReturnValueOnce(makeChain({ data: null, error: null }))
    const res = await DELETE(req({ mediaId: 'm1' }))
    expect(res.status).toBe(200)
    expect(destroy).toHaveBeenCalledWith('Momento/events/e/pic', { resource_type: 'image' })
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'media_deleted' }),
    )
  })

  it('still returns 200 when the Cloudinary destroy fails', async () => {
    destroy.mockRejectedValue(new Error('cdn down'))
    adminClient.from
      .mockReturnValueOnce(
        makeChain({ data: { id: 'm1', url: CLOUD_URL, type: 'image', events: { host_id: 'owner-1' } } }),
      )
      .mockReturnValueOnce(makeChain({ data: null, error: null }))
    const res = await DELETE(req({ mediaId: 'm1' }))
    expect(res.status).toBe(200)
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'cloudinary_delete_failed' }),
    )
  })

  it('500 when the DB delete errors', async () => {
    adminClient.from
      .mockReturnValueOnce(
        makeChain({ data: { id: 'm1', url: CLOUD_URL, type: 'image', events: { host_id: 'owner-1' } } }),
      )
      .mockReturnValueOnce(makeChain({ data: null, error: { message: 'db fail' } }))
    expect((await DELETE(req({ mediaId: 'm1' }))).status).toBe(500)
  })
})
