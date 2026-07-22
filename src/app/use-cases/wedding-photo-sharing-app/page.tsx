import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/use-cases/wedding-photo-sharing-app/Hero'

export const metadata: Metadata = {
  title: 'Wedding Photo Sharing App | Momento App',
  description:
    'Collect every wedding photo and video in one beautiful shared album. Guests scan your QR code and upload instantly — no app download required.',
}

// Section order mirrors frame 2:3416 in the Figma marketing file.
export default function WeddingPhotoSharingAppPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Footer />
    </main>
  )
}
