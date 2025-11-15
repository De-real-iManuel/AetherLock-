// Application constants and configuration values

// ============================================================================
// Status Values
// ============================================================================

export const ESCROW_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  AI_REVIEWING: 'ai_reviewing',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled',
} as const;

export const MILESTONE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  COMPLETED: 'completed',
} as const;

export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const DISPUTE_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
} as const;

export const KYC_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export const AI_VERIFICATION_STATUS = {
  NOT_STARTED: 'not_started',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const NOTIFICATION_TYPE = {
  ESCROW_CREATED: 'escrow_created',
  WORK_SUBMITTED: 'work_submitted',
  AI_VERIFIED: 'ai_verified',
  FUNDS_RELEASED: 'funds_released',
  DISPUTE_OPENED: 'dispute_opened',
  MESSAGE_RECEIVED: 'message_received',
} as const;

// ============================================================================
// Color Values (Tailwind-compatible)
// ============================================================================

export const STATUS_COLORS = {
  // Escrow status colors
  pending: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-500/50',
  },
  active: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500',
    glow: 'shadow-blue-500/50',
  },
  ai_reviewing: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500',
    glow: 'shadow-purple-500/50',
  },
  completed: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500',
    glow: 'shadow-green-500/50',
  },
  disputed: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500',
    glow: 'shadow-red-500/50',
  },
  cancelled: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500',
    glow: 'shadow-gray-500/50',
  },
} as const;

export const THEME_COLORS = {
  // Cyberpunk neon colors
  primary: {
    cyan: '#00f0ff',
    purple: '#b026ff',
    pink: '#ff006e',
    electric: '#00ff9f',
  },
  // Background colors
  background: {
    dark: '#0a0a0f',
    darker: '#050508',
    card: '#1a1a2e',
    surface: '#16213e',
  },
  // Accent colors
  accent: {
    neon: '#39ff14',
    glow: '#ff00ff',
    warning: '#ffaa00',
    danger: '#ff0055',
  },
} as const;

export const CONFIDENCE_COLORS = {
  low: {
    color: '#ff0055',
    range: [0, 40],
  },
  medium: {
    color: '#ffaa00',
    range: [41, 70],
  },
  high: {
    color: '#39ff14',
    range: [71, 100],
  },
} as const;

// ============================================================================
// Configuration Values
// ============================================================================

export const APP_CONFIG = {
  name: 'AetherLock',
  version: '2.0.0',
  description: 'Trustless AI Escrow for Web3 Transactions',
  tagline: 'Secure. Transparent. Decentralized.',
} as const;

export const API_CONFIG = {
  baseUrl: (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:3001',
  websocketUrl: (import.meta.env?.VITE_WEBSOCKET_URL as string) || 'ws://localhost:3001',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

export const WALLET_CONFIG = {
  supportedWallets: [
    {
      id: 'phantom',
      name: 'Phantom',
      chain: 'solana',
      icon: '/icons/phantom.svg',
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      chain: 'zetachain',
      icon: '/icons/metamask.svg',
    },
    {
      id: 'sui',
      name: 'Sui Wallet',
      chain: 'sui',
      icon: '/icons/sui.svg',
    },
    {
      id: 'ton',
      name: 'TON Wallet',
      chain: 'ton',
      icon: '/icons/ton.svg',
    },
  ],
  supportedChains: ['solana', 'zetachain', 'sui', 'ton'],
  supportedCurrencies: ['SOL', 'USDC', 'ZETA'],
} as const;

export const IPFS_CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFileTypes: [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    // Videos
    'video/mp4',
    'video/webm',
    'video/quicktime',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ],
  pinataApiUrl: 'https://api.pinata.cloud',
  pinataGateway: 'https://gateway.pinata.cloud/ipfs',
} as const;

export const FORM_VALIDATION = {
  escrow: {
    titleMinLength: 5,
    titleMaxLength: 100,
    descriptionMinLength: 20,
    descriptionMaxLength: 2000,
    minAmount: 0.01,
    maxAmount: 1000000,
    minMilestones: 1,
    maxMilestones: 10,
  },
  submission: {
    descriptionMinLength: 20,
    descriptionMaxLength: 1000,
    minFiles: 1,
    maxFiles: 10,
  },
  dispute: {
    reasonMinLength: 50,
    reasonMaxLength: 1000,
    maxEvidenceFiles: 5,
  },
  chat: {
    messageMaxLength: 1000,
    messageMinLength: 1,
  },
  profile: {
    nameMinLength: 2,
    nameMaxLength: 50,
    maxSkills: 10,
  },
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,
  limitOptions: [10, 25, 50, 100],
} as const;

export const RATE_LIMITS = {
  apiRequestsPerMinute: 100,
  chatMessagesPerMinute: 30,
  fileUploadsPerHour: 50,
} as const;

export const TIMEOUTS = {
  toastDuration: 5000, // 5 seconds
  modalCloseDelay: 300, // 300ms
  debounceDelay: 500, // 500ms
  autoSaveDelay: 2000, // 2 seconds
  websocketReconnectDelay: 3000, // 3 seconds
  disputePeriod: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
} as const;

export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  particles: {
    count: 150,
    connectionDistance: 150,
    speed: 0.5,
  },
} as const;

export const ROUTES = {
  home: '/',
  landing: '/landing',
  auth: '/auth',
  dashboard: '/dashboard',
  clientDashboard: '/dashboard/client',
  freelancerDashboard: '/dashboard/freelancer',
  escrowCreate: '/escrow/create',
  escrowDetails: '/escrow/:id',
  aiVerification: '/ai-verification/:id',
  chat: '/chat/:escrowId',
  settings: '/settings',
  profile: '/profile/:address',
  faq: '/faq',
  terms: '/terms',
  privacy: '/privacy',
  contact: '/contact',
  notFound: '/404',
} as const;

export const SOCIAL_LINKS = {
  github: 'https://github.com/aetherlock',
  twitter: 'https://twitter.com/aetherlock',
  telegram: 'https://t.me/aetherlock',
  discord: 'https://discord.gg/aetherlock',
  docs: 'https://docs.aetherlock.app',
} as const;

export const FAQ_CATEGORIES = {
  ESCROW: 'escrow',
  AI: 'ai',
  SECURITY: 'security',
  KYC: 'kyc',
  FEES: 'fees',
  TECHNICAL: 'technical',
} as const;

// ============================================================================
// Type Exports
// ============================================================================

export type EscrowStatus = typeof ESCROW_STATUS[keyof typeof ESCROW_STATUS];
export type MilestoneStatus = typeof MILESTONE_STATUS[keyof typeof MILESTONE_STATUS];
export type SubmissionStatus = typeof SUBMISSION_STATUS[keyof typeof SUBMISSION_STATUS];
export type DisputeStatus = typeof DISPUTE_STATUS[keyof typeof DISPUTE_STATUS];
export type KYCStatus = typeof KYC_STATUS[keyof typeof KYC_STATUS];
export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];
export type FAQCategory = typeof FAQ_CATEGORIES[keyof typeof FAQ_CATEGORIES];
