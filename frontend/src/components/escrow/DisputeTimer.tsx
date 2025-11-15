import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle } from 'lucide-react';

interface DisputeTimerProps {
  deadline: Date;
  onExpire?: () => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export const DisputeTimer: React.FC<DisputeTimerProps> = ({
  deadline,
  onExpire,
  className,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => 
    calculateTimeRemaining(deadline)
  );

  // Calculate time remaining
  function calculateTimeRemaining(targetDate: Date): TimeRemaining {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const total = Math.max(0, target - now);

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds, total };
  }

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(deadline);
      setTimeRemaining(newTimeRemaining);

      // Check if timer expired
      if (newTimeRemaining.total === 0 && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  // Determine warning level based on time remaining
  const warningLevel = useMemo(() => {
    const totalHours = timeRemaining.total / (1000 * 60 * 60);
    
    if (totalHours <= 0) return 'expired';
    if (totalHours <= 24) return 'critical'; // Less than 1 day
    if (totalHours <= 72) return 'warning'; // Less than 3 days
    return 'normal';
  }, [timeRemaining.total]);

  // Get color classes based on warning level
  const getColorClasses = () => {
    switch (warningLevel) {
      case 'expired':
        return {
          bg: 'bg-status-failed/20',
          border: 'border-status-failed',
          text: 'text-status-failed',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
        };
      case 'critical':
        return {
          bg: 'bg-status-failed/10',
          border: 'border-status-failed/70',
          text: 'text-status-failed',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/70',
          text: 'text-yellow-400',
          glow: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]',
        };
      default:
        return {
          bg: 'bg-primary-surface/50',
          border: 'border-primary-border',
          text: 'text-slate-300',
          glow: '',
        };
    }
  };

  const colors = getColorClasses();

  // Format number with leading zero
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  // Render expired state
  if (warningLevel === 'expired') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "p-4 rounded-lg border backdrop-blur-sm",
          colors.bg,
          colors.border,
          colors.glow,
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-status-failed/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-status-failed" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-status-failed">
              Dispute Period Expired
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              The dispute period has ended. Funds will be auto-released.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-4 rounded-lg border backdrop-blur-sm transition-all duration-300",
        colors.bg,
        colors.border,
        colors.glow,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Clock className={cn("w-4 h-4", colors.text)} />
        <h3 className={cn("text-sm font-semibold", colors.text)}>
          {warningLevel === 'critical' ? 'Dispute Deadline - Critical!' : 'Dispute Period Remaining'}
        </h3>
      </div>

      {/* Timer Display */}
      <div className="grid grid-cols-4 gap-3">
        {/* Days */}
        <div className="text-center">
          <motion.div
            key={timeRemaining.days}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-2xl font-bold font-mono mb-1",
              colors.text
            )}
          >
            {formatNumber(timeRemaining.days)}
          </motion.div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Days
          </div>
        </div>

        {/* Hours */}
        <div className="text-center">
          <motion.div
            key={timeRemaining.hours}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-2xl font-bold font-mono mb-1",
              colors.text
            )}
          >
            {formatNumber(timeRemaining.hours)}
          </motion.div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Hours
          </div>
        </div>

        {/* Minutes */}
        <div className="text-center">
          <motion.div
            key={timeRemaining.minutes}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-2xl font-bold font-mono mb-1",
              colors.text
            )}
          >
            {formatNumber(timeRemaining.minutes)}
          </motion.div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Minutes
          </div>
        </div>

        {/* Seconds */}
        <div className="text-center">
          <motion.div
            key={timeRemaining.seconds}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-2xl font-bold font-mono mb-1",
              colors.text
            )}
          >
            {formatNumber(timeRemaining.seconds)}
          </motion.div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Seconds
          </div>
        </div>
      </div>

      {/* Warning Message */}
      {warningLevel === 'critical' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 pt-3 border-t border-status-failed/30"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-status-failed flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              Less than 24 hours remaining! If no dispute is filed, funds will be automatically released to the freelancer.
            </p>
          </div>
        </motion.div>
      )}

      {warningLevel === 'warning' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 pt-3 border-t border-yellow-500/30"
        >
          <p className="text-xs text-slate-400">
            Deadline: {new Date(deadline).toLocaleString()}
          </p>
        </motion.div>
      )}

      {warningLevel === 'normal' && (
        <div className="mt-3 pt-3 border-t border-primary-border">
          <p className="text-xs text-slate-400">
            Deadline: {new Date(deadline).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
};
