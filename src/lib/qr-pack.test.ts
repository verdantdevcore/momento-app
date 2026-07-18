import { describe, it, expect } from 'vitest'
import {
  slugify, packFileName, packBundleName, defaultCopy, pxFor,
  getTemplate, TEMPLATES,
} from './qr-pack'

// Only the pure helpers are covered here. The SVG→PNG rasterization and PDF
// building depend on the browser (Image, canvas) and aren't exercised under the
// node test environment.

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify("Sarah & Daniel's Wedding")).toBe('sarah-daniel-s-wedding')
  })
  it('trims leading/trailing separators', () => {
    expect(slugify('  Hello!  ')).toBe('hello')
  })
  it('falls back to "event" when empty', () => {
    expect(slugify('')).toBe('event')
    expect(slugify('!!!')).toBe('event')
  })
})

describe('packFileName', () => {
  it('composes slug, template, variant and extension', () => {
    expect(packFileName('my-wedding', 'welcome', 'cream', 'png')).toBe('my-wedding-welcome-cream.png')
    expect(packFileName('my-wedding', 'table', 'olive', 'pdf')).toBe('my-wedding-table-olive.pdf')
  })
  it('sanitizes an unsafe slug', () => {
    expect(packFileName('A B!', 'poster', 'cream', 'pdf')).toBe('a-b-poster-cream.pdf')
  })
})

describe('packBundleName', () => {
  it('names the full-pack PDF', () => {
    expect(packBundleName('gala', 'olive')).toBe('gala-qr-print-pack-olive.pdf')
  })
})

describe('defaultCopy', () => {
  it('uses the event title as the welcome heading', () => {
    expect(defaultCopy('welcome', 'Our Big Day').heading).toBe('Our Big Day')
  })
  it('falls back when the title is blank', () => {
    expect(defaultCopy('welcome', '').heading).toBe('Our Celebration')
  })
  it('uses fixed headings for poster and table', () => {
    expect(defaultCopy('poster', 'ignored').heading).toBe('Share Your Memories')
    expect(defaultCopy('table', 'ignored').heading).toBe('Share the moment')
  })
  it('always returns a non-empty message', () => {
    for (const id of ['welcome', 'table', 'poster'] as const) {
      expect(defaultCopy(id, 'X').message.length).toBeGreaterThan(0)
    }
  })
})

describe('pxFor', () => {
  it('converts mm to pixels at 300 dpi', () => {
    expect(pxFor(210)).toBe(2480) // A4 width
    expect(pxFor(297)).toBe(3508) // A4 height
  })
})

describe('template registry', () => {
  it('exposes the three templates', () => {
    expect(TEMPLATES.map(t => t.id)).toEqual(['welcome', 'table', 'poster'])
  })
  it('tiles table cards 4-up and prints others 1-up', () => {
    expect(getTemplate('table').pdf).toMatchObject({ format: 'a4', cols: 2, rows: 2 })
    expect(getTemplate('welcome').pdf).toMatchObject({ cols: 1, rows: 1 })
    expect(getTemplate('poster').pdf).toMatchObject({ format: 'a3', cols: 1, rows: 1 })
  })
  it('throws on an unknown id', () => {
    // @ts-expect-error deliberately invalid
    expect(() => getTemplate('nope')).toThrow()
  })
})
