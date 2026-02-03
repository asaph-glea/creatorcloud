import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustSection } from "@/components/landing/trust-section"
import { ProblemSection } from "@/components/landing/problem-section"
import { SolutionOverview } from "@/components/landing/solution-overview"
import { FeatureSection } from "@/components/landing/feature-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { UseCases } from "@/components/landing/use-cases"
import { WhySection } from "@/components/landing/why-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { Testimonials } from "@/components/landing/testimonials"
import { ItemFAQ } from "@/components/landing/faq-section"
import { CTASection } from "@/components/landing/cta-section"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <ProblemSection />
        <SolutionOverview />
        <FeatureSection />
        <HowItWorks />
        <UseCases />
        <WhySection />
        <PricingSection />
        <Testimonials />
        <ItemFAQ />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  )
}
