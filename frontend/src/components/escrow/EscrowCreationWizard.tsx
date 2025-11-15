import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, Calendar, DollarSign } from "lucide-react"
import { useEscrowStore } from "@/stores/escrowStore"
import { useWalletStore } from "@/stores/walletStore"
import { uploadToIPFS } from "@/services/ipfs"
import { api } from "@/services/api"
import type { Milestone, Escrow } from "@/types/models"

// Form data interface
interface EscrowFormData {
  title: string
  description: string
  amount: string
  currency: 'SOL' | 'USDC' | 'ZETA'
  deadline: string
  freelancerAddress: string
  milestones: MilestoneFormData[]
}

interface MilestoneFormData {
  id: string
  title: string
  description: string
  percentage: string
  deadline: string
}

// Validation errors
interface ValidationErrors {
  title?: string
  description?: string
  amount?: string
  deadline?: string
  freelancerAddress?: string
  milestones?: { [key: string]: { title?: string; description?: string; percentage?: string; deadline?: string } }
  milestonesTotal?: string
}

// Steps configuration
const STEPS = [
  { id: 1, name: 'Basic Info', icon: '📝' },
  { id: 2, name: 'Payment Details', icon: '💰' },
  { id: 3, name: 'Milestones', icon: '🎯' },
  { id: 4, name: 'Review', icon: '✅' }
]

interface EscrowCreationWizardProps {
  onComplete?: (escrow: Escrow) => void
  onCancel?: () => void
}

