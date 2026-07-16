'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { GreenLogo, GreenLogoSm } from '@/components/landing/Logo'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

function CallbackBanner() {
  const searchParams = useSearchParams()
  const confirmed = searchParams.get('confirmed')
  const hasError  = searchParams.get('error') === 'auth_callback_failed'
  const account   = searchParams.get('account')

  const supabase = createClient()
  const [email, setEmail]       = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [resendError, setResendError] = useState('')

  if (confirmed === 'true') return (
    <p style={{ color: '#4ade80', backgroundColor: 'rgba(74,222,128,0.08)', padding: '0.75rem 1rem', borderRadius: '0.625rem', fontSize: '0.875rem', border: '1px solid rgba(74,222,128,0.2)', margin: 0 }}>
      ✓ Email confirmed. Sign in below to continue.
    </p>
  )

  // Set by the proxy when a restricted or deleted host is bounced out. The
  // detail (and any reason) is in the email we sent them; this is just so
  // they aren't staring at a login form that silently refuses to work.
  if (account === 'restricted' || account === 'deleted') return (
    <div style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', padding: '0.75rem 1rem', borderRadius: '0.625rem', fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)', margin: 0 }}>
      <p style={{ margin: 0, fontWeight: 600 }}>
        Your account has been {account === 'deleted' ? 'deleted' : 'restricted'}.
      </p>
      <p style={{ margin: '0.375rem 0 0', color: 'var(--text-muted)' }}>
        Check your email for details, or contact{' '}
        <a href="mailto:support@sharemomento.app" style={{ color: 'var(--accent)' }}>support@sharemomento.app</a>
        {' '}for more information.
      </p>
    </div>
  )

  if (!hasError) return null

  async function handleResend() {
    if (!email.trim()) { setResendError('Enter your email address.'); return }
    setSending(true)
    setResendError('')
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
    })
    setSending(false)
    if (error) { setResendError(error.message); return }
    setSent(true)
  }

  const resendInput: React.CSSProperties = {
    flex: 1, backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: '0.625rem', padding: '0.625rem 0.875rem', color: 'var(--text-primary)',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', minHeight: '44px',
  }

  return (
    <div style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>
        This confirmation link has expired or already been used.
      </p>
      {sent ? (
        <p style={{ color: '#4ade80', fontSize: '0.825rem', margin: 0 }}>
          ✓ New confirmation email sent — check your inbox.
        </p>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>
            Enter your email to receive a new confirmation link.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleResend()}
              style={resendInput}
            />
            <button
              onClick={handleResend}
              disabled={sending}
              style={{ backgroundColor: 'var(--accent)', color: '#F7E7CE', border: 'none', borderRadius: '0.625rem', padding: '0.625rem 1rem', fontSize: '0.825rem', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: sending ? 0.6 : 1, minHeight: '44px' }}
            >
              {sending ? 'Sending…' : 'Resend'}
            </button>
          </div>
          {resendError && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>{resendError}</p>
          )}
        </>
      )}
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const { isMobile } = useWindowWidth()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

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

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          {isMobile ? <GreenLogoSm /> : <GreenLogo />}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isMobile && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No account?</span>}
          <Link href="/auth/register" style={{ height: '32px', paddingLeft: '0.75rem', paddingRight: '0.75rem', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            Sign up
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '28rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <Suspense fallback={null}>
            <CallbackBanner />
          </Suspense>

          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1.25rem', padding: '2rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div>
              <h1 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1.75rem' }}>Welcome back</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Enter your email and password to continue</p>
            </div>

            {error && (
              <p style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)', margin: 0 }}>
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
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={{ ...input, paddingRight: '3rem' }}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0.25rem', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading} style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', minHeight: '52px', opacity: loading ? 0.5 : 1 }}>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #333', borderTopColor: '#556B2F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}