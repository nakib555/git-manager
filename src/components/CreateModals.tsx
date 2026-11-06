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
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-surface-1 rounded-t-3xl sm:rounded-2xl border-t sm:border border-border p-5 sm:p-6 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] shadow-2xl z-10 flex flex-col"
          >
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-1 mb-3 sm:hidden shrink-0" />

            <ModalHeader activeModal={activeModal} onClose={closeModal} />

            <div className="mt-2">
              {activeModal === 'repo' && <RepoForm onSubmit={(data) => { createLocalRepo(data); closeModal(); }} />}
              {activeModal === 'branch' && <BranchForm onSubmit={(data) => { createLocalBranch(data); closeModal(); }} />}
              {activeModal === 'pr' && <PRForm onSubmit={(data) => { createLocalPR(data); closeModal(); }} />}
              {activeModal === 'commit' && <CommitForm onSubmit={(data) => { createLocalCommit(data); closeModal(); }} />}
              {activeModal === 'oauth_setup' && <OAuthSetupForm />}
              {activeModal === 'clone' && <CloneModal />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
