'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export type RecapPlayerItem = {
  mediaId: string
  url: string
  type: string
  durationSecs: number
}

/**
 * A "story"-style autoplaying slideshow over an event's curated recap items.
 *
 * No server-composed video exists in v1 — curation (src/lib/recap.ts) already
 * did the "AI" work of picking and ordering the media, and this just plays
 * that ordering back client-side with a Ken-Burns-ish crossfade, so "your
 * event in 90 seconds" is true without needing any new Cloudinary capability.
 */
export function RecapPlayer({ items }: { items: RecapPlayerItem[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef<number | null>(null)

  const current = items[index]

  useEffect(() => {
    setElapsed(0)
    lastTickRef.current = null
  }, [index])

  useEffect(() => {
    if (paused || !current) return

    function tick(now: number) {
      if (lastTickRef.current !== null) {
        setElapsed(prev => {
          const next = prev + (now - lastTickRef.current!)
          if (next >= current.durationSecs * 1000) {
            setIndex(i => (i + 1 < items.length ? i + 1 : i))
          }
          return next
        })
      }
      lastTickRef.current = now
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, index, items.length])

  if (!current) return null

  const isLast = index === items.length - 1
  const progress = Math.min(1, elapsed / (current.durationSecs * 1000))

  return (
    <div
      onClick={() => setPaused(p => !p)}
      style={{
        position: 'relative', width: '100%', height: '100%',
        backgroundColor: '#000', overflow: 'hidden', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.mediaId}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {current.type === 'video' ? (
            <video
              src={current.url}
              autoPlay
              muted
              playsInline
              loop
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <motion.img
              src={current.url}
              alt=""
              initial={{ scale: 1 }}
              animate={{ scale: 1.08 }}
              transition={{ duration: current.durationSecs, ease: 'linear' }}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Segmented progress bar — one segment per item, "story"-style */}
      <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.25rem', zIndex: 5 }}>
        {items.map((item, i) => (
          <div key={item.mediaId} style={{ flex: 1, height: '3px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%', backgroundColor: '#fff', borderRadius: '999px',
                width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
                transition: i === index ? 'none' : 'width 0.2s ease',
              }}
            />
          </div>
        ))}
      </div>

      {paused && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff' }}>
            ▶
          </div>
        </div>
      )}

      {isLast && elapsed >= current.durationSecs * 1000 && (
        <button
          onClick={e => { e.stopPropagation(); setIndex(0) }}
          style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '2rem', padding: '0.625rem 1.25rem', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)' }}
        >
          ↻ Watch again
        </button>
      )}
    </div>
  )
}
