import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const useWalletConnection = () => {
  const { wallet, publicKey, connected, connecting, disconnect, select } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'

  // Update connection state based on wallet status
  useEffect(() => {
    if (connecting) {
      setConnectionState('connecting');
    } else if (connected && publicKey) {
      setConnectionState('connected');
      setError(null);
    } else {
      setConnectionState('disconnected');
    }
  }, [connecting, connected, publicKey]);

  // Fetch wallet balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey && connection) {
        try {
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL);
        } catch (err) {
          console.error('Failed to fetch balance:', err);
          setError('Failed to fetch wallet balance');
        }
      } else {
        setBalance(0);
      }
    };

    fetchBalance();
    
    // Set up balance polling
    const interval = setInterval(fetchBalance, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [connected, publicKey, connection]);

  // Connect to a specific wallet
  const connectWallet = useCallback(async (walletName) => {
    setIsLoading(true);
    setError(null);

    try {
      // Map wallet names to adapter names
      const walletMap = {
        'phantom': 'Phantom',
        'solflare': 'Solflare',
        'backpack': 'Backpack',
        'metamask': 'metamask'
      };

      const adapterName = walletMap[walletName] || walletName;
      
      // Select the wallet adapter
      select(adapterName);
      
      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 30000); // 30 second timeout

        const checkConnection = () => {
          if (connected && publicKey) {
            clearTimeout(timeout);
            resolve();
          } else if (!connecting) {
            // If not connecting anymore but also not connected, it failed
            clearTimeout(timeout);
            reject(new Error('Connection failed'));
          } else {
            // Still connecting, check again
            setTimeout(checkConnection, 100);
          }
        };

        checkConnection();
      });

      setIsLoading(false);
      return { success: true, publicKey: publicKey.toString() };
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      setConnectionState('error');
      return { success: false, error: err.message };
    }
  }, [select, connected, publicKey, connecting]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      setBalance(0);
      setError(null);
      setConnectionState('disconnected');
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [disconnect]);

  // Refresh balance manually
  const refreshBalance = useCallback(async () => {
    if (connected && publicKey && connection) {
      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
        return balance / LAMPORTS_PER_SOL;
      } catch (err) {
        setError('Failed to refresh balance');
        throw err;
      }
    }
    return 0;
  }, [connected, publicKey, connection]);

  return {
    // Wallet state
    wallet,
    publicKey,
    connected,
    connecting,
    balance,
    connectionState,
    isLoading,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    refreshBalance,
    
    // Utilities
    formatBalance: (amount) => `${amount.toFixed(4)} SOL`,
    isWalletInstalled: (walletName) => {
      // Check if specific wallet is installed
      switch (walletName) {
        case 'phantom':
          return typeof window !== 'undefined' && window.solana?.isPhantom;
        case 'solflare':
          return typeof window !== 'undefined' && window.solflare;
        case 'backpack':
          return typeof window !== 'undefined' && window.backpack;
        default:
          return false;
      }
    }
  };
};