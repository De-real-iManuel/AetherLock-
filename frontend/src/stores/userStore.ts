import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, UserSettings } from '../types/models'

/**
 * User Store State
 * Manages current user profile and settings
 */
export interface UserState {
  user: User | null
  settings: UserSettings
  isLoading: boolean
  error: string | null
}

/**
 * User Store Actions
 * Actions for updating user profile, role, KYC status, and settings
 */
interface UserActions {
  setUser: (user: User | null) => void
  updateProfile: (updates: Partial<User>) => void
  updateRole: (role: 'client' | 'freelancer') => void
  updateKycStatus: (status: 'pending' | 'verified' | 'rejected', level?: number) => void
  updateTrustScore: (trustScore: number) => void
  updateStatistics: (stats: { completedJobs?: number; successRate?: number; totalEarned?: number; totalSpent?: number }) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    inApp: true
  },
  theme: 'dark'
}

/**
 * User Store
 * Zustand store for managing user profile and settings
 * Persists user data to localStorage
 */
export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        settings: initialSettings,
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) => set({ user, error: null }),

        updateProfile: (updates) => 
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null
          })),

        updateRole: (role) =>
          set((state) => ({
            user: state.user ? { ...state.user, role } : null
          })),

        updateKycStatus: (kycStatus, kycLevel) =>
          set((state) => ({
            user: state.user 
              ? { ...state.user, kycStatus, ...(kycLevel !== undefined && { kycLevel }) }
              : null
          })),

        updateTrustScore: (trustScore) =>
          set((state) => ({
            user: state.user ? { ...state.user, trustScore } : null
          })),

        updateStatistics: (stats) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...stats } : null
          })),

        updateSettings: (newSettings) =>
          set((state) => ({
            settings: {
              ...state.settings,
              ...newSettings,
              notifications: {
                ...state.settings.notifications,
                ...(newSettings.notifications || {})
              }
            }
          })),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        reset: () => set({ 
          user: null, 
          settings: initialSettings,
          isLoading: false,
          error: null 
        })
      }),
      { 
        name: 'user-store',
        // Persist user and settings
        partialPersist: (state) => ({
          user: state.user,
          settings: state.settings
        })
      }
    ),
    { name: 'user-store' }
  )
)
