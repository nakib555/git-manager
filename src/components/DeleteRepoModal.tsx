import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { DeleteRepoHeader } from './DeleteRepoHeader';
import { ConfirmationCountdownButton } from './ui/ConfirmationCountdownButton';
import { DeleteRepoStatusView, DELETE_REPO_STEPS } from './deleteRepo/DeleteRepoStatusView';
import { useActionWorkflow } from './common/actionWorkflow/useActionWorkflow';

interface DeleteRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
  repoOwner?: string | null;
}

export const DeleteRepoModal: React.FC<DeleteRepoModalProps> = ({
  isOpen, onClose, repoName, repoOwner,
}) => {
  const { deleteRepo, githubUser } = useAppContext();
  const [confirmInput, setConfirmInput] = useState('');

  const owner = repoOwner || githubUser?.login || 'user';
  const fullRepoId = `${owner}/${repoName}`;
  const isMatch = confirmInput.trim() === repoName || confirmInput.trim() === fullRepoId;

  const workflow = useActionWorkflow({
    steps: DELETE_REPO_STEPS,
    autoCloseDelay: 2000,
    onClose: () => {
      setConfirmInput('');
      onClose();
    },
  });

  const handleModalClose = () => {
    if (workflow.isBusy) return;
    setConfirmInput('');
    workflow.reset();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) { workflow.reset(); setConfirmInput(''); }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !workflow.isBusy) handleModalClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, workflow.isBusy]);

  const executeDelete = () => {
    if (!isMatch || workflow.isBusy) return;
    workflow.execute(async () => {
      const ok = await deleteRepo(repoName, owner);
      if (!ok) throw new Error('Failed to delete repository. Check permissions and try again.');
      return {
        title: `Repository Deleted`,
        subtitle: `All local branches and commit objects for ${repoName} have been purged.`,
        metaItems: [
          { label: 'Repository', value: repoName },
          { label: 'Owner', value: owner },
          { label: 'Status', value: 'Purged' },
        ],
      };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div role="alertdialog" aria-modal="true" className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleModalClose} className="absolute inset-0 bg-black/75 backdrop-blur-[2px] cursor-pointer" />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md bg-card border border-danger/40 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <DeleteRepoHeader onClose={handleModalClose} isDeleting={workflow.isBusy} />

            <div className="p-5 sm:p-6 space-y-4">
              {workflow.phase !== 'idle' ? (
                <DeleteRepoStatusView
                  phase={workflow.phase}
                  activeStepIndex={workflow.activeStepIndex}
                  resultSummary={workflow.resultSummary}
                  errorMsg={workflow.errorMsg}
                  countdownRemaining={workflow.countdownRemaining}
                  onDismissNow={workflow.dismissNow}
                  onBackToEdit={workflow.reset}
                  onRetry={executeDelete}
                />
              ) : (
                <>
                  <div className="p-3.5 bg-danger/10 border border-danger/25 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-danger text-[11px] uppercase tracking-wider">
                      <ShieldAlert size={14} /> <span>Permanent Data Removal</span>
                    </div>
                    <ul className="text-text-muted space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                      <li>Repository workspace, commit history, and branches</li>
                      <li>Local uncommitted changes and staging cache</li>
                      <li>Pull requests, tags, and cloud sync tracking</li>
                    </ul>
                  </div>

                  <div className="text-xs text-text-muted leading-relaxed">
                    This action <strong className="text-danger font-semibold">cannot be reversed</strong>. Confirm repository name:
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="confirm-repo-input" className="font-semibold text-text-main">
                        Type <code className="font-mono text-danger font-bold bg-danger/10 px-1 py-0.5 rounded">{repoName}</code>
                      </label>
                      {isMatch ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                          <CheckCircle2 size={12} /> <span>Name matches</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted">Exact match required</span>
                      )}
                    </div>
                    <input
                      id="confirm-repo-input" type="text" autoFocus value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)} placeholder={`Type ${repoName} to confirm`}
                      className={`w-full bg-main border rounded-xl px-3.5 py-2.5 text-xs text-text-main font-mono outline-none transition-colors ${
                        isMatch ? 'border-emerald-500 focus:border-emerald-400' : 'border-border focus:border-danger'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button type="button" onClick={handleModalClose} disabled={workflow.isBusy} className="w-1/3 py-2.5 px-4 bg-hover text-text-muted hover:text-text-main font-semibold rounded-xl text-xs transition cursor-pointer disabled:opacity-40 border border-border">
                      Cancel
                    </button>
                    <div className="flex-1">
                      <ConfirmationCountdownButton
                        label="Delete repository" confirmingLabel="Confirming..." countdownSeconds={2}
                        onConfirm={executeDelete} disabled={!isMatch || workflow.isBusy} variant="danger" icon={<Trash2 size={13} />}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
