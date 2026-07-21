import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeChain, jsonRequest } from '@/test/helpers'

const adminClient = vi.hoisted(() => ({ from: vi.fn() }))
const curateRecap = vi.hoisted(() => vi.fn())

vi.mock('@supabase/supabase-js', () => ({ createClient: () => adminClient }))
vi.mock('@/lib/recap', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/recap')>()
  return { ...actual, curateRecap }
})

import { POST } from './route'

function setTables(map: Record<string, { data?: unknown; error?: unknown }>) {
  adminClient.from.mockImplementation((t: string) => makeChain(map[t] ?? { data: null, error: null }))
}

function req(body: unknown) {
  return jsonRequest(body)
}

const MEDIA = [
  { id: 'm1', type: 'image', url: 'https://x/m1.jpg', views: 5, hashtags: [], created_at: '2026-07-20T10:00:00Z', batch_id: null },
  { id: 'm2', type: 'image', url: 'https://x/m2.jpg', views: 1, hashtags: [], created_at: '2026-07-20T11:00:00Z', batch_id: null },
  { id: 'm3', type: 'image', url: 'https://x/m3.jpg', views: 0, hashtags: [], created_at: '2026-07-20T12:00:00Z', batch_id: null },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/recap/generate-job', () => {
  it('400 when eventId is missing', async () => {
    const res = await POST(req({}))
    expect(res.status).toBe(400)
  })

  it('200 skipped when the event no longer exists', async () => {
    setTables({ events: { data: null, error: null } })
    const res = await POST(req({ eventId: 'e1' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ skipped: 'event not found' })
  })

  it('200 skipped when the event is not in processing state', async () => {
    setTables({ events: { data: { id: 'e1', recap_status: 'ready' } } })
    const res = await POST(req({ eventId: 'e1' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ skipped: 'not in processing state' })
  })

  it('marks the recap failed when there is not enough media', async () => {
    const updates: unknown[] = []
    adminClient.from.mockImplementation((t: string) => {
      if (t === 'events') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'e1', recap_status: 'processing' } }) }) }),
          update: (payload: unknown) => { updates.push(payload); return { eq: async () => ({ data: null, error: null }) } },
        }
      }
      if (t === 'media') return makeChain({ data: MEDIA.slice(0, 2), error: null })
      return makeChain({ data: [], error: null })
    })

    const res = await POST(req({ eventId: 'e1' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ skipped: 'insufficient media' })
    expect(updates).toContainEqual(expect.objectContaining({ recap_status: 'failed', recap_error: 'Not enough photos yet' }))
    expect(curateRecap).not.toHaveBeenCalled()
  })

  it('curates, persists the snapshot, and marks the recap ready on the happy path', async () => {
    const updates: unknown[] = []
    const inserted: unknown[] = []
    let deletedFor: string | undefined

    curateRecap.mockReturnValue([
      { mediaId: 'm1', position: 0, score: 0.9, durationSecs: 5 },
      { mediaId: 'm2', position: 1, score: 0.5, durationSecs: 5 },
      { mediaId: 'm3', position: 2, score: 0.3, durationSecs: 5 },
    ])

    adminClient.from.mockImplementation((t: string) => {
      if (t === 'events') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'e1', recap_status: 'processing' } }) }) }),
          update: (payload: unknown) => { updates.push(payload); return { eq: async () => ({ data: null, error: null }) } },
        }
      }
      if (t === 'media') {
        return { select: () => ({ eq: () => ({ returns: () => Promise.resolve({ data: MEDIA, error: null }) }) }) }
      }
      if (t === 'media_faces') {
        return { select: () => ({ in: async () => ({ data: [{ media_id: 'm1' }, { media_id: 'm1' }], error: null }) }) }
      }
      if (t === 'event_recap_items') {
        return {
          delete: () => ({ eq: async () => { deletedFor = 'e1'; return { data: null, error: null } } }),
          insert: (rows: unknown) => { inserted.push(rows); return Promise.resolve({ data: null, error: null }) },
        }
      }
      return makeChain({ data: null, error: null })
    })

    const res = await POST(req({ eventId: 'e1' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ eventId: 'e1', items: 3 })
    expect(deletedFor).toBe('e1')
    expect(inserted[0]).toEqual([
      { event_id: 'e1', media_id: 'm1', position: 0, score: 0.9, duration_secs: 5 },
      { event_id: 'e1', media_id: 'm2', position: 1, score: 0.5, duration_secs: 5 },
      { event_id: 'e1', media_id: 'm3', position: 2, score: 0.3, duration_secs: 5 },
    ])
    expect(updates).toContainEqual(expect.objectContaining({
      recap_status: 'ready', recap_render_mode: 'client_slideshow', recap_item_count: 3, recap_video_url: null,
    }))
  })

  it('marks the recap failed on an unexpected error and returns 500', async () => {
    const updates: unknown[] = []
    adminClient.from.mockImplementation((t: string) => {
      if (t === 'events') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'e1', recap_status: 'processing' } }) }) }),
          update: (payload: unknown) => { updates.push(payload); return { eq: async () => ({ data: null, error: null }) } },
        }
      }
      if (t === 'media') {
        return { select: () => ({ eq: () => ({ returns: () => Promise.resolve({ data: null, error: { message: 'db down' } }) }) }) }
      }
      return makeChain({ data: null, error: null })
    })

    const res = await POST(req({ eventId: 'e1' }))
    expect(res.status).toBe(500)
    expect(updates).toContainEqual(expect.objectContaining({ recap_status: 'failed' }))
  })
})
