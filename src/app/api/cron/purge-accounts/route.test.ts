import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, getRequest } from '@/test/helpers'

// verifySignatureAppRouter is a pass-through in src/test/setup.ts, so POST is
// the underlying handler. It ignores its argument, but the QStash wrapper's
// type still requires a Request, so we hand it a throwaway one.
const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const purgeHostAccount = vi.hoisted(() => vi.fn())

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
vi.mock('@/lib/events', () => ({ purgeHostAccount }))

import { POST } from './route'
import { logAudit } from '@/lib/audit'

beforeEach(() => {
  vi.clearAllMocks()
  purgeHostAccount.mockResolvedValue({ deleted: 2, failed: 0, folderRemoved: true })
})

describe('POST /api/cron/purge-accounts', () => {
  it('500 when the due-accounts query errors', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: null, error: { message: 'boom' } }))
    expect((await POST(getRequest())).status).toBe(500)
  })

  it('purges nothing when no account is due', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: [], error: null }))
    const res = await POST(getRequest())
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ purged: 0 })
    expect(purgeHostAccount).not.toHaveBeenCalled()
  })

  it('purges each due account and audits it', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({
      data: [{ id: 'h1', purge_after: 't' }, { id: 'h2', purge_after: 't' }],
      error: null,
    }))
    const res = await POST(getRequest())
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ purged: 2, failed: 0 })
    expect(purgeHostAccount).toHaveBeenCalledTimes(2)
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'account_purged' }))
  })

  it('keeps going when one account fails, and reports the failure count', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({
      data: [{ id: 'h1', purge_after: 't' }, { id: 'h2', purge_after: 't' }],
      error: null,
    }))
    purgeHostAccount
      .mockRejectedValueOnce(new Error('cloudinary down'))
      .mockResolvedValueOnce({ deleted: 1, failed: 0, folderRemoved: true })
    const res = await POST(getRequest())
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ purged: 1, failed: 1 })
    expect(logAudit).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'account_purge_failed' }))
  })
})
