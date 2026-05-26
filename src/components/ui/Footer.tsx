'use client'

import { useTheme } from '@/lib/theme-context'

type FooterProps = {
  variant?: 'default' | 'minimal'
}

export function Footer({ variant = 'default' }: FooterProps) {
  const year = new Date().getFullYear()

  if (variant === 'minimal') {
    return (
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          © {year} Momento · Share the moment
        </p>
      </footer>
    )
  }

  return (
    <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '32rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.925rem', letterSpacing: '-0.02em' }}>Momento</span>
          <span style={{ color: 'var(--border)', fontSize: '0.75rem' }}>·</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Share the moment</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Privacy', 'Terms', 'Support'].map(link => (
            <a key={link} href="#" style={{ color: 'var(--text-dim)', fontSize: '0.775rem', fontWeight: 500 }}>
              {link}
            </a>
          ))}
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.725rem' }}>
          © {year} Momento. All rights reserved.
        </p>
      </div>
    </footer>
  )
}