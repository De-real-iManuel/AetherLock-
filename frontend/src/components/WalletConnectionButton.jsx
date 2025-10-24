import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink, Zap, Sparkles, Shield } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletConnection } from '../hooks/useWalletConnection';
import WalletConnectionModal from './WalletConnectionModal';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

const WalletConnectionButton = ({ className }) => {
  const { wallet, publicKey, connected, connecting, disconnect } = useWallet();
  const {
    balance,
    connectionState,
    formatBalance,
    error,
    refreshBalance
  } = useWalletConnection();

  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [justConnected, setJustConnected] = useState(false);

  // Celebrate successful connection
  useEffect(() => {
    if (connected && !justConnected) {
      setJustConnected(true);
      
      // Trigger celebration confetti
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#9333ea', '#06b6d4', '#10b981']
        });
      }, 100);
      
      // Reset after celebration
      setTimeout(() => setJustConnected(false), 3000);
    }
  }, [connected, justConnected]);

  const handleConnect = async (walletAdapter) => {
    // The wallet connection is handled by the modal
    setShowModal(false);
    return { success: true };
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDropdown(false);
      setJustConnected(false);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    const str = address.toString();
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  };

  // Connected state - show wallet info with dropdown
  if (connected && publicKey) {
    return (
      <div className="relative">
        <motion.button
          className={cn(
            "flex items-center space-x-3 px-5 py-3 rounded-2xl relative overflow-hidden group",
            "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600",
            "hover:from-green-500 hover:via-emerald-500 hover:to-teal-500",
            "border border-green-500/50 shadow-xl shadow-green-500/30",
            "transition-all duration-500",
            justConnected && "animate-pulse",
            className
          )}
          onClick={() => setShowDropdown(!showDropdown)}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Animated background shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "easeInOut" 
            }}
          />

          {/* Enhanced status indicator */}
          <motion.div
            className="relative w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50"
            animate={{ 
              scale: [1, 1.3, 1],
              boxShadow: [
                '0 0 5px rgba(74, 222, 128, 0.5)',
                '0 0 15px rgba(74, 222, 128, 0.8)',
                '0 0 5px rgba(74, 222, 128, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {justConnected && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-green-300"
                animate={{ scale: [1, 2], opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
          
          {/* Wallet info with enhanced styling */}
          <div className="flex flex-col items-start relative z-10">
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Wallet className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-sm font-semibold text-white">
                {truncateAddress(publicKey)}
              </span>
              {justConnected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              )}
            </div>
            <motion.span 
              className="text-xs text-green-100 font-medium"
              animate={justConnected ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {formatBalance(balance)}
            </motion.span>
          </div>
          
          <motion.div
            animate={{ rotate: showDropdown ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </motion.div>
        </motion.button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              className="absolute top-full right-0 mt-3 w-72 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header with wallet info */}
              <div className="p-5 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Connected Wallet</h3>
                    <p className="text-xs text-slate-400">{wallet?.adapter?.name || 'Unknown'}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Address</span>
                  <motion.button
                    onClick={copyAddress}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-green-400 flex items-center space-x-1"
                      >
                        <span className="text-xs">Copied!</span>
                        <span>✓</span>
                      </motion.div>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
                <motion.div 
                  className="font-mono text-xs text-slate-300 bg-slate-900/50 p-3 rounded-lg mt-2 break-all border border-slate-700/50"
                  whileHover={{ borderColor: 'rgba(147, 51, 234, 0.5)' }}
                  transition={{ duration: 0.2 }}
                >
                  {publicKey.toString()}
                </motion.div>
              </div>

              {/* Balance section */}
              <div className="p-5 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">Balance</span>
                    <motion.button
                      onClick={refreshBalance}
                      className="p-1 text-slate-500 hover:text-slate-300 rounded"
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </motion.button>
                  </div>
                  <motion.span 
                    className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {formatBalance(balance)}
                  </motion.span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-3 space-y-2">
                <motion.button
                  onClick={() => {
                    window.open(`https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`, '_blank');
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ExternalLink className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                  <span>View on Explorer</span>
                  <motion.div
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -5 }}
                    animate={{ x: 0 }}
                  >
                    <span className="text-xs text-cyan-400">↗</span>
                  </motion.div>
                </motion.button>
                
                <motion.button
                  onClick={handleDisconnect}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Disconnect Wallet</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  // Connecting state
  if (connecting || connectionState === 'connecting') {
    return (
      <motion.button
        className={cn(
          "flex items-center space-x-3 px-6 py-3 rounded-2xl relative overflow-hidden",
          "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600",
          "border border-purple-500/50 shadow-lg shadow-purple-500/25",
          "cursor-not-allowed",
          className
        )}
        disabled
        initial={{ opacity: 0.8 }}
        animate={{ 
          opacity: [0.8, 1, 0.8],
          scale: [1, 1.02, 1]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Animated background wave */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full relative z-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="text-sm font-semibold text-white relative z-10">Connecting Wallet...</span>
        
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 border-2 border-white/30 rounded-2xl"
          animate={{ scale: [1, 1.1], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.button>
    );
  }

  // Disconnected state - show connect button
  return (
    <>
      <motion.button
        className={cn(
          "flex items-center space-x-3 px-6 py-3 rounded-2xl relative overflow-hidden group",
          "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600",
          "hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500",
          "border border-purple-500/50 shadow-xl shadow-purple-500/30",
          "transition-all duration-500",
          className
        )}
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        <motion.div
          className="relative z-10"
          whileHover={{ rotate: 15 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Wallet className="w-5 h-5 text-white" />
        </motion.div>
        
        <span className="text-sm font-semibold text-white relative z-10">Connect Wallet</span>
        
        <motion.div
          className="relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"
          initial={{ x: -10, scale: 0.8 }}
          whileHover={{ x: 0, scale: 1 }}
        >
          <Zap className="w-5 h-5 text-yellow-300" />
        </motion.div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      {/* Connection Modal */}
      <WalletConnectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConnect={handleConnect}
      />

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="absolute top-full left-0 mt-2 p-2 bg-red-900/90 border border-red-700 rounded-lg text-sm text-red-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WalletConnectionButton;