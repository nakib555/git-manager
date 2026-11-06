import React from 'react';
import { GitCommit, GitPullRequest, RefreshCw } from 'lucide-react';

interface ZipSyncStepCommitProps {
  commitMessage: string;
  setCommitMessage: (msg: string) => void;
  commitMode: 'direct' | 'pr';
  setCommitMode: (mode: 'direct' | 'pr') => void;
  newBranchName: string;
  setNewBranchName: (b: string) => void;
  prTitle: string;
  setPrTitle: (t: string) => void;
  prBody: string;
  setPrBody: (b: string) => void;
  summaryCounts: { toUpload: number; toDelete: number; totalToSync: number };
  isCommitting: boolean;
  progressStatus: string;
  onExecuteSync: () => void;
}

export const ZipSyncStepCommit: React.FC<ZipSyncStepCommitProps> = ({
  commitMessage,
  setCommitMessage,
  commitMode,
  setCommitMode,
  newBranchName,
  setNewBranchName,
  prTitle,
  setPrTitle,
  prBody,
  setPrBody,
  summaryCounts,
  isCommitting,
  progressStatus,
  onExecuteSync,
}) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setCommitMode('direct')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            commitMode === 'direct'
              ? 'border-primary bg-primary/5 shadow-xs'
              : 'border-border hover:border-primary/40 bg-card'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <GitCommit size={15} className="text-primary" />
            <span className="text-xs font-bold text-text-main">Direct Commit</span>
          </div>
          <p className="text-[10px] text-text-muted leading-relaxed">
            Commit changes directly to active branch.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setCommitMode('pr')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            commitMode === 'pr'
              ? 'border-primary bg-primary/5 shadow-xs'
              : 'border-border hover:border-primary/40 bg-card'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <GitPullRequest size={15} className="text-accent" />
            <span className="text-xs font-bold text-text-main">Create Pull Request</span>
          </div>
          <p className="text-[10px] text-text-muted leading-relaxed">
            Push to a new branch and open a review PR.
          </p>
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-muted uppercase">Commit Message</label>
        <input
          type="text"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Sync updates from AI Studio package"
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2 text-xs text-text-main outline-none focus:border-primary font-mono"
        />
      </div>

      {commitMode === 'pr' && (
        <div className="space-y-3 bg-main/50 p-3.5 rounded-xl border border-border">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase">New Branch Name</label>
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-text-main outline-none focus:border-primary font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase">PR Title</label>
            <input
              type="text"
              value={prTitle}
              onChange={(e) => setPrTitle(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-text-main outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      <div className="p-3 bg-hover/20 border border-border rounded-xl flex items-center justify-between text-xs font-semibold">
        <span className="text-text-muted">Total files queued to sync:</span>
        <span className="text-primary font-mono font-bold">{summaryCounts.totalToSync} files</span>
      </div>

      {isCommitting && (
        <div className="flex items-center gap-2 text-xs text-primary font-semibold py-1">
          <RefreshCw size={14} className="animate-spin" />
          <span>{progressStatus || 'Synchronizing with GitHub...'}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onExecuteSync}
        disabled={isCommitting || summaryCounts.totalToSync === 0}
        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
      >
        <GitCommit size={15} />
        <span>{isCommitting ? 'Executing Sync...' : `Apply Sync to ${commitMode === 'pr' ? 'Pull Request' : 'Branch'}`}</span>
      </button>
    </div>
  );
};
