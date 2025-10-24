// Core application types
export interface User {
  address: string;
  isConnected: boolean;
  balance: TokenBalance[];
  kycStatus: KYCStatus;
  connectedNetworks: NetworkInfo[];
}

export interface TokenBalance {
  token: 'SOL' | 'USDC' | 'TON' | 'SUI';
  amount: string;
  decimals: number;
  usdValue?: number;
}

export interface NetworkInfo {
  chainId: string;
  name: string;
  rpcUrl: string;
  status: 'active' | 'inactive';
}

export interface KYCStatus {
  isVerified: boolean;
  proofHash?: string;
  verifiedAt?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'failed';
}

export interface Escrow {
  id: string;
  buyer: string;
  seller: string;
  amount: TokenBalance;
  status: EscrowStatus;
  aiVerificationStatus: AIVerificationStatus;
  disputeTimer?: number;
  createdAt: Date;
  expiresAt: Date;
  taskDescription: string;
  evidenceHash?: string;
}

export type EscrowStatus = 'pending' | 'funded' | 'completed' | 'disputed' | 'cancelled';
export type AIVerificationStatus = 'pending' | 'processing' | 'verified' | 'failed';

export interface WalletProvider {
  id: 'phantom' | 'solflare' | 'walletconnect' | 'tonkeeper' | 'slush';
  name: string;
  icon: string;
  chains: string[];
  isInstalled: boolean;
}

export interface Theme {
  mode: 'dark' | 'light' | 'system';
  colors: ThemeColors;
}

export interface ThemeColors {
  primary: {
    background: string;
    surface: string;
    card: string;
    border: string;
  };
  accent: {
    electric: string;
    purple: string;
    cyan: string;
    neon: string;
  };
  status: {
    pending: string;
    verified: string;
    disputed: string;
    failed: string;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  autoClose?: boolean;
}