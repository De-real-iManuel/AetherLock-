// Re-export all types from modular type files
export * from './models';
export * from './api';
export * from './components';

// Legacy types for backward compatibility
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