export const EscrowCreationWizard: React.FC<EscrowCreationWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<ValidationErrors>({})
  
  const { address } = useWalletStore()
  const { addEscrow } = useEscrowStore()

  // Form state
  const [formData, setFormData] = React.useState<EscrowFormData>({
    title: '',
    description: '',
    amount: '',
    currency: 'SOL',
    deadline: '',
    freelancerAddress: '',
    milestones: [
      { id: '1', title: '', description: '', percentage: '', deadline: '' }
    ]
  })

  // Update form field
  const updateField = (field: keyof EscrowFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  // Update milestone field
  const updateMilestone = (index: number, field: keyof MilestoneFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => 
        i === index ? { ...m, [field]: value } : m
      )
    }))
    // Clear error for this milestone field
    setErrors(prev => ({
      ...prev,
      milestones: {
        ...prev.milestones,
        [index]: {
          ...prev.milestones?.[index],
          [field]: undefined
        }
      }
    }))
  }

  // Add milestone
  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { id: Date.now().toString(), title: '', description: '', percentage: '', deadline: '' }
      ]
    }))
  }

  // Remove milestone
  const removeMilestone = (index: number) => {
    if (formData.milestones.length > 1) {
      setFormData(prev => ({
        ...prev,
        milestones: prev.milestones.filter((_, i) => i !== index)
      }))
    }
  }

  // Validate step
  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {}

    if (step === 1) {
      // Basic Info validation
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required'
      } else if (formData.title.length < 5) {
        newErrors.title = 'Title must be at least 5 characters'
      } else if (formData.title.length > 100) {
        newErrors.title = 'Title must be less than 100 characters'
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Description is required'
      }

      if (!formData.deadline) {
        newErrors.deadline = 'Deadline is required'
      } else {
        const deadlineDate = new Date(formData.deadline)
        if (deadlineDate <= new Date()) {
          newErrors.deadline = 'Deadline must be in the future'
        }
      }
    }

    if (step === 2) {
      // Payment Details validation
      if (!formData.amount) {
        newErrors.amount = 'Amount is required'
      } else {
        const amount = parseFloat(formData.amount)
        if (isNaN(amount) || amount <= 0) {
          newErrors.amount = 'Amount must be greater than 0'
        }
      }

      if (formData.freelancerAddress && !isValidAddress(formData.freelancerAddress)) {
        newErrors.freelancerAddress = 'Invalid wallet address'
      }
    }

    if (step === 3) {
      // Milestones validation
      const milestoneErrors: ValidationErrors['milestones'] = {}
      let totalPercentage = 0

      formData.milestones.forEach((milestone, index) => {
        const mErrors: any = {}

        if (!milestone.title.trim()) {
          mErrors.title = 'Title is required'
        }

        if (!milestone.percentage) {
          mErrors.percentage = 'Percentage is required'
        } else {
          const percentage = parseFloat(milestone.percentage)
          if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            mErrors.percentage = 'Percentage must be between 0 and 100'
          } else {
            totalPercentage += percentage
          }
        }

        if (!milestone.deadline) {
          mErrors.deadline = 'Deadline is required'
        } else {
          const milestoneDeadline = new Date(milestone.deadline)
          const escrowDeadline = new Date(formData.deadline)
          if (milestoneDeadline > escrowDeadline) {
            mErrors.deadline = 'Milestone deadline cannot be after escrow deadline'
          }
        }

        if (Object.keys(mErrors).length > 0) {
          milestoneErrors[index] = mErrors
        }
      })

      if (Object.keys(milestoneErrors).length > 0) {
        newErrors.milestones = milestoneErrors
      }

      // Check total percentage
      if (Math.abs(totalPercentage - 100) > 0.01) {
        newErrors.milestonesTotal = `Total percentage must equal 100% (currently ${totalPercentage.toFixed(1)}%)`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Helper to validate wallet address (basic check)
  const isValidAddress = (address: string): boolean => {
    // Basic validation - check if it's a non-empty string with reasonable length
    return address.length >= 32 && address.length <= 44
  }

  // Navigate to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare escrow data
      const escrowData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        deadline: new Date(formData.deadline),
        freelancerAddress: formData.freelancerAddress || undefined,
        milestones: formData.milestones.map((m, index) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          percentage: parseFloat(m.percentage),
          amount: (parseFloat(formData.amount) * parseFloat(m.percentage)) / 100,
          deadline: new Date(m.deadline),
          status: 'pending' as const
        }))
      }

      // Upload escrow details to IPFS
      const escrowBlob = new Blob([JSON.stringify(escrowData, null, 2)], { type: 'application/json' })
      const escrowFile = new File([escrowBlob], `escrow-${Date.now()}.json`, { type: 'application/json' })
      const ipfsResult = await uploadToIPFS(escrowFile)

      // Create escrow via API (which will interact with smart contract)
      const response = await api.post<{ escrow: Escrow }>('/api/escrow/create', {
        ...escrowData,
        ipfsHash: ipfsResult.ipfsHash,
        clientAddress: address
      })

      // Add to store
      addEscrow(response.escrow)

      // Call completion callback
      if (onComplete) {
        onComplete(response.escrow)
      }
    } catch (error: any) {
      console.error('Failed to create escrow:', error)
      setErrors({ title: error.message || 'Failed to create escrow. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold border-2 transition-all",
                    currentStep >= step.id
                      ? "bg-accent-electric text-black border-accent-electric shadow-neon"
                      : "bg-primary-surface border-primary-border text-slate-400"
                  )}
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1
                  }}
                >
                  {currentStep > step.id ? <Check className="w-6 h-6" /> : step.icon}
                </motion.div>
                <span className={cn(
                  "mt-2 text-xs font-medium",
                  currentStep >= step.id ? "text-accent-electric" : "text-slate-500"
                )}>
                  {step.name}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4 transition-all",
                  currentStep > step.id ? "bg-accent-electric" : "bg-primary-border"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <BasicInfoStep formData={formData} updateField={updateField} errors={errors} />}
              {currentStep === 2 && <PaymentDetailsStep formData={formData} updateField={updateField} errors={errors} />}
              {currentStep === 3 && (
                <MilestonesStep
                  formData={formData}
                  updateMilestone={updateMilestone}
                  addMilestone={addMilestone}
                  removeMilestone={removeMilestone}
                  errors={errors}
                />
              )}
              {currentStep === 4 && <ReviewStep formData={formData} />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-primary-border">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {onCancel && (
                <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              )}
              {currentStep < STEPS.length ? (
                <Button onClick={nextStep} disabled={isSubmitting}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} loading={isSubmitting}>
                  Create Escrow
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Step 1: Basic Info
interface StepProps {
  formData: EscrowFormData
  updateField: (field: keyof EscrowFormData, value: any) => void
  errors: ValidationErrors
}

const BasicInfoStep: React.FC<StepProps> = ({ formData, updateField, errors }) => {
  return (
    <div className="space-y-6">
      <Input
        label="Escrow Title *"
        placeholder="e.g., Website Development Project"
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
        error={!!errors.title}
        helperText={errors.title || `${formData.title.length}/100 characters`}
        maxLength={100}
      />

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description *
        </label>
        <textarea
          className={cn(
            "w-full min-h-[120px] rounded-md border bg-primary-surface/50 backdrop-blur-sm px-4 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 transition-all duration-200 resize-y",
            errors.description
              ? "border-status-failed focus-visible:ring-status-failed"
              : "border-primary-border focus-visible:ring-accent-electric hover:border-accent-electric/50"
          )}
          placeholder="Describe the project requirements, deliverables, and expectations..."
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-status-failed">{errors.description}</p>
        )}
      </div>

      <Input
        label="Project Deadline *"
        type="datetime-local"
        value={formData.deadline}
        onChange={(e) => updateField('deadline', e.target.value)}
        error={!!errors.deadline}
        helperText={errors.deadline}
      />
    </div>
  )
}

