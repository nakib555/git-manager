import React from 'react';
import { useAppContext } from '../../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useAppContext();

  if (!toastMessage) return null;

  const getIcon = () => {
    switch (toastType) {
      case 'success':
        return <CheckCircle2 size={16} className="text-success shrink-0" />;
      case 'error':
        return <AlertCircle size={16} className="text-danger shrink-0" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-warning shrink-0" />;
      default:
        return <Info size={16} className="text-accent shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toastType) {
      case 'success':
        return 'border-success/30 bg-surface-1';
      case 'error':
        return 'border-danger/30 bg-surface-1';
      case 'warning':
        return 'border-warning/30 bg-surface-1';
      default:
        return 'border-border bg-surface-1';
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex justify-center px-4 pt-[calc(env(safe-area-inset-top,0px)+64px)]"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-xs font-medium text-text-primary shadow-sm max-w-sm w-fit truncate ${getBorderColor()}`}
        >
          {getIcon()}
          <span className="truncate">{toastMessage}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Aliases
export const MobileToast = Toast;
