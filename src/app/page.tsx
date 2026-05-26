import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { TrustSection } from '@/components/landing/TrustSection'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { BenefitsSection } from '@/components/landing/BenefitsSection'
import { EventTypesSection } from '@/components/landing/EventTypesSection'
import { WhyMomentoSection } from '@/components/landing/WhyMomentoSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { FinalCTASection } from '@/components/landing/FinalCTASection'
import { Footer } from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <TrustSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <BenefitsSection />
      <EventTypesSection />
      <WhyMomentoSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </main>
  )
}