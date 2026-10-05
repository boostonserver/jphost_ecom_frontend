import { LandingCta } from "./landing-cta";
import { LandingFaq } from "./landing-faq";
import { LandingFeatures } from "./landing-features";
import { LandingFooter } from "./landing-footer";
import { LandingHero } from "./landing-hero";
import { LandingHowItWorks } from "./landing-how-it-works";
import { LandingNavbar } from "./landing-navbar";
import { LandingPartners } from "./landing-partners";
import { LandingPricing } from "./landing-pricing";
import { LandingTestimonials } from "./landing-testimonials";
import { LandingThemes } from "./landing-themes";
import type { LandingCmsSettings } from "@/services/platform";

interface SaasLandingPageProps {
  cmsData?: LandingCmsSettings | null;
}

export function SaasLandingPage({ cmsData }: SaasLandingPageProps) {
  return (
    <div className="min-h-screen bg-stone-950 font-sans selection:bg-emerald-500 selection:text-stone-950 scroll-smooth">
      {/* 1. Header & Navigation */}
      <LandingNavbar />

      <main>
        {/* 2. Hero Section */}
        <LandingHero cmsHero={cmsData?.hero} />

        {/* 3. Bangladesh Integrations (bKash/Nagad, Steadfast/Pathao) */}
        <LandingPartners />

        {/* 4. Core Features Deep Dive */}
        <LandingFeatures />

        {/* 5. Storefront Themes Showcase (Shwapno Grocery, Fashion, Tech) */}
        <LandingThemes cmsThemes={cmsData?.themes} />

        {/* 6. How It Works (3 Steps) */}
        <LandingHowItWorks />

        {/* 7. Transparent Pricing Plans */}
        <LandingPricing />

        {/* 8. Merchant Testimonials */}
        <LandingTestimonials cmsTestimonials={cmsData?.testimonials} />

        {/* 9. Frequently Asked Questions */}
        <LandingFaq cmsFaqs={cmsData?.faqs} />

        {/* 10. Final Call to Action Banner */}
        <LandingCta />
      </main>

      {/* 11. Mega Footer */}
      <LandingFooter cmsContact={cmsData?.contact} />
    </div>
  );
}
