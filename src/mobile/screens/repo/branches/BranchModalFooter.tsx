import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { EnrichedBranch } from '../../../../features/branches/branchInspectionService';

interface BranchModalFooterProps {
  branch: EnrichedBranch;
  isSwitching: boolean;
  isDeleting: boolean;
  onSwitch: () => void;
  onDelete: () => void;
}

export const BranchModalFooter: React.FC<BranchModalFooterProps> = ({
  branch,
  isSwitching,
  isDeleting,
  onSwitch,
  onDelete,
}) => {
  return (
    <div className="p-3 border-t border-border bg-surface-1 flex items-center gap-2 shrink-0">
      {!branch.isActive ? (
        <button
          type="button"
          onClick={onSwitch}
          disabled={isSwitching}
          className="flex-1 min-h-[44px] px-4 rounded-xl bg-accent hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer btn-tactile disabled:opacity-50 shadow-xs"
        >
          <Check size={15} />
          <span>{isSwitching ? 'Checking out...' : `Switch to ${branch.name}`}</span>
        </button>
      ) : (
        <div className="flex-1 min-h-[44px] px-4 rounded-xl bg-surface-2 border border-border text-addition font-bold text-xs flex items-center justify-center gap-2">
          <Check size={15} />
          <span>Currently Active HEAD</span>
        </div>
      )}

      {!branch.isDefault && !branch.isActive && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="min-h-[44px] px-3.5 rounded-xl bg-surface-2 border border-border hover:border-danger/40 text-text-secondary hover:text-danger text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer btn-tactile"
          title="Delete Branch"
        >
          <Trash2 size={15} />
          <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </button>
      )}
    </div>
  );
};
