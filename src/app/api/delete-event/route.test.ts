import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, jsonRequest } from '@/test/helpers'

// A stable mock service-role client whose `.from()` is reconfigured per test.
const adminClient = vi.hoisted(() => ({
  from: vi.fn(),
  auth: { admin: { signOut: vi.fn(), deleteUser: vi.fn(), getUserById: vi.fn(), listUsers: vi.fn() } },
}))
const serverAuth = vi.hoisted(() => ({ getUser: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: serverAuth }) }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
vi.mock('@/lib/events', () => ({ purgeEvent: vi.fn() }))

import { DELETE } from './route'
import { logAudit } from '@/lib/audit'
import { purgeEvent } from '@/lib/events'

const VALID_UUID = '11111111-1111-1111-1111-111111111111'

/** Route each `.from(table)` to a canned `{ data, error }`. */
function setTables(map: Record<string, { data?: unknown; error?: unknown }>) {
  adminClient.from.mockImplementation((t: string) => makeChain(map[t] ?? { data: null, error: null }))
}

function req(body: unknown) {
  return jsonRequest(body, { method: 'DELETE', headers: { 'x-forwarded-for': '203.0.113.5' } })
}

beforeEach(() => {
  vi.clearAllMocks()
  serverAuth.getUser.mockResolvedValue({ data: { user: { id: 'owner-1' } } })
  vi.mocked(purgeEvent).mockResolvedValue({ deleted: 3, failed: 0, folderRemoved: true })
})

describe('DELETE /api/delete-event', () => {
  it('401 when unauthenticated', async () => {
    serverAuth.getUser.mockResolvedValue({ data: { user: null } })
    const res = await DELETE(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(401)
    expect(purgeEvent).not.toHaveBeenCalled()
  })

  it('400 when eventId is missing or malformed', async () => {
    expect((await DELETE(req({}))).status).toBe(400)
    expect((await DELETE(req({ eventId: 'not-a-uuid' }))).status).toBe(400)
  })

  it('404 when the event does not exist', async () => {
    setTables({ events: { data: null, error: { message: 'no rows' } } })
    const res = await DELETE(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(404)
  })

  it('403 and audits when caller is neither owner nor admin', async () => {
    setTables({
      events: { data: { id: VALID_UUID, slug: 's', title: 'T', host_id: 'someone-else' } },
      hosts: { data: { is_super_admin: false, restricted_at: null, deleted_at: null } },
    })
    const res = await DELETE(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(403)
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'event_delete_unauthorised' }),
    )
    expect(purgeEvent).not.toHaveBeenCalled()
  })

  it('403 for a restricted non-admin owner', async () => {
    setTables({
      events: { data: { id: VALID_UUID, slug: 's', title: 'T', host_id: 'owner-1' } },
      hosts: { data: { is_super_admin: false, restricted_at: '2026-01-01', deleted_at: null } },
    })
    const res = await DELETE(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(403)
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'event_delete_blocked_inactive_host' }),
    )
    expect(purgeEvent).not.toHaveBeenCalled()
  })

  it('purges and audits when the caller owns the event', async () => {
    setTables({
      events: { data: { id: VALID_UUID, slug: 's', title: 'My Event', host_id: 'owner-1' } },
      hosts: { data: { is_super_admin: false, restricted_at: null, deleted_at: null } },
    })
    const res = await DELETE(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ success: true, deleted: 3, failed: 0 })
    expect(purgeEvent).toHaveBeenCalledOnce()
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'event_deleted' }))
  })

  it('allows a super admin to delete an event they do not own', async () => {
    setTables({
      events: { data: { id: VALID_UUID, slug: 's', title: 'T', host_id: 'someone-else' } },
      hosts: { data: { is_super_admin: true, restricted_at: null, deleted_at: null } },
    })
    const res = await DELETE(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(200)
    expect(purgeEvent).toHaveBeenCalledOnce()
  })

  it('500 when teardown throws', async () => {
    setTables({
      events: { data: { id: VALID_UUID, slug: 's', title: 'T', host_id: 'owner-1' } },
      hosts: { data: { is_super_admin: false, restricted_at: null, deleted_at: null } },
    })
    vi.mocked(purgeEvent).mockRejectedValue(new Error('cloudinary down'))
    const res = await DELETE(req({ eventId: VALID_UUID }))
    expect(res.status).toBe(500)
  })
})
