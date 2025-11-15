import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FileText,
  Shield,
  Upload,
  Brain,
  CheckCircle,
} from "lucide-react";

// Step Icon Components
const StepIcon = ({ icon: Icon, step }: { icon: any; step: number }) => {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-electric to-accent-cyan rounded-full blur-xl opacity-50" />
      
      {/* Icon container */}
      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-accent-electric/20 to-accent-cyan/20 border-2 border-accent-electric flex items-center justify-center backdrop-blur-sm">
        <Icon className="w-10 h-10 text-accent-electric" />
      </div>
      
      {/* Step number badge */}
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-purple border-2 border-white flex items-center justify-center text-white font-bold text-sm">
        {step}
      </div>
    </div>
  );
};

interface Step {
  title: string;
  description: string;
  icon: any;
}

const steps: Step[] = [
  {
    title: "Create Escrow",
    description: "Client creates an escrow agreement with project details, milestones, and payment terms on the blockchain.",
    icon: FileText,
  },
  {
    title: "Verify Identity",
    description: "Both parties complete zero-knowledge KYC verification through zkMe for secure, privacy-preserving identity confirmation.",
    icon: Shield,
  },
  {
    title: "Submit Work",
    description: "Freelancer completes the work and uploads evidence files to IPFS for permanent, decentralized storage.",
    icon: Upload,
  },
  {
    title: "AI Verification",
    description: "Arcanum AI analyzes the submission, providing objective quality assessment with confidence scores and detailed feedback.",
    icon: Brain,
  },
  {
    title: "Release Funds",
    description: "Upon approval, smart contracts automatically release funds to the freelancer. Disputes can be raised if needed.",
    icon: CheckCircle,
  },
];

// Step Card Component
const StepCard = ({ step, index }: { step: Step; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative group"
    >
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl bg-gradient-to-br from-primary-card/50 to-black/50 border border-accent-electric/20 backdrop-blur-sm hover:border-accent-electric/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent-electric/20">
        {/* Icon */}
        <div className="flex-shrink-0">
          <StepIcon icon={step.icon} step={index + 1} />
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent-electric transition-colors">
            {step.title}
          </h3>
          <p className="text-gray-400 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* Connecting line (except for last step) */}
      {index < steps.length - 1 && (
        <div className="hidden md:block absolute left-10 top-full w-0.5 h-12 bg-gradient-to-b from-accent-electric to-transparent" />
      )}
    </motion.div>
  );
};

// Animated Progress Indicator
const ProgressIndicator = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-200px" });

  return (
    <div ref={ref} className="absolute left-10 top-0 bottom-0 w-0.5 hidden md:block">
      <motion.div
        className="w-full bg-gradient-to-b from-accent-electric via-accent-cyan to-accent-purple"
        initial={{ height: "0%" }}
        animate={isInView ? { height: "100%" } : { height: "0%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </div>
  );
};

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="relative py-20 px-6 bg-gradient-to-b from-black via-primary-background to-black overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-electric rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It <span className="bg-gradient-to-r from-accent-electric to-accent-cyan bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Five simple steps to secure, trustless transactions powered by blockchain and AI
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative space-y-12">
          {/* Animated progress line */}
          <ProgressIndicator />

          {/* Steps */}
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-4">Ready to experience trustless escrow?</p>
          <button
            onClick={() => window.location.href = "/auth"}
            className="px-8 py-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-electric/50 transition-all duration-300 transform hover:scale-105"
          >
            Start Your First Escrow
          </button>
        </motion.div>
      </div>
    </section>
  );
};