// Step 2: Payment Details
const PaymentDetailsStep: React.FC<StepProps> = ({ formData, updateField, errors }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Amount *"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => updateField('amount', e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Currency *
          </label>
          <select
            className="w-full h-10 rounded-md border border-primary-border bg-primary-surface/50 backdrop-blur-sm px-4 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-electric transition-all"
            value={formData.currency}
            onChange={(e) => updateField('currency', e.target.value as 'SOL' | 'USDC' | 'ZETA')}
          >
            <option value="SOL">SOL</option>
            <option value="USDC">USDC</option>
            <option value="ZETA">ZETA</option>
          </select>
        </div>
      </div>

      <Input
        label="Freelancer Wallet Address (Optional)"
        placeholder="Enter wallet address or leave empty for open escrow"
        value={formData.freelancerAddress}
        onChange={(e) => updateField('freelancerAddress', e.target.value)}
        error={!!errors.freelancerAddress}
        helperText={errors.freelancerAddress || "Leave empty to allow any freelancer to accept"}
      />

      <div className="p-4 bg-accent-electric/10 border border-accent-electric/30 rounded-lg">
        <p className="text-sm text-slate-300">
          <strong className="text-accent-electric">Note:</strong> The total amount will be locked in the smart contract.
          Funds will be released based on milestone completion and AI verification.
        </p>
      </div>
    </div>
  )
}

// Step 3: Milestones
interface MilestonesStepProps {
  formData: EscrowFormData
  updateMilestone: (index: number, field: keyof MilestoneFormData, value: string) => void
  addMilestone: () => void
  removeMilestone: (index: number) => void
  errors: ValidationErrors
}

const MilestonesStep: React.FC<MilestonesStepProps> = ({
  formData,
  updateMilestone,
  addMilestone,
  removeMilestone,
  errors
}) => {
  const totalPercentage = formData.milestones.reduce((sum, m) => sum + (parseFloat(m.percentage) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Project Milestones</h3>
          <p className="text-sm text-slate-400">Break down the project into milestones with payment percentages</p>
        </div>
        <Button variant="outline" size="sm" onClick={addMilestone}>
          <Plus className="w-4 h-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {errors.milestonesTotal && (
        <div className="p-3 bg-status-failed/10 border border-status-failed/30 rounded-lg">
          <p className="text-sm text-status-failed">{errors.milestonesTotal}</p>
        </div>
      )}

      <div className="space-y-4">
        {formData.milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-primary-surface/30 border border-primary-border rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-accent-electric">Milestone {index + 1}</h4>
              {formData.milestones.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(index)}
                  className="text-status-failed hover:text-status-failed/80"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Input
              label="Milestone Title *"
              placeholder="e.g., Initial Design Mockups"
              value={milestone.title}
              onChange={(e) => updateMilestone(index, 'title', e.target.value)}
              error={!!errors.milestones?.[index]?.title}
              helperText={errors.milestones?.[index]?.title}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-primary-border bg-primary-surface/50 backdrop-blur-sm px-4 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-electric transition-all resize-y"
                placeholder="Describe what needs to be delivered for this milestone..."
                value={milestone.description}
                onChange={(e) => updateMilestone(index, 'description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Payment Percentage *"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="0"
                value={milestone.percentage}
                onChange={(e) => updateMilestone(index, 'percentage', e.target.value)}
                error={!!errors.milestones?.[index]?.percentage}
                helperText={errors.milestones?.[index]?.percentage || `${parseFloat(milestone.percentage) || 0}% of ${formData.amount} ${formData.currency}`}
              />

              <Input
                label="Milestone Deadline *"
                type="datetime-local"
                value={milestone.deadline}
                onChange={(e) => updateMilestone(index, 'deadline', e.target.value)}
                error={!!errors.milestones?.[index]?.deadline}
                helperText={errors.milestones?.[index]?.deadline}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-primary-surface/50 border border-primary-border rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Total Percentage:</span>
          <span className={cn(
            "text-lg font-bold",
            Math.abs(totalPercentage - 100) < 0.01 ? "text-status-verified" : "text-status-failed"
          )}>
            {totalPercentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// Step 4: Review
interface ReviewStepProps {
  formData: EscrowFormData
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const totalAmount = parseFloat(formData.amount) || 0

  return (
    <div className="space-y-6">
      <div className="p-4 bg-accent-electric/10 border border-accent-electric/30 rounded-lg">
        <p className="text-sm text-slate-300">
          Please review all details before creating the escrow. Once created, the funds will be locked in the smart contract.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-1">Title</h3>
          <p className="text-white font-semibold">{formData.title}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-1">Description</h3>
          <p className="text-slate-300 text-sm">{formData.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Amount</h3>
            <p className="text-accent-electric font-bold text-xl">
              {formData.amount} {formData.currency}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Deadline</h3>
            <p className="text-white">
              {new Date(formData.deadline).toLocaleString()}
            </p>
          </div>
        </div>

        {formData.freelancerAddress && (
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Freelancer Address</h3>
            <p className="text-white font-mono text-sm">{formData.freelancerAddress}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Milestones ({formData.milestones.length})</h3>
          <div className="space-y-3">
            {formData.milestones.map((milestone, index) => (
              <div key={milestone.id} className="p-3 bg-primary-surface/30 border border-primary-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-semibold">{index + 1}. {milestone.title}</h4>
                  <span className="text-accent-electric font-bold">{milestone.percentage}%</span>
                </div>
                {milestone.description && (
                  <p className="text-slate-400 text-sm mb-2">{milestone.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Amount: {((totalAmount * parseFloat(milestone.percentage)) / 100).toFixed(2)} {formData.currency}</span>
                  <span>Due: {new Date(milestone.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
