'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: 'dark', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

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
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}