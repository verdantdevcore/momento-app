import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, jsonRequest } from '@/test/helpers'

// verifySignatureAppRouter is stubbed to a pass-through in src/test/setup.ts,
// so POST is the underlying handler and we can call it directly.
const adminClient = vi.hoisted(() => ({
  from: vi.fn(),
  auth: { admin: { getUserById: vi.fn() } },
}))

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/email', () => ({
  sendHostReminderEmail: vi.fn(),
  sendAdminFollowupNotice: vi.fn(),
}))

import { POST } from './route'
import { sendHostReminderEmail, sendAdminFollowupNotice } from '@/lib/email'

function req(body: unknown) {
  return jsonRequest(body)
}

const hostRow = {
  full_name: 'Ada',
  reminder_24h_sent_at: null,
  reminder_72h_sent_at: null,
  reminder_7d_sent_at: null,
  admin_followup_72h_sent_at: null,
  admin_followup_7d_sent_at: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  adminClient.auth.admin.getUserById.mockResolvedValue({
    data: { user: { email: 'ada@example.com', created_at: 't' } },
  })
})

describe('POST /api/cron/onboarding-check', () => {
  it('400 when hostId or checkpoint is missing/invalid', async () => {
    expect((await POST(req({ checkpoint: '24h' }))).status).toBe(400)
    expect((await POST(req({ hostId: 'h1', checkpoint: 'nope' }))).status).toBe(400)
  })

  it('no-ops when the host has already created an event', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: { id: 'e1' } }))
    const res = await POST(req({ hostId: 'h1', checkpoint: '24h' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ skipped: expect.any(String) })
    expect(sendHostReminderEmail).not.toHaveBeenCalled()
  })

  it('404 when the host row or email is missing', async () => {
    adminClient.from.mockReturnValueOnce(makeChain({ data: null })) // no existing event
    adminClient.from.mockReturnValueOnce(makeChain({ data: null })) // no host row
    adminClient.auth.admin.getUserById.mockResolvedValue({ data: { user: null } })
    expect((await POST(req({ hostId: 'h1', checkpoint: '24h' }))).status).toBe(404)
  })

  it('sends the 24h reminder and marks the column', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: null })) // no existing event
      .mockReturnValueOnce(makeChain({ data: hostRow })) // host row
      .mockReturnValueOnce(makeChain({ error: null })) // update reminder column
    const res = await POST(req({ hostId: 'h1', checkpoint: '24h' }))
    expect(res.status).toBe(200)
    expect(sendHostReminderEmail).toHaveBeenCalledWith(
      { email: 'ada@example.com', fullName: 'Ada' },
      '24h',
    )
    expect(sendAdminFollowupNotice).not.toHaveBeenCalled()
  })

  it('also notifies admins at the 72h checkpoint', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: null }))
      .mockReturnValueOnce(makeChain({ data: hostRow }))
      .mockReturnValueOnce(makeChain({ error: null })) // reminder column
      .mockReturnValueOnce(makeChain({ error: null })) // followup column
    const res = await POST(req({ hostId: 'h1', checkpoint: '72h' }))
    expect(res.status).toBe(200)
    expect(sendHostReminderEmail).toHaveBeenCalled()
    expect(sendAdminFollowupNotice).toHaveBeenCalled()
  })

  it('does not resend a reminder already marked sent', async () => {
    adminClient.from
      .mockReturnValueOnce(makeChain({ data: null }))
      .mockReturnValueOnce(makeChain({ data: { ...hostRow, reminder_24h_sent_at: 't' } }))
    const res = await POST(req({ hostId: 'h1', checkpoint: '24h' }))
    expect(res.status).toBe(200)
    expect(sendHostReminderEmail).not.toHaveBeenCalled()
  })
})
