import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/use-cases/event-qr-code/Hero'

export const metadata: Metadata = {
  title: 'Event QR Code Photo Upload | Momento App',
  description:
    'Let every attendee contribute photos and videos instantly. Guests scan a QR code, upload from their browser, and every memory lands in one shared album.',
}

export default function EventQrCodePhotoUploadPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Footer />
    </main>
  )
}
