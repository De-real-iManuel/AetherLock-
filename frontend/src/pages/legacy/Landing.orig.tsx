import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, Globe, Brain, Lock, TrendingUp } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="particle-field" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8 flex justify-center"
          >
            <img 
              src="/aetherlock-logo.png" 
              alt="AetherLock" 
              className="w-32 h-32 drop-shadow-[0_0_50px_rgba(139,92,246,0.8)] animate-float"
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            AetherLock
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl text-gray-300 mb-4"
          >
            AI-Native Universal Escrow Protocol
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Powered by Chainlink Oracles, zkMe KYC, and ZetaChain Cross-Chain Technology
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link to="/auth">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-lg hover:scale-105 transition-transform neon-glow">
                Launch App
              </button>
            </Link>
            <a href="#features">
              <button className="px-8 py-4 border-2 border-purple-500 rounded-lg font-semibold text-lg hover:bg-purple-500/20 transition-colors">
                Learn More
              </button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { label: 'Total Value Locked', value: '$2.5M+' },
              { label: 'Transactions', value: '10K+' },
              { label: 'Success Rate', value: '99.8%' },
              { label: 'Chains Supported', value: '4+' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
          >
            Revolutionary Features
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-12 h-12" />,
                title: 'AI Verification',
                desc: 'Gemini-powered task validation with cryptographic proof via Chainlink oracles'
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: 'zkMe KYC',
                desc: 'Zero-knowledge identity verification for compliant, private transactions'
              },
              {
                icon: <Globe className="w-12 h-12" />,
                title: 'Universal Cross-Chain',
                desc: 'Seamless escrow across Solana, Sui, TON via ZetaChain gateway'
              },
              {
                icon: <Zap className="w-12 h-12" />,
                title: 'Chainlink Automation',
                desc: 'Decentralized oracle network bridges AI verification to on-chain execution'
              },
              {
                icon: <Lock className="w-12 h-12" />,
                title: '10% Protocol Fee',
                desc: 'Transparent, fair fee structure with automatic treasury distribution'
              },
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: 'Dispute Resolution',
                desc: 'Multi-agent AI mediation with 48-hour resolution window'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-slate-900/50 border border-purple-500/30 hover:border-purple-500 transition-all hover:scale-105 gradient-border"
              >
                <div className="text-cyan-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
          >
            How It Works
          </motion.h2>

          <div className="space-y-8">
            {[
              { step: '1', title: 'Connect & Verify', desc: 'Multi-chain wallet + zkMe KYC verification' },
              { step: '2', title: 'Create Escrow', desc: 'Define terms, amount, and AI verification criteria' },
              { step: '3', title: 'Submit Evidence', desc: 'Upload proof to IPFS, trigger Chainlink oracle request' },
              { step: '4', title: 'AI Analysis', desc: 'Gemini AI analyzes evidence, Chainlink sends cryptographic hash on-chain' },
              { step: '5', title: 'Auto-Release', desc: 'Smart contract releases funds (90% seller, 10% protocol)' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 p-6 rounded-xl bg-slate-900/50 border border-purple-500/30"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-purple-500/50"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to Experience the Future?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands using AetherLock for secure, AI-verified cross-chain escrow
            </p>
            <Link to="/auth">
              <button className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold text-xl hover:scale-105 transition-transform neon-glow">
                Get Started Now
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
