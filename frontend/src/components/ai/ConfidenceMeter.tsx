import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConfidenceMeterProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const ConfidenceMeterComponent: React.FC<ConfidenceMeterProps> = ({
  value,
  size = 'md',
  showLabel = true,
  animated = true,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  // Animate value on mount
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, animated]);

  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, displayValue));

  // Get color based on confidence level
  const getColor = (val: number): { stroke: string; glow: string; text: string } => {
    if (val >= 71) {
      return {
        stroke: 'url(#gradient-green)',
        glow: 'rgba(16, 185, 129, 0.5)',
        text: 'text-status-verified',
      };
    } else if (val >= 41) {
      return {
        stroke: 'url(#gradient-yellow)',
        glow: 'rgba(251, 191, 36, 0.5)',
        text: 'text-status-pending',
      };
    } else {
      return {
        stroke: 'url(#gradient-red)',
        glow: 'rgba(239, 68, 68, 0.5)',
        text: 'text-status-failed',
      };
    }
  };

  // Get size dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'sm':
        return { size: 80, strokeWidth: 6, fontSize: 'text-lg' };
      case 'lg':
        return { size: 160, strokeWidth: 10, fontSize: 'text-4xl' };
      case 'md':
      default:
        return { size: 120, strokeWidth: 8, fontSize: 'text-2xl' };
    }
  };

  const { size: circleSize, strokeWidth, fontSize } = getSizeDimensions();
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;
  const color = getColor(clampedValue);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: circleSize, height: circleSize }}>
        <svg
          width={circleSize}
          height={circleSize}
          className="transform -rotate-90"
        >
          {/* Gradient Definitions */}
          <defs>
            {/* Green Gradient (71-100) */}
            <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Yellow Gradient (41-70) */}
            <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>

            {/* Red Gradient (0-40) */}
            <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth={strokeWidth}
          />

          {/* Progress Circle */}
          <motion.circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? circumference : offset}
            animate={{ strokeDashoffset: offset }}
            transition={{
              duration: 1.5,
              ease: 'easeOut',
            }}
            filter="url(#glow)"
            style={{
              filter: `drop-shadow(0 0 8px ${color.glow})`,
            }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={animated ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <div className={cn('font-bold', fontSize, color.text)}>
              {Math.round(clampedValue)}%
            </div>
          </motion.div>
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <motion.div
          initial={animated ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-slate-300">Confidence Score</p>
          <p className={cn('text-xs', color.text)}>
            {clampedValue >= 71 && 'High Confidence'}
            {clampedValue >= 41 && clampedValue < 71 && 'Medium Confidence'}
            {clampedValue < 41 && 'Low Confidence'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Memoize component - only re-render if value or size changes
export const ConfidenceMeter = React.memo(ConfidenceMeterComponent, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.size === nextProps.size &&
    prevProps.showLabel === nextProps.showLabel &&
    prevProps.animated === nextProps.animated
  );
});
