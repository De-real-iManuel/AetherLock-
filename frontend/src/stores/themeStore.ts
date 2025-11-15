import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * Theme Store State
 * Manages theme preferences and accessibility settings
 */
interface ThemeState {
  theme: 'dark' | 'light'
  reducedMotion: boolean
  highContrast: boolean
  language: string
}

/**
 * Theme Store Actions
 * Actions for toggling theme and updating preferences
 */
interface ThemeActions {
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  setReducedMotion: (reduced: boolean) => void
  setHighContrast: (contrast: boolean) => void
  setLanguage: (language: string) => void
}

/**
 * Apply theme to document
 */
const applyTheme = (theme: 'dark' | 'light') => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }
}

/**
 * Theme Store
 * Zustand store for managing theme state
 * Persists theme preference to localStorage
 * Applies theme to document on change
 */
export const useThemeStore = create<ThemeState & ThemeActions>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        theme: 'dark', // Default to dark theme for cyberpunk aesthetic
        reducedMotion: false,
        highContrast: false,
        language: 'en',

        // Actions
        setTheme: (theme) => {
          set({ theme })
          applyTheme(theme)
        },

        toggleTheme: () => {
          const currentTheme = get().theme
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
          set({ theme: newTheme })
          applyTheme(newTheme)
        },

        setReducedMotion: (reducedMotion) => {
          set({ reducedMotion })
          if (typeof document !== 'undefined') {
            if (reducedMotion) {
              document.documentElement.classList.add('reduce-motion')
            } else {
              document.documentElement.classList.remove('reduce-motion')
            }
          }
        },

        setHighContrast: (highContrast) => {
          set({ highContrast })
          if (typeof document !== 'undefined') {
            if (highContrast) {
              document.documentElement.classList.add('high-contrast')
            } else {
              document.documentElement.classList.remove('high-contrast')
            }
          }
        },

        setLanguage: (language) => set({ language })
      }),
      { 
        name: 'theme-store',
        // Apply theme on rehydration
        onRehydrateStorage: () => (state) => {
          if (state) {
            applyTheme(state.theme)
            if (state.reducedMotion && typeof document !== 'undefined') {
              document.documentElement.classList.add('reduce-motion')
            }
            if (state.highContrast && typeof document !== 'undefined') {
              document.documentElement.classList.add('high-contrast')
            }
          }
        }
      }
    ),
    { name: 'theme-store' }
  )
)

/**
 * Computed selector to check if dark theme is active
 */
export const useIsDarkTheme = () => {
  return useThemeStore((state) => state.theme === 'dark')
}

/**
 * Computed selector to check if light theme is active
 */
export const useIsLightTheme = () => {
  return useThemeStore((state) => state.theme === 'light')
}
