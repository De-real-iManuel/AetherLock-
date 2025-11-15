import * as React from 'react';
import { motion } from 'framer-motion';

interface CrossChainBridgeProps {
  escrowId: string;
  sourceChain: string;
  destinationChain: string;
  status: 'pending' | 'processing' | 'completed';
}

export default function CrossChainBridge({ escrowId, sourceChain, destinationChain, status }: CrossChainBridgeProps) {
  return (
    <div className="relative h-32 flex items-center justify-between px-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold"
      >
        {sourceChain === 'solana' ? '◎' : sourceChain === 'zetachain' ? 'Z' : '⚡'}
      </motion.div>

      <div className="flex-1 relative mx-4">
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: status === 'completed' ? '100%' : status === 'processing' ? '50%' : '10%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
          />
        </div>
        
        <motion.div
          animate={{ x: status === 'completed' ? '100%' : status === 'processing' ? '50%' : '0%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="absolute top-1/2 -translate-y-1/2 left-0"
        >
          <div className="w-6 h-6 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50 animate-pulse" />
        </motion.div>
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold"
      >
        {destinationChain === 'solana' ? '◎' : destinationChain === 'zetachain' ? 'Z' : '⚡'}
      </motion.div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-slate-400">
        {status === 'pending' && 'Initiating...'}
        {status === 'processing' && 'Bridging funds...'}
        {status === 'completed' && 'Transfer complete'}
      </div>
    </div>
  );
}
