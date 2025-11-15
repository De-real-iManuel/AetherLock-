// Wallet types
export type WalletType = 'phantom' | 'metamask' | 'sui' | 'ton';
export type ChainType = 'solana' | 'zetachain' | 'sui' | 'ton';

// Wallet connection result
export interface WalletConnection {
  address: string;
  chain: ChainType;
  walletType: WalletType;
  publicKey?: string;
}

// Wallet error types
export class WalletError extends Error {
  constructor(
    message: string,
    public code?: string,
    public walletType?: WalletType
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

// Phantom (Solana) wallet interface
interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
  publicKey?: { toString: () => string };
}

// MetaMask (Ethereum/ZetaChain) provider interface
interface MetaMaskProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

// Sui wallet interface
interface SuiProvider {
  connect: () => Promise<{ address: string }>;
  disconnect: () => Promise<void>;
  signMessage: (message: { message: Uint8Array }) => Promise<{ signature: string }>;
}

// TON wallet interface
interface TonProvider {
  connect: () => Promise<{ address: string }>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<{ signature: string }>;
}

// Declare window extensions
declare global {
  interface Window {
    phantom?: { solana?: PhantomProvider };
    solana?: PhantomProvider;
    ethereum?: MetaMaskProvider;
    suiWallet?: SuiProvider;
    ton?: TonProvider;
  }
}

/**
 * Check if Phantom wallet is installed
 */
export const isPhantomInstalled = (): boolean => {
  return !!(window.phantom?.solana || window.solana?.isPhantom);
};

/**
 * Check if MetaMask wallet is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  return !!(window.ethereum?.isMetaMask);
};

/**
 * Check if Sui wallet is installed
 */
export const isSuiWalletInstalled = (): boolean => {
  return !!window.suiWallet;
};

/**
 * Check if TON wallet is installed
 */
export const isTonWalletInstalled = (): boolean => {
  return !!window.ton;
};

/**
 * Get wallet installation status for all supported wallets
 */
export const getWalletStatus = () => {
  return {
    phantom: isPhantomInstalled(),
    metamask: isMetaMaskInstalled(),
    sui: isSuiWalletInstalled(),
    ton: isTonWalletInstalled(),
  };
};

/**
 * Connect to Phantom wallet (Solana)
 */
export const connectPhantom = async (): Promise<WalletConnection> => {
  try {
    const provider = window.phantom?.solana || window.solana;
    
    if (!provider || !provider.isPhantom) {
      throw new WalletError(
        'Phantom wallet is not installed. Please install it from https://phantom.app',
        'NOT_INSTALLED',
        'phantom'
      );
    }

    const response = await provider.connect();
    const address = response.publicKey.toString();

    return {
      address,
      chain: 'solana',
      walletType: 'phantom',
      publicKey: address,
    };
  } catch (error: any) {
    if (error.code === 4001 || error.message?.includes('User rejected')) {
      throw new WalletError('Connection cancelled by user', 'USER_REJECTED', 'phantom');
    }
    throw new WalletError(
      error.message || 'Failed to connect to Phantom wallet',
      'CONNECTION_FAILED',
      'phantom'
    );
  }
};

/**
 * Connect to MetaMask wallet (Ethereum/ZetaChain)
 */
export const connectMetaMask = async (): Promise<WalletConnection> => {
  try {
    const provider = window.ethereum;
    
    if (!provider || !provider.isMetaMask) {
      throw new WalletError(
        'MetaMask wallet is not installed. Please install it from https://metamask.io',
        'NOT_INSTALLED',
        'metamask'
      );
    }

    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new WalletError('No accounts found', 'NO_ACCOUNTS', 'metamask');
    }

    return {
      address: accounts[0],
      chain: 'zetachain',
      walletType: 'metamask',
    };
  } catch (error: any) {
    if (error.code === 4001 || error.message?.includes('User rejected')) {
      throw new WalletError('Connection cancelled by user', 'USER_REJECTED', 'metamask');
    }
    throw new WalletError(
      error.message || 'Failed to connect to MetaMask wallet',
      'CONNECTION_FAILED',
      'metamask'
    );
  }
};

/**
 * Connect to Sui wallet
 */
export const connectSuiWallet = async (): Promise<WalletConnection> => {
  try {
    const provider = window.suiWallet;
    
    if (!provider) {
      throw new WalletError(
        'Sui wallet is not installed. Please install it from the Chrome Web Store',
        'NOT_INSTALLED',
        'sui'
      );
    }

    const response = await provider.connect();

    return {
      address: response.address,
      chain: 'sui',
      walletType: 'sui',
    };
  } catch (error: any) {
    if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
      throw new WalletError('Connection cancelled by user', 'USER_REJECTED', 'sui');
    }
    throw new WalletError(
      error.message || 'Failed to connect to Sui wallet',
      'CONNECTION_FAILED',
      'sui'
    );
  }
};

/**
 * Connect to TON wallet
 */
export const connectTonWallet = async (): Promise<WalletConnection> => {
  try {
    const provider = window.ton;
    
    if (!provider) {
      throw new WalletError(
        'TON wallet is not installed. Please install it from https://ton.org',
        'NOT_INSTALLED',
        'ton'
      );
    }

    const response = await provider.connect();

    return {
      address: response.address,
      chain: 'ton',
      walletType: 'ton',
    };
  } catch (error: any) {
    if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
      throw new WalletError('Connection cancelled by user', 'USER_REJECTED', 'ton');
    }
    throw new WalletError(
      error.message || 'Failed to connect to TON wallet',
      'CONNECTION_FAILED',
      'ton'
    );
  }
};

