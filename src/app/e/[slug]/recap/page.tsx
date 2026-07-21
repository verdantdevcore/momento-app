'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import JSZip from 'jszip'
import { formatTimeAgo } from '@/lib/utils'
import { OliveLogo } from '@/components/landing/Logo'
import { RecapPlayer, type RecapPlayerItem } from '@/components/event/RecapPlayer'

type RecapStatus = {
  status: 'idle' | 'processing' | 'ready' | 'failed'
  itemCount: number | null
  generatedAt: string | null
  renderMode: string | null
  videoUrl: string | null
  error: string | null
  items: RecapPlayerItem[]
}

export default function RecapPage() {
  const { slug } = useParams()
  const [recap, setRecap] = useState<RecapStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [shared, setShared] = useState(false)
  const [zipping, setZipping] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchStatus() {
      const res = await fetch(`/api/recap/status?slug=${encodeURIComponent(String(slug))}`)
      if (!res.ok || cancelled) {
        if (!cancelled) setLoading(false)
        return
      }
      const data: RecapStatus = await res.json()
      if (!cancelled) {
        setRecap(data)
        setLoading(false)
      }
    }
    fetchStatus()
    // Light polling while a recap is being generated, so a guest who lands
    // here right after the host clicked "Generate" sees it finish without a
    // manual refresh.
    const id = setInterval(() => {
      if (recap?.status === 'processing' || recap === null) fetchStatus()
    }, 4000)
    return () => { cancelled = true; clearInterval(id) }
    // Deliberately narrow to slug/status: the effect already reruns whenever
    // status changes, so depending on the full `recap` object would just
    // tear down and recreate the interval on every poll response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, recap?.status])

  async function handleShare() {
    const shareUrl = `${window.location.origin}/e/${slug}/recap`
    const shareData = { title: 'Event recap', text: 'Check out this event recap on Momento', url: shareUrl }
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      }
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

  async function handleDownload() {
    if (!recap || recap.items.length === 0 || zipping) return
    setZipping(true)
    try {
      const zip = new JSZip()
      await Promise.all(recap.items.map(async (item, index) => {
        const response = await fetch(item.url)
        const blob = await response.blob()
        const ext = item.type === 'video' ? 'mp4' : 'jpg'
        zip.file(`${String(index + 1).padStart(2, '0')}.${ext}`, blob)
      }))
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-recap.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Recap download failed:', err)
    } finally {
      setZipping(false)
    }
  }

  return (
    <main style={{ minHeight: '100dvh', backgroundColor: 'var(--bg-base)', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href={`/e/${slug}`} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Back</Link>
        <OliveLogo size={20} />
        <span style={{ width: '3.5rem' }} />
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && (!recap || recap.status === 'idle') && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>🎬</span>
            <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.125rem' }}>No recap yet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', margin: 0, maxWidth: '22rem' }}>
              The host hasn&apos;t generated a recap for this event yet.
            </p>
          </div>
        )}

        {!loading && recap?.status === 'processing' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', margin: 0 }}>The recap is being generated — check back in a moment.</p>
          </div>
        )}

        {!loading && recap?.status === 'failed' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>😕</span>
            <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.125rem' }}>Couldn&apos;t generate a recap</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', margin: 0, maxWidth: '22rem' }}>
              {recap.error ?? 'Something went wrong. The host can try again from the dashboard.'}
            </p>
          </div>
        )}

        {!loading && recap?.status === 'ready' && recap.items.length > 0 && (
          <>
            <div style={{ flex: 1, position: 'relative', width: '100%', maxHeight: '80dvh' }}>
              <RecapPlayer items={recap.items} />
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                {recap.itemCount} moments{recap.generatedAt ? ` · ${formatTimeAgo(recap.generatedAt)}` : ''}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleDownload}
                  disabled={zipping}
                  style={{ height: '40px', paddingLeft: '1rem', paddingRight: '1rem', borderRadius: '2rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.825rem', fontWeight: 600, cursor: zipping ? 'default' : 'pointer', opacity: zipping ? 0.6 : 1 }}
                >
                  {zipping ? 'Zipping…' : '⬇ Download photos'}
                </button>
                <button
                  onClick={handleShare}
                  style={{ height: '40px', paddingLeft: '1rem', paddingRight: '1rem', borderRadius: '2rem', border: 'none', backgroundColor: 'var(--accent)', color: '#F7E7CE', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {shared ? '✓ Copied' : '↗ Share'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
