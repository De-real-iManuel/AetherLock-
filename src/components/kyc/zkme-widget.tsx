import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { useNotificationStore } from "@/store/notificationStore"

interface ZkMeWidgetProps {
  isOpen: boolean
  onClose: () => void
  onVerificationComplete: (result: any) => void
}

export const ZkMeWidget = ({ isOpen, onClose, onVerificationComplete }: ZkMeWidgetProps) => {
  const { addNotification } = useNotificationStore()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleVerification = async () => {
    setIsLoading(true)
    try {
      // Initialize zkMe widget
      const { ZkMeWidget } = await import('@zkmelabs/widget')
      
      const widget = new ZkMeWidget({
        appId: import.meta.env.VITE_ZKME_APP_ID || 'demo_app_id',
        apiKey: import.meta.env.VITE_ZKME_API_KEY || 'demo_api_key',
        onSuccess: (result: any) => {
          addNotification({
            type: 'success',
            title: 'KYC Verification Complete',
            message: 'Your identity has been verified successfully'
          })
          onVerificationComplete(result)
          onClose()
        },
        onError: (error: any) => {
          addNotification({
            type: 'error',
            title: 'KYC Verification Failed',
            message: error.message || 'Verification failed'
          })
          setIsLoading(false)
        }
      })

      widget.open()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Widget Error',
        message: 'Failed to load verification widget'
      })
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    addNotification({
      type: 'info',
      title: 'KYC Skipped',
      message: 'You can verify your identity later in settings'
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Identity Verification">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyberpunk-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-cyberpunk-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Verify Your Identity
          </h3>
          <p className="text-slate-400 text-sm">
            Complete zero-knowledge KYC verification to unlock full platform features and enhanced security.
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-cyberpunk-500/30">
          <h4 className="font-medium text-cyberpunk-400 mb-2">Benefits of Verification:</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Higher escrow limits</li>
            <li>• Priority dispute resolution</li>
            <li>• Enhanced security features</li>
            <li>• Zero-knowledge privacy protection</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="cyber"
            className="flex-1"
            onClick={handleVerification}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Verify with zkMe'}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip for now
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Your privacy is protected through zero-knowledge proofs. No personal data is stored on-chain.
        </p>
      </div>
    </Modal>
  )
}