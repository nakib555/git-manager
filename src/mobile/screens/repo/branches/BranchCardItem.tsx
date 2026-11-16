import React from 'react';
import { Check, ChevronRight, GitBranch, Lock } from 'lucide-react';
import { EnrichedBranch } from '../../../../features/branches/branchInspectionService';

interface BranchCardItemProps {
  branch: EnrichedBranch;
  isSwitching: boolean;
  index?: number;
  onSelect: () => void;
  onSwitch: (e: React.MouseEvent) => void;
}

export const BranchCardItem: React.FC<BranchCardItemProps> = ({
  branch,
  isSwitching,
  index = 0,
  onSelect,
  onSwitch,
}) => {
  const staggerClass = `cascade-item stagger-${Math.min(index + 1, 8)}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`rounded-2xl p-3.5 border transition-colors cursor-pointer select-none btn-tactile ${staggerClass} ${
        branch.isActive
          ? 'bg-surface-1 border-accent/60'
          : 'bg-surface-1 border-border hover:border-text-tertiary/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
              branch.isActive
                ? 'bg-accent-soft border-accent/30 text-accent'
                : 'bg-surface-2 border-border text-text-secondary'
            }`}
          >
            <GitBranch size={15} strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-xs font-bold font-mono truncate ${
                  branch.isActive ? 'text-accent' : 'text-text-primary'
                }`}
              >
                {branch.name}
              </span>
              {branch.isActive && (
                <span className="text-[10px] font-mono font-bold text-addition shrink-0">
                  HEAD
                </span>
              )}
              {branch.isDefault && (
                <span className="text-[10px] font-mono text-text-tertiary shrink-0">
                  default
                </span>
              )}
              {branch.isProtected && !branch.isDefault && (
                <Lock size={11} className="text-text-tertiary shrink-0" />
              )}
            </div>

            <p className="text-[11px] text-text-secondary truncate mt-0.5">
              {branch.lastCommitMsg}
            </p>

            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-text-tertiary font-mono">
              {branch.shortSha && (
                <span className="text-accent font-semibold tabular-nums">
                  {branch.shortSha}
                </span>
              )}
              {branch.shortSha && branch.relativeTime && <span>·</span>}
              {branch.relativeTime && (
                <span className="tabular-nums truncate">{branch.relativeTime}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {branch.isActive ? (
            <div
              className="touch-target-44 w-9 h-9 rounded-xl bg-addition/15 border border-addition/25 text-addition flex items-center justify-center"
              aria-label="Active branch"
            >
              <Check size={15} strokeWidth={2.5} />
            </div>
          ) : (
            <button
              type="button"
              onClick={onSwitch}
              disabled={isSwitching}
              className="min-h-[44px] px-3 rounded-xl text-xs font-semibold bg-surface-2 hover:bg-surface-3 border border-border text-text-primary transition-colors cursor-pointer disabled:opacity-50 btn-tactile"
            >
              Checkout
            </button>
          )}
          <ChevronRight size={15} className="text-text-tertiary shrink-0" />
        </div>
      </div>
    </div>
  );
};
