import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { CloneModal } from './CloneModal';
import { ModalHeader } from './modals/ModalHeader';
import { RepoForm } from './modals/RepoForm';
import { BranchForm } from './modals/BranchForm';
import { PRForm } from './modals/PRForm';
import { CommitForm } from './modals/CommitForm';
import { OAuthSetupForm } from './modals/OAuthSetupForm';

export const CreateModals: React.FC = () => {
  const { activeModal, closeModal, createLocalRepo, createLocalBranch, createLocalPR, createLocalCommit } = useAppContext();

  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, closeModal]);

  return (
    <AnimatePresence>
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md max-h-[88vh] overflow-y-auto bg-surface-1 rounded-2xl border border-border p-5 sm:p-6 shadow-2xl z-10 flex flex-col"
          >
            <ModalHeader activeModal={activeModal} onClose={closeModal} />

            <div className="mt-2">
              {activeModal === 'repo' && (
                <RepoForm onExecute={createLocalRepo} onClose={closeModal} />
              )}
              {activeModal === 'branch' && (
                <BranchForm onExecute={createLocalBranch} onClose={closeModal} />
              )}
              {activeModal === 'pr' && (
                <PRForm onExecute={createLocalPR} onClose={closeModal} />
              )}
              {activeModal === 'commit' && (
                <CommitForm onExecute={createLocalCommit} onClose={closeModal} />
              )}
              {activeModal === 'oauth_setup' && <OAuthSetupForm />}
              {activeModal === 'clone' && <CloneModal />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
