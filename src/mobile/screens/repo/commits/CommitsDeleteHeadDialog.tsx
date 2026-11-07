import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
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
  onConfirm: () => void | Promise<void>;
}

export const CommitsDeleteHeadDialog: React.FC<CommitsDeleteHeadDialogProps> = ({
  commit,
  parentCommit,
  branchName = 'main',
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [status, setStatus] = useState<'idle' | 'deleting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) { setStatus('idle'); setErrorMsg(''); }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'deleting') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, status, onClose]);

  const handleExecute = async () => {
    setStatus('deleting');
    setStepIdx(0);
    const t1 = setTimeout(() => setStepIdx(1), 600);
    const t2 = setTimeout(() => setStepIdx(2), 1200);
    try {
      await Promise.resolve(onConfirm());
      clearTimeout(t1); clearTimeout(t2);
      setStatus('success');
      setTimeout(() => { setStatus('idle'); onClose(); }, 1400);
    } catch (err: any) {
      clearTimeout(t1); clearTimeout(t2);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to rewind commit.');
    }
  };

  if (!isOpen || !commit) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => status !== 'deleting' && onClose()}
          className="absolute inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative bg-surface-1 border border-border rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl z-10 max-h-[88vh] overflow-y-auto"
        >

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
              type="button" onClick={onClose} disabled={status === 'deleting'}
              className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-tertiary hover:text-text-primary transition cursor-pointer disabled:opacity-40"
            >
              <X size={15} />
            </button>
          </div>

          {status === 'success' ? (
            <div className="py-4 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-sm text-text-primary">HEAD Commit Successfully Rewound</h3>
              <p className="text-xs text-text-tertiary">Active branch pointer restored to parent commit. Working files intact.</p>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-500">
                    <AlertCircle size={14} /> <span>Rollback Failed</span>
                  </div>
                  <p className="text-[11px] text-text-tertiary">{errorMsg}</p>
                </div>
              )}

              <CommitsDeleteHeadVisualCard commit={commit} parentCommit={parentCommit} branchName={branchName} />

              {status === 'deleting' && (
                <RollbackTransitionLoader
                  steps={['Rewinding branch pointer...', 'Updating repository revision...', 'Rollback complete!']}
                  activeStepIndex={stepIdx}
                  isComplete={stepIdx >= 2}
                />
              )}

              <div className="flex gap-2.5 items-center justify-end pt-2 border-t border-border/80">
                <button
                  type="button" onClick={onClose} disabled={status === 'deleting'}
                  className="w-1/3 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-surface-2 transition cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
                <div className="flex-1">
                  <ConfirmationCountdownButton
                    label="Delete & Roll Back" countdownSeconds={2} onConfirm={handleExecute}
                    disabled={status === 'deleting'} variant="danger" icon={<Trash2 size={13} />}
                  />
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
