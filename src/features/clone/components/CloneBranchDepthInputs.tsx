import React from 'react';
import { GitBranch, HardDrive, Loader2 } from 'lucide-react';

interface CloneBranchDepthInputsProps {
  branch: string;
  setBranch: (val: string) => void;
  depth: 'full' | 'shallow';
  setDepth: (depth: 'full' | 'shallow') => void;
  availableBranches?: string[];
  isLoadingBranches?: boolean;
}

export const CloneBranchDepthInputs: React.FC<CloneBranchDepthInputsProps> = ({
  branch,
  setBranch,
  depth,
  setDepth,
  availableBranches = ['main'],
  isLoadingBranches = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <GitBranch size={12} />
            <span>Target Branch / Ref</span>
          </span>
          {isLoadingBranches && (
            <span className="flex items-center gap-1 text-[10px] text-primary lowercase font-normal">
              <Loader2 size={10} className="animate-spin" />
              <span>fetching...</span>
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type="text"
            list="clone-available-branches"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            className="w-full bg-main border border-border rounded-xl px-3 py-2 text-xs text-text-main outline-none focus:border-primary font-mono"
          />
          <datalist id="clone-available-branches">
            {availableBranches.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <HardDrive size={12} />
          <span>Clone Depth</span>
        </label>
        <select
          value={depth}
          onChange={(e) => setDepth(e.target.value as 'full' | 'shallow')}
          className="w-full bg-main border border-border rounded-xl px-3 py-2 text-xs text-text-main outline-none focus:border-primary cursor-pointer"
        >
          <option value="shallow">Shallow (Depth 1 — Fast download)</option>
          <option value="full">Full History (All commits & tags)</option>
        </select>
      </div>
    </div>
  );
};
