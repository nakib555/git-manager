import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { RestoreMode } from '../CommitRestoreSheet';

interface CommitRestoreStatusCardProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  selectedMode: RestoreMode;
  shortSha: string;
  errorMsg?: string;
  onRetry?: () => void;
}

export const CommitRestoreStatusCard: React.FC<CommitRestoreStatusCardProps> = ({
  status,
  selectedMode,
  shortSha,
  errorMsg,
  onRetry,
}) => {
  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div className="p-3.5 bg-accent/10 border border-accent/30 rounded-2xl flex items-center gap-3">
        <Loader2 size={18} className="text-accent animate-spin shrink-0" />
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-text-primary">
            {selectedMode === 'snapshot' ? 'Restoring Repository Snapshot...' : 'Reverting Commit Delta...'}
          </h4>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Generating forward rollback commit for <code className="font-mono text-accent font-semibold">{shortSha}</code>
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-emerald-400">Rollback Successfully Applied</h4>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">Verified</span>
          </div>
          <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
            New commit recorded in branch history. Working tree and commit data refreshed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
      <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-bold text-red-400">Rollback Failed</h4>
        <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
          {errorMsg || 'Unable to apply rollback commit. Please check git tree conflicts.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
