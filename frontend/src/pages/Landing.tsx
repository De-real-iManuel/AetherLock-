import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WhyAetherLockSection } from "@/components/landing/WhyAetherLockSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PartnerLogosGrid } from "@/components/landing/PartnerLogosGrid";
import { RoleComparisonSection } from "@/components/landing/RoleComparisonSection";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * Landing Page Component
 * 
 * Main landing page for AetherLock platform featuring:
 * - Hero section with animated background and live blockchain stats
 * - How It Works timeline with 5 steps
 * - Why AetherLock benefits with 6 holographic cards
 * - Testimonials carousel with auto-scroll
 * - Partner logos grid
 * - Role comparison section for clients vs freelancers
 * 
 * Responsive design for mobile (320px+), tablet (768px+), and desktop (1024px+)
 */
export const Landing = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <HeroSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Why AetherLock Section */}
        <WhyAetherLockSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Partner Logos Grid */}
        <PartnerLogosGrid />

        {/* Role Comparison Section */}
        <RoleComparisonSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
