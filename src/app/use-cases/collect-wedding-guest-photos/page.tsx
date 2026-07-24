import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/use-cases/collect-wedding-guest-photos/Hero'
import { EmotionalStory } from '@/components/use-cases/collect-wedding-guest-photos/EmotionalStory'
import { MissingMemories } from '@/components/use-cases/collect-wedding-guest-photos/MissingMemories'
import { MemoryJourney } from '@/components/use-cases/collect-wedding-guest-photos/MemoryJourney'
import { MemoryWall } from '@/components/use-cases/collect-wedding-guest-photos/MemoryWall'
import { BenefitsGrid } from '@/components/use-cases/collect-wedding-guest-photos/BenefitsGrid'
import { WeddingStories } from '@/components/use-cases/collect-wedding-guest-photos/WeddingStories'
import { PhotographerGuest } from '@/components/use-cases/collect-wedding-guest-photos/PhotographerGuest'
import { GalleryShowcase } from '@/components/use-cases/collect-wedding-guest-photos/GalleryShowcase'
import { Testimonials } from '@/components/use-cases/collect-wedding-guest-photos/Testimonials'
import { Faq } from '@/components/use-cases/collect-wedding-guest-photos/Faq'
import { FinalCta } from '@/components/use-cases/collect-wedding-guest-photos/FinalCta'

export const metadata: Metadata = {
  title: 'Collect Wedding Guest Photos | Momento App',
  description:
    'Every guest captures a different part of your wedding story. Collect all their photos and videos in one beautiful shared album — guests scan a QR code or tap a link to upload instantly, no app download required.',
}

// Section order mirrors frame 2:10989 in the Figma marketing file.
export default function CollectWeddingGuestPhotosPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <EmotionalStory />
      <MissingMemories />
      <MemoryJourney />
      <MemoryWall />
      <BenefitsGrid />
      <WeddingStories />
      <PhotographerGuest />
      <GalleryShowcase />
      <Testimonials />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  )
}
