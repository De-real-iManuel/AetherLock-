import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Float, Sphere } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import { useInView } from 'react-intersection-observer'
import { Wallet, Shield, Zap, Globe, Activity, TrendingUp } from 'lucide-react'
import { useWalletStore } from '../../store/walletStore'
import { useEscrowStore } from '../../store/escrowStore'
import { HolographicCard } from '../animations/holographic-card'
import { GlitchText } from '../animations/glitch-text'
import { NeonProgress } from '../animations/neon-progress'
import { ParticleField } from '../ui/particle-field'

// Floating 3D Elements Component
function FloatingElements() {
  return (
    <>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere args={[0.1, 16, 16]} position={[-2, 1, -1]}>
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} />
        </Sphere>
      </Float>
      
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        <Sphere args={[0.05, 12, 12]} position={[2, -1, -0.5]}>
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.4} />
        </Sphere>
      </Float>
      
      <Float speed={1.2} rotationIntensity={0.7} floatIntensity={0.3}>
        <Sphere args={[0.08, 14, 14]} position={[0, 2, -2]}>
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.2} />
        </Sphere>
      </Float>
    </>
  )
}

// 3D Background Scene
function CyberBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ff00ff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <FloatingElements />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  )
}

// Animated Statistics Card
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  delay?: number
}

function AnimatedStatCard({ title, value, icon, trend, delay = 0 }: StatCardProps) {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true })
  
  const springProps = useSpring({
    from: { opacity: 0, transform: 'translateY(50px) rotateX(-10deg)' },
    to: { 
      opacity: inView ? 1 : 0, 
      transform: inView ? 'translateY(0px) rotateX(0deg)' : 'translateY(50px) rotateX(-10deg)' 
    },
    delay: delay * 100,
    config: { tension: 280, friction: 60 }
  })

  const countUp = useSpring({
    from: { number: 0 },
    to: { number: inView ? (typeof value === 'number' ? value : 0) : 0 },
    delay: delay * 100 + 200,
    config: { duration: 2000 }
  })

  return (
    <animated.div ref={ref} style={springProps}>
      <HolographicCard className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-cyan-500/30 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </h3>
          <div className="text-3xl font-bold text-white">
            {typeof value === 'number' ? (
              <animated.span>
                {countUp.number.to(n => Math.floor(n).toLocaleString())}
              </animated.span>
            ) : (
              <GlitchText text={value} />
            )}
          </div>
        </div>
      </HolographicCard>
    </animated.div>
  )
}

// Enhanced Balance Display
function EnhancedBalanceDisplay() {
  const { balance, isConnected } = useWalletStore()
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })

  const balanceSpring = useSpring({
    from: { scale: 0.8, opacity: 0 },
    to: { scale: inView ? 1 : 0.8, opacity: inView ? 1 : 0 },
    config: { tension: 300, friction: 30 }
  })

  const glowSpring = useSpring({
    from: { boxShadow: '0 0 0px rgba(0, 255, 255, 0)' },
    to: { 
      boxShadow: inView 
        ? '0 0 40px rgba(0, 255, 255, 0.3), 0 0 80px rgba(0, 255, 255, 0.1)' 
        : '0 0 0px rgba(0, 255, 255, 0)' 
    },
    config: { duration: 1000 }
  })

  if (!isConnected) return null

  return (
    <animated.div 
      ref={ref} 
      style={{ ...balanceSpring, ...glowSpring }}
      className="relative"
    >
      <HolographicCard className="p-8 bg-gradient-to-r from-slate-900/90 to-slate-800/70 border-2 border-cyan-400/50 backdrop-blur-xl">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Wallet className="w-6 h-6 text-cyan-400" />
            <span className="text-slate-400 uppercase tracking-wider text-sm font-medium">
              Wallet Balance
            </span>
          </div>
          
          <div className="relative">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              {balance?.toFixed(4) || '0.0000'}
            </div>
            <div className="text-lg text-slate-400 mt-2">SOL</div>
            
            {/* Animated pulse effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-lg blur-xl animate-pulse" />
          </div>
          
          <NeonProgress value={75} className="mt-4" />
          <div className="text-xs text-slate-500">Portfolio Performance: +12.5%</div>
        </div>
      </HolographicCard>
    </animated.div>
  )
}

// Floating Action Button
function FloatingActionButton() {
  const [isHovered, setIsHovered] = React.useState(false)
  
  const buttonSpring = useSpring({
    transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
    boxShadow: isHovered 
      ? '0 20px 40px rgba(0, 255, 255, 0.4), 0 0 60px rgba(0, 255, 255, 0.2)'
      : '0 10px 20px rgba(0, 255, 255, 0.2)',
    config: { tension: 300, friction: 20 }
  })

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
    >
      <animated.button
        style={buttonSpring}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg border border-cyan-400/50 backdrop-blur-sm"
      >
        <Zap className="w-8 h-8" />
      </animated.button>
    </motion.div>
  )
}

// Main Enhanced Dashboard Component
export function EnhancedDashboard() {
  const { escrows } = useEscrowStore()
  const { isConnected } = useWalletStore()
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 3D Background */}
      <CyberBackground />
      
      {/* Particle Field Overlay */}
      <ParticleField />
      
      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-6 py-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="text-center space-y-4">
            <GlitchText 
              text="AETHERLOCK PROTOCOL" 
              className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
            />
            <div className="text-xl text-slate-400 max-w-2xl mx-auto">
              Next-generation decentralized escrow with AI-powered verification
            </div>
          </div>
        </motion.div>

        {/* Balance Display */}
        {isConnected && (
          <motion.div variants={itemVariants} className="mb-12 flex justify-center">
            <EnhancedBalanceDisplay />
          </motion.div>
        )}

        {/* Statistics Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <AnimatedStatCard
            title="Active Escrows"
            value={escrows.length}
            icon={<Shield className="w-6 h-6 text-cyan-400" />}
            trend={15}
            delay={0}
          />
          <AnimatedStatCard
            title="Total Volume"
            value="1,247.8"
            icon={<Activity className="w-6 h-6 text-blue-400" />}
            trend={8}
            delay={1}
          />
          <AnimatedStatCard
            title="Success Rate"
            value="98.7%"
            icon={<TrendingUp className="w-6 h-6 text-green-400" />}
            trend={2}
            delay={2}
          />
          <AnimatedStatCard
            title="Network Status"
            value="ONLINE"
            icon={<Globe className="w-6 h-6 text-purple-400" />}
            delay={3}
          />
        </motion.div>

        {/* Interactive Network Visualization */}
        <motion.div variants={itemVariants} className="mb-12">
          <HolographicCard className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-cyan-500/30 backdrop-blur-xl">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-cyan-400">Network Activity</h2>
              
              {/* Animated connection lines */}
              <div className="relative h-64 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 flex items-center justify-center">
                    <div className="text-lg font-bold text-cyan-400">CORE</div>
                  </div>
                </div>
                
                {/* Orbiting nodes */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 flex items-center justify-center"
                    animate={{
                      rotate: 360,
                      x: Math.cos((i * Math.PI) / 2) * 100,
                      y: Math.sin((i * Math.PI) / 2) * 100,
                    }}
                    transition={{
                      duration: 10 + i * 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  </motion.div>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">24</div>
                  <div className="text-slate-400">Active Nodes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">156</div>
                  <div className="text-slate-400">Transactions/min</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">99.9%</div>
                  <div className="text-slate-400">Uptime</div>
                </div>
              </div>
            </div>
          </HolographicCard>
        </motion.div>
      </motion.div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  )
}