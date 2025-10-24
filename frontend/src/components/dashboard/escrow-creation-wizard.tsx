import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NeonProgress } from "@/components/animations/neon-progress"
import { useNotificationStore } from "@/store/notificationStore"
import { ArrowLeft, ArrowRight, Upload, Check } from "lucide-react"

interface EscrowFormData {
  sellerAddress: string
  amount: string
  token: string
  description: string
  deadline: string
  evidenceFiles: File[]
}

const steps = [
  { id: 1, title: "Escrow Details", description: "Set up basic escrow parameters" },
  { id: 2, title: "Task Description", description: "Describe the work to be completed" },
  { id: 3, title: "Evidence Upload", description: "Upload initial evidence or requirements" },
  { id: 4, title: "Review & Create", description: "Review and confirm escrow creation" }
]

export const EscrowCreationWizard = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState<EscrowFormData>({
    sellerAddress: "",
    amount: "",
    token: "SOL",
    description: "",
    deadline: "",
    evidenceFiles: []
  })
  const [isCreating, setIsCreating] = React.useState(false)
  const { addNotification } = useNotificationStore()

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = async () => {
    setIsCreating(true)
    // Simulate escrow creation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    addNotification({
      type: 'success',
      title: 'Escrow Created',
      message: 'Your escrow has been successfully created!'
    })
    
    setIsCreating(false)
    onClose()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Seller Address
              </label>
              <Input
                placeholder="Enter seller's wallet address"
                value={formData.sellerAddress}
                onChange={(e) => setFormData({...formData, sellerAddress: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Amount
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Token
                </label>
                <select 
                  className="w-full h-9 px-3 rounded-md border border-gray-700 bg-gray-800 text-white"
                  value={formData.token}
                  onChange={(e) => setFormData({...formData, token: e.target.value})}
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Deadline
              </label>
              <Input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Task Description
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-white resize-none"
                placeholder="Describe the work to be completed..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white mb-2">Upload Evidence Files</p>
              <p className="text-sm text-gray-400 mb-4">
                Drag and drop files or click to browse
              </p>
              <Button variant="outline">Choose Files</Button>
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Seller:</span>
                <span className="text-white font-mono text-sm">
                  {formData.sellerAddress.slice(0, 8)}...{formData.sellerAddress.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-cyberpunk-400 font-bold">
                  {formData.amount} {formData.token}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deadline:</span>
                <span className="text-white">
                  {new Date(formData.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-cyberpunk-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-cyberpunk-400">Create New Escrow</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
            </div>
            
            <NeonProgress 
              progress={progress} 
              label={`Step ${currentStep} of ${steps.length}`}
              className="mt-4"
            />
            
            <div className="flex items-center justify-between mt-4">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`flex items-center ${
                    step.id <= currentStep ? 'text-cyberpunk-400' : 'text-gray-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step.id < currentStep 
                      ? 'bg-cyberpunk-500 border-cyberpunk-500' 
                      : step.id === currentStep
                      ? 'border-cyberpunk-500'
                      : 'border-gray-600'
                  }`}>
                    {step.id < currentStep ? (
                      <Check className="w-4 h-4 text-black" />
                    ) : (
                      step.id
                    )}
                  </div>
                  {step.id < steps.length && (
                    <div className={`w-16 h-0.5 ${
                      step.id < currentStep ? 'bg-cyberpunk-500' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {steps[currentStep - 1].description}
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep === steps.length ? (
                <Button
                  variant="cyber"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Escrow'}
                </Button>
              ) : (
                <Button
                  variant="cyber"
                  onClick={handleNext}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}