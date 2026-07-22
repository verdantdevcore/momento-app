import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/use-cases/event-qr-code/Hero'
import { TrustMetrics } from '@/components/use-cases/event-qr-code/TrustMetrics'
import { HowItWorks } from '@/components/use-cases/event-qr-code/HowItWorks'
import { QrCodePlacement } from '@/components/use-cases/event-qr-code/QrCodePlacement'
import { ComparisonTable } from '@/components/use-cases/event-qr-code/ComparisonTable'
import { EventTypes } from '@/components/use-cases/event-qr-code/EventTypes'
import { FeaturedAlbums } from '@/components/use-cases/event-qr-code/FeaturedAlbums'
import { FeaturesGrid } from '@/components/use-cases/event-qr-code/FeaturesGrid'
import { Testimonials } from '@/components/use-cases/event-qr-code/Testimonials'
import { Faq } from '@/components/use-cases/event-qr-code/Faq'
import { FinalCta } from '@/components/use-cases/event-qr-code/FinalCta'

export const metadata: Metadata = {
  title: 'Event QR Code Photo Upload | Momento App',
  description:
    'Let every attendee contribute photos and videos instantly. Guests scan a QR code, upload from their browser, and every memory lands in one shared album.',
}

// Section order mirrors frame 2:8409 in the Figma marketing file.
export default function EventQrCodePhotoUploadPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustMetrics />
      <HowItWorks />
      <QrCodePlacement />
      <ComparisonTable />
      <EventTypes />
      <FeaturedAlbums />
      <FeaturesGrid />
      <Testimonials />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  )
}
