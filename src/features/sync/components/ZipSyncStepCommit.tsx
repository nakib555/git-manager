import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitCommit, GitPullRequest, RefreshCw, AlertCircle } from 'lucide-react';

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
  isCommitting: boolean;
  progressStatus: string;
  commitError: string | null;
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
  isCommitting,
  progressStatus,
  commitError,
}) => {
  const isMessageEmpty = commitMessage.trim().length === 0;
  const isBranchEmpty = commitMode === 'pr' && newBranchName.trim().length === 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setCommitMode('direct')}
          disabled={isCommitting}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer btn-tactile ${
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
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer btn-tactile ${
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
          className={`w-full bg-surface-2/40 border rounded-xl px-3.5 py-2.5 text-xs text-text-primary outline-none transition-colors font-mono ${
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
                  className={`w-full bg-surface-2/40 border rounded-xl px-3 py-2 text-xs text-text-primary outline-none font-mono ${
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
                  className="w-full bg-surface-2/40 border border-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
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
                className="w-full bg-surface-2/40 border border-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent resize-none leading-relaxed"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Structured tabular summary */}
      <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-xl bg-surface-2/30 text-center">
        <div className="py-2.5 px-3">
          <span className="text-[11px] text-text-secondary block">Files to Upload</span>
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
        <div className="py-2.5 px-3">
          <span className="text-[11px] text-text-secondary block">Skipped / Retained</span>
          <span className="text-sm font-mono font-bold text-text-secondary tabular-nums mt-0.5 block">
            {summaryCounts.skipped}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isCommitting && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-accent/10 border border-accent/25 space-y-2"
          >
            <div className="flex items-center gap-2 text-xs text-accent font-semibold">
              <RefreshCw size={14} className="animate-spin shrink-0" />
              <span className="truncate">{progressStatus || 'Synchronizing with GitHub...'}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ x: '-60%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                style={{ width: '55%' }}
              />
            </div>
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
