import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, jsonRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const serverAuth = vi.hoisted(() => ({ getUser: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: serverAuth }) }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))

import { POST } from './route'
import { logAudit } from '@/lib/audit'

function req(body: unknown) {
  return jsonRequest(body, { headers: { 'x-forwarded-for': '203.0.113.5' } })
}

beforeEach(() => {
  vi.clearAllMocks()
  serverAuth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
})

describe('POST /api/admin/set-role', () => {
  it('401 when unauthenticated', async () => {
    serverAuth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await POST(req({ targetId: 't', isSuperAdmin: true }))).status).toBe(401)
  })

  it('403 when the caller is not a super admin', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { is_super_admin: false } }))
    expect((await POST(req({ targetId: 't', isSuperAdmin: true }))).status).toBe(403)
  })

  it('400 when the body is malformed', async () => {
    adminClient.from.mockReturnValue(makeChain({ data: { is_super_admin: true } }))
    expect((await POST(req({ targetId: 't' }))).status).toBe(400)
    expect((await POST(req({ isSuperAdmin: true }))).status).toBe(400)
  })

  it('400 when changing your own role', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { is_super_admin: true } }))
    expect((await POST(req({ targetId: 'admin-1', isSuperAdmin: false }))).status).toBe(400)
  })

  it('500 when the update errors', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: { is_super_admin: true } }))
      .mockReturnValueOnce(makeChain({ error: { message: 'db fail' } }))
    expect((await POST(req({ targetId: 't', isSuperAdmin: true }))).status).toBe(500)
  })

  it('promotes a target and audits it', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: { is_super_admin: true } }))
      .mockReturnValueOnce(makeChain({ error: null }))
    const res = await POST(req({ targetId: 'target-2', isSuperAdmin: true }))
    expect(res.status).toBe(200)
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'admin_promoted' }))
  })

  it('demotes a target and audits it', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: { is_super_admin: true } }))
      .mockReturnValueOnce(makeChain({ error: null }))
    const res = await POST(req({ targetId: 'target-2', isSuperAdmin: false }))
    expect(res.status).toBe(200)
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'admin_demoted' }))
  })
})
