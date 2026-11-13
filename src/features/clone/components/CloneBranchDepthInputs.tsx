import React from 'react';
import { GitBranch, HardDrive, Loader2, ChevronDown } from 'lucide-react';

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
  const branchCount = availableBranches.length;
  const hasMultipleBranches = branchCount > 1;
  const currentBranchName = branch || (availableBranches[0] || 'main');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 cls-stable">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-micro flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <GitBranch size={12} className={hasMultipleBranches ? 'text-primary' : 'text-text-tertiary'} />
            <span>Target Branch</span>
          </span>
          {isLoadingBranches ? (
            <span className="flex items-center gap-1 text-[10px] text-primary lowercase font-normal">
              <Loader2 size={10} className="animate-spin" />
              <span>checking...</span>
            </span>
          ) : hasMultipleBranches ? (
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.2 rounded-md font-mono tabular-nums">
              {branchCount} branches
            </span>
          ) : null}
        </label>

        {isLoadingBranches ? (
          /* Skeleton loader in branch option when checking - exact 40px height to avoid layout shift */
          <div
            className="w-full h-[40px] rounded-xl bg-surface-2 border border-border/60 px-3 flex items-center justify-between ghost-shimmer select-none"
            aria-busy="true"
            aria-label="Checking repository branches..."
          >
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-surface-3 shrink-0" />
              <div className="w-24 h-3 rounded bg-surface-3" />
            </div>
            <div className="w-16 h-3 rounded-md bg-surface-3/80 shrink-0" />
          </div>
        ) : hasMultipleBranches ? (
          /* Beautiful combobox dropdown when repo has multiple branches - exact 40px height */
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
              <GitBranch size={13} />
            </div>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              role="combobox"
              aria-label="Select target branch"
              className="w-full h-[40px] bg-main hover:bg-card border border-border focus:border-primary rounded-xl pl-8 pr-8 py-2 text-xs font-mono text-text-main outline-none cursor-pointer appearance-none transition-colors shadow-xs"
            >
              {availableBranches.map((b) => (
                <option key={b} value={b} className="bg-surface-1 text-text-main py-1">
                  {b} {b === 'main' || b === 'master' ? '(default)' : ''}
                </option>
              ))}
              {!availableBranches.includes(branch) && branch.trim() && (
                <option value={branch} className="bg-surface-1 text-text-main py-1">
                  {branch}
                </option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted group-hover:text-text-main transition-colors">
              <ChevronDown size={14} />
            </div>
          </div>
        ) : (
          /* Non-clickable professional light gray display when single branch - exact 40px height */
          <div
            className="w-full h-[40px] bg-surface-2/80 border border-border/80 rounded-xl px-3 flex items-center justify-between select-none cursor-default pointer-events-none transition-colors"
            aria-disabled="true"
            title="Single repository branch (non-clickable)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <GitBranch size={13} className="text-text-tertiary shrink-0" />
              <span className="text-xs font-mono font-medium text-text-secondary truncate">
                {currentBranchName}
              </span>
            </div>
            <span className="text-[10px] font-sans font-medium text-text-tertiary bg-surface-3/80 px-2 py-0.5 rounded-md border border-border/50 shrink-0">
              Single branch
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-micro flex items-center gap-1.5">
          <HardDrive size={12} />
          <span>Clone Depth</span>
        </label>
        <div className="relative">
          <select
            value={depth}
            onChange={(e) => setDepth(e.target.value as 'full' | 'shallow')}
            aria-label="Select clone depth"
            className="w-full h-[40px] bg-main hover:bg-card border border-border focus:border-primary rounded-xl px-3 pr-8 py-2 text-xs text-text-main outline-none cursor-pointer appearance-none transition-colors shadow-xs"
          >
            <option value="shallow">Shallow (Depth 1 — Fast snapshot)</option>
            <option value="full">Full History (All commits & tags)</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
