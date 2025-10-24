import * as React from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HolographicCard } from "@/components/animations/holographic-card"
import { Brain, Shield, Zap } from "lucide-react"
import { containerVariants, itemVariants } from "@/lib/animations"

const features = [
  {
    icon: Brain,
    title: "AI Verification",
    description: "Advanced AI agents analyze evidence and verify task completion with cryptographic signatures",
    color: "accent-cyan",
    gradient: "from-accent-cyan to-blue-400"
  },
  {
    icon: Shield,
    title: "zkKYC Identity",
    description: "Zero-knowledge KYC ensures compliance while preserving user privacy and anonymity",
    color: "accent-purple",
    gradient: "from-accent-purple to-purple-400"
  },
  {
    icon: Zap,
    title: "Cross-Chain",
    description: "Seamless escrow across Solana, ZetaChain, Sui, and TON with unified verification",
    color: "accent-electric",
    gradient: "from-accent-electric to-green-400"
  }
]

export const FeatureShowcase = () => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-20 px-6 bg-primary-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Next-Gen Escrow Features
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Revolutionary technology stack combining AI, blockchain, and zero-knowledge proofs
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <HolographicCard className="h-full">
                  <Card className="h-full border-0 bg-transparent">
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-black" />
                      </div>
                      <CardTitle className={`text-${feature.color}`}>
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-center leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </HolographicCard>
              </motion.div>
            )
          })
        </motion.div>
      </div>
    </section>
  )
}