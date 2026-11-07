import React from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface DeleteRepoStatusViewProps {
  status: 'deleting' | 'success' | 'error';
  errorMsg?: string;
}

export const DeleteRepoStatusView: React.FC<DeleteRepoStatusViewProps> = ({
  status,
  errorMsg,
}) => {
  if (status === 'success') {
    return (
      <div className="py-4 text-center space-y-2.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="font-bold text-sm text-text-main">Repository Successfully Deleted</h3>
        <p className="text-xs text-text-muted">All branches, commits, and local workspace cache have been removed.</p>
      </div>
    );
  }

  if (status === 'deleting') {
    return (
      <div className="p-4 bg-surface-2 border border-border rounded-xl flex items-center gap-3 text-xs">
        <Loader2 size={16} className="animate-spin text-danger shrink-0" />
        <div>
          <p className="font-bold text-text-main">Deleting repository...</p>
          <p className="text-[11px] text-text-muted">Purging Git branches and updating local catalog</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs space-y-1">
      <div className="flex items-center gap-1.5 font-bold text-rose-500">
        <AlertCircle size={14} /> <span>Deletion Failed</span>
      </div>
      <p className="text-[11px] text-text-muted">{errorMsg || 'Failed to delete repository.'}</p>
    </div>
  );
};
