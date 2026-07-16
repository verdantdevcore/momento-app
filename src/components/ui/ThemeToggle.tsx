'use client'

import { useTheme } from '@/lib/theme-context'

export function ThemeToggle() {
  const { toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        // Chrome tokens: the toggle only ever sits in a header or the mobile
        // menu, both of which are .chrome-surface.
        border: '1px solid var(--btn-chrome-border)',
        backgroundColor: 'var(--btn-chrome-bg)',
        color: 'var(--btn-chrome-text)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.125rem',
        flexShrink: 0,
      }}
    >
      {/* Both icons are rendered and CSS shows the one matching data-theme.
          Picking in JS is what caused the hydration error: the server has no
          way to know the visitor's theme, so it always rendered the sun while
          a light-mode client rendered the moon. */}
      <span className="theme-icon--dark" aria-hidden="true">☀️</span>
      <span className="theme-icon--light" aria-hidden="true">🌙</span>
    </button>
  )
}