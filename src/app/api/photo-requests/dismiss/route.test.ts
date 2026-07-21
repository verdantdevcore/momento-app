import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, jsonRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const serverAuth = vi.hoisted(() => ({ getUser: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: serverAuth }) }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))

import { POST } from './route'
import { logAudit } from '@/lib/audit'

const VALID_UUID = '11111111-1111-1111-1111-111111111111'
const REQUEST_UUID = '22222222-2222-2222-2222-222222222222'

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

describe('POST /api/photo-requests/dismiss', () => {
  it('401 when unauthenticated', async () => {
    serverAuth.getUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(req({ eventId: VALID_UUID, requestId: REQUEST_UUID }))
    expect(res.status).toBe(401)
  })

  it('400 when eventId or requestId is missing or malformed', async () => {
    expect((await POST(req({ requestId: REQUEST_UUID }))).status).toBe(400)
    expect((await POST(req({ eventId: VALID_UUID }))).status).toBe(400)
    expect((await POST(req({ eventId: 'nope', requestId: REQUEST_UUID }))).status).toBe(400)
  })

  it('404 when the event does not exist', async () => {
    setTables({ events: { data: null } })
    const res = await POST(req({ eventId: VALID_UUID, requestId: REQUEST_UUID }))
    expect(res.status).toBe(404)
  })

  it('403 and audits when caller is not the owner', async () => {
    setTables({ events: { data: { id: VALID_UUID, host_id: 'someone-else' } } })
    const res = await POST(req({ eventId: VALID_UUID, requestId: REQUEST_UUID }))
    expect(res.status).toBe(403)
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'photo_request_dismiss_unauthorised' })
    )
  })

  it('403 for a restricted host', async () => {
    setTables({
      events: { data: { id: VALID_UUID, host_id: 'owner-1' } },
      hosts: { data: { restricted_at: '2026-01-01', deleted_at: null } },
    })
    const res = await POST(req({ eventId: VALID_UUID, requestId: REQUEST_UUID }))
    expect(res.status).toBe(403)
  })

  it('404 when the photo request does not exist for this event', async () => {
    setTables({
      events: { data: { id: VALID_UUID, host_id: 'owner-1' } },
      hosts: { data: { restricted_at: null, deleted_at: null } },
      event_photo_requests: { data: null },
    })
    const res = await POST(req({ eventId: VALID_UUID, requestId: REQUEST_UUID }))
    expect(res.status).toBe(404)
  })

  it('200 and dismisses on a valid request from the owner', async () => {
    setTables({
      events: { data: { id: VALID_UUID, host_id: 'owner-1' } },
      hosts: { data: { restricted_at: null, deleted_at: null } },
      event_photo_requests: { data: { id: REQUEST_UUID } },
    })
    const res = await POST(req({ eventId: VALID_UUID, requestId: REQUEST_UUID }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ dismissed: true })
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'photo_request_dismissed' })
    )
  })
})
