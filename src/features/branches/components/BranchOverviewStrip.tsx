import React from 'react';
import { GitBranch, Lock, Plus, Search, ShieldCheck, X } from 'lucide-react';
import { EnrichedBranch } from '../branchInspectionService';

export type BranchFilterMode = 'all' | 'protected';

interface BranchOverviewStripProps {
  branches: EnrichedBranch[];
  activeBranchName: string;
  defaultBranchName: string;
  search: string;
  filter: BranchFilterMode;
  compact?: boolean;
  onSearchChange: (val: string) => void;
  onFilterChange: (filter: BranchFilterMode) => void;
  onCreateBranch: () => void;
}

export const BranchOverviewStrip: React.FC<BranchOverviewStripProps> = ({
  branches,
  activeBranchName,
  defaultBranchName,
  search,
  filter,
  compact = false,
  onSearchChange,
  onFilterChange,
  onCreateBranch,
}) => {
  const protectedCount = branches.filter((b) => b.isProtected).length;

  return (
    <div className="space-y-3 shrink-0">
      {/* Executive KPI Overview Strip */}
      <div
        className={`grid gap-2.5 ${
          compact ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'
        }`}
      >
        <div
          className={`bg-surface-1 border border-border rounded-xl flex items-center justify-between gap-2 min-w-0 ${
            compact ? 'px-2.5 py-2' : 'px-3.5 py-2.5'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-medium text-text-tertiary block truncate">
              {compact ? 'Branches' : 'Total Branches'}
            </span>
            <span className="text-base sm:text-lg font-bold text-text-primary tabular-nums font-mono leading-tight">
              {branches.length}
            </span>
          </div>
          {!compact && (
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-secondary shrink-0">
              <GitBranch size={15} />
            </div>
          )}
        </div>

        <div
          className={`bg-surface-1 border border-border rounded-xl flex items-center justify-between gap-2 min-w-0 ${
            compact ? 'px-2.5 py-2' : 'px-3.5 py-2.5'
          }`}
        >
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-medium text-text-tertiary block truncate">
              {compact ? 'HEAD' : 'Checked Out HEAD'}
            </span>
            <span
              title={activeBranchName}
              className="text-xs sm:text-sm font-bold text-accent font-mono truncate block leading-tight mt-0.5"
            >
              {activeBranchName}
            </span>
          </div>
          {!compact && (
            <div className="w-8 h-8 rounded-lg bg-accent-soft border border-accent/25 flex items-center justify-center text-accent shrink-0">
              <ShieldCheck size={15} />
            </div>
          )}
        </div>

        {!compact && (
          <div className="bg-surface-1 border border-border rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-text-tertiary block truncate">
                Default Base
              </span>
              <span
                title={defaultBranchName}
                className="text-xs sm:text-sm font-semibold text-text-primary font-mono truncate block leading-tight mt-0.5"
              >
                {defaultBranchName}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-tertiary shrink-0 font-mono text-[10px] font-bold">
              BASE
            </div>
          </div>
        )}

        <div
          className={`bg-surface-1 border border-border rounded-xl flex items-center justify-between gap-2 min-w-0 ${
            compact ? 'px-2.5 py-2' : 'px-3.5 py-2.5'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-medium text-text-tertiary block truncate">
              {compact ? 'Protected' : 'Protected Refs'}
            </span>
            <span className="text-base sm:text-lg font-bold text-text-primary tabular-nums font-mono leading-tight">
              {protectedCount}
            </span>
          </div>
          {!compact && (
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-secondary shrink-0">
              <Lock size={14} />
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex-1 min-w-0 sm:max-w-sm bg-surface-1 border border-border focus-within:border-accent rounded-xl px-3 min-h-[42px] flex items-center gap-2 transition-colors">
          <Search size={14} className="text-text-tertiary shrink-0" />
          <input
            type="text"
            placeholder="Filter branches by name or commit..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Filter branches"
            className="bg-transparent border-none text-xs text-text-primary w-full outline-none placeholder:text-text-tertiary"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear branch search"
              className="p-1 text-text-tertiary hover:text-text-primary rounded-md cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div
            role="tablist"
            aria-label="Branch filter"
            className="inline-flex items-center p-0.5 rounded-xl bg-surface-2 border border-border shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              onClick={() => onFilterChange('all')}
              className={`px-3 min-h-[36px] rounded-[9px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                filter === 'all'
                  ? 'bg-surface-1 text-text-primary shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All ({branches.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'protected'}
              onClick={() => onFilterChange('protected')}
              className={`px-3 min-h-[36px] rounded-[9px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                filter === 'protected'
                  ? 'bg-surface-1 text-text-primary shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Protected ({protectedCount})
            </button>
          </div>

          <button
            type="button"
            onClick={onCreateBranch}
            className="min-h-[40px] px-3.5 sm:px-4 rounded-xl bg-accent hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-tactile shadow-xs shrink-0 whitespace-nowrap"
          >
            <Plus size={15} strokeWidth={2.4} />
            <span>New Branch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
