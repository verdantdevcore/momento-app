import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, getRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))

import { GET } from './route'

function setTables(map: Record<string, { data?: unknown; error?: unknown }>) {
  adminClient.from.mockImplementation((t: string) => makeChain(map[t] ?? { data: null, error: null }))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/recap/status', () => {
  it('400 when both eventId and slug are missing', async () => {
    const res = await GET(getRequest('https://sharemomento.app/api/recap/status'))
    expect(res.status).toBe(400)
  })

  it('404 when the event is not found', async () => {
    setTables({ events: { data: null, error: null } })
    const res = await GET(getRequest('https://sharemomento.app/api/recap/status?slug=unknown'))
    expect(res.status).toBe(404)
  })

  it('requires no auth — returns 200 for a public idle event', async () => {
    setTables({ events: { data: {
      id: 'e1', recap_status: 'idle', recap_generated_at: null, recap_render_mode: null,
      recap_video_url: null, recap_item_count: null, recap_error: null,
    } } })
    const res = await GET(getRequest('https://sharemomento.app/api/recap/status?slug=my-event'))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ status: 'idle', items: [] })
  })

  it('surfaces recap_error for a failed recap', async () => {
    setTables({ events: { data: {
      id: 'e1', recap_status: 'failed', recap_generated_at: null, recap_render_mode: null,
      recap_video_url: null, recap_item_count: null, recap_error: 'Not enough photos yet',
    } } })
    const res = await GET(getRequest('https://sharemomento.app/api/recap/status?eventId=e1'))
    const body = await res.json()
    expect(body.status).toBe('failed')
    expect(body.error).toBe('Not enough photos yet')
  })

  it('returns joined items in position order for a ready recap', async () => {
    setTables({
      events: { data: {
        id: 'e1', recap_status: 'ready', recap_generated_at: '2026-07-20T10:00:00Z',
        recap_render_mode: 'client_slideshow', recap_video_url: null, recap_item_count: 2, recap_error: null,
      } },
      event_recap_items: { data: [
        { position: 0, duration_secs: 5, media: { id: 'm1', url: 'https://x/m1.jpg', type: 'image' } },
        { position: 1, duration_secs: 5, media: { id: 'm2', url: 'https://x/m2.jpg', type: 'image' } },
      ] },
    })
    const res = await GET(getRequest('https://sharemomento.app/api/recap/status?eventId=e1'))
    const body = await res.json()
    expect(body.status).toBe('ready')
    expect(body.items).toEqual([
      { mediaId: 'm1', url: 'https://x/m1.jpg', type: 'image', durationSecs: 5 },
      { mediaId: 'm2', url: 'https://x/m2.jpg', type: 'image', durationSecs: 5 },
    ])
  })

  it('skips a recap item whose media row was deleted', async () => {
    setTables({
      events: { data: {
        id: 'e1', recap_status: 'ready', recap_generated_at: '2026-07-20T10:00:00Z',
        recap_render_mode: 'client_slideshow', recap_video_url: null, recap_item_count: 1, recap_error: null,
      } },
      event_recap_items: { data: [
        { position: 0, duration_secs: 5, media: null },
      ] },
    })
    const res = await GET(getRequest('https://sharemomento.app/api/recap/status?eventId=e1'))
    const body = await res.json()
    expect(body.items).toEqual([])
  })
})
