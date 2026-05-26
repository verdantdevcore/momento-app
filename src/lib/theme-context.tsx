'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: 'dark', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const pathname = usePathname()
  const isWide = pathname?.startsWith('/admin')

  useEffect(() => {
    const stored = localStorage.getItem('momento-theme') as Theme | null
    const resolved = stored ?? 'dark'
    setTheme(resolved)
    document.documentElement.setAttribute('data-theme', resolved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('momento-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {isWide ? (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', width: '100%' }}>
          {children}
        </div>
      ) : (
        <div style={{
          maxWidth: '430px',
          marginLeft: 'auto',
          marginRight: 'auto',
          minHeight: '100vh',
          position: 'relative',
          boxShadow: '0 0 80px rgba(0,0,0,0.6)',
          backgroundColor: 'var(--bg-base)',
          overflowX: 'hidden',
        }}>
          {children}
        </div>
      )}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}