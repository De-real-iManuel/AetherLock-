// Application constants
export const APP_NAME = 'AetherLock';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'Trustless AI Escrow for Web3 Transactions';

// API endpoints
export const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:3001';
export const WEBSOCKET_URL = (import.meta.env?.VITE_WEBSOCKET_URL as string) || 'ws://localhost:3001';

// Blockchain networks
export const SUPPORTED_NETWORKS = {
  SOLANA: 'solana',
  ZETACHAIN: 'zetachain',
  SUI: 'sui',
  TON: 'ton',
} as const;

// Wallet providers
export const WALLET_PROVIDERS = {
  PHANTOM: 'phantom',
  SOLFLARE: 'solflare',
  WALLET_CONNECT: 'walletconnect',
  TONKEEPER: 'tonkeeper',
  SLUSH: 'slush',
} as const;

// Escrow statuses
export const ESCROW_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled',
} as const;

// AI verification statuses
export const AI_VERIFICATION_STATUS = {
  NOT_STARTED: 'not_started',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Animation variants
export const ANIMATION_VARIANTS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
} as const;

export type NetworkType = typeof SUPPORTED_NETWORKS[keyof typeof SUPPORTED_NETWORKS];
export type WalletProviderType = typeof WALLET_PROVIDERS[keyof typeof WALLET_PROVIDERS];
export type EscrowStatusType = typeof ESCROW_STATUS[keyof typeof ESCROW_STATUS];
export type AIVerificationStatusType = typeof AI_VERIFICATION_STATUS[keyof typeof AI_VERIFICATION_STATUS];