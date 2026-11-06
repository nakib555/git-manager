import React from 'react';
import { GitBranch, Check, ChevronRight } from 'lucide-react';

interface BranchCardItemProps {
  branch: { name: string };
  isActive: boolean;
  isDefault: boolean;
  isSwitching: boolean;
  onSelect: () => void;
  onSwitch: (e: React.MouseEvent) => void;
}

export const BranchCardItem: React.FC<BranchCardItemProps> = ({
  branch,
  isActive,
  isDefault,
  isSwitching,
  onSelect,
  onSwitch,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`rounded-xl p-3.5 space-y-2.5 border transition-all cursor-pointer select-none active:scale-98 shadow-xs ${
        isActive
          ? 'bg-surface-1 border-accent/60 ring-1 ring-accent/30'
          : 'bg-surface-1 border-border hover:border-border-accent'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isActive
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-surface-2 border border-border-accent text-accent'
            }`}
          >
            <GitBranch size={15} strokeWidth={2.4} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold truncate ${isActive ? 'text-accent' : 'text-text-primary'}`}>
                {branch.name}
              </span>
              {isActive && <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">HEAD</span>}
              {isDefault && <span className="text-[10px] font-mono text-text-tertiary shrink-0">default</span>}
            </div>

            <div className="flex items-center gap-2 mt-1 text-[11px] text-text-tertiary font-mono">
              <span className="text-text-tertiary">ahead 2 · behind 0</span>
              <span>·</span>
              <span>updated 2h ago</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isActive ? (
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check size={14} strokeWidth={2.5} />
            </div>
          ) : (
            <button
              type="button"
              onClick={onSwitch}
              disabled={isSwitching}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-surface-2 hover:bg-surface-3 border border-border-accent text-text-primary active:scale-95 transition-all cursor-pointer"
            >
              Checkout
            </button>
          )}
          <ChevronRight size={15} className="text-text-tertiary" />
        </div>
      </div>
    </div>
  );
};
