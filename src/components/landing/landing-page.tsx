import * as React from "react"
import { HeroSection } from "./hero-section"
import { FeatureShowcase } from "./feature-showcase"
import { PageTransition } from "@/components/ui/page-transition"

export const LandingPage = () => {
  return (
    <PageTransition className="min-h-screen">
      <HeroSection />
      <FeatureShowcase />
    </PageTransition>
  )
}