import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  reducedMotion: boolean
  highContrast: boolean
  language: string
}

interface ThemeActions {
  toggleTheme: () => void
  setReducedMotion: (reduced: boolean) => void
  setHighContrast: (contrast: boolean) => void
  setLanguage: (language: string) => void
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  devtools(
    persist(
      (set) => ({
        // State
        isDark: true, // Default to dark theme for cyberpunk aesthetic
        reducedMotion: false,
        highContrast: false,
        language: 'en',

        // Actions
        toggleTheme: () => set(state => ({ isDark: !state.isDark })),
        setReducedMotion: (reducedMotion) => set({ reducedMotion }),
        setHighContrast: (highContrast) => set({ highContrast }),
        setLanguage: (language) => set({ language })
      }),
      { name: 'theme-store' }
    ),
    { name: 'theme-store' }
  )
)