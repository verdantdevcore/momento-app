'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Footer } from '@/components/ui/Footer'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

const features = [
  { icon: '📸', title: 'Guest uploads', desc: 'Guests share photos and videos directly — no app download required.' },
  { icon: '🎞', title: 'Live feed', desc: 'Watch memories appear in real time as guests upload throughout the event.' },
  { icon: '📲', title: 'QR sharing', desc: 'One QR code gets every guest into the feed instantly.' },
  { icon: '⬇️', title: 'Download all', desc: 'Hosts can download every upload as a zip after the event.' },
]

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const { isDesktop } = useWindowWidth()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/dashboard')
    }
    check()
  }, [router, supabase.auth])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Momento</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <Link href="/auth/login" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Sign in</Link>
          <Link href="/auth/register" style={{ height: '36px', paddingLeft: '1rem', paddingRight: '1rem', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
            Get started
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <section style={{ flex: isDesktop ? 'unset' : 1, padding: isDesktop ? '5rem 2rem' : '3rem 1.5rem', display: 'flex', flexDirection: isDesktop ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: isDesktop ? '4rem' : '2rem', maxWidth: '72rem', margin: '0 auto', width: '100%' }}>

        {/* Left — copy */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: isDesktop ? 'left' : 'center', alignItems: isDesktop ? 'flex-start' : 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(85,107,47,0.15)', border: '1px solid rgba(85,107,47,0.3)', borderRadius: '999px', padding: '0.375rem 0.875rem' }}>
            <span style={{ fontSize: '0.75rem' }}>✨</span>
            <span style={{ color: 'var(--accent)', fontSize: '0.775rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Event media sharing</span>
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: isDesktop ? '3.5rem' : '2.5rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0 }}>
            Every moment,<br />
            <span style={{ color: 'var(--accent)' }}>shared together.</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', lineHeight: 1.6, maxWidth: '28rem', margin: 0 }}>
            Collect photos and videos from everyone at your event — in one beautiful shared feed your whole guest list can enjoy.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: isDesktop ? 'flex-start' : 'center' }}>
            <Link href="/auth/register" style={{ height: '52px', paddingLeft: '1.75rem', paddingRight: '1.75rem', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              Host an event →
            </Link>
            <Link href="/auth/login" style={{ height: '52px', paddingLeft: '1.75rem', paddingRight: '1.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.825rem', margin: 0 }}>
            Got an event link? Scan the QR code or ask your host.
          </p>
        </div>

        {/* Right — feature cards */}
        {isDesktop && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {features.map(f => (
              <div key={f.title} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{f.icon}</span>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.925rem', margin: 0 }}>{f.title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mobile feature list */}
      {!isDesktop && (
        <section style={{ padding: '0 1.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {features.map(f => (
            <div key={f.title} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.925rem', margin: 0 }}>{f.title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.5, margin: '0.25rem 0 0' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <Footer />
    </main>
  )
}