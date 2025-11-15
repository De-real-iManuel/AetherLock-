import * as React from "react"
import { motion } from "framer-motion"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { useWalletStore } from "@/store/walletStore"
import { useNotificationStore } from "@/store/notificationStore"
import { walletProviders } from "@/services/walletService"
import { Wallet, CheckCircle } from "lucide-react"

interface WalletConnectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WalletConnectionModal = ({ isOpen, onClose }: WalletConnectionModalProps) => {
  const { connect, isConnecting } = useWalletStore()
  const { addNotification } = useNotificationStore()

  const handleConnect = async (providerName: string) => {
    try {
      await connect(providerName)
      addNotification({
        type: 'success',
        title: 'Wallet Connected',
        message: `Successfully connected to ${providerName}`
      })
      onClose()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: error instanceof Error ? error.message : 'Failed to connect wallet'
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet">
      <div className="space-y-4">
        <p className="text-slate-400 text-center mb-6">
          Choose your preferred wallet to connect to AetherLock
        </p>
        
        <div className="grid gap-3">
          {walletProviders.map((provider, index) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full h-16 justify-start gap-4 text-left hover:border-accent-electric hover:bg-accent-electric/10"
                onClick={() => handleConnect(provider.name)}
                disabled={isConnecting || !provider.isInstalled()}
              >
                <div className="w-8 h-8 rounded-full bg-accent-electric/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-accent-electric" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{provider.name}</div>
                  <div className="text-xs text-slate-400">
                    {provider.isInstalled() ? 'Detected' : 'Not installed'}
                  </div>
                </div>
                {provider.isInstalled() && (
                  <CheckCircle className="w-4 h-4 text-status-verified" />
                )}
              </Button>
            </motion.div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-primary-border">
          <p className="text-xs text-slate-500 text-center">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </Modal>
  )
}