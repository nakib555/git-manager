import React from 'react';
import { BulkResolutionType } from '../../../mobile/utils/zipSyncEngine';

interface SyncConflictHeaderProps {
  modifiedCount: number;
  addedCount: number;
  missingCount: number;
  onBulkResolve: (type: BulkResolutionType) => void;
}

export const SyncConflictHeader: React.FC<SyncConflictHeaderProps> = ({
  modifiedCount,
  addedCount,
  missingCount,
  onBulkResolve,
}) => {
  return (
    <div className="px-3.5 py-3 border-b border-border bg-surface-2/40 flex flex-col gap-2.5 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-text-primary truncate">Changed Files</h3>
          <p className="text-[11px] text-text-secondary tabular-nums mt-0.5">
            {modifiedCount} modified · {addedCount} added · {missingCount} missing
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
        <button
          type="button"
          onClick={() => onBulkResolve('all_zip')}
          className="min-h-[32px] px-2.5 py-1 bg-accent/12 hover:bg-accent/20 text-accent border border-accent/30 font-semibold rounded-lg transition-colors cursor-pointer btn-tactile whitespace-nowrap"
        >
          Accept All ZIP
        </button>
        <button
          type="button"
          onClick={() => onBulkResolve('all_original')}
          className="min-h-[32px] px-2.5 py-1 bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary border border-border font-medium rounded-lg transition-colors cursor-pointer btn-tactile whitespace-nowrap"
        >
          Keep All Repo
        </button>
        {missingCount > 0 && (
          <>
            <button
              type="button"
              onClick={() => onBulkResolve('all_restore')}
              className="min-h-[32px] px-2.5 py-1 bg-surface-2 hover:bg-surface-3 text-warning border border-border font-semibold rounded-lg transition-colors cursor-pointer btn-tactile whitespace-nowrap"
            >
              Retain Missing
            </button>
            <button
              type="button"
              onClick={() => onBulkResolve('all_delete')}
              className="min-h-[32px] px-2.5 py-1 bg-danger/10 hover:bg-danger/15 text-danger border border-danger/25 font-semibold rounded-lg transition-colors cursor-pointer btn-tactile whitespace-nowrap"
            >
              Delete Missing
            </button>
          </>
        )}
      </div>
    </div>
  );
};
