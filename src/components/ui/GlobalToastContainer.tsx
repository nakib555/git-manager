import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastItem, ToastType } from '../../types';

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getVariantConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
          borderClass: 'border-emerald-500/30 shadow-emerald-500/5',
          accentBar: 'bg-emerald-500',
          badgeText: 'Success',
        };
      case 'error':
        return {
          icon: <AlertCircle size={16} className="text-rose-500 shrink-0" />,
          borderClass: 'border-rose-500/40 shadow-rose-500/5',
          accentBar: 'bg-rose-500',
          badgeText: 'Error',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={16} className="text-amber-500 shrink-0" />,
          borderClass: 'border-amber-500/40 shadow-amber-500/5',
          accentBar: 'bg-amber-500',
          badgeText: 'Notice',
        };
      case 'info':
      default:
        return {
          icon: <Info size={16} className="text-accent shrink-0" />,
          borderClass: 'border-border shadow-xs',
          accentBar: 'bg-accent',
          badgeText: 'Info',
        };
    }
  };

  const config = getVariantConfig(toast.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.92, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', damping: 28, stiffness: 350 }}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative w-full sm:w-[380px] bg-surface-1 border rounded-2xl p-3.5 shadow-xl flex items-start gap-3 overflow-hidden backdrop-blur-md ${config.borderClass}`}
    >
      {/* Visual Accent indicator bar */}
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${config.accentBar}`} />

      {/* Leading severity icon */}
      <div className="pt-0.5 pl-1">{config.icon}</div>

      {/* Toast Content Area */}
      <div className="flex-1 min-w-0 pr-1">
        {toast.title && (
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-xs text-text-primary truncate">{toast.title}</span>
          </div>
        )}
        <p className="text-xs text-text-secondary leading-relaxed break-words font-medium">
          {toast.message}
        </p>

        {/* Optional Interactive Action Button */}
        {toast.action && (
          <div className="mt-2 pt-1.5 border-t border-border/50 flex justify-end">
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className="text-xs font-bold text-accent hover:underline cursor-pointer"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="w-6 h-6 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors cursor-pointer shrink-0 mt-0.5"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
};

export const GlobalToastContainer: React.FC = () => {
  const { toasts = [], toastMessage, toastType = 'info', dismissToast } = useAppContext();

  // Combine multi-toasts list or synthesize pseudo-toast from legacy toastMessage if list empty
  const activeList: ToastItem[] = React.useMemo(() => {
    if (toasts && toasts.length > 0) return toasts;
    if (toastMessage) {
      return [
        {
          id: 'legacy_toast',
          message: toastMessage,
          type: toastType,
          createdAt: Date.now(),
        },
      ];
    }
    return [];
  }, [toasts, toastMessage, toastType]);

  return (
    <div
      aria-label="Notifications"
      className="fixed z-[9999] pointer-events-none top-[calc(env(safe-area-inset-top,0px)+12px)] left-4 right-4 sm:left-auto sm:right-6 sm:top-6 sm:w-auto flex flex-col items-center sm:items-end gap-2.5"
    >
      <AnimatePresence mode="popLayout">
        {activeList.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
