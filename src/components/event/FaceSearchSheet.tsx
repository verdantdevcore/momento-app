'use client'

import { useRef, useState } from 'react'

/**
 * "Upload a selfie, find every photo you're in."
 *
 * The selfie never reaches Cloudinary or our database — it is downscaled here,
 * posted to /api/face/search, matched, and dropped. The copy in this sheet says
 * so, and that promise is enforced in lib/faces.ts; the two need to stay true
 * to each other.
 */

const MAX_EDGE = 1024
const JPEG_QUALITY = 0.85

/**
 * Shrinks the selfie before it leaves the device. Rekognition needs roughly 80
 * pixels across a face, so 1024 on the long edge is generous — and a modern
 * phone photo sent raw would be several MB of upload the guest waits on for no
 * gain.
 */
async function downscaleToJpegDataUrl(file: File): Promise<string> {
  // from-image so an EXIF-rotated phone photo is uploaded the right way up.
  // A sideways face often isn't detected at all.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width  = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not read that photo')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

export function FaceSearchSheet({
  slug,
  onClose,
  onResults,
}: {
  slug: string
  onClose: () => void
  onResults: (mediaIds: string[]) => void
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  async function handlePick(file: File | undefined) {
    if (!file) return
    setError(null)
    try {
      setPreview(await downscaleToJpegDataUrl(file))
    } catch {
      // Mostly HEIC that the browser can't decode. The accept list below asks
      // iOS to transcode, but a file dragged in on desktop can still land here.
      setError("We couldn't read that photo. Try a JPEG or PNG, or take a new photo.")
    }
  }

  async function handleSearch() {
    if (!preview || searching) return
    setSearching(true)
    setError(null)
    try {
      const res = await fetch('/api/face/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, selfie: preview }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      onResults(data.mediaIds ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem',
          padding: '1.25rem',
          width: '100%', maxWidth: '32rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          maxHeight: '90dvh', overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              Find your photos
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Add a selfie and we&apos;ll pull out every photo you&apos;re in.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          // Explicit types rather than image/* so iOS transcodes the HEIC it
          // would otherwise hand us, which browsers can't decode.
          accept="image/jpeg,image/png,image/webp"
          // No capture attribute on purpose: it would open the camera directly
          // on iOS with no way to pick an existing photo, and plenty of guests
          // already have a selfie they'd rather use.
          onChange={e => handlePick(e.target.files?.[0])}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileRef.current?.click()}
          style={{
            border: '1px dashed var(--border)', borderRadius: '1rem',
            backgroundColor: 'var(--bg-input)', cursor: 'pointer',
            padding: preview ? '0.75rem' : '2rem 1rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem',
          }}
        >
          {preview ? (
            <>
              {/* Local canvas data URL, never uploaded anywhere but the search
                  request — next/image would gain nothing and can't optimise it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Your selfie"
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%' }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tap to change</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '2rem' }}>🤳</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                Add a selfie
              </span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                Clear, well lit, just you in frame
              </span>
            </>
          )}
        </button>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSearch}
          disabled={!preview || searching}
          style={{
            backgroundColor: 'var(--accent)', color: '#F7E7CE',
            border: 'none', borderRadius: '0.75rem',
            padding: '0.875rem', minHeight: '52px',
            fontSize: '0.95rem', fontWeight: 600,
            cursor: !preview || searching ? 'default' : 'pointer',
            opacity: !preview || searching ? 0.4 : 1,
          }}
        >
          {searching ? 'Searching…' : 'Find my photos'}
        </button>

        {/* The guest-facing half of the consent story. Every claim here is
            enforced somewhere real — keep them in step. */}
        <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', lineHeight: 1.6, margin: 0 }}>
          Your selfie is used for this search only. It isn&apos;t saved, added to the album, or
          shared — it&apos;s deleted the moment the search finishes. The host turned face search on
          for this event; face data is deleted when they turn it off or delete the event.{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
            Privacy policy
          </a>
        </p>
      </div>
    </div>
  )
}
