import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SyncConflictHeaderProps {
  modifiedCount: number;
  missingCount: number;
  onBulkResolve: (type: 'all_zip' | 'all_original' | 'all_restore' | 'all_delete') => void;
}

export const SyncConflictHeader: React.FC<SyncConflictHeaderProps> = ({
  modifiedCount,
  missingCount,
  onBulkResolve,
}) => {
  return (
    <div className="px-4 py-3 border-b border-border bg-surface-2/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle size={16} />
        </div>
        <div>
          <span className="text-xs font-bold text-text-primary block">Sync Conflict Resolver</span>
          <span className="text-[11px] text-text-secondary">
            {modifiedCount} overlapping files · {missingCount} missing in ZIP
          </span>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => onBulkResolve('all_zip')}
          className="min-h-[36px] px-3 py-1.5 bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 font-bold rounded-xl transition-all cursor-pointer active:scale-95"
        >
          Accept All ZIP
        </button>
        <button
          type="button"
          onClick={() => onBulkResolve('all_original')}
          className="min-h-[36px] px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary border border-border font-medium rounded-xl transition-all cursor-pointer active:scale-95"
        >
          Keep All Repo
        </button>
        {missingCount > 0 && (
          <button
            type="button"
            onClick={() => onBulkResolve('all_restore')}
            className="min-h-[36px] px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Restore All Missing
          </button>
        )}
      </div>
    </div>
  );
};
