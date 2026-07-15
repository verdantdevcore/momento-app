'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'
import { GreenLogo, GreenLogoSm } from '@/components/landing/Logo'

type AccountType = 'individual' | 'company'

export default function RegisterPage() {
  const supabase = createClient()
  const { isMobile } = useWindowWidth()

  const [accountType, setAccountType] = useState<AccountType>('individual')
  const [firstName, setFirstName]     = useState('')
  const [lastName, setLastName]       = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [sent, setSent]               = useState(false)

  async function handleRegister() {
    if (!firstName.trim()) { setError('First name is required.'); return }
    if (!lastName.trim() && accountType === 'individual') { setError('Last name is required.'); return }
    if (!companyName.trim() && accountType === 'company') { setError('Company name is required.'); return }
    if (!email.trim()) { setError('Email address is required.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    setError('')

    const displayName = accountType === 'company'
      ? companyName.trim()
      : `${firstName.trim()} ${lastName.trim()}`

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name:   firstName.trim(),
          last_name:    lastName.trim(),
          company_name: accountType === 'company' ? companyName.trim() : null,
          account_type: accountType,
          full_name:    displayName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      }
    })

    if (err) { setError(err.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  const input: React.CSSProperties = {
    width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: '0.75rem', padding: '0.875rem 1rem', color: 'var(--text-primary)',
    fontSize: '1rem', outline: 'none', boxSizing: 'border-box', minHeight: '52px',
  }

  const tabBtn = (type: AccountType): React.CSSProperties => ({
    flex: 1, padding: '0.625rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
    fontSize: '0.875rem', fontWeight: 700, transition: 'all 0.15s',
    backgroundColor: accountType === type ? 'var(--accent)' : 'transparent',
    color: accountType === type ? '#F7E7CE' : 'var(--text-muted)',
  })

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          {isMobile ? <GreenLogoSm /> : <GreenLogo />}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isMobile && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Have an account?</span>}
          <Link href="/auth/login" style={{ height: '36px', paddingLeft: '0.875rem', paddingRight: '0.875rem', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '0.5rem', fontSize: '0.825rem', fontWeight: 600, display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-input)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Sign in
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1.25rem', padding: '2rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {sent ? (
              <>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>📬</span>
                  <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Check your email</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                    We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                    Click it to activate your account.
                  </p>
                </div>
                <Link href="/auth/login" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, fontSize: '1rem', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', textDecoration: 'none', backgroundColor: 'var(--bg-input)', boxSizing: 'border-box' }}>
                  Back to sign in
                </Link>
              </>
            ) : (
              <>
                <div>
                  <h1 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700 }}>Create your account</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Host your first event in 60 seconds</p>
                </div>

                {/* Account type toggle */}
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    I am registering as an
                  </label>
                  <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-input)', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                    <button onClick={() => setAccountType('individual')} style={tabBtn('individual')}>
                      👤 Individual
                    </button>
                    <button onClick={() => setAccountType('company')} style={tabBtn('company')}>
                      🏢 Organisation
                    </button>
                  </div>
                </div>

                {/* Name fields */}
                {accountType === 'individual' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>First name *</label>
                      <input type="text" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} style={input} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Last name *</label>
                      <input type="text" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} style={input} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Company / Organisation name *</label>
                      <input type="text" placeholder="Acme Events Ltd" value={companyName} onChange={e => setCompanyName(e.target.value)} style={input} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Contact first name</label>
                        <input type="text" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} style={input} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Contact last name</label>
                        <input type="text" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} style={input} />
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Email address *</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={input} />
                </div>

                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRegister()}
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

                {error && (
                  <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0, backgroundColor: 'rgba(239,68,68,0.08)', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </p>
                )}

                <button onClick={handleRegister} disabled={loading} style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', minHeight: '52px', opacity: loading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {loading ? (
                    <>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(247,231,206,0.3)', borderTopColor: '#F7E7CE', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                      Creating account...
                    </>
                  ) : 'Create account'}
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}