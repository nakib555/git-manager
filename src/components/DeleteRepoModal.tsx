import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { useAppContext } from '../AppContext';

interface DeleteRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
  repoOwner?: string | null;
}

export const DeleteRepoModal: React.FC<DeleteRepoModalProps> = ({
  isOpen,
  onClose,
  repoName,
  repoOwner,
}) => {
  const { deleteRepo, githubUser } = useAppContext();
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const owner = repoOwner || githubUser?.login || 'user';
  const fullRepoId = `${owner}/${repoName}`;
  
  // Accept either just the repo name or the full owner/name
  const isMatch = confirmInput.trim() === repoName || confirmInput.trim() === fullRepoId;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || isDeleting) return;

    setIsDeleting(true);
    try {
      const success = await deleteRepo(repoName, owner);
      if (success) {
        setConfirmInput('');
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalClose = () => {
    if (isDeleting) return;
    setConfirmInput('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          role="alertdialog" 
          aria-modal="true" 
          aria-labelledby="delete-repo-title"
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-card border border-danger/40 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Warning Banner */}
            <div className="p-5 border-b border-border bg-danger/10 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-danger/15 text-danger border border-danger/30 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="delete-repo-title" className="text-base font-bold text-text-main flex items-center gap-2">
                  <span>Delete Repository</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  GitHub & Git Danger Zone specification
                </p>
              </div>
              <button
                type="button"
                onClick={handleModalClose}
                disabled={isDeleting}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover transition cursor-pointer shrink-0 disabled:opacity-40"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Warning Body */}
            <form onSubmit={handleDelete} className="p-5 space-y-4">
              <div className="text-xs text-text-muted space-y-2 leading-relaxed">
                <p>
                  This action <strong className="text-danger font-semibold">cannot be undone</strong>. This will permanently delete the repository{' '}
                  <span className="font-mono font-bold text-text-main bg-hover px-1.5 py-0.5 rounded border border-border">
                    {fullRepoId}
                  </span>
                  , including all:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-text-muted/90 text-[11px]">
                  <li>Branches, tags, and commits</li>
                  <li>Pull requests, issues, and discussions</li>
                  <li>Webhooks, keys, and branch protection rules</li>
                  <li>Local workstation staging and cached files</li>
                </ul>
              </div>

              {/* Type-to-Confirm Input */}
              <div className="space-y-1.5 pt-2">
                <label 
                  htmlFor="confirm-repo-input" 
                  className="block text-xs font-semibold text-text-main"
                >
                  Please type <span className="font-mono text-danger font-bold">{repoName}</span> to confirm:
                </label>
                <input
                  id="confirm-repo-input"
                  type="text"
                  autoFocus
                  disabled={isDeleting}
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={repoName}
                  className="w-full bg-main border border-border focus:border-danger rounded-xl px-3.5 py-2.5 text-xs text-text-main font-mono outline-none transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 bg-hover text-text-muted hover:text-text-main font-semibold rounded-xl text-xs transition cursor-pointer disabled:opacity-40 border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isMatch || isDeleting}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                    isMatch && !isDeleting
                      ? 'bg-danger text-white hover:bg-danger/90 active:scale-95 cursor-pointer shadow-danger/20'
                      : 'bg-danger/20 text-danger/50 border border-danger/20 cursor-not-allowed'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>Delete this repository</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
