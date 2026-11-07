import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BranchModalHeader } from './BranchModalHeader';
import { BranchModalTabs } from './BranchModalTabs';
import { BranchModalFooter } from './BranchModalFooter';
import { useActionWorkflow } from '../../../../components/common/actionWorkflow/useActionWorkflow';
import { ActionVerificationTracker } from '../../../../components/common/actionWorkflow/ActionVerificationTracker';
import { WorkflowStep } from '../../../../components/common/actionWorkflow/types';

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
  onSwitch: () => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

const SWITCH_STEPS: WorkflowStep[] = [
  { id: 'clean', label: 'Validating working tree cleanliness', sublabel: 'Ensuring zero conflicting unstaged changes' },
  { id: 'checkout', label: 'Switching active branch ref', sublabel: 'Updating repository HEAD pointer' },
  { id: 'ver', label: 'Verifying active files & index', sublabel: 'Synchronizing commit history tree' },
];

const DELETE_BRANCH_STEPS: WorkflowStep[] = [
  { id: 'val', label: 'Validating branch deletion constraints', sublabel: 'Verifying branch is non-default and inactive' },
  { id: 'del', label: 'Purging Git branch ref', sublabel: 'Deleting ref pointer from repository' },
  { id: 'ver', label: 'Verifying active branch list', sublabel: 'Updating repository branch catalog' },
];

export const BranchDetailModal: React.FC<BranchDetailModalProps> = ({
  selectedBranch, currentBranch, activeTab, activeCommits,
  onTabChange, onClose, onSelectCommit, onCreatePR, onSwitch, onDelete,
}) => {
  const switchWorkflow = useActionWorkflow({ steps: SWITCH_STEPS, autoCloseDelay: 2000, onClose });
  const deleteWorkflow = useActionWorkflow({ steps: DELETE_BRANCH_STEPS, autoCloseDelay: 2000, onClose });

  const handleSwitch = () => {
    if (!selectedBranch || switchWorkflow.isBusy) return;
    switchWorkflow.execute(async () => {
      await onSwitch();
      return {
        title: `Switched to ${selectedBranch}`,
        subtitle: `Branch ${selectedBranch} is now the active HEAD.`,
        metaItems: [{ label: 'Branch', value: selectedBranch }, { label: 'HEAD', value: 'Active' }],
      };
    });
  };

  const handleDelete = () => {
    if (!selectedBranch || deleteWorkflow.isBusy) return;
    deleteWorkflow.execute(async () => {
      await onDelete();
      return {
        title: `Branch Deleted`,
        subtitle: `Branch ${selectedBranch} has been purged from the repository.`,
        metaItems: [{ label: 'Branch', value: selectedBranch }, { label: 'Status', value: 'Purged' }],
      };
    });
  };

  const activeWorkflow = switchWorkflow.phase !== 'idle' ? switchWorkflow : deleteWorkflow;
  const isWorkflowActive = activeWorkflow.phase !== 'idle';

  return (
    <AnimatePresence>
      {selectedBranch && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !isWorkflowActive && onClose()}
            className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full bg-surface-1 border-t border-border-accent rounded-t-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
          >
            <BranchModalHeader
              selectedBranch={selectedBranch} currentBranch={currentBranch}
              activeTab={activeTab} onTabChange={onTabChange} onClose={onClose}
            />
            {isWorkflowActive ? (
              <div className="p-5 flex-1 overflow-y-auto">
                <ActionVerificationTracker
                  phase={activeWorkflow.phase} steps={activeWorkflow.steps}
                  activeStepIndex={activeWorkflow.activeStepIndex} resultSummary={activeWorkflow.resultSummary}
                  errorMsg={activeWorkflow.errorMsg} countdownRemaining={activeWorkflow.countdownRemaining}
                  onDismissNow={activeWorkflow.dismissNow} onBackToEdit={activeWorkflow.reset}
                  onRetry={switchWorkflow.phase !== 'idle' ? handleSwitch : handleDelete}
                />
              </div>
            ) : (
              <>
                <BranchModalTabs
                  activeTab={activeTab} selectedBranch={selectedBranch}
                  activeCommits={activeCommits} onSelectCommit={onSelectCommit} onCreatePR={onCreatePR}
                />
                <BranchModalFooter
                  selectedBranch={selectedBranch} currentBranch={currentBranch}
                  isSwitching={switchWorkflow.isBusy} isDeleting={deleteWorkflow.isBusy}
                  onSwitch={handleSwitch} onDelete={handleDelete}
                />
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
