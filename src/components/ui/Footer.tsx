'use client'

type FooterProps = {
  variant?: 'default' | 'minimal'
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Footer({ variant = 'default' }: FooterProps) {
  const year = new Date().getFullYear()

  if (variant === 'minimal') {
    return (
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.725rem', letterSpacing: '0.04em' }}>
          © {year} Verdant DevCore Technologies Inc.
        </p>
      </footer>
    )
  }

  return (
    <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)', padding: '2rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Brand line */}
        <div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 0.25rem' }}>
            BY
          </p>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.01em', margin: 0, lineHeight: 1.1 }}>
            Verdant DevCore
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

        {/* Copyright + socials row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.775rem', margin: 0 }}>
            © {year} Verdant DevCore Technologies Inc.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            {[
              { href: 'https://linkedin.com/company/verdantdevcore', icon: <LinkedInIcon />, label: 'LinkedIn' },
              { href: 'https://instagram.com/verdantdevcore', icon: <InstagramIcon />, label: 'Instagram' },
              { href: 'https://x.com/verdantdevcore', icon: <XIcon />, label: 'X' },
            ].map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}