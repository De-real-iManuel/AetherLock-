import * as React from 'react';

interface WalletContextType {
  address: string | null;
  chain: 'solana' | 'zetachain' | 'sui' | 'ton' | null;
  balance: number;
  isConnected: boolean;
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
  switchChain: (chain: string) => Promise<void>;
}

const WalletContext = React.createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = React.useState<string | null>(null);
  const [chain, setChain] = React.useState<'solana' | 'zetachain' | 'sui' | 'ton' | null>(null);
  const [balance, setBalance] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);

  const connect = async (walletType: string) => {
    if (walletType === 'phantom' && window.solana) {
      const response = await window.solana.connect();
      setAddress(response.publicKey.toString());
      setChain('solana');
      setIsConnected(true);
    } else if (walletType === 'metamask' && window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setChain('zetachain');
      setIsConnected(true);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setChain(null);
    setBalance(0);
    setIsConnected(false);
  };

  const switchChain = async (newChain: string) => {
    setChain(newChain as any);
  };

  return (
    <WalletContext.Provider value={{ address, chain, balance, isConnected, connect, disconnect, switchChain }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = React.useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};