import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Wallet, X, Zap, Shield, Sparkles, ExternalLink, Info, Star, Hexagon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWallet } from '@solana/wallet-adapter-react';
import { cn } from '../lib/utils';
import ParticleBackground from './ParticleBackground';

// Enhanced wallet option component with advanced hover effects
const WalletOption = ({ wallet, onSelect, isConnecting, isInstalled }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef();

  const handleMouseMove = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "relative w-full p-5 rounded-2xl border-2 transition-all duration-500 group overflow-hidden",
        "bg-slate-800/30 backdrop-blur-xl border-slate-700/50",
        "hover:border-purple-500/70 hover:bg-slate-700/50",
        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900",
        isConnecting && "opacity-50 cursor-not-allowed",
        !isInstalled && "opacity-60"
      )}
      onClick={() => !isConnecting && onSelect(wallet)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      disabled={isConnecting}
    >
      {/* Animated background glow with gradient */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 via-cyan-500/10 to-emerald-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
        }}
        initial={{ x: '-100%' }}
        animate={isHovered ? { x: '100%' } : { x: '-100%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      <div className="relative flex items-center space-x-4">
        <div className="relative">
          <motion.div
            className="relative w-14 h-14 rounded-xl overflow-hidden"
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src={wallet.icon} 
              alt={wallet.name}
              className="w-full h-full object-cover"
            />
            {/* Animated ring around icon */}
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-purple-400/60"
              initial={{ scale: 1, opacity: 0 }}
              animate={isHovered ? { 
                scale: [1, 1.1, 1.05], 
                opacity: [0, 1, 0.7] 
              } : { scale: 1, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-xl border border-purple-300"
              animate={isHovered ? {
                scale: [1, 1.2, 1.4],
                opacity: [0.5, 0.2, 0]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          
          {/* Installation status indicator */}
          <motion.div
            className={cn(
              "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800",
              isInstalled ? "bg-green-500" : "bg-orange-500"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          />
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
              {wallet.name}
            </h3>
            {!isInstalled && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <ExternalLink className="w-4 h-4 text-orange-400" />
              </motion.div>
            )}
          </div>
          <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
            {wallet.description}
          </p>
          {!isInstalled && (
            <motion.p
              className="text-xs text-orange-400 mt-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Click to install
            </motion.p>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex flex-col items-end space-y-2">
          {/* Animated connecting indicator */}
          {isConnecting && (
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.div
                className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-sm text-purple-400 font-medium">Connecting...</span>
            </motion.div>
          )}

          {/* Hover effects */}
          <AnimatePresence>
            {isHovered && !isConnecting && (
              <motion.div
                className="flex items-center space-x-1"
                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Zap className="w-5 h-5 text-purple-400" />
                </motion.div>
                <span className="text-sm text-purple-400 font-medium">
                  {isInstalled ? 'Connect' : 'Install'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"
        initial={{ width: 0 }}
        animate={isHovered ? { width: '100%' } : { width: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.button>
  );
};

// Enhanced success animation component with spectacular effects
const SuccessAnimation = ({ walletName, onComplete }) => {
  const confettiRef = useRef();
  
  useEffect(() => {
    // Multi-stage confetti celebration with enhanced effects
    const celebrateConnection = () => {
      // Stage 1: Initial explosion from center
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#9333ea', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
        gravity: 0.9,
        scalar: 1.4,
        drift: 0.1,
        ticks: 300
      });

      // Stage 2: Side cannons with different colors
      setTimeout(() => {
        // Left cannon - purple theme
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 65,
          origin: { x: 0, y: 0.6 },
          colors: ['#9333ea', '#c084fc', '#a855f7'],
          gravity: 0.8,
          scalar: 1.2,
          shapes: ['circle', 'square']
        });
        
        // Right cannon - cyan theme
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 65,
          origin: { x: 1, y: 0.6 },
          colors: ['#06b6d4', '#67e8f9', '#22d3ee'],
          gravity: 0.8,
          scalar: 1.2,
          shapes: ['circle', 'square']
        });
      }, 250);

      // Stage 3: Top-down golden rain
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 120,
          origin: { y: 0.1 },
          colors: ['#fbbf24', '#f59e0b', '#eab308'],
          shapes: ['star'],
          scalar: 1.0,
          gravity: 0.6,
          drift: 0.2
        });
      }, 500);

      // Stage 4: Final celebration burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 360,
          origin: { y: 0.5 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
          shapes: ['circle'],
          scalar: 0.9,
          gravity: 1.2,
          ticks: 200
        });
      }, 750);

      // Stage 5: Continuous sparkles
      const sparkleInterval = setInterval(() => {
        confetti({
          particleCount: 3,
          spread: 60,
          origin: { 
            x: Math.random() * 0.6 + 0.2, 
            y: Math.random() * 0.4 + 0.3 
          },
          colors: ['#fbbf24', '#f59e0b'],
          shapes: ['star'],
          scalar: 0.6,
          gravity: 0.4,
          ticks: 100
        });
      }, 300);

      // Clear sparkles after 3 seconds
      setTimeout(() => clearInterval(sparkleInterval), 3000);
    };

    celebrateConnection();

    // Auto-close after animation
    const timer = setTimeout(onComplete, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="text-center py-10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Main success icon with enhanced animations */}
      <motion.div
        className="relative mx-auto w-24 h-24 mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          delay: 0.2, 
          type: "spring", 
          stiffness: 200, 
          damping: 15 
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl"
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(16, 185, 129, 0.5)',
              '0 0 40px rgba(16, 185, 129, 0.8)',
              '0 0 20px rgba(16, 185, 129, 0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          >
            <Shield className="w-12 h-12 text-white" />
          </motion.div>
        </motion.div>
        
        {/* Multiple animated rings with different effects */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute inset-0 rounded-full border-2",
              i % 2 === 0 ? "border-green-400" : "border-emerald-300"
            )}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ 
              scale: [1, 2.5 + i * 0.3], 
              opacity: [1, 0.3, 0] 
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Sparkle particles around the icon */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 0'
            }}
            animate={{
              rotate: [0, 360],
              scale: [0, 1, 0],
              x: [0, Math.cos(i * 45 * Math.PI / 180) * 40],
              y: [0, Math.sin(i * 45 * Math.PI / 180) * 40]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.8 + i * 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>

      {/* Success text with typewriter effect */}
      <motion.h3
        className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        Wallet Connected!
      </motion.h3>
      
      <motion.p
        className="text-lg text-slate-300 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Successfully connected to <span className="font-semibold text-white">{walletName}</span>
      </motion.p>

      {/* Feature highlights */}
      <motion.div
        className="flex justify-center space-x-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {[
          { icon: Shield, label: 'Secure', color: 'text-green-400' },
          { icon: Zap, label: 'Fast', color: 'text-yellow-400' },
          { icon: Sparkles, label: 'Ready', color: 'text-purple-400' }
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="flex flex-col items-center space-y-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2 + i * 0.1, type: "spring", stiffness: 200 }}
          >
            <item.icon className={cn("w-5 h-5", item.color)} />
            <span className="text-xs text-slate-400">{item.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Animated progress bar */}
      <motion.div
        className="w-full max-w-xs mx-auto h-1 bg-slate-700 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 1.6, duration: 1, ease: "easeOut" }}
        />
      </motion.div>

      <motion.p
        className="text-sm text-slate-500 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        Redirecting to dashboard...
      </motion.p>
    </motion.div>
  );
};

