/**
 * Comprehensive theme configuration for AetherLock Interactive Dashboard
 * Implements neon-dark cyberpunk aesthetic with electric blue, cyan, and purple accents
 */

export interface ThemeConfig {
  colors: {
    primary: {
      background: string
      surface: string
      card: string
      border: string
    }
    accent: {
      electric: string // ZetaChain green
      purple: string // Primary purple
      cyan: string // AI verification
      neon: string // Success states
    }
    status: {
      pending: string
      verified: string
      disputed: string
      failed: string
    }
  }
  typography: {
    fonts: {
      primary: string
      display: string
      code: string
    }
    sizes: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
  }
  animations: {
    duration: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      ease: string
      spring: string
    }
  }
}

export const themeConfig: ThemeConfig = {
  colors: {
    primary: {
      background: '#000000',
      surface: '#0a0a0a',
      card: '#111111',
      border: '#1a1a1a',
    },
    accent: {
      electric: '#00d4aa', // ZetaChain green
      purple: '#9333ea', // Primary purple
      cyan: '#06b6d4', // AI verification
      neon: '#10b981', // Success states
    },
    status: {
      pending: '#f59e0b',
      verified: '#10b981',
      disputed: '#ef4444',
      failed: '#dc2626',
    },
  },
  typography: {
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      display: 'Orbitron, monospace',
      code: 'JetBrains Mono, monospace',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};

export default themeConfig;