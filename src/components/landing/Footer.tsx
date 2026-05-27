'use client'

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

type FooterProps = {
  variant?: 'default' | 'minimal'
}

export function Footer({ variant = 'default' }: FooterProps) {
  const year = new Date().getFullYear()

  if (variant === 'minimal') {
    return (
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.725rem' }}>
          © {year} Verdant DevCore Technologies Inc.
        </p>
      </footer>
    )
  }

  return (
    <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)', padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.875rem' }}>

        {/* Left — brand text only, no logo */}
        <div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>BY</p>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem', fontWeight: 800, margin: '0 0 0.25rem', letterSpacing: '-0.01em' }}>Verdant DevCore</p>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.725rem', margin: 0 }}>© {year} Verdant DevCore Technologies Inc.</p>
        </div>

        {/* Right — social icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {[
            { href: 'https://www.linkedin.com/company/share-momento', icon: <LinkedInIcon />, label: 'LinkedIn' },
            { href: 'https://x.com/sharemomentoapp', icon: <XIcon />, label: 'X' },
            { href: 'https://www.instagram.com/sharemomentoapp', icon: <InstagramIcon />, label: 'Instagram' },
          ].map(({ href, icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '0.5rem', border: '1px solid var(--border)', transition: 'color 0.15s ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}