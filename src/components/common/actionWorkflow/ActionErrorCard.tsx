import React from 'react';
import { AlertCircle, RotateCcw, ArrowLeft, KeyRound } from 'lucide-react';
import { useAppContext } from '../../../AppContext';

interface ActionErrorCardProps {
  errorMsg: string;
  onRetry?: () => void;
  onBackToEdit: () => void;
}

export const ActionErrorCard: React.FC<ActionErrorCardProps> = ({
  errorMsg,
  onRetry,
  onBackToEdit,
}) => {
  const { connectGitHub } = useAppContext();
  const isAuthError = /401|authentication|re-authenticate|credentials|unauthorized|expired|token/i.test(errorMsg);

  return (
    <div className="py-3 space-y-4">
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
          <AlertCircle size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-red-400">Action Verification Failed</h3>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed break-words">
            {errorMsg || 'An unexpected error occurred during execution. Please verify inputs.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
        <button
          type="button"
          onClick={onBackToEdit}
          className="h-10 px-4 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-border"
        >
          <ArrowLeft size={13} />
          <span>Edit Form</span>
        </button>

        {isAuthError && (
          <button
            type="button"
            onClick={connectGitHub}
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <KeyRound size={13} />
            <span>Re-authenticate GitHub</span>
          </button>
        )}

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="h-10 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-red-500/30"
          >
            <RotateCcw size={13} />
            <span>Retry Operation</span>
          </button>
        )}
      </div>
    </div>
  );
};
