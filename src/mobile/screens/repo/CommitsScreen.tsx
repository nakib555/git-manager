import React, { useState } from 'react';
import { useAppContext } from '../../../AppContext';
import { CommitCard } from '../../components/CommitCard';
import { GitCommit, Copy, Check, X, FileDiff, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CommitsScreen: React.FC = () => {
  const { activeCommits, showToast, currentRepo } = useAppContext();
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setIsCopied(true);
    showToast(`Copied SHA: ${hash.substring(0, 7)}`, 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">Commits</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            History of {currentRepo} on current branch
          </p>
        </div>
        <span className="text-xs font-mono text-accent font-semibold bg-accent-soft px-2 py-0.5 rounded border border-accent/25">
          {activeCommits.length} commits
        </span>
      </div>

      {activeCommits.length === 0 ? (
        <div className="bg-surface-1 border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <GitCommit size={32} className="text-text-tertiary mb-2 opacity-50" />
          <span className="text-sm font-semibold text-text-primary mb-1">No commits on branch</span>
          <span className="text-xs text-text-tertiary">
            Create a commit to start building project history.
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeCommits.map((commit, idx) => (
            <CommitCard
              key={`${commit.hash}-${idx}`}
              commit={{
                hash: commit.hash,
                msg: commit.msg,
                author: commit.author,
                date: commit.date,
                avatarUrl: commit.avatarUrl,
                stats: commit.stats,
              }}
              onClick={() => setSelectedCommit(commit)}
              onCopyHash={() => handleCopyHash(commit.hash)}
              isLatest={idx === 0}
            />
          ))}
        </div>
      )}

      {/* Bottom Sheet: Commit Details & Diff */}
      <AnimatePresence>
        {selectedCommit && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCommit(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-surface-1 border-t border-x border-border rounded-t-[20px] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />

              <div className="flex items-start justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-text-primary leading-snug">
                    {selectedCommit.msg}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-text-secondary">
                      {selectedCommit.author}
                    </span>
                    <span className="text-[10px] text-text-tertiary">•</span>
                    <span className="text-xs text-text-tertiary">
                      {selectedCommit.date}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCommit(null)}
                  className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* SHA block */}
              <div className="py-3 border-b border-border flex items-center justify-between text-xs">
                <span className="text-text-tertiary font-mono">Commit SHA</span>
                <button
                  onClick={() => handleCopyHash(selectedCommit.hash)}
                  className="flex items-center gap-1.5 font-mono text-accent bg-accent-soft px-2.5 py-1 rounded-md border border-accent/20 cursor-pointer active:scale-95 transition-all"
                >
                  <span>{selectedCommit.hash}</span>
                  {isCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                </button>
              </div>

              {/* Stats badges */}
              <div className="py-3 flex items-center gap-3 text-xs font-mono">
                <span className="text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded">
                  +{selectedCommit.stats?.additions || 12} additions
                </span>
                <span className="text-danger bg-danger/10 border border-danger/20 px-2 py-0.5 rounded">
                  -{selectedCommit.stats?.deletions || 4} deletions
                </span>
              </div>

              {/* Simulated Unified Diff Snippet */}
              <div className="mt-2 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                  <FileDiff size={14} className="text-accent" />
                  <span>Changed Files & Diff</span>
                </span>

                <div className="rounded-xl border border-border bg-background p-3 font-mono text-[11px] space-y-1 overflow-x-auto">
                  <div className="text-text-tertiary font-bold pb-1 border-b border-border">
                    --- a/src/core/git.ts
                    <br />
                    +++ b/src/core/git.ts
                  </div>
                  <div className="text-text-tertiary">@@ -14,6 +14,8 @@ export function update() &#123;</div>
                  <div className="text-text-secondary">&nbsp;&nbsp;const store = getStore();</div>
                  <div className="text-success bg-success/10 px-1 rounded-sm">+&nbsp;&nbsp;const cache = invalidateBranchCache();</div>
                  <div className="text-success bg-success/10 px-1 rounded-sm">+&nbsp;&nbsp;await persistMetadata(store);</div>
                  <div className="text-danger bg-danger/10 px-1 rounded-sm">-&nbsp;&nbsp;flushQueue();</div>
                  <div className="text-text-secondary">&nbsp;&nbsp;return true;</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Aliases
export const MobileCommits = CommitsScreen;
