import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { RotateCcw, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CommitRestorePreviewCard } from './restore/CommitRestorePreviewCard';
import { CommitRestoreOptionCard } from './restore/CommitRestoreOptionCard';
import { CommitRestoreStatusCard } from './restore/CommitRestoreStatusCard';
import { CommitRestoreFooter } from './restore/CommitRestoreFooter';

export type RestoreMode = 'snapshot' | 'revert';

export interface CommitRestoreSheetProps {
  isOpen: boolean; commit: any | null; onClose: () => void; onSuccess?: () => void;
}

export const CommitRestoreSheet: React.FC<CommitRestoreSheetProps> = ({
  isOpen, commit, onClose, onSuccess,
}) => {
  const { restoreFilesToCommit, revertCommit, showToast, currentBranch } = useAppContext();
  const [selectedMode, setSelectedMode] = useState<RestoreMode>('revert');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !commit) return null;

  const shortSha = commit.hash?.substring(0, 7) || commit.shortSha || 'HEAD';
  const fullSha = commit.fullHash || commit.hash || shortSha;
  const firstLineMsg = (commit.msg || commit.fullMessage || 'Commit').split('\n')[0];
  const isBusy = status === 'loading' || status === 'success';

  const handleSubmit = async () => {
    setStatus('loading');
    try {
      const ok = selectedMode === 'snapshot'
        ? await restoreFilesToCommit(fullSha, firstLineMsg)
        : await revertCommit(fullSha, firstLineMsg);
      if (ok) {
        setStatus('success');
        onSuccess?.();
        setTimeout(() => onClose(), 1300);
      } else {
        setStatus('error');
        setErrorMsg('Action returned unsuccessful status.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Operation failed');
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => !isBusy && onClose()}
          className="absolute inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0.8 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-[500px] bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden max-h-[92vh]"
        >
          <div className="pt-2.5 pb-1 flex justify-center shrink-0 sm:hidden">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                <RotateCcw size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary leading-tight">Restore or Revert Commit</h2>
                <p className="text-[11px] text-text-tertiary mt-0.5">
                  Revision <code className="font-mono text-accent font-semibold">{shortSha}</code> &bull; {currentBranch || 'main'}
                </p>
              </div>
            </div>

            <button
              type="button" onClick={onClose} disabled={isBusy}
              className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-tertiary hover:text-text-primary transition disabled:opacity-40 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
            <CommitRestoreStatusCard
              status={status} selectedMode={selectedMode} shortSha={shortSha}
              errorMsg={errorMsg} onRetry={() => setStatus('idle')}
            />

            <CommitRestorePreviewCard
              shortSha={shortSha} firstLineMsg={firstLineMsg}
              authorName={commit.author || 'Author'}
              commitTime={commit.date || commit.timestamp || commit.time}
              stats={commit.stats} branchName={currentBranch || 'main'}
            />

            <div>
              <label className="block text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2">
                Choose Restore Method
              </label>
              <CommitRestoreOptionCard
                selectedMode={selectedMode} shortSha={shortSha}
                firstLineMsg={firstLineMsg} isSubmitting={isBusy}
                onSelectMode={setSelectedMode}
              />
            </div>

            <div className="p-3 bg-surface-2/60 border border-border/70 rounded-2xl flex items-start gap-2.5 text-[11px] text-text-secondary leading-relaxed">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-text-primary font-semibold">Non-destructive: </strong>
                Appends forward commit. Branch history remains intact.
              </span>
            </div>
          </div>

          <CommitRestoreFooter
            selectedMode={selectedMode} shortSha={shortSha}
            isSubmitting={isBusy} onClose={onClose} onSubmit={handleSubmit}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
