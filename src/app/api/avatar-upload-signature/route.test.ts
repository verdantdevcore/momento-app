import { describe, it, expect, beforeEach, vi } from 'vitest'
import { jsonRequest } from '@/test/helpers'

const serverAuth = vi.hoisted(() => ({ getUser: vi.fn() }))
const apiSign = vi.hoisted(() => vi.fn(() => 'signature-abc'))
const rateLimit = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: serverAuth }) }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
vi.mock('@/lib/cloudinary', async (orig) => {
  const actual = await orig<typeof import('@/lib/cloudinary')>()
  return { ...actual, cloudinary: { utils: { api_sign_request: apiSign } } }
})
vi.mock('@/lib/upload-security', async (orig) => {
  const actual = await orig<typeof import('@/lib/upload-security')>()
  return { ...actual, avatarRatelimit: { limit: rateLimit } }
})

import { POST } from './route'

const APP_ORIGIN = 'https://sharemomento.app'

function req(body: unknown, origin: string | null = APP_ORIGIN) {
  const headers: Record<string, string> = { 'x-forwarded-for': '203.0.113.5' }
  if (origin) headers.origin = origin
  return jsonRequest(body, { headers })
}

const imageBody = { fileName: 'me.jpg', fileType: 'image/jpeg', fileSize: 1024 }

beforeEach(() => {
  vi.clearAllMocks()
  serverAuth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  rateLimit.mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: Date.now() + 1000 })
})

describe('POST /api/avatar-upload-signature', () => {
  it('403 when the origin is not allowed', async () => {
    expect((await POST(req(imageBody, 'https://evil.example'))).status).toBe(403)
  })

  it('401 when unauthenticated', async () => {
    serverAuth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await POST(req(imageBody))).status).toBe(401)
  })

  it('429 when rate limited', async () => {
    rateLimit.mockResolvedValue({ success: false, limit: 5, remaining: 0, reset: Date.now() + 1000 })
    expect((await POST(req(imageBody))).status).toBe(429)
  })

  it('400 when the file is too large', async () => {
    expect((await POST(req({ ...imageBody, fileSize: 9 * 1024 * 1024 }))).status).toBe(400)
  })

  it('400 when the file is a video', async () => {
    const res = await POST(req({ fileName: 'clip.mp4', fileType: 'video/mp4', fileSize: 1024 }))
    expect(res.status).toBe(400)
  })

  it('returns a signature keyed to the user id on success', async () => {
    const res = await POST(req(imageBody))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ signature: 'signature-abc', publicId: 'user-1', resourceType: 'image' })
  })
})
