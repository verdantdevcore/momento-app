'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'
import { GreenLogo,  GreenLogoSm  } from '@/components/landing/Logo'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { isDesktop } = useWindowWidth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const input: React.CSSProperties = {
    width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: '0.75rem', padding: '0.875rem 1rem', color: 'var(--text-primary)',
    fontSize: '1rem', outline: 'none', boxSizing: 'border-box', minHeight: '52px',
  }

  const { isMobile } = useWindowWidth()

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          {isMobile ? <GreenLogoSm /> : <GreenLogo />}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No account?</span>
          <Link href="/auth/register" style={{ height: '32px', paddingLeft: '0.75rem', paddingRight: '0.75rem', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
            Sign up
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '28rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {isDesktop && (
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Sign in to your host account</p>
            </div>
          )}

          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1.25rem', padding: '2rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h1 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: isDesktop ? '1.75rem' : '2rem' }}>Welcome back</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Enter your email and password to continue</p>
            </div>

            {error && (
              <p style={{ color: 'var(--text-primary)', backgroundColor: 'var(--border)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Email address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={input} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Password</label>
                  <Link href="/auth/forgot-password" style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Forgot password?</Link>
                </div>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={input} />
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading} style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px', opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              No account?{' '}
              <Link href="/auth/register" style={{ color: 'var(--text-silver)', fontWeight: 600 }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}