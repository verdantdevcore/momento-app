import { describe, it, expect } from 'vitest'
import { curateRecap, type CandidateMedia } from './recap'

function media(overrides: Partial<CandidateMedia> & { id: string; created_at: string }): CandidateMedia {
  return {
    type: 'image',
    url: `https://res.cloudinary.com/demo/image/upload/${overrides.id}.jpg`,
    views: 0,
    hashtags: [],
    batch_id: null,
    faceCount: 0,
    ...overrides,
  }
}

describe('curateRecap', () => {
  it('returns nothing below the minimum candidate threshold', () => {
    const candidates = [
      media({ id: 'a', created_at: '2026-01-01T10:00:00Z' }),
      media({ id: 'b', created_at: '2026-01-01T11:00:00Z' }),
    ]
    expect(curateRecap(candidates)).toEqual([])
  })

  it('returns nothing for empty input', () => {
    expect(curateRecap([])).toEqual([])
  })

  it('collapses a batch to its single highest-scoring representative', () => {
    const candidates = [
      media({ id: 'low', created_at: '2026-01-01T10:00:00Z', batch_id: 'batch-1', views: 1 }),
      media({ id: 'high', created_at: '2026-01-01T10:00:01Z', batch_id: 'batch-1', views: 500 }),
      media({ id: 'other-1', created_at: '2026-01-01T12:00:00Z' }),
      media({ id: 'other-2', created_at: '2026-01-01T14:00:00Z' }),
    ]
    const result = curateRecap(candidates)
    const ids = result.map(r => r.mediaId)
    expect(ids).toContain('high')
    expect(ids).not.toContain('low')
  })

  it('scores higher views, face count, and hashtag diversity above a bare upload', () => {
    const candidates = [
      media({ id: 'plain', created_at: '2026-01-01T10:00:00Z' }),
      media({
        id: 'rich', created_at: '2026-01-01T10:00:01Z',
        views: 50, faceCount: 6, hashtags: ['first-dance', 'cake', 'family'],
      }),
      media({ id: 'filler-1', created_at: '2026-01-01T12:00:00Z' }),
      media({ id: 'filler-2', created_at: '2026-01-01T14:00:00Z' }),
    ]
    const result = curateRecap(candidates)
    const rich = result.find(r => r.mediaId === 'rich')!
    const plain = result.find(r => r.mediaId === 'plain')!
    expect(rich.score).toBeGreaterThan(plain.score)
  })

  it('spreads selection across time instead of only taking the top-scored cluster', () => {
    // 20 high-view photos all clustered in one hour, plus one lone photo from
    // a different part of the event with no engagement at all.
    const clustered: CandidateMedia[] = Array.from({ length: 20 }, (_, i) =>
      media({
        id: `cluster-${i}`,
        created_at: new Date(Date.UTC(2026, 0, 1, 10, i)).toISOString(),
        views: 1000,
      })
    )
    const lonely = media({ id: 'lonely', created_at: '2026-01-01T22:00:00Z', views: 0 })

    const result = curateRecap([...clustered, lonely], { maxItems: 8 })
    expect(result.some(r => r.mediaId === 'lonely')).toBe(true)
  })

  it('caps output at maxItems', () => {
    const candidates: CandidateMedia[] = Array.from({ length: 40 }, (_, i) =>
      media({ id: `m-${i}`, created_at: new Date(Date.UTC(2026, 0, 1, 0, i * 10)).toISOString() })
    )
    const result = curateRecap(candidates, { maxItems: 10 })
    expect(result.length).toBeLessThanOrEqual(10)
  })

  it('orders the final result chronologically, not by score', () => {
    const candidates = [
      media({ id: 'late', created_at: '2026-01-01T20:00:00Z', views: 999 }),
      media({ id: 'early', created_at: '2026-01-01T08:00:00Z', views: 0 }),
      media({ id: 'mid', created_at: '2026-01-01T14:00:00Z', views: 5 }),
    ]
    const result = curateRecap(candidates)
    expect(result.map(r => r.mediaId)).toEqual(['early', 'mid', 'late'])
  })

  it('assigns sequential positions matching array order', () => {
    const candidates = [
      media({ id: 'a', created_at: '2026-01-01T08:00:00Z' }),
      media({ id: 'b', created_at: '2026-01-01T14:00:00Z' }),
      media({ id: 'c', created_at: '2026-01-01T20:00:00Z' }),
    ]
    const result = curateRecap(candidates)
    expect(result.map(r => r.position)).toEqual([0, 1, 2])
  })

  it('paces item duration toward the target total, clamped to min/max', () => {
    // 18 items at 90s / 18 = 5s each — within [minItemSecs, maxItemSecs], so
    // the clamp is a no-op and the total should land on the target exactly.
    const candidates: CandidateMedia[] = Array.from({ length: 18 }, (_, i) =>
      media({ id: `m-${i}`, created_at: new Date(Date.UTC(2026, 0, 1, 0, i * 10)).toISOString() })
    )
    const result = curateRecap(candidates, {
      targetTotalSecs: 90, minItemSecs: 3, maxItemSecs: 6, maxItems: 18,
    })
    for (const item of result) {
      expect(item.durationSecs).toBeGreaterThanOrEqual(3)
      expect(item.durationSecs).toBeLessThanOrEqual(6)
    }
    const total = result.reduce((sum, item) => sum + item.durationSecs, 0)
    expect(total).toBeCloseTo(90, 0)
  })

  it('clamps to minItemSecs when there are far more items than the target allows', () => {
    const candidates: CandidateMedia[] = Array.from({ length: 30 }, (_, i) =>
      media({ id: `m-${i}`, created_at: new Date(Date.UTC(2026, 0, 1, 0, i * 5)).toISOString() })
    )
    const result = curateRecap(candidates, {
      targetTotalSecs: 90, minItemSecs: 3, maxItemSecs: 6, maxItems: 30,
    })
    for (const item of result) {
      expect(item.durationSecs).toBe(3)
    }
  })

  it('is deterministic for the same input', () => {
    const candidates: CandidateMedia[] = Array.from({ length: 12 }, (_, i) =>
      media({
        id: `m-${i}`,
        created_at: new Date(Date.UTC(2026, 0, 1, 0, i * 15)).toISOString(),
        views: i * 3,
        faceCount: i % 4,
      })
    )
    expect(curateRecap(candidates)).toEqual(curateRecap(candidates))
  })
})
