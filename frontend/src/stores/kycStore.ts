import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * KYC Verification Data
 * Contains verification session and result information
 */
interface KycVerificationData {
  sessionId: string
  level?: number
  verifiedAt?: Date
  expiresAt?: Date
  provider: 'zkme'
}

/**
 * KYC Store State
 * Manages KYC verification status and session data
 */
interface KycState {
  status: 'pending' | 'verified' | 'rejected' | 'not_started'
  verificationData: KycVerificationData | null
  showWidget: boolean
  hasSeenPrompt: boolean
  isInitializing: boolean
  error: string | null
}

/**
 * KYC Store Actions
 * Actions for initializing KYC, updating status, and handling completion
 */
interface KycActions {
  initializeKyc: (sessionId: string) => void
  updateStatus: (status: 'pending' | 'verified' | 'rejected', level?: number) => void
  handleCompletion: (success: boolean, data?: Partial<KycVerificationData>) => void
  setShowWidget: (show: boolean) => void
  setHasSeenPrompt: (seen: boolean) => void
  setInitializing: (isInitializing: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

/**
 * Helper to check if verification is still valid
 */
const isVerificationValid = (data: KycVerificationData | null): boolean => {
  if (!data || !data.expiresAt) return false
  return new Date(data.expiresAt) > new Date()
}

/**
 * KYC Store
 * Zustand store for managing KYC verification state
 * Persists verification status and session data to localStorage
 */
export const useKycStore = create<KycState & KycActions>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        status: 'not_started',
        verificationData: null,
        showWidget: false,
        hasSeenPrompt: false,
        isInitializing: false,
        error: null,

        // Actions
        initializeKyc: (sessionId) => {
          set({ 
            status: 'pending',
            verificationData: {
              sessionId,
              provider: 'zkme'
            },
            isInitializing: true,
            error: null
          })
        },

        updateStatus: (status, level) => {
          set((state) => ({
            status,
            verificationData: state.verificationData 
              ? { 
                  ...state.verificationData, 
                  ...(level !== undefined && { level }),
                  ...(status === 'verified' && { verifiedAt: new Date() })
                }
              : null,
            error: null
          }))
        },

        handleCompletion: (success, data) => {
          const state = get()
          
          if (success) {
            set({
              status: 'verified',
              verificationData: state.verificationData
                ? {
                    ...state.verificationData,
                    ...data,
                    verifiedAt: new Date(),
                    // Set expiration to 1 year from now
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                  }
                : null,
              showWidget: false,
              isInitializing: false,
              error: null
            })
          } else {
            set({
              status: 'rejected',
              showWidget: false,
              isInitializing: false,
              error: 'KYC verification was rejected'
            })
          }
        },

        setShowWidget: (showWidget) => {
          set({ showWidget })
          if (showWidget) {
            set({ hasSeenPrompt: true })
          }
        },

        setHasSeenPrompt: (hasSeenPrompt) => set({ hasSeenPrompt }),

        setInitializing: (isInitializing) => set({ isInitializing }),

        setError: (error) => set({ error }),

        reset: () => set({
          status: 'not_started',
          verificationData: null,
          showWidget: false,
          hasSeenPrompt: false,
          isInitializing: false,
          error: null
        })
      }),
      { 
        name: 'kyc-store',
        // Custom storage to validate expiration on load
        onRehydrateStorage: () => (state) => {
          if (state && state.verificationData) {
            if (!isVerificationValid(state.verificationData)) {
              // Verification expired, reset to not_started
              state.status = 'not_started'
              state.verificationData = null
            }
          }
        }
      }
    ),
    { name: 'kyc-store' }
  )
)

/**
 * Computed selector to check if user is verified
 */
export const useIsVerified = () => {
  const status = useKycStore((state) => state.status)
  const verificationData = useKycStore((state) => state.verificationData)
  return status === 'verified' && isVerificationValid(verificationData)
}
