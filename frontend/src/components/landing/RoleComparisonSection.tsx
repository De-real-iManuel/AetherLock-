import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoleFeature {
  text: string;
  highlight?: boolean;
}

const clientFeatures: RoleFeature[] = [
  { text: "Post unlimited projects", highlight: true },
  { text: "AI-verified work submissions" },
  { text: "Escrow protection for payments" },
  { text: "Access to verified freelancers" },
  { text: "Real-time project tracking" },
  { text: "Dispute resolution support" },
  { text: "Multi-chain payment options" },
];

const freelancerFeatures: RoleFeature[] = [
  { text: "Browse verified projects", highlight: true },
  { text: "Secure payment guarantees" },
  { text: "Build your trust score" },
  { text: "IPFS work documentation" },
  { text: "Direct client communication" },
  { text: "Low transaction fees" },
  { text: "Global payment access" },
];

const FeatureList = ({ features, color }: { features: RoleFeature[]; color: string }) => {
  return (
    <ul className="space-y-4">
      {features.map((feature, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="flex items-start gap-3"
        >
          <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r ${color} flex items-center justify-center mt-0.5`}>
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className={`text-gray-300 ${feature.highlight ? "font-semibold text-white" : ""}`}>
            {feature.text}
          </span>
        </motion.li>
      ))}
    </ul>
  );
};

export const RoleComparisonSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-primary-background to-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent-electric rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent-purple rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-accent-electric to-accent-purple bg-clip-text text-transparent">
              Path
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Whether you're hiring talent or offering services, AetherLock has you covered
          </p>
        </motion.div>

        {/* Split Screen Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
          {/* Client Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="p-8 md:p-12 rounded-2xl lg:rounded-r-none bg-gradient-to-br from-accent-electric/10 to-black/50 border-2 border-accent-electric/30 backdrop-blur-sm hover:border-accent-electric/60 transition-all duration-300 h-full">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-electric to-transparent opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300 rounded-2xl lg:rounded-r-none" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-electric to-accent-cyan flex items-center justify-center mb-6 shadow-lg shadow-accent-electric/50">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold text-white mb-4">
                  For Clients
                </h3>
                <p className="text-gray-400 mb-8">
                  Hire verified talent with confidence. Pay only for quality work.
                </p>

                {/* Features */}
                <FeatureList features={clientFeatures} color="from-accent-electric to-accent-cyan" />

                {/* CTA Button */}
                <button
                  onClick={() => navigate("/auth")}
                  className="mt-8 w-full px-6 py-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-electric/50 transition-all duration-300 transform hover:scale-105"
                >
                  Start Hiring
                </button>
              </div>
            </div>
          </motion.div>

          {/* Divider Line */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3/4 bg-gradient-to-b from-transparent via-accent-cyan to-transparent" />

          {/* Freelancer Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="p-8 md:p-12 rounded-2xl lg:rounded-l-none bg-gradient-to-br from-accent-purple/10 to-black/50 border-2 border-accent-purple/30 backdrop-blur-sm hover:border-accent-purple/60 transition-all duration-300 h-full">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-l from-accent-purple to-transparent opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300 rounded-2xl lg:rounded-l-none" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center mb-6 shadow-lg shadow-accent-purple/50">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold text-white mb-4">
                  For Freelancers
                </h3>
                <p className="text-gray-400 mb-8">
                  Find quality projects. Get paid securely and on time.
                </p>

                {/* Features */}
                <FeatureList features={freelancerFeatures} color="from-accent-purple to-accent-pink" />

                {/* CTA Button */}
                <button
                  onClick={() => navigate("/auth")}
                  className="mt-8 w-full px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-purple/50 transition-all duration-300 transform hover:scale-105"
                >
                  Start Earning
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
