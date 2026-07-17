import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('GET /api/batch-id', () => {
  it('returns a v4-shaped UUID as batchId', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.batchId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })

  it('returns a different id on each call', async () => {
    const a = await (await GET()).json()
    const b = await (await GET()).json()
    expect(a.batchId).not.toBe(b.batchId)
  })
})
