import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useKycStore } from './kycStore'

/**
 * Wallet Store State
 * Manages connected wallet information and state
 */
export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number
  chain: 'solana' | 'zetachain' | 'sui' | 'ton' | null
  walletType: 'phantom' | 'metamask' | 'sui' | 'ton' | null
  isConnecting: boolean
  error: string | null
}

/**
 * Wallet Store Actions
 * Actions for connecting, disconnecting, and updating wallet state
 */
interface WalletActions {
  connect: (walletType: 'phantom' | 'metamask' | 'sui' | 'ton', address: string, chain: 'solana' | 'zetachain' | 'sui' | 'ton') => void
  disconnect: () => void
  updateBalance: (balance: number) => void
  updateChain: (chain: 'solana' | 'zetachain' | 'sui' | 'ton') => void
  setConnecting: (isConnecting: boolean) => void
  setError: (error: string | null) => void
}

/**
 * Wallet Store
 * Zustand store for managing wallet connection state
 * Persists wallet connection state to localStorage
 */
export const useWalletStore = create<WalletState & WalletActions>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        isConnected: false,
        address: null,
        balance: 0,
        chain: null,
        walletType: null,
        isConnecting: false,
        error: null,

        // Actions
        connect: (walletType, address, chain) => {
          set({ 
            isConnected: true,
            address,
            chain,
            walletType,
            isConnecting: false,
            error: null
          })
          
          // Show KYC widget after successful connection if not verified
          const { isVerified, hasSeenPrompt, setShowWidget } = useKycStore.getState()
          if (!isVerified && !hasSeenPrompt) {
            setTimeout(() => setShowWidget(true), 1000)
          }
        },

        disconnect: () => {
          set({
            isConnected: false,
            address: null,
            balance: 0,
            chain: null,
            walletType: null,
            error: null
          })
        },

        updateBalance: (balance: number) => set({ balance }),
        
        updateChain: (chain: 'solana' | 'zetachain' | 'sui' | 'ton') => set({ chain }),
        
        setConnecting: (isConnecting: boolean) => set({ isConnecting }),
        
        setError: (error: string | null) => set({ error })
      }),
      { 
        name: 'wallet-store',
        // Only persist essential connection state
        partialPersist: (state) => ({
          isConnected: state.isConnected,
          address: state.address,
          chain: state.chain,
          walletType: state.walletType
        })
      }
    ),
    { name: 'wallet-store' }
  )
)