import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NeonProgress } from "@/components/animations/neon-progress"
import { LoadingSpinner } from "@/components/animations/loading-spinner"
import { SuccessAnimation } from "@/components/animations/success-animation"
import { Upload, Brain, Shield, CheckCircle, AlertCircle } from "lucide-react"

interface VerificationStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: "pending" | "processing" | "completed" | "failed"
  progress?: number
}

interface AIVerificationVisualizerProps {
  escrowId: string
  isVisible: boolean
  onClose: () => void
}

export const AIVerificationVisualizer = ({ 
  escrowId, 
  isVisible, 
  onClose 
}: AIVerificationVisualizerProps) => {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [steps, setSteps] = React.useState<VerificationStep[]>([
    {
      id: "upload",
      title: "Uploading Evidence",
      description: "Uploading files to IPFS storage",
      icon: Upload,
      status: "processing",
      progress: 0
    },
    {
      id: "ai-processing", 
      title: "AI Processing",
      description: "Analyzing evidence with AWS Bedrock",
      icon: Brain,
      status: "pending"
    },
    {
      id: "signature",
      title: "Signature Submitted", 
      description: "Cryptographic signature generated",
      icon: Shield,
      status: "pending"
    },
    {
      id: "verified",
      title: "Verified",
      description: "Verification complete and recorded",
      icon: CheckCircle,
      status: "pending"
    }
  ])

  React.useEffect(() => {
    if (!isVisible) return

    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)
        
        // Update current step to processing
        setSteps(prev => prev.map((step, idx) => 
          idx === i ? { ...step, status: "processing" as const } : step
        ))

        // Simulate progress for upload step
        if (i === 0) {
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100))
            setSteps(prev => prev.map((step, idx) => 
              idx === i ? { ...step, progress } : step
            ))
          }
        } else {
          // Other steps take 2-3 seconds
          await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
        }

        // Mark as completed
        setSteps(prev => prev.map((step, idx) => 
          idx === i ? { ...step, status: "completed" as const } : step
        ))
      }
    }

    processSteps()
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-cyberpunk-500/30">
          <CardHeader>
            <CardTitle className="text-cyberpunk-400 text-center">
              AI Verification in Progress
            </CardTitle>
            <p className="text-center text-gray-400">
              Escrow ID: {escrowId.slice(0, 8)}...{escrowId.slice(-8)}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = step.status === "completed"
              const isFailed = step.status === "failed"
              
              return (
                <motion.div
                  key={step.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300 ${
                    isActive 
                      ? "border-cyberpunk-500/50 bg-cyberpunk-500/10" 
                      : isCompleted
                      ? "border-green-500/50 bg-green-500/10"
                      : isFailed
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-gray-700 bg-gray-800/30"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? "bg-green-500" 
                      : isActive 
                      ? "bg-cyberpunk-500" 
                      : "bg-gray-600"
                  }`}>
                    {isActive && step.status === "processing" ? (
                      <LoadingSpinner size="sm" />
                    ) : isCompleted ? (
                      <SuccessAnimation size="sm" />
                    ) : (
                      <Icon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      isCompleted ? "text-green-400" : isActive ? "text-cyberpunk-400" : "text-white"
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                    
                    {isActive && step.progress !== undefined && (
                      <div className="mt-2">
                        <NeonProgress 
                          progress={step.progress} 
                          color="#00d4aa"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className={`w-4 h-4 rounded-full ${
                    isCompleted 
                      ? "bg-green-500" 
                      : isActive 
                      ? "bg-cyberpunk-500 animate-pulse" 
                      : "bg-gray-600"
                  }`} />
                </motion.div>
              )
            })}
            
            {steps.every(step => step.status === "completed") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <SuccessAnimation size="lg" onComplete={onClose} />
                <p className="text-green-400 font-semibold mt-4">
                  Verification Complete!
                </p>
                <p className="text-gray-400 text-sm">
                  Your escrow has been successfully verified by AI
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}