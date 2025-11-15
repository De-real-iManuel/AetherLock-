import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  return (
    <motion.div 
      onClick={onClick}
      className={`p-6 rounded-lg border-2 backdrop-blur-xl transition-all duration-300 cursor-pointer ${
        isActive ? 'border-primary-400 bg-primary-500/10 shadow-lg' :
        isCompleted ? 'border-emerald-400 bg-emerald-500/5' :
        'border-neutral-200 bg-white hover:shadow-md'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
          isCompleted ? 'bg-emerald-100 border-emerald-400' : 
          isActive ? 'bg-primary-100 border-primary-400' : 
          'bg-neutral-100 border-neutral-300'
        }`}>
          {isCompleted ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-neutral-600">Step {step}</span>
            {isActive && <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />}
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          <p className="text-sm text-neutral-600 mt-1">{description}</p>
        </div>
        
        <ArrowRight className={`w-5 h-5 transition-colors ${
          isActive ? 'text-primary-600' : 'text-neutral-400'
        }`} />
      </div>
    </motion.div>
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
    { label: 'Active Escrows', value: stats.escrows, icon: Shield, color: 'text-primary-600' },
    { label: 'Total Volume', value: `${stats.volume.toFixed(0)} SOL`, icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Users', value: stats.users, icon: Users, color: 'text-accent-purple' },
    { label: 'Success Rate', value: `${stats.success.toFixed(1)}%`, icon: CheckCircle, color: 'text-accent-cyan' }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <motion.div 
          key={item.label} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 text-center bg-white rounded-xl border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
          <div className={`text-2xl font-bold ${item.color}`}>
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </div>
          <div className="text-sm text-neutral-600">{item.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

// Main Demo Showcase Component
export default function DemoShowcase() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])
  
  const demoSteps = [
    {
      title: 'Connect Wallet',
      description: 'Connect your Solana wallet to access the protocol',
      icon: <Zap className="w-6 h-6 text-primary-600" />
    },
    {
      title: 'Complete KYC',
      description: 'Verify identity using zkMe zero-knowledge proofs',
      icon: <Shield className="w-6 h-6 text-emerald-600" />
    },
    {
      title: 'Create Escrow',
      description: 'Set up cross-chain escrow with task requirements',
      icon: <Database className="w-6 h-6 text-accent-cyan" />
    },
    {
      title: 'Upload Evidence',
      description: 'Submit proof of task completion to IPFS',
      icon: <Cpu className="w-6 h-6 text-accent-purple" />
    },
    {
      title: 'AI Verification',
      description: 'AI agent analyzes evidence and signs verification',
      icon: <Sparkles className="w-6 h-6 text-yellow-500" />
    },
    {
      title: 'Release Funds',
      description: 'Automatic fund release across all connected chains',
      icon: <Network className="w-6 h-6 text-primary-600" />
    }
  ]

  // Auto-play demo
  React.useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % demoSteps.length
        setCompletedSteps(completed => {
          if (!completed.includes(prev)) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 via-accent-purple to-accent-cyan bg-clip-text text-transparent">
              AetherLock Protocol Demo
            </span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto mb-8">
            Experience the future of decentralized escrow with AI-powered verification and cross-chain compatibility
          </p>
          
          {/* Demo Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlayback}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-purple text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isPlaying ? 'Pause Demo' : 'Start Demo'}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetDemo}
              className="flex items-center space-x-2 px-6 py-3 bg-neutral-200 text-neutral-900 rounded-lg font-medium hover:bg-neutral-300 transition-all"
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
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Interactive Demo Flow</h2>
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
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <div className="p-6 bg-white rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Demo Progress</h3>
              <span className="text-sm text-neutral-600">
                {completedSteps.length} / {demoSteps.length} completed
              </span>
            </div>
            
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps.length / demoSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-primary-600 to-accent-purple"
              />
            </div>
            
            {completedSteps.length === demoSteps.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-4"
              >
                <div className="text-emerald-600 font-medium">
                  ✅ Demo completed successfully! Ready for production deployment.
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
