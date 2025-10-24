import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Sphere, Box, Torus } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/web'
import confetti from 'canvas-confetti'
import { soundManager } from '../../utils/sounds'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Cpu,
  Database,
  Network
} from 'lucide-react'
import { GlitchText } from '../animations/glitch-text'
import { HolographicCard } from '../animations/holographic-card'
import { NeonProgress } from '../animations/neon-progress'
import { LoadingSpinner } from '../animations/loading-spinner'
import { SuccessAnimation } from '../animations/success-animation'

// 3D AetherLock Logo Component
function AetherLockLogo3D() {
  return (
    <group>
      {/* Central core */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      {/* Orbiting rings */}
      {[0, 1, 2].map((i) => (
        <motion.group
          key={i}
          animate={{ rotateY: 360, rotateX: 180 }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <Torus 
            args={[1 + i * 0.3, 0.05, 16, 100]} 
            rotation={[Math.PI / 4 * i, 0, 0]}
          >
            <meshStandardMaterial 
              color={['#00ffff', '#ff00ff', '#ffff00'][i]} 
              emissive={['#00ffff', '#ff00ff', '#ffff00'][i]} 
              emissiveIntensity={0.2}
            />
          </Torus>
        </motion.group>
      ))}
      
      {/* Floating data cubes */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.group
          key={`cube-${i}`}
          position={[
            Math.cos((i * Math.PI) / 4) * 2,
            Math.sin((i * Math.PI) / 4) * 2,
            Math.sin(i) * 0.5
          ]}
          animate={{
            y: [0, 0.5, 0],
            rotateX: 360,
            rotateY: 360
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Box args={[0.1, 0.1, 0.1]}>
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff" 
              emissiveIntensity={0.1}
            />
          </Box>
        </motion.group>
      ))}
      
      {/* Protocol text */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        AETHERLOCK
      </Text>
    </group>
  )
}

// Demo Flow Step Component
interface DemoStepProps {
  step: number
  title: string
  description: string
  icon: React.ReactNode
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}

function DemoStep({ step, title, description, icon, isActive, isCompleted, onClick }: DemoStepProps) {
  const stepSpring = useSpring({
    scale: isActive ? 1.05 : 1,
    borderColor: isActive ? '#00ffff' : isCompleted ? '#00ff00' : '#666666',
    backgroundColor: isActive ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.5)',
    config: { tension: 300, friction: 30 }
  })

  return (
    <animated.div 
      style={stepSpring}
      onClick={onClick}
      className="cursor-pointer p-6 rounded-lg border-2 backdrop-blur-xl transition-all duration-300 hover:shadow-lg"
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
          isCompleted ? 'bg-green-500/20 border-green-400' : 
          isActive ? 'bg-cyan-500/20 border-cyan-400' : 
          'bg-slate-500/20 border-slate-400'
        }`}>
          {isCompleted ? <CheckCircle className="w-6 h-6 text-green-400" /> : icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-400">Step {step}</span>
            {isActive && <LoadingSpinner size="sm" />}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
        
        <ArrowRight className={`w-5 h-5 transition-colors ${
          isActive ? 'text-cyan-400' : 'text-slate-600'
        }`} />
      </div>
    </animated.div>
  )
}

// Animated Statistics Display
function AnimatedStats() {
  const [stats, setStats] = React.useState({
    escrows: 0,
    volume: 0,
    users: 0,
    success: 0
  })

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        escrows: Math.min(prev.escrows + Math.floor(Math.random() * 3), 1247),
        volume: Math.min(prev.volume + Math.floor(Math.random() * 50), 8950),
        users: Math.min(prev.users + Math.floor(Math.random() * 2), 3420),
        success: Math.min(prev.success + 0.1, 98.7)
      }))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const statItems = [
    { label: 'Active Escrows', value: stats.escrows, icon: Shield, color: 'text-cyan-400' },
    { label: 'Total Volume', value: `${stats.volume.toFixed(0)} SOL`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Users', value: stats.users, icon: Users, color: 'text-purple-400' },
    { label: 'Success Rate', value: `${stats.success.toFixed(1)}%`, icon: CheckCircle, color: 'text-blue-400' }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <HolographicCard key={item.label} className="p-4 text-center bg-slate-900/50 border border-slate-700/50">
          <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
          <div className={`text-2xl font-bold ${item.color}`}>
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </div>
          <div className="text-sm text-slate-400">{item.label}</div>
        </HolographicCard>
      ))}
    </div>
  )
}

// Interactive Architecture Diagram
function ArchitectureDiagram() {
  const [activeComponent, setActiveComponent] = React.useState<string | null>(null)
  
  const components = [
    { id: 'frontend', name: 'React Frontend', position: { x: 20, y: 20 }, color: '#61DAFB' },
    { id: 'solana', name: 'Solana Program', position: { x: 80, y: 20 }, color: '#9945FF' },
    { id: 'ai-agent', name: 'AI Agent', position: { x: 20, y: 80 }, color: '#FF6B6B' },
    { id: 'zetachain', name: 'ZetaChain', position: { x: 80, y: 80 }, color: '#00D4AA' },
    { id: 'ipfs', name: 'IPFS Storage', position: { x: 50, y: 50 }, color: '#65C3F7' }
  ]

  return (
    <HolographicCard className="p-6 bg-slate-900/50 border border-cyan-500/30">
      <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">System Architecture</h3>
      
      <div className="relative h-64 bg-slate-800/30 rounded-lg overflow-hidden">
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full">
          {components.map((comp, i) => 
            components.slice(i + 1).map((otherComp, j) => (
              <motion.line
                key={`${i}-${j}`}
                x1={`${comp.position.x}%`}
                y1={`${comp.position.y}%`}
                x2={`${otherComp.position.x}%`}
                y2={`${otherComp.position.y}%`}
                stroke={activeComponent === comp.id || activeComponent === otherComp.id ? '#00ffff' : '#666666'}
                strokeWidth={activeComponent === comp.id || activeComponent === otherComp.id ? 2 : 1}
                opacity={0.6}
                animate={{
                  strokeDasharray: activeComponent === comp.id || activeComponent === otherComp.id ? '5,5' : '0,0'
                }}
                transition={{ duration: 0.3 }}
              />
            ))
          )}
        </svg>
        
        {/* Component nodes */}
        {components.map((component) => (
          <motion.div
            key={component.id}
            className="absolute w-16 h-16 rounded-full border-2 flex items-center justify-center cursor-pointer text-xs font-medium text-white"
            style={{
              left: `${component.position.x}%`,
              top: `${component.position.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: `${component.color}20`,
              borderColor: component.color
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setActiveComponent(component.id)}
            onMouseLeave={() => setActiveComponent(null)}
          >
            <div className="text-center">
              <div className="w-6 h-6 mx-auto mb-1 rounded" style={{ backgroundColor: component.color }} />
              <div className="text-xs">{component.name.split(' ')[0]}</div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {activeComponent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600/50"
        >
          <div className="text-sm text-white font-medium">
            {components.find(c => c.id === activeComponent)?.name}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {activeComponent === 'frontend' && 'React dashboard with 3D animations and wallet integration'}
            {activeComponent === 'solana' && 'Smart contracts for escrow management and fund custody'}
            {activeComponent === 'ai-agent' && 'AWS Bedrock AI for task verification and evidence analysis'}
            {activeComponent === 'zetachain' && 'Universal apps for cross-chain escrow synchronization'}
            {activeComponent === 'ipfs' && 'Decentralized storage for evidence files and metadata'}
          </div>
        </motion.div>
      )}
    </HolographicCard>
  )
}

