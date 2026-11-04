import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  RotateCcw, Undo2, X, CheckCircle2, 
  GitCommit, AlertCircle, Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRelativeTime } from '../utils/formatters';

export type RestoreMode = 'snapshot' | 'revert';

export interface CommitRestoreSheetProps {
  isOpen: boolean;
  commit: any | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CommitRestoreSheet: React.FC<CommitRestoreSheetProps> = ({
  isOpen,
  commit,
  onClose,
  onSuccess,
}) => {
  const { restoreFilesToCommit, revertCommit, showToast } = useAppContext();
  const [selectedMode, setSelectedMode] = useState<RestoreMode>('snapshot');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !commit) return null;

  const shortSha = commit.hash ? commit.hash.substring(0, 7) : (commit.shortSha || 'head');
  const fullSha = commit.fullHash || commit.hash || shortSha;
  const commitMsg = commit.msg || commit.fullMessage || 'Commit';
  const firstLineMsg = commitMsg.split('\n')[0];
  const authorName = commit.author || 'Author';
  const commitTime = commit.date || commit.timestamp || commit.time;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let success = false;
      if (selectedMode === 'snapshot') {
        success = await restoreFilesToCommit(fullSha, firstLineMsg);
      } else {
        success = await revertCommit(fullSha, firstLineMsg);
      }

      if (success) {
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      console.error('Commit restore/revert error:', err);
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isSubmitting && onClose()}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Slide-up Container adhering to 8-point rhythm */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-[480px] mx-auto bg-surface-1 border-t border-x border-border rounded-t-3xl shadow-2xl z-10 flex flex-col overflow-hidden max-h-[92vh]"
        >
          {/* Top Grab Handle */}
          <div className="pt-2.5 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                <RotateCcw size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary leading-tight">
                  Restore / Revert Commit
                </h2>
                <p className="text-[11px] text-text-tertiary">
                  Target commit <code className="font-mono text-text-primary font-semibold">{shortSha}</code>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-tertiary hover:text-text-primary transition disabled:opacity-40 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Target Commit Preview Card */}
            <div className="p-3.5 bg-surface-2/60 border border-border/80 rounded-2xl space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-surface-3 flex items-center justify-center text-text-secondary shrink-0">
                    <GitCommit size={13} />
                  </div>
                  <span className="font-mono text-xs font-bold text-accent px-1.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 shrink-0">
                    {shortSha}
                  </span>
                  <span className="text-xs font-semibold text-text-primary truncate">
                    {firstLineMsg}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-text-tertiary font-mono pt-0.5">
                <span className="text-text-secondary font-sans truncate max-w-[130px]">{authorName}</span>
                {commitTime && (
                  <>
                    <span className="opacity-40">&bull;</span>
                    <span className="font-sans">{formatRelativeTime(commitTime)}</span>
                  </>
                )}
                {commit.stats && (
                  <>
                    <span className="opacity-40">&bull;</span>
                    <span className="text-emerald-500 font-semibold">+{commit.stats.additions}</span>
                    <span className="text-rose-500 font-semibold">-{commit.stats.deletions}</span>
                  </>
                )}
              </div>
            </div>

            {/* Mode Selection Heading */}
            <div>
              <label className="block text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2">
                Choose Action Method
              </label>

              {/* Mode Options Grid */}
              <div className="space-y-2.5">
                {/* Option 1: Restore Snapshot */}
                <div
                  onClick={() => !isSubmitting && setSelectedMode('snapshot')}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    selectedMode === 'snapshot'
                      ? 'bg-accent/10 border-accent text-text-primary shadow-xs'
                      : 'bg-surface-2/40 border-border/80 text-text-secondary hover:bg-surface-2'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    selectedMode === 'snapshot'
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-surface-3'
                  }`}>
                    {selectedMode === 'snapshot' && <CheckCircle2 size={13} className="stroke-[3]" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                      <RotateCcw size={13} className="text-accent" />
                      <span>Restore Snapshot (Full Rollback)</span>
                    </div>
                    <p className="text-[11px] text-text-tertiary mt-1 leading-relaxed">
                      Restores the entire repository working tree to the state of commit <strong className="font-mono text-text-primary">{shortSha}</strong> and generates a rollback commit preserving full Git history.
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-text-tertiary bg-surface-1 px-2 py-1 rounded-lg border border-border/70 inline-block">
                      Revert to {shortSha}: {firstLineMsg.slice(0, 32)}...
                    </div>
                  </div>
                </div>

                {/* Option 2: Revert Single Commit */}
                <div
                  onClick={() => !isSubmitting && setSelectedMode('revert')}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    selectedMode === 'revert'
                      ? 'bg-accent/10 border-accent text-text-primary shadow-xs'
                      : 'bg-surface-2/40 border-border/80 text-text-secondary hover:bg-surface-2'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    selectedMode === 'revert'
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-surface-3'
                  }`}>
                    {selectedMode === 'revert' && <CheckCircle2 size={13} className="stroke-[3]" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                      <Undo2 size={13} className="text-accent" />
                      <span>Revert this Commit (Delta Inverse)</span>
                    </div>
                    <p className="text-[11px] text-text-tertiary mt-1 leading-relaxed">
                      Reverses only the changes introduced in <strong className="font-mono text-text-primary">{shortSha}</strong> without altering subsequent or predecessor commits, creating standard <code className="font-mono text-text-primary">Revert "{firstLineMsg.slice(0, 20)}"</code> commit.
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-text-tertiary bg-surface-1 px-2 py-1 rounded-lg border border-border/70 inline-block">
                      git revert {shortSha}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GitHub Best Practice Informational Callout */}
            <div className="p-3 bg-surface-2 border border-border/70 rounded-2xl flex items-start gap-2.5 text-[11px] text-text-tertiary leading-relaxed">
              <AlertCircle size={15} className="text-accent shrink-0 mt-0.5" />
              <span>
                Both options follow GitHub rules by creating forward commits. Branch history is never force-erased, keeping collaboration safe and auditable.
              </span>
            </div>
          </div>

          {/* Sticky Bottom Actions Bar (8-point touch targets: 44px min) */}
          <div className="p-4 border-t border-border bg-surface-1 flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11 bg-surface-2 hover:bg-surface-3 text-text-secondary font-bold rounded-2xl text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[2] h-11 bg-accent hover:opacity-90 text-white font-bold rounded-2xl text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>{selectedMode === 'snapshot' ? 'Restoring Snapshot...' : 'Reverting Commit...'}</span>
                </>
              ) : (
                <>
                  {selectedMode === 'snapshot' ? <RotateCcw size={15} /> : <Undo2 size={15} />}
                  <span>{selectedMode === 'snapshot' ? `Restore to ${shortSha}` : `Revert ${shortSha}`}</span>
                  <ArrowRight size={13} className="opacity-70" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
