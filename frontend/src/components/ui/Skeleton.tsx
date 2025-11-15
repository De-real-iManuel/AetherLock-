import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animate = true
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%')
  };

  const baseClasses = cn(
    'bg-slate-800/50',
    variantClasses[variant],
    className
  );

  if (animate) {
    return (
      <motion.div
        className={baseClasses}
        style={style}
        animate={{
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    );
  }

  return <div className={baseClasses} style={style} />;
};

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton width="200px" height="32px" />
        <Skeleton width="300px" height="20px" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-slate-700 rounded-lg p-6 space-y-3">
            <Skeleton width="120px" height="20px" />
            <Skeleton width="80px" height="36px" />
            <Skeleton width="150px" height="16px" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="border border-slate-700 rounded-lg p-6 space-y-4">
        <Skeleton width="180px" height="24px" />
        <Skeleton height="300px" />
      </div>

      {/* Table */}
      <div className="border border-slate-700 rounded-lg p-6 space-y-4">
        <Skeleton width="150px" height="24px" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height="60px" />
          ))}
        </div>
      </div>
    </div>
  );
};

// Escrow List Skeleton
export const EscrowListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border border-slate-700 rounded-lg p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton width="60%" height="24px" />
              <Skeleton width="40%" height="16px" />
            </div>
            <Skeleton width="80px" height="32px" variant="rectangular" />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <Skeleton width="80px" height="14px" />
                <Skeleton width="100px" height="20px" />
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Skeleton width="120px" height="14px" />
            <Skeleton height="8px" />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Skeleton width="100px" height="36px" />
            <Skeleton width="100px" height="36px" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Escrow Card Skeleton
export const EscrowCardSkeleton: React.FC = () => {
  return (
    <div className="border border-slate-700 rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton width="70%" height="24px" />
        <Skeleton width="80px" height="28px" />
      </div>
      
      <Skeleton width="100%" height="60px" />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton width="60px" height="14px" />
          <Skeleton width="100px" height="20px" />
        </div>
        <div className="space-y-2">
          <Skeleton width="60px" height="14px" />
          <Skeleton width="100px" height="20px" />
        </div>
      </div>
      
      <Skeleton width="100%" height="40px" />
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 5 
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="20px" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} height="40px" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Avatar and Name */}
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width="80px" height="80px" />
        <div className="space-y-2 flex-1">
          <Skeleton width="200px" height="28px" />
          <Skeleton width="150px" height="20px" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton width="60px" height="32px" className="mx-auto" />
            <Skeleton width="80px" height="16px" className="mx-auto" />
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton width="120px" height="16px" />
            <Skeleton width="100%" height="40px" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Chat Skeleton
export const ChatSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
          <div className={cn('space-y-2', i % 2 === 0 ? 'items-end' : 'items-start')}>
            <Skeleton width="200px" height="60px" />
            <Skeleton width="80px" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
};
