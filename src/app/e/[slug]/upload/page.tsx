'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'
import { getFeedStatus } from '@/lib/utils'

type Event = {
  id: string
  title: string
  slug: string
  feed_opens_at: string | null
  feed_closes_at: string | null
}

/**
 * How far along the whole selection is, measured in bytes actually sent.
 *
 * `percent` is weighted by file size rather than file count, so a 40MB video
 * followed by a 200KB photo doesn't crawl to 50% and then leap to done.
 */
type Progress = { fileIndex: number; totalFiles: number; percent: number }

/**
 * Share of a file's progress earned by transferring its bytes.
 *
 * The last slice is held back for the round trip after the bytes land:
 * Cloudinary finishes processing the asset and our own /api/upload saves the
 * media record. Without it the bar would park at 100% for seconds — on a large
 * video, long enough for a guest to assume it had frozen.
 */
const TRANSFER_SHARE = 0.9

export default function UploadPage() {
  const { slug } = useParams()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [event, setEvent] = useState<Event | null>(null)
  const [name, setName] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<Progress | null>(null)
  const [fileWarning, setFileWarning] = useState('')
  const { isDesktop } = useWindowWidth()


  const [showLimitModal, setShowLimitModal] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)


  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase
        .from('events')
        .select('id, title, slug, feed_opens_at, feed_closes_at')
        .eq('slug', slug)
        .single()
      if (!data) return router.push('/')
      setEvent(data)
    }

    const savedName = localStorage.getItem('momento-guest-name')
    if (savedName) setName(savedName)

    fetchEvent()

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (uploading) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [slug, router, supabase, uploading])

  function handleFileChange(incoming: FileList | null) {
      if (!incoming) return
      setFileWarning('')

      const MAX_FILES = 10
      const MAX_SIZE_MB = 50

      let accepted = Array.from(incoming)

      if (accepted.length > MAX_FILES) {
        setSelectedCount(accepted.length)
        setShowLimitModal(true)
        setFiles(null)
        return
      }

      const oversized = accepted.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024)
      accepted = accepted.filter(f => f.size <= MAX_SIZE_MB * 1024 * 1024)

      if (oversized.length > 0) {
        setFileWarning(`${oversized.length} file${oversized.length > 1 ? 's' : ''} over ${MAX_SIZE_MB}MB removed.`)
      }

      if (accepted.length > 0) {
        const dt = new DataTransfer()
        accepted.forEach(f => dt.items.add(f))
        setFiles(dt.files)
      } else {
        setFiles(null)
      }
    }

type UploadSignature = {
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  format?: string
  cloudName: string
  resourceType: 'image' | 'video'
}

type CloudinaryUpload = { secure_url: string; public_id: string }

/**
 * Reads a JSON response, or throws something a guest can act on.
 *
 * A route that fails before its own handler runs answers with an HTML error
 * page or an empty body, not JSON. Calling .json() on that throws the
 * browser's own parser error — on iOS Safari, the famously unhelpful "The
 * string did not match the expected pattern." — which the catch below then
 * printed verbatim on screen. Read the body once as text and decide from
 * there, so a broken dependency reads as a broken upload.
 */
async function readJson<T>(response: Response, fallback: string): Promise<T> {
  const raw = await response.text()
  // Our routes answer { error: string }; Cloudinary answers { error: { message } }.
  let data: (T & { error?: string | { message?: string } }) | null = null
  if (raw) {
    try { data = JSON.parse(raw) } catch { /* non-JSON error page — handled below */ }
  }

  const err = data?.error
  const message =
    typeof err === 'string' ? err :
    typeof err?.message === 'string' ? err.message :
    null

  if (message) throw new Error(message)
  if (!response.ok || !data) throw new Error(`${fallback} (HTTP ${response.status})`)
  return data
}

/**
 * POSTs a file and reports bytes sent as they go.
 *
 * fetch() gives no visibility into the request body's upload, so the bar could
 * only ever count whole files. XMLHttpRequest still exposes upload.onprogress,
 * which is the only way to know a 40MB video is 12MB in. The response is handed
 * back to readJson so failures read the same as everywhere else.
 */
function postWithProgress(
  url: string,
  body: FormData,
  fallback: string,
  onProgress: (sentBytes: number) => void,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) onProgress(e.loaded)
    })
    xhr.addEventListener('load', () => {
      // status 0 means the request never reached the server — no body to read.
      if (xhr.status === 0) return reject(new Error(fallback))
      // An empty string is still a body to Response(), which rejects one on a
      // 204 — pass null so a no-content reply reaches readJson intact.
      resolve(new Response(xhr.responseText || null, { status: xhr.status }))
    })
    xhr.addEventListener('error', () => reject(new Error(fallback)))
    xhr.addEventListener('abort', () => reject(new Error(fallback)))
    xhr.send(body)
  })
}

