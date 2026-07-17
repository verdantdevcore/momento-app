import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextResponse } from 'next/server'
import { makeChain, jsonRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const requireSuperAdmin = vi.hoisted(() => vi.fn())
const purgeHostAccount = vi.hoisted(() => vi.fn())

vi.mock('@/lib/admin-auth', () => ({ adminClient, requireSuperAdmin }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
vi.mock('@/lib/events', () => ({ purgeHostAccount }))

import { POST } from './route'
import { logAudit } from '@/lib/audit'

function req(body: unknown) {
  return jsonRequest(body, { headers: { 'x-forwarded-for': '203.0.113.5' } })
}

const softDeleted = { id: 'target-2', is_super_admin: false, deleted_at: '2026-01-01' }

beforeEach(() => {
  vi.clearAllMocks()
  requireSuperAdmin.mockResolvedValue({ ok: true, userId: 'admin-1' })
  purgeHostAccount.mockResolvedValue({ deleted: 4, failed: 0, folderRemoved: true })
})

describe('POST /api/admin/purge-user', () => {
  it('passes the guard response through when not a super admin', async () => {
    requireSuperAdmin.mockResolvedValue({ ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) })
    expect((await POST(req({ targetId: 'target-2' }))).status).toBe(403)
  })

  it('400 when targetId is missing', async () => {
    expect((await POST(req({}))).status).toBe(400)
  })

  it('400 when purging your own account', async () => {
    expect((await POST(req({ targetId: 'admin-1' }))).status).toBe(400)
  })

  it('404 when the target is not found', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: null }))
    expect((await POST(req({ targetId: 'target-2' }))).status).toBe(404)
  })

  it('400 when the target is another admin', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { ...softDeleted, is_super_admin: true } }))
    expect((await POST(req({ targetId: 'target-2' }))).status).toBe(400)
  })

  it('400 when the account has not been soft-deleted first', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { ...softDeleted, deleted_at: null } }))
    expect((await POST(req({ targetId: 'target-2' }))).status).toBe(400)
    expect(purgeHostAccount).not.toHaveBeenCalled()
  })

  it('purges the account and audits the request and completion', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: softDeleted }))
    const res = await POST(req({ targetId: 'target-2' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ success: true, assetsDeleted: 4, assetsFailed: 0 })
    expect(purgeHostAccount).toHaveBeenCalledWith('target-2')
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'account_purge_requested' }))
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'account_purged' }))
  })

  it('500 and audits a failure when the purge throws', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: softDeleted }))
    purgeHostAccount.mockRejectedValue(new Error('cloudinary down'))
    const res = await POST(req({ targetId: 'target-2' }))
    expect(res.status).toBe(500)
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'account_purge_failed' }))
  })
})
