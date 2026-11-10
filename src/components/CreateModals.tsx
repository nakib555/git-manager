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
  const isMountedRef = React.useRef<boolean>(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSafeClose = React.useCallback(() => {
    if (!isMountedRef.current) return;
    try {
      if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
        (document.activeElement as HTMLElement).blur();
      }
    } catch (_) {}
    if (isMountedRef.current) {
      closeModal();
    }
  }, [closeModal]);

  React.useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMountedRef.current) handleSafeClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, handleSafeClose]);

  return (
    <AnimatePresence>
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSafeClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md max-h-[88vh] overflow-y-auto bg-surface-1 rounded-2xl border border-border p-5 sm:p-6 shadow-2xl z-10 flex flex-col sm:-translate-y-4 affordance-card"
          >
            <ModalHeader activeModal={activeModal} onClose={handleSafeClose} />

            <div className="mt-2">
              {activeModal === 'repo' && (
                <RepoForm onExecute={createLocalRepo} onClose={handleSafeClose} />
              )}
              {activeModal === 'branch' && (
                <BranchForm onExecute={createLocalBranch} onClose={handleSafeClose} />
              )}
              {activeModal === 'pr' && (
                <PRForm onExecute={createLocalPR} onClose={handleSafeClose} />
              )}
              {activeModal === 'commit' && (
                <CommitForm onExecute={createLocalCommit} onClose={handleSafeClose} />
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
