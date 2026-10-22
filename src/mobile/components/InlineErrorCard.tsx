import React, { useState } from 'react';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';

export interface InlineErrorCardProps {
  title?: string;
  message: string;
  error?: Error | string | null;
  onRetry?: () => void | Promise<void>;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  icon?: LucideIcon;
  compact?: boolean;
  className?: string;
}

export const InlineErrorCard: React.FC<InlineErrorCardProps> = ({
  title = 'Unable to load data',
  message,
  error,
  onRetry,
  secondaryAction,
  icon: Icon = AlertCircle,
  compact = false,
  className = '',
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const rawErrorMessage = typeof error === 'string' ? error : error?.message;

  if (compact) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={`p-3 rounded-xl bg-danger/10 border border-danger/30 flex items-center justify-between gap-3 text-xs ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-1">
          <Icon size={16} className="text-danger shrink-0" />
          <span className="text-text-primary font-medium truncate">{message}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="h-8 px-3 rounded-lg bg-danger/15 hover:bg-danger/25 border border-danger/30 text-danger text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRetrying ? 'animate-spin' : ''} />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`bg-surface-1 border border-danger/30 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-4 shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/25 flex items-center justify-center text-danger shrink-0">
        <Icon size={24} strokeWidth={2} />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-sm font-bold text-text-primary tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          {message}
        </p>
      </div>

      {rawErrorMessage && (
        <div className="w-full max-w-sm text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] font-mono text-text-tertiary hover:text-text-secondary flex items-center gap-1 mx-auto cursor-pointer"
          >
            <span>{showDetails ? 'Hide technical diagnostics' : 'Show technical diagnostics'}</span>
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showDetails && (
            <div className="mt-2 p-3 bg-surface-2 rounded-xl border border-border font-mono text-[11px] text-danger/90 break-all leading-normal">
              {rawErrorMessage}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs pt-1">
        {onRetry && (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-accent text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-accent/20 hover:opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={isRetrying ? 'animate-spin' : ''} />
            <span>{isRetrying ? 'Retrying...' : 'Retry Request'}</span>
          </button>
        )}

        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-surface-2 border border-border text-text-primary hover:bg-surface-3 font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <span>{secondaryAction.label}</span>
          </button>
        )}
      </div>
    </div>
  );
};
