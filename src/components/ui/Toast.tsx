import React from 'react';
import { useAppContext } from '../../AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useAppContext();

  const getVariantStyles = () => {
    switch (toastType) {
      case 'error':
        return 'border-danger/40 text-text-primary bg-surface-1 shadow-sm';
      case 'success':
        return 'border-success/40 text-text-primary bg-surface-1 shadow-sm';
      case 'warning':
        return 'border-warning/40 text-text-primary bg-surface-1 shadow-sm';
      case 'info':
      default:
        return 'border-border text-text-primary bg-surface-1 shadow-sm';
    }
  };

  const getIcon = () => {
    switch (toastType) {
      case 'error':
        return <AlertCircle size={14} className="text-danger shrink-0" />;
      case 'success':
        return <CheckCircle2 size={14} className="text-success shrink-0" />;
      case 'warning':
        return <AlertCircle size={14} className="text-warning shrink-0" />;
      case 'info':
      default:
        return <Info size={14} className="text-accent shrink-0" />;
    }
  };

  return (
    <div 
      className={`fixed top-16 left-1/2 -translate-x-1/2 max-w-[90vw] sm:max-w-md border px-3.5 py-2 min-h-[36px] rounded-md text-xs font-medium transition-all duration-200 z-[300] flex items-center gap-2.5 pointer-events-none ${getVariantStyles()} ${
        toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95'
      }`}
    >
      {getIcon()}
      <span className="truncate">{toastMessage}</span>
    </div>
  );
};
