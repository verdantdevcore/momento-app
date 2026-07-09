import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme-context'
import './globals.css'

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
    <html lang="en" className={urbanist.variable}>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}