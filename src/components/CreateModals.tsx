import React from 'react';
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

  return (
    <AnimatePresence>
      {activeModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border p-6 shadow-2xl"
          >
            <ModalHeader activeModal={activeModal} onClose={closeModal} />

            {activeModal === 'repo' && <RepoForm onSubmit={(data) => { createLocalRepo(data); closeModal(); }} />}
            {activeModal === 'branch' && <BranchForm onSubmit={(data) => { createLocalBranch(data); closeModal(); }} />}
            {activeModal === 'pr' && <PRForm onSubmit={(data) => { createLocalPR(data); closeModal(); }} />}
            {activeModal === 'commit' && <CommitForm onSubmit={(data) => { createLocalCommit(data); closeModal(); }} />}
            {activeModal === 'oauth_setup' && <OAuthSetupForm />}
            {activeModal === 'clone' && <CloneModal />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
