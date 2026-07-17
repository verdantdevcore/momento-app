import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, jsonRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const destroy = vi.hoisted(() => vi.fn())
const isHostInactive = vi.hoisted(() => vi.fn())
const rateLimit = vi.hoisted(() => vi.fn())

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
vi.mock('@/lib/cloudinary', async (orig) => {
  const actual = await orig<typeof import('@/lib/cloudinary')>()
  return { ...actual, cloudinary: { uploader: { destroy } } }
})
// Keep the real pure helpers (isOriginAllowed, UUID_RE); stub the async/stateful ones.
vi.mock('@/lib/upload-security', async (orig) => {
  const actual = await orig<typeof import('@/lib/upload-security')>()
  return { ...actual, isHostInactive, saveRatelimit: { limit: rateLimit } }
})

import { POST } from './route'

const VALID_UUID = '11111111-1111-1111-1111-111111111111'
const APP_ORIGIN = 'https://sharemomento.app'
const CLOUD_URL = 'https://res.cloudinary.com/demo/image/upload/v1/Momento/events/e/pic.jpg'

function req(body: unknown, origin: string | null = APP_ORIGIN) {
  const headers: Record<string, string> = { 'x-forwarded-for': '203.0.113.5' }
  if (origin) headers.origin = origin
  return jsonRequest(body, { headers })
}

const openEvent = { host_id: 'owner-1', feed_opens_at: null, feed_closes_at: null }

beforeEach(() => {
  vi.clearAllMocks()
  rateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() + 1000 })
  isHostInactive.mockResolvedValue(false)
  adminClient.from.mockImplementation(() => makeChain({ data: null, error: null }))
})

describe('POST /api/upload', () => {
  it('403 when the origin is not allowed', async () => {
    expect((await POST(req({ url: CLOUD_URL, eventId: VALID_UUID }, 'https://evil.example'))).status).toBe(403)
  })

  it('429 when rate limited', async () => {
    rateLimit.mockResolvedValue({ success: false, limit: 10, remaining: 0, reset: Date.now() + 1000 })
    expect((await POST(req({ url: CLOUD_URL, eventId: VALID_UUID }))).status).toBe(429)
  })

  it('400 when url or eventId is missing', async () => {
    expect((await POST(req({ eventId: VALID_UUID }))).status).toBe(400)
    expect((await POST(req({ url: CLOUD_URL }))).status).toBe(400)
  })

  it('400 when eventId is not a UUID', async () => {
    expect((await POST(req({ url: CLOUD_URL, eventId: 'nope' }))).status).toBe(400)
  })

  it('403 when the event is missing or not accepting uploads', async () => {
    adminClient.from.mockImplementation(() => makeChain({ data: null }))
    expect((await POST(req({ url: CLOUD_URL, eventId: VALID_UUID }))).status).toBe(403)
  })

  it('403 when the host is inactive', async () => {
    adminClient.from.mockImplementation(() => makeChain({ data: openEvent }))
    isHostInactive.mockResolvedValue(true)
    expect((await POST(req({ url: CLOUD_URL, eventId: VALID_UUID }))).status).toBe(403)
  })

  it('400 when the media URL is not a Cloudinary URL', async () => {
    adminClient.from.mockImplementation(() => makeChain({ data: openEvent }))
    const res = await POST(req({ url: 'https://evil.com/x.jpg', eventId: VALID_UUID }))
    expect(res.status).toBe(400)
  })

  it('400 when there are too many hashtags', async () => {
    adminClient.from.mockImplementation(() => makeChain({ data: openEvent }))
    const res = await POST(
      req({ url: CLOUD_URL, eventId: VALID_UUID, hashtags: Array(11).fill('x') }),
    )
    expect(res.status).toBe(400)
  })

  it('saves the media record and returns the mediaId on success', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: openEvent }))
      .mockReturnValueOnce(makeChain({ data: { id: 'media-9' }, error: null }))
    const res = await POST(req({ url: CLOUD_URL, eventId: VALID_UUID, uploadedBy: 'Ada' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ mediaId: 'media-9', type: 'image' })
  })

  it('cleans up the orphaned asset and 500s when the DB insert fails', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: openEvent }))
      .mockReturnValueOnce(makeChain({ data: null, error: { message: 'insert fail' } }))
    const res = await POST(req({ url: CLOUD_URL, eventId: VALID_UUID, publicId: 'Momento/events/e/pic' }))
    expect(res.status).toBe(500)
    expect(destroy).toHaveBeenCalledWith('Momento/events/e/pic', { resource_type: 'image' })
  })
})
