import React from 'react';
import { Check, Trash2 } from 'lucide-react';

interface BranchModalFooterProps {
  selectedBranch: string;
  currentBranch: string | null;
  isSwitching: boolean;
  isDeleting: boolean;
  onSwitch: () => void;
  onDelete: () => void;
}

export const BranchModalFooter: React.FC<BranchModalFooterProps> = ({
  selectedBranch,
  currentBranch,
  isSwitching,
  isDeleting,
  onSwitch,
  onDelete,
}) => {
  return (
    <div className="p-3 border-t border-border-accent bg-surface-1/95 backdrop-blur-md flex items-center gap-2 shrink-0">
      {selectedBranch !== currentBranch ? (
        <button
          onClick={onSwitch}
          disabled={isSwitching}
          className="flex-1 h-11 px-4 rounded-xl bg-text-primary text-background hover:opacity-90 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
        >
          <Check size={15} />
          <span>{isSwitching ? 'Checking out...' : `Switch to ${selectedBranch}`}</span>
        </button>
      ) : (
        <div className="flex-1 h-11 px-4 rounded-xl bg-surface-2 border border-border text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
          <Check size={15} />
          <span>Currently Active HEAD</span>
        </div>
      )}

      {selectedBranch !== 'main' && selectedBranch !== 'master' && selectedBranch !== currentBranch && (
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="h-11 px-3.5 rounded-xl bg-surface-2 border border-border hover:border-red-500/40 text-text-secondary hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
          title="Delete Branch"
        >
          <Trash2 size={15} />
          <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </button>
      )}
    </div>
  );
};
