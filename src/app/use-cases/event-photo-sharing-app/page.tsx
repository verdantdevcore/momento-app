import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/use-cases/event-photo-sharing-app/Hero'
import { TrustMetrics } from '@/components/use-cases/event-photo-sharing-app/TrustMetrics'
import { EventTypes } from '@/components/use-cases/event-photo-sharing-app/EventTypes'
import { ChallengesSolutions } from '@/components/use-cases/event-photo-sharing-app/ChallengesSolutions'
import { HowItWorks } from '@/components/use-cases/event-photo-sharing-app/HowItWorks'
import { Features } from '@/components/use-cases/event-photo-sharing-app/Features'
import { IndustrySolutions } from '@/components/use-cases/event-photo-sharing-app/IndustrySolutions'
import { LiveGallery } from '@/components/use-cases/event-photo-sharing-app/LiveGallery'
import { QrPlacementGuide } from '@/components/use-cases/event-photo-sharing-app/QrPlacementGuide'
import { Testimonials } from '@/components/use-cases/event-photo-sharing-app/Testimonials'
import { ComparisonTable } from '@/components/use-cases/event-photo-sharing-app/ComparisonTable'
import { Faq } from '@/components/use-cases/event-photo-sharing-app/Faq'
import { FinalCta } from '@/components/use-cases/event-photo-sharing-app/FinalCta'

export const metadata: Metadata = {
  title: 'Event Photo Sharing App | Momento App',
  description:
    'Collect every attendee’s photos and videos in one secure shared album. From conferences and corporate events to graduations, festivals, and fundraisers, guests scan a QR code and upload instantly — no app download required.',
}

// Section order mirrors frame 2:9245 in the Figma marketing file.
export default function EventPhotoSharingAppPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustMetrics />
      <EventTypes />
      <ChallengesSolutions />
      <HowItWorks />
      <Features />
      <IndustrySolutions />
      <LiveGallery />
      <QrPlacementGuide />
      <Testimonials />
      <ComparisonTable />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  )
}
