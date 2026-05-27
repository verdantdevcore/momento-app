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
  title: 'Momento App — Every Moment. Shared Together.',
  description:
    'Momento is the private shared album for every event. Capture, share, and relive photos and videos from every special occasion — privately and effortlessly.',
    icons: {
      icon: '/favicon.svg',
      apple: '/apple-touch-icon.svg',
    },
  openGraph: {
    title: 'Momento App — Every Moment. Shared Together.',
    description:
      'The easiest way for people at an event to collect and relive every photo and video together in one private shared space.',
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