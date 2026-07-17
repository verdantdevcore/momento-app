import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextResponse } from 'next/server'
import { makeChain, jsonRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn(), auth: { admin: { signOut: vi.fn() } } }))
const requireSuperAdmin = vi.hoisted(() => vi.fn())
const getHostContact = vi.hoisted(() => vi.fn())

vi.mock('@/lib/admin-auth', () => ({ adminClient, requireSuperAdmin, getHostContact }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
vi.mock('@/lib/email', () => ({ sendAccountDeletedEmail: vi.fn() }))

import { POST, DELETE } from './route'
import { logAudit } from '@/lib/audit'
import { sendAccountDeletedEmail } from '@/lib/email'

function req(body: unknown, method = 'POST') {
  return jsonRequest(body, { method, headers: { 'x-forwarded-for': '203.0.113.5' } })
}

const activeTarget = { id: 'target-2', is_super_admin: false, deleted_at: null }

beforeEach(() => {
  vi.clearAllMocks()
  requireSuperAdmin.mockResolvedValue({ ok: true, userId: 'admin-1' })
  getHostContact.mockResolvedValue({ email: 't@example.com', fullName: 'Target' })
  adminClient.auth.admin.signOut.mockResolvedValue({ error: null })
})

describe('POST /api/admin/delete-user (soft delete)', () => {
  it('passes the guard response through when not a super admin', async () => {
    requireSuperAdmin.mockResolvedValue({ ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) })
    expect((await POST(req({ targetId: 'target-2' }))).status).toBe(403)
  })

  it('400 when targetId is missing', async () => {
    expect((await POST(req({}))).status).toBe(400)
  })

  it('400 when deleting your own account', async () => {
    expect((await POST(req({ targetId: 'admin-1' }))).status).toBe(400)
  })

  it('400 when the reason is too long', async () => {
    expect((await POST(req({ targetId: 'target-2', reason: 'x'.repeat(501) }))).status).toBe(400)
  })

  it('404 when the target is not found', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: null }))
    expect((await POST(req({ targetId: 'target-2' }))).status).toBe(404)
  })

  it('400 when the target is another admin', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { ...activeTarget, is_super_admin: true } }))
    expect((await POST(req({ targetId: 'target-2' }))).status).toBe(400)
  })

  it('400 when the target is already deleted', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { ...activeTarget, deleted_at: '2026-01-01' } }))
    expect((await POST(req({ targetId: 'target-2' }))).status).toBe(400)
  })

  it('soft-deletes, revokes sessions, emails and audits on success', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: activeTarget }))
      .mockReturnValueOnce(makeChain({ error: null }))
    const res = await POST(req({ targetId: 'target-2', reason: 'spam' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ success: true, emailSent: true })
    expect(adminClient.auth.admin.signOut).toHaveBeenCalledWith('target-2', 'global')
    expect(sendAccountDeletedEmail).toHaveBeenCalled()
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'account_deleted' }))
  })

  it('still succeeds (emailSent false) when the notification throws', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: activeTarget }))
      .mockReturnValueOnce(makeChain({ error: null }))
    vi.mocked(sendAccountDeletedEmail).mockRejectedValue(new Error('mail down'))
    const res = await POST(req({ targetId: 'target-2' }))
    expect(res.status).toBe(200)
    expect((await res.json()).emailSent).toBe(false)
  })

  it('500 when the update errors', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: activeTarget }))
      .mockReturnValueOnce(makeChain({ error: { message: 'db fail' } }))
    expect((await POST(req({ targetId: 'target-2' }))).status).toBe(500)
  })
})

describe('DELETE /api/admin/delete-user (restore)', () => {
  it('passes the guard response through when not a super admin', async () => {
    requireSuperAdmin.mockResolvedValue({ ok: false, response: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }) })
    expect((await DELETE(req({ targetId: 'target-2' }, 'DELETE'))).status).toBe(401)
  })

  it('400 when targetId is missing', async () => {
    expect((await DELETE(req({}, 'DELETE'))).status).toBe(400)
  })

  it('404 when the target is not found', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: null }))
    expect((await DELETE(req({ targetId: 'target-2' }, 'DELETE'))).status).toBe(404)
  })

  it('400 when the account is not deleted', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { deleted_at: null } }))
    expect((await DELETE(req({ targetId: 'target-2' }, 'DELETE'))).status).toBe(400)
  })

  it('restores a soft-deleted account and audits it', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: { deleted_at: '2026-01-01' } }))
      .mockReturnValueOnce(makeChain({ error: null }))
    const res = await DELETE(req({ targetId: 'target-2' }, 'DELETE'))
    expect(res.status).toBe(200)
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'account_restored' }))
  })
})
