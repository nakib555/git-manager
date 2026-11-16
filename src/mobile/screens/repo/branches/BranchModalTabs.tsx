import React from 'react';
import { ArrowLeftRight, Check, ChevronRight, GitCommit, GitPullRequest, Shield } from 'lucide-react';
import { formatRelativeTime } from '../../../utils/formatters';
import {
  BranchComparisonResult,
  BranchProtectionSummary,
  EnrichedBranch,
} from '../../../../features/branches/branchInspectionService';

interface BranchModalTabsProps {
  activeTab: 'overview' | 'commits' | 'compare';
  branch: EnrichedBranch;
  baseBranchName: string;
  comparison: BranchComparisonResult | null;
  protection: BranchProtectionSummary | null;
  isLoadingDetails: boolean;
  onSelectCommit: (commit: any) => void;
  onCreatePR: () => void;
}

export const BranchModalTabs: React.FC<BranchModalTabsProps> = ({
  activeTab,
  branch,
  baseBranchName,
  comparison,
  protection,
  isLoadingDetails,
  onSelectCommit,
  onCreatePR,
}) => {
  const aheadCount = comparison ? comparison.aheadBy : (branch.aheadBy ?? 0);
  const behindCount = comparison ? comparison.behindBy : (branch.behindBy ?? 0);
  const commits = comparison?.commits || [];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 min-h-0">
      {activeTab === 'overview' && (
        <div className="space-y-3.5">
          <div className="p-3.5 bg-surface-2/60 rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                Branch Lineage vs {baseBranchName}
              </span>
              <span className="text-[11px] font-mono text-text-secondary capitalize">
                {isLoadingDetails ? 'Syncing…' : comparison?.status || 'aligned'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg bg-surface-1 border border-border">
                <span className="text-lg font-bold font-mono text-addition tabular-nums">
                  {isLoadingDetails ? '—' : `↑ ${aheadCount}`}
                </span>
                <span className="text-[10px] text-text-tertiary block mt-0.5">
                  Commits Ahead
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-1 border border-border">
                <span className="text-lg font-bold font-mono text-text-secondary tabular-nums">
                  {isLoadingDetails ? '—' : `↓ ${behindCount}`}
                </span>
                <span className="text-[10px] text-text-tertiary block mt-0.5">
                  Commits Behind
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-1 border border-border flex items-center gap-3 text-xs font-mono">
              <ArrowLeftRight size={14} className="text-text-tertiary shrink-0" />
              <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                <span className="text-text-secondary truncate">
                  base: <strong className="text-text-primary">{baseBranchName}</strong>
                </span>
                <span className="text-text-tertiary shrink-0">→</span>
                <span className="text-accent font-bold truncate">{branch.name}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-surface-2/60 rounded-xl border border-border space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
              <Shield size={12} /> Protection & Policies
            </span>
            <div className="divide-y divide-border">
              <div className="py-1.5 flex items-center justify-between text-text-secondary">
                <span>Direct Push</span>
                <span
                  className={`font-mono font-bold ${
                    protection?.directPushAllowed ? 'text-addition' : 'text-warning'
                  }`}
                >
                  {protection?.directPushAllowed ? 'Allowed' : 'Restricted'}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between text-text-secondary">
                <span>Pull Request Review</span>
                <span className="font-mono text-text-primary font-semibold">
                  {protection?.requiresPrReview ? 'Required' : 'Optional'}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between text-text-secondary">
                <span>Required Status Checks</span>
                <span className="font-mono text-text-primary font-semibold">
                  {protection?.checksLabel || 'None required'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'commits' && (
        <div className="space-y-2">
          {isLoadingDetails ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-surface-2 ghost-shimmer border border-border" />
              ))}
            </div>
          ) : commits.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-tertiary bg-surface-2/60 border border-border rounded-xl space-y-1.5">
              <GitCommit size={18} className="mx-auto text-text-tertiary" />
              <p>No unique commits found ahead of {baseBranchName}.</p>
            </div>
          ) : (
            commits.slice(0, 10).map((commit, idx) => (
              <button
                key={`${commit.hash}-${idx}`}
                type="button"
                onClick={() => onSelectCommit(commit)}
                className="w-full text-left p-3.5 bg-surface-2/60 hover:bg-surface-2 rounded-xl border border-border flex items-start justify-between gap-2.5 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text-primary truncate">{commit.msg}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-text-tertiary font-mono">
                    <span className="text-accent font-semibold tabular-nums">
                      {commit.hash.substring(0, 7)}
                    </span>
                    <span>·</span>
                    <span className="truncate">{commit.author.split(' ')[0]}</span>
                    {commit.timestamp && (
                      <>
                        <span>·</span>
                        <span className="tabular-nums shrink-0">
                          {formatRelativeTime(commit.timestamp, commit.time)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight size={14} className="text-text-tertiary shrink-0 mt-1" />
              </button>
            ))
          )}
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="space-y-3.5">
          <div className="p-3.5 bg-surface-2/60 rounded-xl border border-border space-y-2.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
              Compare Against {baseBranchName}
            </span>
            <p className="text-text-secondary text-xs leading-relaxed">
              Comparing changes from{' '}
              <span className="font-mono font-semibold text-accent">{branch.name}</span> into{' '}
              <span className="font-mono font-semibold text-text-primary">{baseBranchName}</span>.
            </p>
            <div className="p-2.5 rounded-lg bg-surface-1 border border-border flex items-center justify-between text-xs font-mono">
              <span className="text-text-tertiary">Compare Status</span>
              <span className="text-addition font-bold flex items-center gap-1 capitalize">
                <Check size={12} /> {isLoadingDetails ? 'Checking…' : comparison?.status || 'aligned'}
              </span>
            </div>
          </div>

          {branch.name !== baseBranchName ? (
            <button
              type="button"
              onClick={onCreatePR}
              className="w-full min-h-[44px] px-4 rounded-xl bg-accent hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 btn-tactile transition-colors cursor-pointer shadow-xs"
            >
              <GitPullRequest size={15} />
              <span>Create Pull Request from {branch.name}</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border text-xs text-text-secondary text-center">
              Switch to or select another branch to open a pull request against {baseBranchName}.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
