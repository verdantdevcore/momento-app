'use client'

import { createContext, useContext, useSyncExternalStore } from 'react'
import { THEME_STORAGE_KEY } from '@/lib/theme-storage'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: 'dark', toggleTheme: () => {} })

// The theme lives on <html data-theme>, applied by the inline script in the
// root layout before the first paint. Reading it back from there — rather than
// keeping a second copy in React state — means there is only ever one source of
// truth, and it's the one the CSS is already using.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

// The server cannot know a visitor's theme, so it renders the CSS default and
// the client corrects itself after hydration. This used to be a
// `typeof window === 'undefined'` branch inside useState, which meant the
// server rendered 'dark' while a light-mode client rendered 'light' — a
// hydration mismatch on every single page load. Anything whose *appearance*
// depends on the theme should therefore branch in CSS on [data-theme], not on
// this value (see ThemeToggle and ChromeLogo).
function getServerSnapshot(): Theme {
  return 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_STORAGE_KEY, next)
    // Setting the attribute is the whole update: the MutationObserver above
    // picks it up and re-renders every consumer.
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
