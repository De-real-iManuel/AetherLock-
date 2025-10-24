import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useKycStore } from './kycStore'

export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number
  network: string
  provider: string | null
  isConnecting: boolean
  error: string | null
}

interface WalletActions {
  connect: (provider: string) => Promise<void>
  disconnect: () => void
  setBalance: (balance: number) => void
  setNetwork: (network: string) => void
  setError: (error: string | null) => void
}

export const useWalletStore = create<WalletState & WalletActions>()(
  devtools(
    (set, get) => ({
      // State
      isConnected: false,
      address: null,
      balance: 0,
      network: 'solana',
      provider: null,
      isConnecting: false,
      error: null,

      // Actions
      connect: async (provider: string) => {
        set({ isConnecting: true, error: null })
        try {
          // Wallet connection logic will be implemented in wallet service
          set({ 
            isConnected: true, 
            provider, 
            isConnecting: false 
          })
          
          // Show KYC widget after successful connection if not verified
          const { isVerified, hasSeenPrompt, setShowWidget } = useKycStore.getState()
          if (!isVerified && !hasSeenPrompt) {
            setTimeout(() => setShowWidget(true), 1000)
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Connection failed',
            isConnecting: false 
          })
        }
      },

      disconnect: () => {
        set({
          isConnected: false,
          address: null,
          balance: 0,
          provider: null,
          error: null
        })
      },

      setBalance: (balance: number) => set({ balance }),
      setNetwork: (network: string) => set({ network }),
      setError: (error: string | null) => set({ error })
    }),
    { name: 'wallet-store' }
  )
)