import * as React from "react"
import { HeroSection } from "./hero-section"
import { FeatureShowcase } from "./feature-showcase"
import { PageTransition } from "@/components/ui/page-transition"
import { CyberBackground } from "@/components/3d/cyber-background"

export const LandingPage = () => {
  return (
    <PageTransition className="min-h-screen relative">
      <CyberBackground />
      <HeroSection />
      <FeatureShowcase />
    </PageTransition>
  )
}