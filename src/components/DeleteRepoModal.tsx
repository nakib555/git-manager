import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { DeleteRepoHeader } from './DeleteRepoHeader';
import { ConfirmationCountdownButton } from './ui/ConfirmationCountdownButton';

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
  const [isDeleting, setIsDeleting] = useState(false);

  const owner = repoOwner || githubUser?.login || 'user';
  const fullRepoId = `${owner}/${repoName}`;
  const isMatch = confirmInput.trim() === repoName || confirmInput.trim() === fullRepoId;

  const handleModalClose = () => {
    if (isDeleting) return;
    setConfirmInput('');
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) handleModalClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting]);

  const executeDelete = async () => {
    if (!isMatch || isDeleting) return;
    setIsDeleting(true);
    try {
      const success = await deleteRepo(repoName, owner);
      if (success) { setConfirmInput(''); onClose(); }
    } finally { setIsDeleting(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="delete-repo-title" className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleModalClose} className="absolute inset-0 bg-black/75 backdrop-blur-[2px] cursor-pointer" />

          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-card border-t sm:border border-danger/40 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col pb-[env(safe-area-inset-bottom,0px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5 -mb-1 sm:hidden shrink-0" />
            <DeleteRepoHeader onClose={handleModalClose} isDeleting={isDeleting} />

            <div className="p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] space-y-4">
              <div className="text-xs text-text-muted space-y-2 leading-relaxed">
                <p>
                  This action <strong className="text-danger font-semibold">cannot be undone</strong>. This will permanently delete repository{' '}
                  <span className="font-mono font-bold text-text-main bg-hover px-1.5 py-0.5 rounded border border-border">{fullRepoId}</span>
                  , including all branches, tags, commits, PRs, and staging.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label htmlFor="confirm-repo-input" className="block text-xs font-semibold text-text-main">
                  Please type <span className="font-mono text-danger font-bold">{repoName}</span> to confirm:
                </label>
                <input
                  id="confirm-repo-input" type="text" autoFocus disabled={isDeleting} value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)} placeholder={repoName}
                  className="w-full bg-main border border-border focus:border-danger rounded-xl px-3.5 py-2.5 text-xs text-text-main font-mono outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={handleModalClose} disabled={isDeleting} className="w-1/3 py-2.5 px-4 bg-hover text-text-muted hover:text-text-main font-semibold rounded-xl text-xs transition cursor-pointer disabled:opacity-40 border border-border">
                  Cancel
                </button>
                <div className="flex-1">
                  <ConfirmationCountdownButton
                    label="Delete repository"
                    confirmingLabel="Confirming..."
                    countdownSeconds={2}
                    onConfirm={executeDelete}
                    disabled={!isMatch || isDeleting}
                    variant="danger"
                    icon={<Trash2 size={13} />}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
