import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextResponse } from 'next/server'
import { makeChain, jsonRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn(), auth: { admin: { signOut: vi.fn() } } }))
const requireSuperAdmin = vi.hoisted(() => vi.fn())
const getHostContact = vi.hoisted(() => vi.fn())

vi.mock('@/lib/admin-auth', () => ({ adminClient, requireSuperAdmin, getHostContact }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
vi.mock('@/lib/email', () => ({
  sendAccountRestrictedEmail: vi.fn(),
  sendAccountUnrestrictedEmail: vi.fn(),
}))

import { POST } from './route'
import { logAudit } from '@/lib/audit'
import { sendAccountRestrictedEmail, sendAccountUnrestrictedEmail } from '@/lib/email'

function req(body: unknown) {
  return jsonRequest(body, { headers: { 'x-forwarded-for': '203.0.113.5' } })
}

const activeTarget = { id: 'target-2', is_super_admin: false, deleted_at: null }

beforeEach(() => {
  vi.clearAllMocks()
  requireSuperAdmin.mockResolvedValue({ ok: true, userId: 'admin-1' })
  getHostContact.mockResolvedValue({ email: 't@example.com', fullName: 'Target' })
  adminClient.auth.admin.signOut.mockResolvedValue({ error: null })
})

describe('POST /api/admin/restrict-user', () => {
  it('passes the guard response through when not a super admin', async () => {
    requireSuperAdmin.mockResolvedValue({ ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) })
    expect((await POST(req({ targetId: 'target-2', restrict: true }))).status).toBe(403)
  })

  it('400 when targetId or restrict is malformed', async () => {
    expect((await POST(req({ targetId: 'target-2' }))).status).toBe(400)
    expect((await POST(req({ restrict: true }))).status).toBe(400)
  })

  it('400 when restricting your own account', async () => {
    expect((await POST(req({ targetId: 'admin-1', restrict: true }))).status).toBe(400)
  })

  it('400 when the reason is too long', async () => {
    expect((await POST(req({ targetId: 'target-2', restrict: true, reason: 'x'.repeat(501) }))).status).toBe(400)
  })

  it('404 when the target is not found', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: null }))
    expect((await POST(req({ targetId: 'target-2', restrict: true }))).status).toBe(404)
  })

  it('400 when the target is another admin', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { ...activeTarget, is_super_admin: true } }))
    expect((await POST(req({ targetId: 'target-2', restrict: true }))).status).toBe(400)
  })

  it('400 when the target is already deleted', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { ...activeTarget, deleted_at: '2026-01-01' } }))
    expect((await POST(req({ targetId: 'target-2', restrict: true }))).status).toBe(400)
  })

  it('restricts the host, revokes sessions, emails and audits', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: activeTarget }))
      .mockReturnValueOnce(makeChain({ error: null }))
    const res = await POST(req({ targetId: 'target-2', restrict: true, reason: 'abuse' }))
    expect(res.status).toBe(200)
    expect(adminClient.auth.admin.signOut).toHaveBeenCalledWith('target-2', 'global')
    expect(sendAccountRestrictedEmail).toHaveBeenCalled()
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'account_restricted' }))
  })

  it('unrestricts the host without revoking sessions', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: activeTarget }))
      .mockReturnValueOnce(makeChain({ error: null }))
    const res = await POST(req({ targetId: 'target-2', restrict: false }))
    expect(res.status).toBe(200)
    expect(adminClient.auth.admin.signOut).not.toHaveBeenCalled()
    expect(sendAccountUnrestrictedEmail).toHaveBeenCalled()
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'account_unrestricted' }))
  })

  it('500 when the update errors', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: activeTarget }))
      .mockReturnValueOnce(makeChain({ error: { message: 'db fail' } }))
    expect((await POST(req({ targetId: 'target-2', restrict: true }))).status).toBe(500)
  })
})
