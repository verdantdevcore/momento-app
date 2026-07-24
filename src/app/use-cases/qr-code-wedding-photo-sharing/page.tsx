import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/use-cases/qr-code-wedding-photo-sharing/Hero'
import { TrustMetrics } from '@/components/use-cases/qr-code-wedding-photo-sharing/TrustMetrics'
import { WhyQRCodes } from '@/components/use-cases/qr-code-wedding-photo-sharing/WhyQRCodes'
import { GuestJourney } from '@/components/use-cases/qr-code-wedding-photo-sharing/GuestJourney'
import { PrintCollection } from '@/components/use-cases/qr-code-wedding-photo-sharing/PrintCollection'
import { PlacementGuide } from '@/components/use-cases/qr-code-wedding-photo-sharing/PlacementGuide'
import { FeatureGrid } from '@/components/use-cases/qr-code-wedding-photo-sharing/FeatureGrid'
import { DeviceShowcase } from '@/components/use-cases/qr-code-wedding-photo-sharing/DeviceShowcase'
import { Testimonials } from '@/components/use-cases/qr-code-wedding-photo-sharing/Testimonials'
import { ComparisonTable } from '@/components/use-cases/qr-code-wedding-photo-sharing/ComparisonTable'
import { Faq } from '@/components/use-cases/qr-code-wedding-photo-sharing/Faq'
import { FinalCta } from '@/components/use-cases/qr-code-wedding-photo-sharing/FinalCta'

export const metadata: Metadata = {
  title: 'QR Code Wedding Photo Sharing | Momento App',
  description:
    'Display one beautifully designed QR code around your wedding venue and let every guest upload their photos and videos instantly — no app download, no lost memories. Includes printable QR sign templates.',
}

// Section order mirrors frame 2:6564 in the Figma marketing file.
export default function QrCodeWeddingPhotoSharingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustMetrics />
      <WhyQRCodes />
      <GuestJourney />
      <PrintCollection />
      <PlacementGuide />
      <FeatureGrid />
      <DeviceShowcase />
      <Testimonials />
      <ComparisonTable />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  )
}
