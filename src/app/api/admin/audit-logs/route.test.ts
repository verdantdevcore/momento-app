import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, getRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const serverAuth = vi.hoisted(() => ({ getUser: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: serverAuth }) }))

import { GET } from './route'

beforeEach(() => {
  vi.clearAllMocks()
  serverAuth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
})

describe('GET /api/admin/audit-logs', () => {
  it('401 when unauthenticated', async () => {
    serverAuth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await GET(getRequest())).status).toBe(401)
  })

  it('403 when the caller is not a super admin', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { is_super_admin: false } }))
    expect((await GET(getRequest())).status).toBe(403)
  })

  it('500 when the logs query errors', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: { is_super_admin: true } }))
      .mockReturnValueOnce(makeChain({ data: null, error: { message: 'boom' } }))
    expect((await GET(getRequest())).status).toBe(500)
  })

  it('returns logs enriched with the acting user email', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: { is_super_admin: true } }))
      .mockReturnValueOnce(makeChain({
        data: [{ id: 'l1', event_type: 'x', user_id: 'u1', ip_address: null, metadata: null, created_at: 't' }],
        error: null,
      }))
      .mockReturnValueOnce(makeChain({ data: [{ id: 'u1', email: 'u1@example.com' }] }))
    const res = await GET(getRequest('https://sharemomento.app/api/admin/audit-logs?limit=50'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.logs[0]).toMatchObject({ id: 'l1', user_email: 'u1@example.com' })
  })
})
