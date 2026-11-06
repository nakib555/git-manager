import React from 'react';
import { RotateCcw, Undo2, Loader2, ArrowRight } from 'lucide-react';
import { RestoreMode } from '../CommitRestoreSheet';

interface CommitRestoreFooterProps {
  selectedMode: RestoreMode;
  shortSha: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const CommitRestoreFooter: React.FC<CommitRestoreFooterProps> = ({
  selectedMode,
  shortSha,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="p-4 border-t border-border bg-surface-1 flex items-center gap-3 shrink-0">
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="flex-1 h-11 bg-surface-2 hover:bg-surface-3 text-text-secondary font-bold rounded-2xl text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="flex-[2] h-11 bg-accent hover:opacity-90 text-white font-bold rounded-2xl text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>{selectedMode === 'snapshot' ? 'Restoring Snapshot...' : 'Reverting Commit...'}</span>
          </>
        ) : (
          <>
            {selectedMode === 'snapshot' ? <RotateCcw size={15} /> : <Undo2 size={15} />}
            <span>{selectedMode === 'snapshot' ? `Restore to ${shortSha}` : `Revert ${shortSha}`}</span>
            <ArrowRight size={13} className="opacity-70" />
          </>
        )}
      </button>
    </div>
  );
};
