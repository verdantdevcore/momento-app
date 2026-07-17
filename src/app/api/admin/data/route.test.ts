import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({
  from: vi.fn(),
  auth: { admin: { listUsers: vi.fn() } },
}))
const serverAuth = vi.hoisted(() => ({ getUser: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: serverAuth }) }))

import { GET } from './route'

beforeEach(() => {
  vi.clearAllMocks()
  serverAuth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
  adminClient.auth.admin.listUsers.mockResolvedValue({ data: { users: [] } })
})

describe('GET /api/admin/data', () => {
  it('401 when unauthenticated', async () => {
    serverAuth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await GET()).status).toBe(401)
  })

  it('403 when the caller is not a super admin', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { is_super_admin: false } }))
    expect((await GET()).status).toBe(403)
  })

  it('aggregates hosts, events and media, excluding deleted hosts from the count', async () => {
    // Call order: caller check, then Promise.all(metrics, hosts, events, media).
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: { is_super_admin: true } }))
      .mockReturnValueOnce(makeChain({ data: null })) // platform_metrics (recomputed)
      .mockReturnValueOnce(makeChain({
        data: [
          { id: 'h1', full_name: 'Live Host', is_super_admin: false, created_at: 't', restricted_at: null, restricted_reason: null, deleted_at: null, deletion_reason: null, purge_after: null },
          { id: 'h2', full_name: 'Gone Host', is_super_admin: false, created_at: 't', restricted_at: null, restricted_reason: null, deleted_at: '2026-01-01', deletion_reason: 'x', purge_after: 't' },
        ],
      }))
      .mockReturnValueOnce(makeChain({
        data: [{ id: 'e1', title: 'E', slug: 'e', category: 'Wedding', event_date: 'd', location: 'l', created_at: 't', host_id: 'h1' }],
      }))
      .mockReturnValueOnce(makeChain({ data: [{ type: 'image', views: 5, event_id: 'e1' }] }))

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.metrics.total_hosts).toBe(1) // deleted host excluded
    expect(body.hosts).toHaveLength(2)
    const liveHost = body.hosts.find((h: { id: string }) => h.id === 'h1')
    expect(liveHost).toMatchObject({ event_count: 1, upload_count: 1, total_views: 5 })
  })

  it('500 when a query throws', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { is_super_admin: true } }))
    adminClient.auth.admin.listUsers.mockRejectedValue(new Error('auth down'))
    expect((await GET()).status).toBe(500)
  })
})
