'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { GreenLogo, GreenLogoSm } from '@/components/landing/Logo'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { isMobile } = useWindowWidth()

  async function handleUpdate() {
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
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

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          {isMobile ? <GreenLogoSm /> : <GreenLogo />}
        </Link>
        <ThemeToggle />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ width: '100%', maxWidth: '24rem', backgroundColor: 'var(--bg-surface)', borderRadius: '1.25rem', padding: '2rem 1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>New password</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Choose a new password for your account
            </p>
          </div>

          {error && (
            <p style={{ color: 'var(--text-primary)', backgroundColor: 'var(--border)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                style={{ ...input, paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
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

          <button
            onClick={handleUpdate}
            disabled={loading || !password.trim() || !confirm.trim()}
            style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px', opacity: loading || !password.trim() || !confirm.trim() ? 0.4 : 1 }}
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </div>
    </main>
  )
}