// Main Demo Showcase Component
export function DemoShowcase() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  const demoSteps = [
    {
      title: 'Connect Wallet',
      description: 'Connect your Solana wallet to access the protocol',
      icon: <Zap className="w-6 h-6 text-cyan-400" />
    },
    {
      title: 'Complete KYC',
      description: 'Verify identity using zkMe zero-knowledge proofs',
      icon: <Shield className="w-6 h-6 text-green-400" />
    },
    {
      title: 'Create Escrow',
      description: 'Set up cross-chain escrow with task requirements',
      icon: <Database className="w-6 h-6 text-blue-400" />
    },
    {
      title: 'Upload Evidence',
      description: 'Submit proof of task completion to IPFS',
      icon: <Cpu className="w-6 h-6 text-purple-400" />
    },
    {
      title: 'AI Verification',
      description: 'AI agent analyzes evidence and signs verification',
      icon: <Sparkles className="w-6 h-6 text-yellow-400" />
    },
    {
      title: 'Release Funds',
      description: 'Automatic fund release across all connected chains',
      icon: <Network className="w-6 h-6 text-pink-400" />
    }
  ]

  // Auto-play demo
  React.useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % demoSteps.length
        
        // Mark current step as completed
        setCompletedSteps(completed => {
          if (!completed.includes(prev)) {
            // Trigger confetti and sound for completion
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 }
            })
            soundManager.success()
            return [...completed, prev]
          }
          return completed
        })
        
        return nextStep
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, demoSteps.length])

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setIsPlaying(false)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setCompletedSteps([])
    setIsPlaying(false)
  }

  // Simulate initial loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-cyan-400 text-xl">Initializing AetherLock Protocol...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 60 }}
          performance={{ min: 0.5 }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ff00ff" />
          
          <React.Suspense fallback={null}>
            <AetherLockLogo3D />
          </React.Suspense>
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <GlitchText 
            text="AETHERLOCK PROTOCOL DEMO" 
            className="text-3xl sm:text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-6"
          />
          <div className="text-sm sm:text-xl text-slate-400 max-w-3xl mx-auto mb-8 px-4">
            Experience the future of decentralized escrow with AI-powered verification and cross-chain compatibility
          </div>
          
          {/* Demo Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlayback}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isPlaying ? 'Pause Demo' : 'Start Demo'}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetDemo}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-700 rounded-lg font-medium hover:bg-slate-600 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Live Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <AnimatedStats />
        </motion.div>

        {/* Demo Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* Demo Steps */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">Interactive Demo Flow</h2>
            {demoSteps.map((step, index) => (
              <DemoStep
                key={index}
                step={index + 1}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isActive={currentStep === index}
                isCompleted={completedSteps.includes(index)}
                onClick={() => handleStepClick(index)}
              />
            ))}
          </div>
          
          {/* Architecture Diagram */}
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">System Architecture</h2>
            <ArchitectureDiagram />
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <HolographicCard className="p-6 bg-slate-900/50 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Demo Progress</h3>
              <span className="text-sm text-slate-400">
                {completedSteps.length} / {demoSteps.length} completed
              </span>
            </div>
            
            <NeonProgress 
              value={(completedSteps.length / demoSteps.length) * 100} 
              className="mb-4"
            />
            
            {completedSteps.length === demoSteps.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <SuccessAnimation />
                <div className="text-green-400 font-medium mt-2">
                  🎉 Demo completed successfully! Ready for production deployment.
                </div>
              </motion.div>
            )}
          </HolographicCard>
        </motion.div>
      </div>
    </div>
  )
}