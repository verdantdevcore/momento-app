import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme-context'
// Not from theme-context: that module is 'use client', and a Server Component
// importing a value out of it gets a client-reference stub, not the string.
import { THEME_STORAGE_KEY } from '@/lib/theme-storage'
import './globals.css'

// Applies the stored theme before the browser paints anything.
//
// A plain inline <script> is deliberate: it executes during HTML parsing, so
// the attribute is set before any content is painted. next/script can't do this
// job — even `beforeInteractive` is documented as not blocking, and applying the
// theme from React (as this used to, in an effect) means every light-mode
// visitor gets a frame of the dark default first.
//
// Falls back to dark, which is what :root already declares, so a visitor with
// localStorage disabled sees the same page they do today.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    document.documentElement.setAttribute('data-theme', stored === 'light' ? 'light' : 'dark');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Momento App — Collect Every Guest Photo From Your Event.',
  description:
    'Momento App makes it easy for hosts and guests to instantly capture, share, and relive memorable photos and videos from every special event — privately and effortlessly. No app downloads. No chasing people afterward.',
    icons: {
      icon: '/favicon.svg',
      apple: '/apple-touch-icon.svg',
    },
  openGraph: {
    title: 'Momento App — Collect Every Guest Photo From Your Event.',
    description:
      'Momento App makes it easy for hosts and guests to instantly capture, share, and relive memorable photos and videos from every special event — privately and effortlessly. No app downloads. No chasing people afterward.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: themeScript sets data-theme on this element
    // before React hydrates, so the attribute is legitimately absent from the
    // server HTML. It only applies to this element, not the tree below it.
    <html lang="en" className={urbanist.variable} suppressHydrationWarning>
      <body>
        {/* First thing in the body so it runs before any of it is painted. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}