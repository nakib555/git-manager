import React from 'react';
import { GitMerge, GitPullRequest, CornerDownRight, Check, Trash2, X } from 'lucide-react';

interface PRDetailOverviewProps {
  pr: any;
  mergeStrategy: 'merge' | 'squash';
  setMergeStrategy: (val: 'merge' | 'squash') => void;
  deleteBranch: boolean;
  setDeleteBranch: (val: boolean) => void;
  isMerging: boolean;
  onMerge: () => void;
  onClosePR: () => void;
}

export const PRDetailOverview: React.FC<PRDetailOverviewProps> = ({
  pr,
  mergeStrategy,
  setMergeStrategy,
  deleteBranch,
  setDeleteBranch,
  isMerging,
  onMerge,
  onClosePR,
}) => {
  const isMerged = pr.status === 'Merged';
  const isClosed = pr.status === 'Closed';

  return (
    <div className="space-y-5">
      <div className="p-4 bg-main/40 border border-border rounded-xl space-y-3">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Branch Flow</span>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-md bg-card border border-border font-bold text-text-main">
            {pr.branch}
          </span>
          <CornerDownRight size={14} className="text-text-muted" />
          <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 font-bold text-primary">
            {pr.target || 'main'}
          </span>
        </div>
      </div>

      {!isMerged && !isClosed && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <GitMerge size={14} className="text-primary" />
              <span>Merge Pull Request</span>
            </span>
            <div className="flex bg-main p-0.5 rounded-lg border border-border text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setMergeStrategy('merge')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  mergeStrategy === 'merge' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Merge Commit
              </button>
              <button
                type="button"
                onClick={() => setMergeStrategy('squash')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  mergeStrategy === 'squash' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Squash and Merge
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={deleteBranch}
              onChange={(e) => setDeleteBranch(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Delete branch <code className="font-mono text-text-main">{pr.branch}</code> after merging</span>
          </label>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onMerge}
              disabled={isMerging}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <GitMerge size={14} />
              <span>{isMerging ? 'Merging...' : mergeStrategy === 'squash' ? 'Confirm Squash and Merge' : 'Confirm Merge'}</span>
            </button>
            <button
              onClick={onClosePR}
              className="px-4 py-2.5 rounded-xl border border-border bg-main hover:bg-hover text-xs font-bold text-text-muted hover:text-rose-500 transition-colors cursor-pointer"
            >
              Close PR
            </button>
          </div>
        </div>
      )}

      {isMerged && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center space-y-1">
          <span className="text-xs font-bold text-purple-400 block">Pull request has been merged</span>
          <span className="text-[11px] text-text-muted">Changes are incorporated into {pr.target || 'main'}</span>
        </div>
      )}

      {isClosed && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center space-y-1">
          <span className="text-xs font-bold text-rose-500 block">Pull request was closed</span>
          <span className="text-[11px] text-text-muted">No changes were merged</span>
        </div>
      )}
    </div>
  );
};
