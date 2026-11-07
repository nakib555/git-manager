import React from 'react';
import { Check, ChevronRight, GitPullRequest } from 'lucide-react';
import { formatRelativeTime } from '../../../utils/formatters';

interface BranchModalTabsProps {
  activeTab: 'overview' | 'commits' | 'compare';
  selectedBranch: string;
  activeCommits: any[];
  onSelectCommit: (commit: any) => void;
  onCreatePR: () => void;
}

export const BranchModalTabs: React.FC<BranchModalTabsProps> = ({
  activeTab,
  selectedBranch,
  activeCommits,
  onSelectCommit,
  onCreatePR,
}) => {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 min-h-0">
      {activeTab === 'overview' && (
        <div className="space-y-3.5">
          <div className="p-3.5 bg-surface-2 rounded-xl border border-border-accent space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
              Branch Lineage & Sync Status
            </span>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-surface-1 border border-border">
                <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">↑ 2</span>
                <span className="text-[10px] text-text-tertiary block mt-0.5">Commits Ahead</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-1 border border-border">
                <span className="text-lg font-bold font-mono text-text-secondary tabular-nums">↓ 0</span>
                <span className="text-[10px] text-text-tertiary block mt-0.5">Commits Behind</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-surface-1/80 border border-border flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="w-0.5 h-6 bg-border-accent" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="min-w-0 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <span className="text-text-tertiary">base:</span>
                  <span className="font-semibold text-text-primary">origin/main</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 mt-2 font-bold">
                  <span className="text-text-tertiary font-normal">tip:</span>
                  <span>{selectedBranch}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-surface-2 rounded-xl border border-border space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
              Protection & Policies
            </span>
            <div className="flex items-center justify-between text-text-secondary">
              <span>Direct Push Allowed</span>
              <span className="font-mono text-emerald-400 font-bold">Yes</span>
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <span>Require Pull Request Review</span>
              <span className="font-mono text-text-tertiary font-semibold">Optional</span>
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <span>Required Status Checks</span>
              <span className="font-mono text-emerald-400 font-bold">CI/CD Passing</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'commits' && (
        <div className="space-y-2">
          {activeCommits.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-tertiary bg-surface-2 rounded-xl">
              No commits recorded on this branch yet.
            </div>
          ) : (
            activeCommits.slice(0, 5).map((commit, idx) => (
              <div
                key={`${commit.hash}-${idx}`}
                onClick={() => onSelectCommit(commit)}
                className="p-3.5 bg-surface-2 hover:bg-surface-3 rounded-xl border border-border flex items-start justify-between gap-2.5 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{commit.msg}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-text-tertiary font-mono">
                    <span className="text-accent font-semibold tabular-nums">{commit.hash.substring(0, 7)}</span>
                    <span>·</span>
                    <span>{commit.author.split(' ')[0]}</span>
                    <span>·</span>
                    <span className="tabular-nums">{formatRelativeTime(commit.timestamp || commit.date, commit.time)}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-text-tertiary shrink-0 mt-1" />
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="space-y-3.5">
          <div className="p-3.5 bg-surface-2 rounded-xl border border-border-accent space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
              Compare Against Default Branch
            </span>
            <p className="text-text-secondary text-xs leading-relaxed">
              Comparing changes from <span className="font-mono font-semibold text-accent">{selectedBranch}</span> into <span className="font-mono font-semibold text-text-primary">main</span>.
            </p>
            <div className="p-2.5 rounded-lg bg-surface-1 border border-border flex items-center justify-between text-xs font-mono">
              <span className="text-text-tertiary">Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check size={12} /> Able to merge cleanly
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCreatePR}
            className="w-full h-11 px-4 rounded-xl bg-text-primary text-background hover:opacity-90 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <GitPullRequest size={15} />
            <span>Create Pull Request from {selectedBranch}</span>
          </button>
        </div>
      )}
    </div>
  );
};
