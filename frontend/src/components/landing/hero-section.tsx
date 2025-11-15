import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ParticleField } from "@/components/ui/particle-field"
import { GlitchText } from "@/components/animations/glitch-text"
import { FloatingLogoCanvas } from "@/components/3d/floating-logo"

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = React.useState("")
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i))
        i++
        if (i > text.length) clearInterval(interval)
      }, 50)
      return () => clearInterval(interval)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [text, delay])

  return <span>{displayText}</span>
}

export const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary-background">
      <ParticleField particleCount={80} className="opacity-40" />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <FloatingLogoCanvas />
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
            <GlitchText text="Trustless AI Escrow" className="block" />
            <br />
            <span className="text-cyberpunk-400">
              <TypewriterText text="for Web3 Transactions" delay={1500} />
            </span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.8 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto"
          >
            Secure, decentralized escrow powered by AI verification and zero-knowledge identity
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              variant="cyber" 
              size="lg"
              className="text-lg px-8 py-3"
              onClick={() => navigate('/dashboard')}
            >
              Launch Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-3"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-background/50" />
    </section>
  )
}