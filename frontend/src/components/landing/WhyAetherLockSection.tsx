import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { HolographicCard } from "@/components/animations/holographic-card";
import {
  Shield,
  Zap,
  Lock,
  Globe,
  TrendingUp,
  Users,
} from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: any;
  color: string;
}

const features: Feature[] = [
  {
    title: "AI-Powered Verification",
    description: "Arcanum AI provides objective, automated quality assessment of work submissions with detailed confidence scores and actionable feedback.",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "Zero-Knowledge KYC",
    description: "Privacy-preserving identity verification through zkMe ensures compliance without compromising user anonymity or personal data.",
    icon: Shield,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Blockchain Security",
    description: "Smart contracts on Solana and ZetaChain ensure trustless, transparent, and immutable escrow agreements with multi-chain support.",
    icon: Lock,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Decentralized Storage",
    description: "IPFS integration via Pinata provides permanent, censorship-resistant storage for all work evidence and project documentation.",
    icon: Globe,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Low Fees",
    description: "Leverage Solana's high throughput and low transaction costs to minimize fees, making escrow accessible for projects of any size.",
    icon: TrendingUp,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "Trust Score System",
    description: "Build reputation through completed transactions. Our transparent trust score system helps clients and freelancers find reliable partners.",
    icon: Users,
    color: "from-pink-500 to-purple-500",
  },
];

// Feature Card Component
const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 50, scale: 0.9 }
      }
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <HolographicCard className="h-full" intensity={0.8}>
        <div className="p-6 h-full flex flex-col">
          {/* Icon with neon glow */}
          <div className="mb-4">
            <div className="relative inline-block">
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-full blur-xl opacity-50`} />
              
              {/* Icon container */}
              <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent-electric transition-colors">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 leading-relaxed flex-1">
            {feature.description}
          </p>

          {/* Hover indicator */}
          <div className="mt-4 flex items-center text-accent-cyan text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Learn more</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </HolographicCard>
    </motion.div>
  );
};

export const WhyAetherLockSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-black via-primary-background to-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Grid pattern */}
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 212, 170, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 212, 170, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-electric rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-purple rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-accent-electric via-accent-cyan to-accent-purple bg-clip-text text-transparent">
              AetherLock
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the future of secure transactions with cutting-edge technology and unparalleled protection
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary-card/30 to-black/30 border border-accent-electric/20 backdrop-blur-sm">
            <div className="text-4xl font-bold text-accent-electric mb-2">99.9%</div>
            <div className="text-gray-400">Uptime Guarantee</div>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary-card/30 to-black/30 border border-accent-cyan/20 backdrop-blur-sm">
            <div className="text-4xl font-bold text-accent-cyan mb-2">&lt;$0.01</div>
            <div className="text-gray-400">Average Transaction Fee</div>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary-card/30 to-black/30 border border-accent-purple/20 backdrop-blur-sm">
            <div className="text-4xl font-bold text-accent-purple mb-2">24/7</div>
            <div className="text-gray-400">AI Verification Available</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