const WalletConnectionModal = ({ isOpen, onClose, onConnect }) => {
  const { wallets: availableWallets, select, connected, connecting } = useWallet();
  const [connectionState, setConnectionState] = useState('selecting'); // 'selecting', 'connecting', 'success', 'error'
  const [connectingWallet, setConnectingWallet] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [error, setError] = useState(null);

  // Enhanced wallet configurations with real adapter data
  const walletConfigs = [
    {
      name: 'Phantom',
      description: 'The most popular Solana wallet with seamless DeFi integration',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiByeD0iMjYiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzIpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNzguMDc1MyAzNi4yNTc4QzgwLjQzMTggMzMuOTAxMyA4My4zNzE0IDMyLjUgODYuNDc1MyAzMi41SDk2QzEwMC4xNDIgMzIuNSAxMDMuNSAzNS44NTc5IDEwMy41IDQwVjY4QzEwMy41IDcyLjE0MjEgMTAwLjE0MiA3NS41IDk2IDc1LjVIODYuNDc1M0M4My4zNzE0IDc1LjUgODAuNDMxOCA3NC4wOTg3IDc4LjA3NTMgNzEuNzQyMkw2OC4yNTc4IDYxLjkyNDdDNjUuOTAxMyA1OS41NjgyIDY1LjkwMTMgNTUuNDMxOCA2OC4yNTc4IDUzLjA3NTNMNzguMDc1MyAzNi4yNTc4WiIgZmlsbD0iIzUzNDI5NiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTI5LjkyNDcgMzYuMjU3OEMzMi4yODEyIDMzLjkwMTMgMzUuMjIwOCAzMi41IDM4LjMyNDcgMzIuNUg0N0M1MS4xNDIxIDMyLjUgNTQuNSAzNS44NTc5IDU0LjUgNDBWNjhDNTQuNSA3Mi4xNDIxIDUxLjE0MjEgNzUuNSA0NyA3NS41SDM4LjMyNDdDMzUuMjIwOCA3NS41IDMyLjI4MTIgNzQuMDk4NyAyOS45MjQ3IDcxLjc0MjJMMjAuMTA3MiA2MS45MjQ3QzE3Ljc1MDcgNTkuNTY4MiAxNy43NTA3IDU1LjQzMTggMjAuMTA3MiA1My4wNzUzTDI5LjkyNDcgMzYuMjU3OFoiIGZpbGw9IiM1MzQyOTYiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xXzIiIHgxPSIwIiB5MT0iMCIgeDI9IjEwOCIgeTI9IjEwOCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNTM0Mjk2Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzU1MzRBNSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=',
      adapter: 'Phantom',
      installUrl: 'https://phantom.app/',
      features: ['DeFi Ready', 'NFT Support', 'Staking']
    },
    {
      name: 'Solflare',
      description: 'Secure Solana wallet with advanced security features',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiNGRkM5NDciLz4KPHBhdGggZD0iTTI1IDc1TDc1IDI1IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0yNSAyNUw3NSA3NSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K',
      adapter: 'Solflare',
      installUrl: 'https://solflare.com/',
      features: ['Hardware Support', 'Multi-Device', 'Advanced Security']
    },
    {
      name: 'Backpack',
      description: 'Multi-chain wallet for Solana and Ethereum ecosystems',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiMwMDAwMDAiLz4KPHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHJ4PSIxMCIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K',
      adapter: 'Backpack',
      installUrl: 'https://backpack.app/',
      features: ['Multi-Chain', 'Social Features', 'xNFTs']
    },
    {
      name: 'Torus',
      description: 'Social login wallet with email and OAuth integration',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiMwMzY0ZmYiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzAiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
      adapter: 'Torus',
      installUrl: 'https://tor.us/',
      features: ['Social Login', 'No Extension', 'Beginner Friendly']
    },
    {
      name: 'Ledger',
      description: 'Hardware wallet with maximum security for your assets',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiMwMDAwMDAiLz4KPHJlY3QgeD0iMjAiIHk9IjMwIiB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHJ4PSI1IiBmaWxsPSIjZmZmZmZmIi8+Cjwvdmc+',
      adapter: 'Ledger',
      installUrl: 'https://www.ledger.com/',
      features: ['Hardware Security', 'Cold Storage', 'Multi-Asset']
    }
  ];

  // Check if wallet is installed
  const isWalletInstalled = (adapterName) => {
    return availableWallets.some(wallet => wallet.adapter.name === adapterName);
  };

  const handleWalletSelect = async (walletConfig) => {
    const isInstalled = isWalletInstalled(walletConfig.adapter);
    
    // If wallet is not installed, open install URL
    if (!isInstalled) {
      window.open(walletConfig.installUrl, '_blank');
      return;
    }

    setConnectionState('connecting');
    setConnectingWallet(walletConfig);
    setError(null);

    try {
      // Select the wallet adapter
      select(walletConfig.adapter);
      
      // Wait for connection with timeout
      const connectionPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout - please try again'));
        }, 30000);

        const checkConnection = () => {
          if (connected) {
            clearTimeout(timeout);
            resolve();
          } else if (!connecting) {
            clearTimeout(timeout);
            reject(new Error('Connection was cancelled or failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };

        // Start checking after a brief delay
        setTimeout(checkConnection, 500);
      });

      await connectionPromise;
      
      setConnectedWallet(walletConfig);
      setConnectionState('success');
      
      // Call the parent onConnect if provided
      if (onConnect) {
        await onConnect(walletConfig.adapter);
      }
      
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setConnectionState('selecting');
      setConnectingWallet(null);
    }
  };

  const handleClose = () => {
    setConnectionState('selecting');
    setConnectingWallet(null);
    setConnectedWallet(null);
    setError(null);
    onClose();
  };

  const handleSuccessComplete = () => {
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Enhanced particle background */}
          <ParticleBackground 
            particleCount={30} 
            interactive={true} 
            color="mixed"
            className="opacity-40"
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                  <p className="text-sm text-slate-400">Choose your preferred wallet</p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {connectionState === 'selecting' && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {walletConfigs.map((wallet, index) => (
                    <motion.div
                      key={wallet.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <WalletOption
                        wallet={wallet}
                        onSelect={handleWalletSelect}
                        isConnecting={connectingWallet?.name === wallet.name}
                        isInstalled={isWalletInstalled(wallet.adapter)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {connectionState === 'connecting' && connectingWallet && (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Connecting to {connectingWallet.name}
                  </h3>
                  <p className="text-slate-400">Please approve the connection in your wallet</p>
                </motion.div>
              )}

              {connectionState === 'success' && connectedWallet && (
                <SuccessAnimation
                  walletName={connectedWallet.name}
                  onComplete={handleSuccessComplete}
                />
              )}

              {error && (
                <motion.div
                  className="p-4 bg-red-900/20 border border-red-700 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
                  >
                    Try again
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WalletConnectionModal;