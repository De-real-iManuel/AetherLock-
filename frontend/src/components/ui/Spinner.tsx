import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'cyan' | 'purple' | 'white';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4'
};

const colorClasses = {
  cyan: 'border-cyan-500 border-t-transparent',
  purple: 'border-purple-500 border-t-transparent',
  white: 'border-white border-t-transparent'
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'cyan',
  className 
}) => {
  return (
    <motion.div
      className={cn(
        'rounded-full animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
};

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'lg',
  fullScreen = false 
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <Spinner size={size} color="cyan" />
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-slate-300 text-sm"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

interface PulseLoaderProps {
  count?: number;
  color?: 'cyan' | 'purple';
  className?: string;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({ 
  count = 3, 
  color = 'cyan',
  className 
}) => {
  const dotColor = color === 'cyan' ? 'bg-cyan-500' : 'bg-purple-500';

  return (
    <div className={cn('flex space-x-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn('w-2 h-2 rounded-full', dotColor)}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
};
