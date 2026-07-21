import { describe, it, expect } from 'vitest'
import {
  slugify, packFileName, packBundleName, defaultCopy, pxFor,
  getTemplate, TEMPLATES,
  normalizeHex, mix, contrastRatio, buildPalette, variantName,
  PRESETS, MIN_READABLE_CONTRAST,
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

describe('normalizeHex', () => {
  it('expands shorthand and uppercases', () => {
    expect(normalizeHex('#abc')).toBe('#AABBCC')
    expect(normalizeHex('f7e7ce')).toBe('#F7E7CE')
  })
  it('rejects anything that is not a hex colour', () => {
    expect(normalizeHex('')).toBeNull()
    expect(normalizeHex('#55')).toBeNull()
    expect(normalizeHex('rebeccapurple')).toBeNull()
    expect(normalizeHex('#1234567')).toBeNull()
  })
})

describe('mix', () => {
  it('returns the endpoints at t=0 and t=1', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000')
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF')
  })
  it('blends halfway', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080')
  })
})

describe('contrastRatio', () => {
  it('is 21:1 for black on white and 1:1 for a colour on itself', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
    expect(contrastRatio('#556B2F', '#556B2F')).toBeCloseTo(1, 5)
  })
  it('is order-independent', () => {
    expect(contrastRatio('#F7E7CE', '#556B2F')).toBeCloseTo(contrastRatio('#556B2F', '#F7E7CE'), 10)
  })
})

describe('buildPalette', () => {
  it('keeps the host\'s two choices verbatim', () => {
    const p = buildPalette('#F7E7CE', '#556B2F')
    expect(p.bg).toBe('#F7E7CE')
    expect(p.ink).toBe('#556B2F')
  })

  it('derives the in-between tones between ink and background', () => {
    const p = buildPalette('#F7E7CE', '#556B2F')
    // Each successive tone sits further from the ink, toward the background.
    const d = (c: string) => contrastRatio(c, '#556B2F')
    expect(d(p.sub)).toBeLessThan(d(p.faint))
    expect(d(p.faint)).toBeLessThan(d(p.line))
  })

  it('leaves a dark ink alone for the QR', () => {
    // The original olive already scans; it must not be darkened.
    expect(buildPalette('#F7E7CE', '#556B2F').qr).toBe('#556B2F')
  })

  it('darkens a pale ink until the QR can scan off its white card', () => {
    const p = buildPalette('#1A1A1A', '#F2F2F2')
    expect(p.qr).not.toBe('#F2F2F2')
    expect(contrastRatio(p.qr, '#FFFFFF')).toBeGreaterThanOrEqual(5)
  })

  it('falls back to the brand colours for unparseable input', () => {
    const p = buildPalette('nonsense', 'also-nonsense')
    expect(p.bg).toBe('#F7E7CE')
    expect(p.ink).toBe('#556B2F')
  })
})

describe('presets', () => {
  it('are all legible enough not to trip the contrast warning', () => {
    for (const p of PRESETS) {
      expect(contrastRatio(p.bg, p.ink)).toBeGreaterThanOrEqual(MIN_READABLE_CONTRAST)
    }
  })
  it('all produce a scannable QR', () => {
    for (const p of PRESETS) {
      expect(contrastRatio(buildPalette(p.bg, p.ink).qr, '#FFFFFF')).toBeGreaterThanOrEqual(5)
    }
  })
})

describe('variantName', () => {
  it('names a matching preset', () => {
    expect(variantName('#F7E7CE', '#556B2F')).toBe('cream')
    expect(variantName('#556b2f', '#f7e7ce')).toBe('olive') // case-insensitive
  })
  it('calls anything else custom', () => {
    expect(variantName('#123456', '#FEDCBA')).toBe('custom')
    // A preset's colours swapped is a different colourway, not that preset.
    expect(variantName('#556B2F', '#556B2F')).toBe('custom')
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
