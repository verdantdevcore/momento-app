import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, jsonRequest, getRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const serverAuth = vi.hoisted(() => ({ getUser: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: serverAuth }) }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))

import { GET, POST } from './route'
import { logAudit } from '@/lib/audit'

const VALID_UUID = '11111111-1111-1111-1111-111111111111'

function setTables(map: Record<string, { data?: unknown; error?: unknown }>) {
  adminClient.from.mockImplementation((t: string) => makeChain(map[t] ?? { data: null, error: null }))
}

function req(body: unknown) {
  return jsonRequest(body, { headers: { 'x-forwarded-for': '203.0.113.5' } })
}

beforeEach(() => {
  vi.clearAllMocks()
  serverAuth.getUser.mockResolvedValue({ data: { user: { id: 'owner-1' } } })
})

describe('GET /api/photo-requests', () => {
  it('400 when both eventId and slug are missing', async () => {
    const res = await GET(getRequest('https://sharemomento.app/api/photo-requests'))
    expect(res.status).toBe(400)
  })

  it('404 when the event does not exist', async () => {
    setTables({ events: { data: null } })
    const res = await GET(getRequest(`https://sharemomento.app/api/photo-requests?eventId=${VALID_UUID}`))
    expect(res.status).toBe(404)
  })

  it('200 with only active requests, newest first', async () => {
    setTables({
      events: { data: { id: VALID_UUID } },
      event_photo_requests: {
        data: [
          { id: 'r2', prompt: 'Get a group photo', created_at: '2026-07-21T02:00:00Z' },
          { id: 'r1', prompt: 'Need more dance floor photos', created_at: '2026-07-21T01:00:00Z' },
        ],
      },
    })
    const res = await GET(getRequest(`https://sharemomento.app/api/photo-requests?eventId=${VALID_UUID}`))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      requests: [
        { id: 'r2', prompt: 'Get a group photo', createdAt: '2026-07-21T02:00:00Z' },
        { id: 'r1', prompt: 'Need more dance floor photos', createdAt: '2026-07-21T01:00:00Z' },
      ],
    })
  })
})

describe('POST /api/photo-requests', () => {
  it('401 when unauthenticated', async () => {
    serverAuth.getUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(req({ eventId: VALID_UUID, prompt: 'Need more dance floor photos' }))
    expect(res.status).toBe(401)
  })

  it('400 when eventId is missing or malformed', async () => {
    expect((await POST(req({ prompt: 'x' }))).status).toBe(400)
    expect((await POST(req({ eventId: 'not-a-uuid', prompt: 'x' }))).status).toBe(400)
  })

  it('400 when prompt is empty or too long', async () => {
    expect((await POST(req({ eventId: VALID_UUID, prompt: '  ' }))).status).toBe(400)
    expect((await POST(req({ eventId: VALID_UUID, prompt: 'x'.repeat(121) }))).status).toBe(400)
  })

  it('404 when the event does not exist', async () => {
    setTables({ events: { data: null } })
    const res = await POST(req({ eventId: VALID_UUID, prompt: 'Need more dance floor photos' }))
    expect(res.status).toBe(404)
  })

  it('403 and audits when caller is not the owner', async () => {
    setTables({ events: { data: { id: VALID_UUID, host_id: 'someone-else' } } })
    const res = await POST(req({ eventId: VALID_UUID, prompt: 'Need more dance floor photos' }))
    expect(res.status).toBe(403)
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'photo_request_create_unauthorised' })
    )
  })

  it('403 for a restricted host', async () => {
    setTables({
      events: { data: { id: VALID_UUID, host_id: 'owner-1' } },
      hosts: { data: { restricted_at: '2026-01-01', deleted_at: null } },
    })
    const res = await POST(req({ eventId: VALID_UUID, prompt: 'Need more dance floor photos' }))
    expect(res.status).toBe(403)
  })

  it('201 and creates on a valid request from the owner', async () => {
    setTables({
      events: { data: { id: VALID_UUID, host_id: 'owner-1' } },
      hosts: { data: { restricted_at: null, deleted_at: null } },
      event_photo_requests: {
        data: { id: 'new-request', prompt: 'Need more dance floor photos', created_at: '2026-07-21T02:00:00Z' },
      },
    })
    const res = await POST(req({ eventId: VALID_UUID, prompt: 'Need more dance floor photos' }))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({
      request: { id: 'new-request', prompt: 'Need more dance floor photos', createdAt: '2026-07-21T02:00:00Z' },
    })
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'photo_request_created' })
    )
  })
})
