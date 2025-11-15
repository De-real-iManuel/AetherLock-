import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/hooks/useNotification';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle
};

const colors = {
  success: 'bg-status-verified/10 border-status-verified text-status-verified',
  error: 'bg-status-failed/10 border-status-failed text-status-failed',
  info: 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan',
  warning: 'bg-status-pending/10 border-status-pending text-status-pending'
};

const glowColors = {
  success: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  error: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  info: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
  warning: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]'
};

export const ToastContainer = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = icons[notification.type];
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8, transition: { duration: 0.2 } }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className={`p-4 rounded-lg border-2 backdrop-blur-xl pointer-events-auto ${colors[notification.type]} ${glowColors[notification.type]}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 break-words">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-1 bg-current opacity-30 rounded-full mt-3"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};