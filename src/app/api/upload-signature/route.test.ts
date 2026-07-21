import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, jsonRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const apiSign = vi.hoisted(() => vi.fn(() => 'signature-abc'))
const isHostInactive = vi.hoisted(() => vi.fn())
const rateLimit = vi.hoisted(() => vi.fn())

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
vi.mock('@/lib/cloudinary', async (orig) => {
  const actual = await orig<typeof import('@/lib/cloudinary')>()
  return { ...actual, cloudinary: { utils: { api_sign_request: apiSign } } }
})
vi.mock('@/lib/upload-security', async (orig) => {
  const actual = await orig<typeof import('@/lib/upload-security')>()
  return { ...actual, isHostInactive, signatureRatelimit: { limit: rateLimit } }
})

import { POST } from './route'

const VALID_UUID = '11111111-1111-1111-1111-111111111111'
const APP_ORIGIN = 'https://sharemomento.app'

function req(body: unknown, origin: string | null = APP_ORIGIN) {
  const headers: Record<string, string> = { 'x-forwarded-for': '203.0.113.5' }
  if (origin) headers.origin = origin
  return jsonRequest(body, { headers })
}

const openEvent = { slug: 'my-event', host_id: 'owner-1', feed_opens_at: null, feed_closes_at: null }
const imageBody = { eventId: VALID_UUID, fileName: 'pic.jpg', fileType: 'image/jpeg', fileSize: 1024 }

beforeEach(() => {
  vi.clearAllMocks()
  rateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() + 1000 })
  isHostInactive.mockResolvedValue(false)
  adminClient.from.mockImplementation(() => makeChain({ data: openEvent }))
})

describe('POST /api/upload-signature', () => {
  it('403 when the origin is not allowed', async () => {
    expect((await POST(req(imageBody, 'https://evil.example'))).status).toBe(403)
  })

  it('429 when rate limited', async () => {
    rateLimit.mockResolvedValue({ success: false, limit: 10, remaining: 0, reset: Date.now() + 1000 })
    expect((await POST(req(imageBody))).status).toBe(429)
  })

  // The Upstash host stopped resolving and every upload on the platform
  // 500ed, because .limit() rejected outside the handler's try/catch. Rate
  // limiting is abuse control, not an authorisation boundary — it has to
  // fail open.
  it('still signs when the rate limiter is unreachable', async () => {
    rateLimit.mockRejectedValue(
      Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } })
    )
    const res = await POST(req(imageBody))
    expect(res.status).toBe(200)
    expect((await res.json()).signature).toBe('signature-abc')
  })

  it('400 when eventId is invalid', async () => {
    expect((await POST(req({ ...imageBody, eventId: 'nope' }))).status).toBe(400)
  })

  it('403 when the event is not accepting uploads', async () => {
    adminClient.from.mockImplementation(() => makeChain({ data: null }))
    expect((await POST(req(imageBody))).status).toBe(403)
  })

  it('403 when the host is inactive', async () => {
    isHostInactive.mockResolvedValue(true)
    expect((await POST(req(imageBody))).status).toBe(403)
  })

  it('400 when the file is too large', async () => {
    const res = await POST(req({ ...imageBody, fileSize: 51 * 1024 * 1024 }))
    expect(res.status).toBe(400)
  })

  it('400 when the file type is unsupported', async () => {
    const res = await POST(req({ ...imageBody, fileName: 'doc.pdf', fileType: 'application/pdf' }))
    expect(res.status).toBe(400)
  })

  it('returns a Cloudinary signature on success', async () => {
    const res = await POST(req(imageBody))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ signature: 'signature-abc', folder: 'Momento/events/my-event', resourceType: 'image' })
    expect(apiSign).toHaveBeenCalledOnce()
  })
})
