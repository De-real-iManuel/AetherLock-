import * as React from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "./dashboard-layout"
import { EscrowList } from "./escrow-list"
import { EscrowCreationWizard } from "./escrow-creation-wizard"
import { ZkMeWidget } from "@/components/kyc/zkme-widget"
import { useWalletStore } from "@/store/walletStore"
import { useEscrowStore } from "@/store/escrowStore"
import { useKycStore } from "@/store/kycStore"
import { Button } from "@/components/ui/button"
import { Wallet, Plus } from "lucide-react"

// Mock data for demonstration
const mockEscrows = [
  {
    id: "esc_1234567890abcdef",
    buyer: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    seller: "7xKXtg2CW3UuUkRXpVfHVPuUJjHjsJGdQTPNvQoS9wHp",
    amount: 2.5,
    token: "SOL",
    status: "active" as const,
    description: "Website development project with React and TypeScript",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    aiVerification: {
      status: "verified" as const,
      confidence: 0.95,
      timestamp: new Date()
    }
  },
  {
    id: "esc_fedcba0987654321",
    buyer: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    seller: "3mKLtg9CW8UuUkRXpVfHVPuUJjHjsJGdQTPNvQoS2wHp",
    amount: 1.0,
    token: "SOL",
    status: "disputed" as const,
    description: "Logo design for crypto startup",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    aiVerification: {
      status: "failed" as const,
      confidence: 0.3,
      timestamp: new Date()
    }
  }
]

export const Dashboard = () => {
  const { isConnected } = useWalletStore()
  const { setEscrows } = useEscrowStore()
  const { showWidget, setShowWidget, setVerified, setHasSeenPrompt } = useKycStore()
  const [showCreateWizard, setShowCreateWizard] = React.useState(false)

  const handleVerificationComplete = (result: any) => {
    setVerified(true, result)
    setHasSeenPrompt(true)
  }

  const handleWidgetClose = () => {
    setShowWidget(false)
    setHasSeenPrompt(true)
  }

  React.useEffect(() => {
    if (isConnected) {
      setEscrows(mockEscrows)
    }
  }, [isConnected, setEscrows])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-cyberpunk-400 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to access the AetherLock dashboard
          </p>
          <Button variant="cyber" size="lg">
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardLayout>
        <EscrowList />
        
        {/* Floating Action Button */}
        <motion.button
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-cyberpunk-500 to-purple-500 rounded-full shadow-cyber-lg flex items-center justify-center text-black font-bold z-40"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreateWizard(true)}
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </DashboardLayout>
      
      {showCreateWizard && (
        <EscrowCreationWizard onClose={() => setShowCreateWizard(false)} />
      )}
      
      <ZkMeWidget
        isOpen={showWidget}
        onClose={handleWidgetClose}
        onVerificationComplete={handleVerificationComplete}
      />
    </>
  )
}