import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { CommitsDeleteHeadVisualCard } from './CommitsDeleteHeadVisualCard';
import { ConfirmationCountdownButton } from '../../../../components/ui/ConfirmationCountdownButton';
import { RollbackTransitionLoader } from '../../../../components/ui/RollbackTransitionLoader';

export interface CommitsDeleteHeadDialogProps {
  commit: any | null;
  parentCommit?: any;
  branchName?: string;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CommitsDeleteHeadDialog: React.FC<CommitsDeleteHeadDialogProps> = ({
  commit,
  parentCommit,
  branchName = 'main',
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  useEffect(() => {
    if (isDeleting) {
      setStepIdx(0);
      const t1 = setTimeout(() => setStepIdx(1), 600);
      const t2 = setTimeout(() => setStepIdx(2), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isDeleting]);

  if (!isOpen || !commit) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isDeleting && onClose()}
          className="absolute inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] max-w-md w-full space-y-4 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        >
          <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-1 mb-1 sm:hidden shrink-0" />

          <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-text-primary leading-tight">Delete HEAD Commit</h3>
                <p className="text-[11px] text-text-tertiary mt-0.5">Rewind active branch to previous revision</p>
              </div>
            </div>

            <button
              type="button" onClick={onClose} disabled={isDeleting}
              className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-tertiary hover:text-text-primary transition cursor-pointer disabled:opacity-40"
            >
              <X size={15} />
            </button>
          </div>

          <CommitsDeleteHeadVisualCard commit={commit} parentCommit={parentCommit} branchName={branchName} />

          {isDeleting && (
            <RollbackTransitionLoader
              steps={['Rewinding branch pointer...', 'Updating repository revision...', 'Rollback complete!']}
              activeStepIndex={stepIdx}
              isComplete={stepIdx >= 2}
            />
          )}

          <div className="flex gap-2.5 items-center justify-end pt-2 border-t border-border/80">
            <button
              type="button" onClick={onClose} disabled={isDeleting}
              className="w-1/3 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-surface-2 transition cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <div className="flex-1">
              <ConfirmationCountdownButton
                label="Delete & Roll Back"
                countdownSeconds={2}
                onConfirm={onConfirm}
                disabled={isDeleting}
                variant="danger"
                icon={<Trash2 size={13} />}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
