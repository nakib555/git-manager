import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BranchModalHeader } from './BranchModalHeader';
import { BranchModalTabs } from './BranchModalTabs';
import { BranchModalFooter } from './BranchModalFooter';

interface BranchDetailModalProps {
  selectedBranch: string | null;
  currentBranch: string | null;
  activeTab: 'overview' | 'commits' | 'compare';
  activeCommits: any[];
  isSwitching: boolean;
  isDeleting: boolean;
  onTabChange: (tab: 'overview' | 'commits' | 'compare') => void;
  onClose: () => void;
  onSelectCommit: (commit: any) => void;
  onCreatePR: () => void;
  onSwitch: () => void;
  onDelete: () => void;
}

export const BranchDetailModal: React.FC<BranchDetailModalProps> = ({
  selectedBranch,
  currentBranch,
  activeTab,
  activeCommits,
  isSwitching,
  isDeleting,
  onTabChange,
  onClose,
  onSelectCommit,
  onCreatePR,
  onSwitch,
  onDelete,
}) => {
  return (
    <AnimatePresence>
      {selectedBranch && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full bg-surface-1 border-t border-border-accent rounded-t-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
          >
            <BranchModalHeader
              selectedBranch={selectedBranch}
              currentBranch={currentBranch}
              activeTab={activeTab}
              onTabChange={onTabChange}
              onClose={onClose}
            />
            <BranchModalTabs
              activeTab={activeTab}
              selectedBranch={selectedBranch}
              activeCommits={activeCommits}
              onSelectCommit={onSelectCommit}
              onCreatePR={onCreatePR}
            />
            <BranchModalFooter
              selectedBranch={selectedBranch}
              currentBranch={currentBranch}
              isSwitching={isSwitching}
              isDeleting={isDeleting}
              onSwitch={onSwitch}
              onDelete={onDelete}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
