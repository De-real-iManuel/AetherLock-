import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface KycState {
  isVerified: boolean
  verificationData: any | null
  showWidget: boolean
  hasSeenPrompt: boolean
}

interface KycActions {
  setVerified: (verified: boolean, data?: any) => void
  setShowWidget: (show: boolean) => void
  setHasSeenPrompt: (seen: boolean) => void
  reset: () => void
}

export const useKycStore = create<KycState & KycActions>()(
  devtools(
    persist(
      (set) => ({
        // State
        isVerified: false,
        verificationData: null,
        showWidget: false,
        hasSeenPrompt: false,

        // Actions
        setVerified: (verified, data = null) => 
          set({ isVerified: verified, verificationData: data }),
        
        setShowWidget: (showWidget) => set({ showWidget }),
        
        setHasSeenPrompt: (hasSeenPrompt) => set({ hasSeenPrompt }),
        
        reset: () => set({
          isVerified: false,
          verificationData: null,
          showWidget: false,
          hasSeenPrompt: false
        })
      }),
      { name: 'kyc-store' }
    ),
    { name: 'kyc-store' }
  )
)