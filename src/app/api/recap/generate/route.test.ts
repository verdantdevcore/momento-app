import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, jsonRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const serverAuth = vi.hoisted(() => ({ getUser: vi.fn() }))
const enqueueRecapGenerate = vi.hoisted(() => vi.fn())

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: serverAuth }) }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
vi.mock('@/lib/qstash', () => ({ enqueueRecapGenerate }))

import { POST } from './route'
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

describe('POST /api/recap/generate', () => {
  it('401 when unauthenticated', async () => {
    serverAuth.getUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(401)
    expect(enqueueRecapGenerate).not.toHaveBeenCalled()
  })

  it('400 when eventId is missing or malformed', async () => {
    expect((await POST(req({}))).status).toBe(400)
    expect((await POST(req({ eventId: 'not-a-uuid' }))).status).toBe(400)
  })

  it('404 when the event does not exist', async () => {
    setTables({ events: { data: null, error: null } })
    const res = await POST(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(404)
  })

  it('403 and audits when caller is not the owner', async () => {
    setTables({ events: { data: { id: VALID_UUID, host_id: 'someone-else', recap_status: 'idle' } } })
    const res = await POST(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(403)
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'recap_generate_unauthorised' })
    )
    expect(enqueueRecapGenerate).not.toHaveBeenCalled()
  })

  it('403 for a restricted host', async () => {
    setTables({
      events: { data: { id: VALID_UUID, host_id: 'owner-1', recap_status: 'idle' } },
      hosts: { data: { restricted_at: '2026-01-01', deleted_at: null } },
    })
    const res = await POST(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(403)
    expect(enqueueRecapGenerate).not.toHaveBeenCalled()
  })

  it('409 when a recap is already generating', async () => {
    setTables({
      events: { data: { id: VALID_UUID, host_id: 'owner-1', recap_status: 'processing' } },
      hosts: { data: { restricted_at: null, deleted_at: null } },
    })
    const res = await POST(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(409)
    expect(enqueueRecapGenerate).not.toHaveBeenCalled()
  })

  it('202 and enqueues on a valid request from the owner', async () => {
    setTables({
      events: { data: { id: VALID_UUID, host_id: 'owner-1', recap_status: 'idle' } },
      hosts: { data: { restricted_at: null, deleted_at: null } },
    })
    const res = await POST(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(202)
    expect(await res.json()).toEqual({ status: 'processing' })
    expect(enqueueRecapGenerate).toHaveBeenCalledWith(VALID_UUID)
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'recap_generate_requested' })
    )
  })

  it('202 and enqueues when retriggered after a failure', async () => {
    setTables({
      events: { data: { id: VALID_UUID, host_id: 'owner-1', recap_status: 'failed' } },
      hosts: { data: { restricted_at: null, deleted_at: null } },
    })
    const res = await POST(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(202)
    expect(enqueueRecapGenerate).toHaveBeenCalledWith(VALID_UUID)
  })
})
