import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitCommit, GitPullRequest, RefreshCw, AlertCircle, X, Ban } from 'lucide-react';

interface ZipSyncStepCommitProps {
  currentBranch: string;
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
  summaryCounts: { toUpload: number; toDelete: number; skipped: number; totalToSync: number };
  unchangedCount?: number;
  totalArchiveFiles?: number;
  isCommitting: boolean;
  progressStatus: string;
  commitProgress: { completed: number; total: number } | null;
  commitError: string | null;
  cancelNotice: string | null;
  onCancelSync: () => void;
  onDismissNotice: () => void;
}

export const ZipSyncStepCommit: React.FC<ZipSyncStepCommitProps> = ({
  currentBranch,
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
  unchangedCount = 0,
  totalArchiveFiles = 0,
  isCommitting,
  progressStatus,
  commitProgress,
  commitError,
  cancelNotice,
  onCancelSync,
  onDismissNotice,
}) => {
  const isMessageEmpty = commitMessage.trim().length === 0;
  const isBranchEmpty = commitMode === 'pr' && newBranchName.trim().length === 0;
  const progressPct =
    commitProgress && commitProgress.total > 0
      ? Math.min(100, Math.max(6, Math.round((commitProgress.completed / commitProgress.total) * 100)))
      : null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setCommitMode('direct')}
          disabled={isCommitting}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer btn-tactile disabled:opacity-60 disabled:cursor-not-allowed ${
            commitMode === 'direct'
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-accent/45 bg-surface-2/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <GitCommit size={15} className={commitMode === 'direct' ? 'text-accent' : 'text-text-secondary'} />
            <span className="text-xs font-bold text-text-primary">Direct Commit</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Commit changes directly to <span className="font-mono text-text-primary">{currentBranch}</span>.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setCommitMode('pr')}
          disabled={isCommitting}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer btn-tactile disabled:opacity-60 disabled:cursor-not-allowed ${
            commitMode === 'pr'
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-accent/45 bg-surface-2/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <GitPullRequest size={15} className={commitMode === 'pr' ? 'text-accent' : 'text-text-secondary'} />
            <span className="text-xs font-bold text-text-primary">Create Pull Request</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Push to a new branch and open a pull request against <span className="font-mono text-text-primary">{currentBranch}</span>.
          </p>
        </button>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="zip-commit-message" className="text-xs font-semibold text-text-primary block">
          Commit Message
        </label>
        <input
          id="zip-commit-message"
          type="text"
          value={commitMessage}
          disabled={isCommitting}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Sync updates from AI Studio package"
          className={`w-full bg-surface-2/40 border rounded-xl px-3.5 py-2.5 text-xs text-text-primary outline-none transition-colors font-mono disabled:opacity-60 ${
            isMessageEmpty ? 'border-danger/60 focus:border-danger' : 'border-border focus:border-accent'
          }`}
        />
        {isMessageEmpty && (
          <p className="text-[11px] text-danger">A commit message is required before syncing.</p>
        )}
      </div>

      <AnimatePresence initial={false}>
        {commitMode === 'pr' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3.5 pt-3 border-t border-border"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="zip-pr-branch" className="text-xs font-semibold text-text-primary block">
                  New Branch Name
                </label>
                <input
                  id="zip-pr-branch"
                  type="text"
                  value={newBranchName}
                  disabled={isCommitting}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="sync-aistudio-update"
                  className={`w-full bg-surface-2/40 border rounded-xl px-3 py-2 text-xs text-text-primary outline-none font-mono disabled:opacity-60 ${
                    isBranchEmpty ? 'border-danger/60 focus:border-danger' : 'border-border focus:border-accent'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="zip-pr-title" className="text-xs font-semibold text-text-primary block">
                  Pull Request Title
                </label>
                <input
                  id="zip-pr-title"
                  type="text"
                  value={prTitle}
                  disabled={isCommitting}
                  onChange={(e) => setPrTitle(e.target.value)}
                  placeholder="Sync updates from AI Studio package"
                  className="w-full bg-surface-2/40 border border-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="zip-pr-body" className="text-xs font-semibold text-text-primary block">
                Pull Request Description
              </label>
              <textarea
                id="zip-pr-body"
                rows={2}
                value={prBody}
                disabled={isCommitting}
                onChange={(e) => setPrBody(e.target.value)}
                placeholder="Describe the synchronized updates..."
                className="w-full bg-surface-2/40 border border-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent resize-none leading-relaxed disabled:opacity-60"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Structured tabular summary */}
      <div className="border border-border rounded-xl bg-surface-2/30 overflow-hidden">
        <div className={`grid ${unchangedCount > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} divide-y sm:divide-y-0 sm:divide-x divide-border text-center`}>
          <div className="py-2.5 px-3">
            <span className="text-[11px] text-text-secondary block">Files to Commit</span>
            <span className="text-sm font-mono font-bold text-text-primary tabular-nums mt-0.5 block">
              {summaryCounts.toUpload}
            </span>
          </div>
          <div className="py-2.5 px-3">
            <span className="text-[11px] text-text-secondary block">Files to Delete</span>
            <span className="text-sm font-mono font-bold text-danger tabular-nums mt-0.5 block">
              {summaryCounts.toDelete}
            </span>
          </div>
          {unchangedCount > 0 && (
            <div className="py-2.5 px-3">
              <span className="text-[11px] text-text-secondary block">Already Identical</span>
              <span className="text-sm font-mono font-bold text-addition tabular-nums mt-0.5 block">
                {unchangedCount}
              </span>
            </div>
          )}
          <div className="py-2.5 px-3">
            <span className="text-[11px] text-text-secondary block">Skipped / Retained</span>
            <span className="text-sm font-mono font-bold text-text-secondary tabular-nums mt-0.5 block">
              {summaryCounts.skipped}
            </span>
          </div>
        </div>
        {totalArchiveFiles > 0 && unchangedCount > 0 && (
          <div className="px-3.5 py-2 border-t border-border bg-surface-2/50 text-[11px] text-text-secondary flex items-center justify-between gap-2">
            <span>
              GitHub commit records changed blobs only; {unchangedCount} identical {unchangedCount === 1 ? 'file matches' : 'files match'} branch HEAD.
            </span>
            <span className="font-mono font-semibold text-text-primary tabular-nums shrink-0">
              {totalArchiveFiles} archive files
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCommitting && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl bg-accent/10 border border-accent/25 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-accent font-semibold min-w-0 flex-1">
                <RefreshCw size={14} className="animate-spin shrink-0" />
                <span className="truncate font-mono">{progressStatus || 'Synchronizing with GitHub...'}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {progressPct !== null && (
                  <span className="text-[11px] font-mono font-semibold text-accent tabular-nums">
                    {progressPct}%
                  </span>
                )}
                <button
                  type="button"
                  onClick={onCancelSync}
                  className="min-h-[30px] px-2.5 rounded-lg border border-danger/35 bg-danger/10 hover:bg-danger/20 text-danger text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer btn-tactile whitespace-nowrap"
                >
                  <Ban size={12} />
                  <span>Cancel Sync</span>
                </button>
              </div>
            </div>
            <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
              {progressPct !== null ? (
                <div
                  className="h-full bg-accent rounded-full transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              ) : (
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ x: '-60%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                  style={{ width: '55%' }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cancelNotice && !isCommitting && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="flex items-center justify-between gap-2.5 p-3 rounded-xl bg-warning/10 border border-warning/30 text-xs text-warning"
          >
            <div className="flex items-start gap-2 min-w-0">
              <Ban size={15} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{cancelNotice}</span>
            </div>
            <button
              type="button"
              onClick={onDismissNotice}
              aria-label="Dismiss notice"
              className="w-7 h-7 rounded-lg hover:bg-warning/15 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commitError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-xs text-danger"
          >
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{commitError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
