import type { Metadata } from 'next'
import { DM_Serif_Display } from 'next/font/google'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/use-cases/wedding-photo-sharing-app/Hero'
import { TrustMetrics } from '@/components/use-cases/wedding-photo-sharing-app/TrustMetrics'
import { ProblemSection } from '@/components/use-cases/wedding-photo-sharing-app/ProblemSection'
import { SolutionSection } from '@/components/use-cases/wedding-photo-sharing-app/SolutionSection'

// The design gives this page an editorial serif for card and quote headings.
// Declared here rather than in the root layout so only this route pays for it.
const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wedding Photo Sharing App | Momento App',
  description:
    'Collect every wedding photo and video in one beautiful shared album. Guests scan your QR code and upload instantly — no app download required.',
}

// Section order mirrors frame 2:3416 in the Figma marketing file.
export default function WeddingPhotoSharingAppPage() {
  return (
    <main className={dmSerif.variable}>
      <Navbar />
      <Hero />
      <TrustMetrics />
      <ProblemSection />
      <SolutionSection />
      <Footer />
    </main>
  )
}