/**
 * Connect to wallet based on type
 */
export const connectWallet = async (walletType: WalletType): Promise<WalletConnection> => {
  switch (walletType) {
    case 'phantom':
      return connectPhantom();
    case 'metamask':
      return connectMetaMask();
    case 'sui':
      return connectSuiWallet();
    case 'ton':
      return connectTonWallet();
    default:
      throw new WalletError(`Unsupported wallet type: ${walletType}`, 'UNSUPPORTED_WALLET');
  }
};

/**
 * Disconnect from Phantom wallet
 */
export const disconnectPhantom = async (): Promise<void> => {
  const provider = window.phantom?.solana || window.solana;
  if (provider && provider.isPhantom) {
    await provider.disconnect();
  }
};

/**
 * Disconnect from wallet based on type
 */
export const disconnectWallet = async (walletType: WalletType): Promise<void> => {
  try {
    switch (walletType) {
      case 'phantom':
        await disconnectPhantom();
        break;
      case 'sui':
        if (window.suiWallet) {
          await window.suiWallet.disconnect();
        }
        break;
      case 'ton':
        if (window.ton) {
          await window.ton.disconnect();
        }
        break;
      // MetaMask doesn't have a disconnect method
      case 'metamask':
        break;
    }
  } catch (error: any) {
    console.error(`Failed to disconnect ${walletType}:`, error);
  }
};

/**
 * Sign a message with Phantom wallet for authentication
 */
export const signMessagePhantom = async (message: string): Promise<string> => {
  try {
    const provider = window.phantom?.solana || window.solana;
    
    if (!provider || !provider.isPhantom) {
      throw new WalletError('Phantom wallet not connected', 'NOT_CONNECTED', 'phantom');
    }

    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await provider.signMessage(encodedMessage, 'utf8');
    
    // Convert signature to base64
    const signatureArray = Array.from(signedMessage.signature);
    return btoa(String.fromCharCode(...signatureArray));
  } catch (error: any) {
    throw new WalletError(
      error.message || 'Failed to sign message',
      'SIGN_FAILED',
      'phantom'
    );
  }
};

/**
 * Sign a message with MetaMask wallet for authentication
 */
export const signMessageMetaMask = async (message: string, address: string): Promise<string> => {
  try {
    const provider = window.ethereum;
    
    if (!provider || !provider.isMetaMask) {
      throw new WalletError('MetaMask wallet not connected', 'NOT_CONNECTED', 'metamask');
    }

    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address],
    });

    return signature;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new WalletError('Signature cancelled by user', 'USER_REJECTED', 'metamask');
    }
    throw new WalletError(
      error.message || 'Failed to sign message',
      'SIGN_FAILED',
      'metamask'
    );
  }
};

/**
 * Sign a message with Sui wallet for authentication
 */
export const signMessageSui = async (message: string): Promise<string> => {
  try {
    const provider = window.suiWallet;
    
    if (!provider) {
      throw new WalletError('Sui wallet not connected', 'NOT_CONNECTED', 'sui');
    }

    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await provider.signMessage({ message: encodedMessage });
    
    return signedMessage.signature;
  } catch (error: any) {
    throw new WalletError(
      error.message || 'Failed to sign message',
      'SIGN_FAILED',
      'sui'
    );
  }
};

/**
 * Sign a message with TON wallet for authentication
 */
export const signMessageTon = async (message: string): Promise<string> => {
  try {
    const provider = window.ton;
    
    if (!provider) {
      throw new WalletError('TON wallet not connected', 'NOT_CONNECTED', 'ton');
    }

    const signedMessage = await provider.signMessage(message);
    
    return signedMessage.signature;
  } catch (error: any) {
    throw new WalletError(
      error.message || 'Failed to sign message',
      'SIGN_FAILED',
      'ton'
    );
  }
};

/**
 * Sign a message for authentication based on wallet type
 */
export const signMessage = async (
  message: string,
  walletType: WalletType,
  address?: string
): Promise<string> => {
  switch (walletType) {
    case 'phantom':
      return signMessagePhantom(message);
    case 'metamask':
      if (!address) {
        throw new WalletError('Address required for MetaMask signing', 'MISSING_ADDRESS', 'metamask');
      }
      return signMessageMetaMask(message, address);
    case 'sui':
      return signMessageSui(message);
    case 'ton':
      return signMessageTon(message);
    default:
      throw new WalletError(`Unsupported wallet type: ${walletType}`, 'UNSUPPORTED_WALLET');
  }
};

/**
 * Get user-friendly error message
 */
export const getWalletErrorMessage = (error: WalletError): string => {
  switch (error.code) {
    case 'NOT_INSTALLED':
      return error.message;
    case 'USER_REJECTED':
      return 'Connection cancelled';
    case 'CONNECTION_FAILED':
      return `Failed to connect to ${error.walletType} wallet`;
    case 'NOT_CONNECTED':
      return 'Wallet not connected';
    case 'SIGN_FAILED':
      return 'Failed to sign message';
    case 'NO_ACCOUNTS':
      return 'No accounts found in wallet';
    default:
      return error.message || 'An unknown error occurred';
  }
};