async function handleUpload() {
    if (!files || files.length === 0 || !event) return
    setUploading(true)
    setError('')

    const selected = Array.from(files)
    // Guard against a zero-byte selection so the percentage never divides by 0.
    const totalBytes = Math.max(selected.reduce((sum, f) => sum + f.size, 0), 1)
    let settledBytes = 0 // bytes belonging to files already saved

    function report(fileIndex: number, sentBytes: number) {
      const done = (settledBytes + sentBytes) / totalBytes
      setProgress({ fileIndex, totalFiles: selected.length, percent: Math.min(Math.round(done * 100), 100) })
    }

    report(0, 0)

    const guestName = name.trim() || null
    if (guestName) localStorage.setItem('momento-guest-name', guestName)

    const parsedTags = hashtags
      .split(/[\s,#]+/)
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 10) // max 10 tags

    // F-15: Fetch server-generated batch ID
    let batchId: string | null = null
    if (files.length > 1) {
      try {
        const r = await fetch('/api/batch-id')
        const d = await r.json()
        batchId = d.batchId
      } catch {
        // Non-critical — continue without batch grouping
      }
    }

    try {
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i]
        report(i, 0)

        // Step 1: ask our server for a short-lived signed upload for this
        // file. This request is tiny (no file bytes) regardless of the
        // file size.
        const sigResponse = await fetch('/api/upload-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event.id,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        })
        const sig = await readJson<UploadSignature>(sigResponse, 'Could not start the upload. Please try again.')

        // Step 2: upload the file bytes directly from the browser to
        // Cloudinary. This bypasses our server entirely, so large files
        // (mainly videos) are no longer constrained by our serverless
        // function's request-body size limit.
        const cdForm = new FormData()
        cdForm.append('file', file)
        cdForm.append('api_key', sig.apiKey)
        cdForm.append('timestamp', String(sig.timestamp))
        cdForm.append('signature', sig.signature)
        cdForm.append('folder', sig.folder)
        if (sig.format) cdForm.append('format', sig.format)

        const cdFailed = 'Upload to storage failed. Please try again.'
        const cdResponse = await postWithProgress(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`,
          cdForm,
          cdFailed,
          // The form carries a little metadata beyond the file, so cap the
          // reported bytes at the file's own size to keep the maths honest.
          sent => report(i, Math.min(sent, file.size) * TRANSFER_SHARE),
        )
        const cdResult = await readJson<CloudinaryUpload>(cdResponse, cdFailed)

        // Step 3: tell our server the upload succeeded so it can save the
        // media record. This is another small JSON request.
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event.id,
            url: cdResult.secure_url,
            publicId: cdResult.public_id,
            resourceType: sig.resourceType,
            uploadedBy: guestName,
            batchId,
            hashtags: parsedTags,
          }),
        })

        await readJson<{ mediaId: string }>(response, 'Could not save the upload. Please try again.')

        settledBytes += file.size
        report(i, 0)
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Upload failed. Please try again.')
    }

    setUploading(false)
    setProgress(null)
  }

  const input: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '52px',
  }

  if (!event) return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading event...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )

  const feedStatus = getFeedStatus(event)
  if (feedStatus !== 'open') return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem', textAlign: 'center' }}>
      <span style={{ fontSize: '2.5rem' }}>{feedStatus === 'closed' ? '🔒' : '⏳'}</span>
      <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.125rem' }}>{event.title}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', margin: 0, maxWidth: '24rem' }}>
        {feedStatus === 'closed'
          ? 'This event has been closed by the host. Uploads are no longer accepted.'
          : "This event's feed hasn't opened yet. Check back soon."}
      </p>
    </main>
  )

  if (done) return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', gap: '1rem', textAlign: 'center' }}>
      <p style={{ fontSize: '3rem' }}>🎉</p>
      <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Uploaded!</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Your media has been added to {event.title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '20rem' }}>
        <button
          onClick={() => { setFiles(null); setDone(false); setHashtags(''); setProgress(null); setFileWarning('') }}
          style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px' }}
        >
          Upload more
        </button>
        <Link
          href={`/e/${slug}`}
          style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
        >
          View the feed
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none', padding: '0.5rem' }}
        >
          Create your own event →
        </a>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href={`/e/${slug}`} style={{ height: '44px', paddingLeft: '1rem', paddingRight: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', whiteSpace: 'nowrap', flexShrink: 0, textDecoration: 'none' }}>
          ← Feed
        </Link>
        <p style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '1rem', flex: 1 }}>
          {event.title}
        </p>
        <ThemeToggle />
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: isDesktop ? 'flex-start' : 'stretch', justifyContent: 'center', padding: isDesktop ? '2rem' : '1rem' }}>
        <div style={{ width: '100%', maxWidth: isDesktop ? '36rem' : '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Share your shots</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Add your photos and videos to the event feed
            </p>
          </div>

          {error && (
            <p style={{ color: 'var(--text-primary)', backgroundColor: 'var(--border)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>
              {error}
            </p>
          )}

          {fileWarning && (
            <p style={{ color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.825rem', border: '1px solid rgba(245,158,11,0.3)' }}>
              ⚠️ {fileWarning}
            </p>
          )}

          {/* Name field — always editable input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
                Your name (optional)
              </label>
              {name && (
                <button
                  onClick={() => { setName(''); localStorage.removeItem('momento-guest-name') }}
                  style={{ color: 'var(--text-muted)', fontSize: '0.775rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Kemi"
              value={name}
              onChange={e => setName(e.target.value)}
              style={input}
            />
          </div>

          {/* Hashtags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
              Hashtags (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. #ceremonydance #cakesplash"
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              style={input}
            />
            <p style={{ color: 'var(--text-dim)', fontSize: '0.825rem' }}>Separate tags with spaces</p>
          </div>

          {/* Prominent upload limits banner */}
          <div style={{ backgroundColor: 'rgba(85,107,47,0.15)', border: '1px solid rgba(85,107,47,0.4)', borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>📎</span>
            <div>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.825rem', fontWeight: 700, margin: 0 }}>
                Upload limits
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                Max <strong style={{ color: 'var(--text-primary)' }}>10 files</strong> per upload · Max <strong style={{ color: 'var(--text-primary)' }}>50MB</strong> per file. Select more? Split into multiple uploads.
              </p>
            </div>
          </div>

          {/* File picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
              Photos & videos *
            </label>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.775rem', margin: 0 }}>
              Selecting multiple files will group them as a carousel post
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.375rem' }}>

              {/* Camera — no accept filter, let the OS decide */}
              <label
                style={{ flex: 1, minHeight: '72px', border: '1px solid var(--border)', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'pointer', backgroundColor: 'var(--bg-input)', padding: '0.75rem' }}
              >
                <span style={{ fontSize: '1.25rem' }}>📷</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem', fontWeight: 600 }}>Camera</span>
                <input
                  type="file"
                  capture="environment"
                  onChange={e => handleFileChange(e.target.files)}
                  style={{ display: 'none' }}
                />
              </label>

              {/* Library — no accept filter, accepts everything */}
              <label
                style={{ flex: 1, minHeight: '72px', border: files && files.length > 0 ? '2px solid var(--accent)' : '2px dashed var(--border)', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'pointer', backgroundColor: 'var(--bg-input)', padding: '0.75rem' }}
              >
                <span style={{ fontSize: '1.25rem' }}>🖼️</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem', fontWeight: 600, textAlign: 'center' }}>
                  {files && files.length > 0 ? `${files.length} selected` : 'Library'}
                </span>
                <input
                  type="file"
                  multiple
                  onChange={e => handleFileChange(e.target.files)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Progress bar */}
          {uploading && progress && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>
                  {progress.totalFiles > 1
                    ? `Uploading ${progress.fileIndex + 1} of ${progress.totalFiles}...`
                    : 'Uploading...'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>
                  {progress.percent}%
                </p>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{ height: '100%', backgroundColor: 'var(--accent)', borderRadius: '999px', width: `${progress.percent}%`, transition: 'width 0.2s linear' }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !files || files.length === 0}
            style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px', opacity: uploading || !files || files.length === 0 ? 0.4 : 1 }}
          >
            {uploading ? `Uploading... ${progress?.percent ?? 0}%` : 'Upload'}
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none', padding: '0.25rem' }}
          >
            Create your own event →
          </a>

        </div>
      </div>
      {/* Limit exceeded modal */}
      {showLimitModal && (
        <div
          onClick={() => setShowLimitModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg-base)', borderRadius: '1.25rem', padding: '1.75rem', width: '100%', maxWidth: '22rem', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.15)', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              ⚠️
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.125rem' }}>
                Too many files
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
                You selected <strong style={{ color: 'var(--text-primary)' }}>{selectedCount} files</strong> but the maximum is <strong style={{ color: 'var(--text-primary)' }}>10 per upload</strong>.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
                Go back to your gallery, select <strong style={{ color: 'var(--text-primary)' }}>10 or fewer</strong>, then upload. You can always upload the rest in a second round.
              </p>
            </div>
            <button
              onClick={() => setShowLimitModal(false)}
              style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px' }}
            >
              Got it, I&apos;ll reselect
            </button>
          </div>
        </div>
      )}

    </main>
  )
}