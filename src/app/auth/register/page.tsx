'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'
import { GreenLogo, GreenLogoSm } from '@/components/landing/Logo'

export default function RegisterPage() {
  const supabase = createClient()
  const { isDesktop } = useWindowWidth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { isMobile } = useWindowWidth()

  async function handleRegister() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  const input: React.CSSProperties = {
    width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: '0.75rem', padding: '0.875rem 1rem', color: 'var(--text-primary)',
    fontSize: '1rem', outline: 'none', boxSizing: 'border-box', minHeight: '52px',
  }

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
        <div style={{ width: '100%', maxWidth: '28rem' }}>

          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1.25rem', padding: '2rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {sent ? (
              <>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>📬</span>
                  <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Check your email</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                    We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Click it to activate your account.
                  </p>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', textAlign: 'center', margin: 0 }}>
                  Didn&apos;t get it?{' '}
                  <button onClick={() => setSent(false)} style={{ color: 'var(--text-silver)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.825rem', padding: 0 }}>Try again</button>
                </p>
                <Link href="/auth/login" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, fontSize: '1rem', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', textDecoration: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-input)' }}>
                  Back to sign in
                </Link>
              </>
            ) : (
              <>
                <div>
                  <h1 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: isDesktop ? '1.75rem' : '2rem' }}>Create account</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Host your first event in minutes</p>
                </div>

                {error && (
                  <p style={{ color: 'var(--text-primary)', backgroundColor: 'var(--border)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>{error}</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Full name</label>
                    <input type="text" placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} style={input} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Email address</label>
                    <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={input} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleRegister()}
                        style={{ ...input, paddingRight: '3rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button onClick={handleRegister} disabled={loading} style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px', opacity: loading ? 0.5 : 1 }}>
                  {loading ? 'Creating account...' : 'Create account'}
                </button>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                  Already have an account?{' '}
                  <Link href="/auth/login" style={{ color: 'var(--text-silver)', fontWeight: 600 }}>Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}