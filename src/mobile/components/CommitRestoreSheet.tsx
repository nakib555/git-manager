import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { RotateCcw, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CommitRestorePreviewCard } from './restore/CommitRestorePreviewCard';
import { CommitRestoreOptionCard } from './restore/CommitRestoreOptionCard';
import { CommitRestoreFooter } from './restore/CommitRestoreFooter';

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
      const success = selectedMode === 'snapshot'
        ? await restoreFilesToCommit(fullSha, firstLineMsg)
        : await revertCommit(fullSha, firstLineMsg);

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isSubmitting && onClose()}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-[480px] mx-auto bg-surface-1 border-t border-x border-border rounded-t-3xl shadow-2xl z-10 flex flex-col overflow-hidden max-h-[92vh]"
        >
          <div className="pt-2.5 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          <div className="px-5 py-3 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                <RotateCcw size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary leading-tight">Restore / Revert Commit</h2>
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

          <div className="p-4 space-y-4 overflow-y-auto">
            <CommitRestorePreviewCard
              shortSha={shortSha}
              firstLineMsg={firstLineMsg}
              authorName={authorName}
              commitTime={commitTime}
              stats={commit.stats}
            />

            <div>
              <label className="block text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2">
                Choose Action Method
              </label>
              <CommitRestoreOptionCard
                selectedMode={selectedMode}
                shortSha={shortSha}
                firstLineMsg={firstLineMsg}
                isSubmitting={isSubmitting}
                onSelectMode={setSelectedMode}
              />
            </div>

            <div className="p-3 bg-surface-2 border border-border/70 rounded-2xl flex items-start gap-2.5 text-[11px] text-text-tertiary leading-relaxed">
              <AlertCircle size={15} className="text-accent shrink-0 mt-0.5" />
              <span>Both options follow GitHub rules by creating forward commits. Branch history is never force-erased.</span>
            </div>
          </div>

          <CommitRestoreFooter
            selectedMode={selectedMode}
            shortSha={shortSha}
            isSubmitting={isSubmitting}
            onClose={onClose}
            onSubmit={handleSubmit}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
