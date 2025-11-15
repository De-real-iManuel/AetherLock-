import * as React from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/stores/walletStore';
import { 
  connectWallet, 
  getWalletStatus, 
  WalletError, 
  getWalletErrorMessage,
  type WalletType 
} from '@/services/wallet';
import { useNotification } from '@/hooks/useNotification';
import { Wallet, ExternalLink } from 'lucide-react';

interface WalletOption {
  id: WalletType;
  name: string;
  chain: 'solana' | 'zetachain' | 'sui' | 'ton';
  icon: string;
  installUrl: string;
  description: string;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    chain: 'solana',
    icon: '👻',
    installUrl: 'https://phantom.app',
    description: 'Solana wallet with built-in swap'
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    chain: 'zetachain',
    icon: '🦊',
    installUrl: 'https://metamask.io',
    description: 'Popular Ethereum & multi-chain wallet'
  },
  {
    id: 'sui',
    name: 'Sui Wallet',
    chain: 'sui',
    icon: '💧',
    installUrl: 'https://chrome.google.com/webstore/category/extensions',
    description: 'Official Sui blockchain wallet'
  },
  {
    id: 'ton',
    name: 'TON Wallet',
    chain: 'ton',
    icon: '💎',
    installUrl: 'https://ton.org',
    description: 'The Open Network wallet'
  }
];

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [connectingWallet, setConnectingWallet] = React.useState<WalletType | null>(null);
  const [walletStatus, setWalletStatus] = React.useState<Record<string, boolean>>({});
  const { connect, setConnecting, setError } = useWalletStore();
  const notification = useNotification();

  // Check wallet installation status on mount
  React.useEffect(() => {
    if (isOpen) {
      const status = getWalletStatus();
      setWalletStatus(status);
    }
  }, [isOpen]);

  const handleConnect = async (walletType: WalletType) => {
    setConnectingWallet(walletType);
    setConnecting(true);
    setError(null);

    try {
      const connection = await connectWallet(walletType);
      
      // Update wallet store
      connect(connection.walletType, connection.address, connection.chain);
      
      // Show success notification
      notification.success(
        'Wallet Connected',
        `Successfully connected to ${WALLET_OPTIONS.find(w => w.id === walletType)?.name}`
      );
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Wallet connection error:', error);
      
      let errorMessage = 'Failed to connect wallet';
      
      if (error instanceof WalletError) {
        errorMessage = getWalletErrorMessage(error);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      notification.error('Connection Failed', errorMessage);
    } finally {
      setConnectingWallet(null);
      setConnecting(false);
    }
  };

  const handleInstall = (installUrl: string) => {
    window.open(installUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Wallet"
      size="md"
      closeOnBackdropClick={!connectingWallet}
    >
      <div className="space-y-4">
        <p className="text-slate-300 text-sm">
          Choose a wallet to connect to AetherLock. Make sure you have the wallet extension installed.
        </p>

        <div className="space-y-3">
          {WALLET_OPTIONS.map((wallet) => {
            const isInstalled = walletStatus[wallet.id];
            const isConnecting = connectingWallet === wallet.id;

            return (
              <motion.div
                key={wallet.id}
                whileHover={{ scale: isConnecting ? 1 : 1.02 }}
                whileTap={{ scale: isConnecting ? 1 : 0.98 }}
                className="relative"
              >
                <button
                  onClick={() => isInstalled ? handleConnect(wallet.id) : handleInstall(wallet.installUrl)}
                  disabled={isConnecting}
                  className="w-full p-4 rounded-lg border-2 border-accent-electric/30 bg-primary-card/50 hover:bg-primary-card hover:border-accent-electric/60 transition-all backdrop-blur-sm text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Wallet Icon */}
                      <div className="text-4xl">{wallet.icon}</div>
                      
                      {/* Wallet Info */}
                      <div>
                        <h3 className="text-white font-semibold flex items-center space-x-2">
                          <span>{wallet.name}</span>
                          {!isInstalled && (
                            <span className="text-xs text-status-pending bg-status-pending/20 px-2 py-0.5 rounded">
                              Not Installed
                            </span>
                          )}
                        </h3>
                        <p className="text-slate-400 text-sm">{wallet.description}</p>
                        <p className="text-accent-cyan text-xs mt-1">
                          Chain: {wallet.chain.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Action Icon */}
                    <div className="flex-shrink-0">
                      {isConnecting ? (
                        <svg
                          className="animate-spin h-6 w-6 text-accent-electric"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : isInstalled ? (
                        <Wallet className="h-6 w-6 text-accent-electric group-hover:text-accent-cyan transition-colors" />
                      ) : (
                        <ExternalLink className="h-6 w-6 text-slate-400 group-hover:text-accent-electric transition-colors" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-electric/0 via-accent-electric/5 to-accent-cyan/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
          <p className="text-sm text-slate-300">
            <span className="text-accent-cyan font-semibold">New to crypto wallets?</span>
            <br />
            Wallets are used to securely store your digital assets and interact with blockchain applications.
            We recommend starting with Phantom for Solana or MetaMask for Ethereum-based chains.
          </p>
        </div>
      </div>
    </Modal>
  );
};
