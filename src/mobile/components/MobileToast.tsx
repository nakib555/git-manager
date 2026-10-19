import React from 'react';
import { useAppContext } from '../../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const MobileToast: React.FC = () => {
  const { toastMessage, toastType } = useAppContext();

  if (!toastMessage) return null;

  const getIcon = () => {
    switch (toastType) {
      case 'success':
        return <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />;
      case 'error':
        return <AlertCircle size={16} className="text-[#EF4444] shrink-0" />;
      default:
        return <Info size={16} className="text-[#3B82F6] shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toastType) {
      case 'success':
        return 'border-[#22C55E]/30 bg-[#121214] shadow-[#22C55E]/10';
      case 'error':
        return 'border-[#EF4444]/30 bg-[#121214] shadow-[#EF4444]/10';
      default:
        return 'border-[#3B82F6]/30 bg-[#121214] shadow-[#3B82F6]/10';
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
        style={{ top: 'calc(56px + env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold text-[#F4F4F5] shadow-xl backdrop-blur-md max-w-sm w-fit truncate ${getBorderColor()}`}
        >
          {getIcon()}
          <span className="truncate">{toastMessage}</span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
