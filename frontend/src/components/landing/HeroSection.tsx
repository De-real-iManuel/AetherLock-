import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ParticleBackground";
import { NeonGrid } from "@/components/animations/NeonGrid";
import { BlockchainStats } from "@/types/models";

// 3D Rotating Logo Component
const RotatingLogo = () => {
  return (
    <motion.div
      className="w-32 h-32 mx-auto mb-8"
      animate={{
        rotateY: [0, 360],
        rotateX: [0, 15, 0],
      }}
      transition={{
        rotateY: {
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        },
        rotateX: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div className="relative w-full h-full">
        {/* Logo placeholder - replace with actual logo */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-electric via-accent-cyan to-accent-purple opacity-80 blur-xl" />
        <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-accent-electric to-accent-purple flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
          AL
        </div>
      </div>
    </motion.div>
  );
};

// Blockchain Stats Display Component
const BlockchainStatsDisplay = ({ stats }: { stats: BlockchainStats | null }) => {
  if (!stats) {
    return (
      <div className="flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
          <span className="text-gray-400">Loading stats...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
      className="flex flex-wrap justify-center gap-6 text-sm"
    >
      {/* Solana TPS */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            stats.solana.status === "online"
              ? "bg-green-500"
              : stats.solana.status === "degraded"
              ? "bg-yellow-500"
              : "bg-red-500"
          } animate-pulse`}
        />
        <span className="text-gray-300">
          Solana: <span className="text-accent-electric font-semibold">{stats.solana.tps} TPS</span>
        </span>
      </div>

      {/* ZetaChain Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            stats.zetachain.status === "online" ? "bg-green-500" : "bg-red-500"
          } animate-pulse`}
        />
        <span className="text-gray-300">
          ZetaChain: <span className="text-accent-cyan font-semibold">{stats.zetachain.connectedChains} Chains</span>
        </span>
      </div>

      {/* IPFS Uptime */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            stats.ipfs.status === "online" ? "bg-green-500" : "bg-red-500"
          } animate-pulse`}
        />
        <span className="text-gray-300">
          IPFS: <span className="text-accent-purple font-semibold">{stats.ipfs.uptime}% Uptime</span>
        </span>
      </div>

      {/* AI Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            stats.ai.status === "active" ? "bg-green-500" : "bg-red-500"
          } animate-pulse`}
        />
        <span className="text-gray-300">
          AI: <span className="text-accent-electric font-semibold">{stats.ai.model}</span>
        </span>
      </div>
    </motion.div>
  );
};

export const HeroSection = () => {
  const navigate = useNavigate();
  const [blockchainStats, setBlockchainStats] = useState<BlockchainStats | null>(null);

  // Fetch live blockchain stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Mock data for now - replace with actual API calls
        const stats: BlockchainStats = {
          solana: {
            tps: Math.floor(Math.random() * 3000) + 2000,
            blockHeight: 250000000,
            status: "online",
          },
          zetachain: {
            status: "online",
            connectedChains: 7,
          },
          ipfs: {
            uptime: 99.9,
            status: "online",
          },
          ai: {
            model: "Arcanum v2",
            status: "active",
            responseTime: 1.2,
          },
        };
        setBlockchainStats(stats);
      } catch (error) {
        console.error("Failed to fetch blockchain stats:", error);
      }
    };

    fetchStats();
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-primary-background to-black">
      {/* Animated Neon Grid Background */}
      <div className="absolute inset-0 opacity-30">
        <NeonGrid gridSize={50} glowColor="rgba(0, 212, 170, 0.3)" />
      </div>

      {/* Floating Particle System */}
      <ParticleBackground />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* 3D Rotating Logo */}
          <RotatingLogo />

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white leading-tight"
          >
            <span className="bg-gradient-to-r from-accent-electric via-accent-cyan to-accent-purple bg-clip-text text-transparent">
              AetherLock
            </span>
            <br />
            <span className="text-3xl md:text-5xl text-gray-300">
              Trustless AI Escrow
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            Secure, decentralized escrow powered by{" "}
            <span className="text-accent-electric font-semibold">AI verification</span>,{" "}
            <span className="text-accent-cyan font-semibold">zero-knowledge identity</span>, and{" "}
            <span className="text-accent-purple font-semibold">blockchain technology</span>
          </motion.p>

          {/* Live Blockchain Stats */}
          <BlockchainStatsDisplay stats={blockchainStats} />

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Button
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 bg-gradient-to-r from-accent-electric to-accent-cyan hover:from-accent-cyan hover:to-accent-electric transition-all duration-300 shadow-lg hover:shadow-accent-electric/50 transform hover:scale-105"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Scroll to how it works section
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-lg px-8 py-6 border-2 border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 transition-all duration-300"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
};
