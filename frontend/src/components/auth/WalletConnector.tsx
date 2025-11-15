import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface WalletConnectorProps {
  onConnect: (address: string, chain: string) => void;
  supportedWallets: string[];
}

const WalletConnector = React.forwardRef<HTMLDivElement, WalletConnectorProps>(
  ({ onConnect, supportedWallets }, ref) => {
    const [isConnecting, setIsConnecting] = React.useState(false);
    const [selectedWallet, setSelectedWallet] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const walletConfigs = {
      phantom: {
        name: 'Phantom',
        icon: '👻',
        chain: 'solana',
        check: () => window.solana?.isPhantom
      },
      metamask: {
        name: 'MetaMask',
        icon: '🦊',
        chain: 'zetachain',
        check: () => window.ethereum?.isMetaMask
      },
      sui: {
        name: 'Sui Wallet',
        icon: '🌊',
        chain: 'sui',
        check: () => window.suiWallet
      },
      ton: {
        name: 'TON Wallet',
        icon: '💎',
        chain: 'ton',
        check: () => window.tonWallet
      }
    };

    const connectWallet = async (walletType: string) => {
      setIsConnecting(true);
      setSelectedWallet(walletType);
      setError(null);

      try {
        const config = walletConfigs[walletType];
        
        if (!config.check()) {
          throw new Error(`${config.name} not installed`);
        }

        let address = '';
        
        if (walletType === 'phantom') {
          const response = await window.solana.connect();
          address = response.publicKey.toString();
        } else if (walletType === 'metamask') {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          address = accounts[0];
        }

        onConnect(address, config.chain);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsConnecting(false);
        setSelectedWallet(null);
      }
    };

    return (
      <div ref={ref} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {supportedWallets.map((walletType) => {
            const config = walletConfigs[walletType];
            const isAvailable = config.check();
            const isLoading = isConnecting && selectedWallet === walletType;

            return (
              <motion.div
                key={walletType}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-4 cursor-pointer border-slate-700 hover:border-cyan-500 transition-colors">
                  <Button
                    onClick={() => connectWallet(walletType)}
                    disabled={!isAvailable || isConnecting}
                    className="w-full h-auto p-4 bg-transparent hover:bg-slate-800"
                    variant="ghost"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-2xl">{config.icon}</span>
                      <span className="font-medium">{config.name}</span>
                      <span className="text-xs text-slate-400 capitalize">{config.chain}</span>
                      {isLoading && (
                        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {!isAvailable && (
                        <span className="text-xs text-red-400">Not installed</span>
                      )}
                    </div>
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </div>
    );
  }
);

WalletConnector.displayName = 'WalletConnector';

export { WalletConnector };