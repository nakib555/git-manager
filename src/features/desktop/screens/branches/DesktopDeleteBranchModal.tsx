import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useActionWorkflow } from '../../../../components/common/actionWorkflow/useActionWorkflow';
import { ActionVerificationTracker } from '../../../../components/common/actionWorkflow/ActionVerificationTracker';
import { WorkflowStep } from '../../../../components/common/actionWorkflow/types';

interface DesktopDeleteBranchModalProps {
  branchName: string | null;
  onClose: () => void;
  onConfirmDelete: (name: string) => Promise<any>;
}

const DELETE_STEPS: WorkflowStep[] = [
  { id: 'val', label: 'Validating branch deletion constraints', sublabel: 'Verifying non-default status' },
  { id: 'del', label: 'Purging Git branch ref', sublabel: 'Removing branch pointer from index' },
  { id: 'ver', label: 'Verifying repository state', sublabel: 'Updating workspace branch catalog' },
];

export const DesktopDeleteBranchModal: React.FC<DesktopDeleteBranchModalProps> = ({
  branchName,
  onClose,
  onConfirmDelete,
}) => {
  const workflow = useActionWorkflow({
    steps: DELETE_STEPS,
    autoCloseDelay: 2000,
    onClose,
  });

  const handleDelete = () => {
    if (!branchName || workflow.isBusy) return;
    workflow.execute(async () => {
      await onConfirmDelete(branchName);
      return {
        title: `Branch Deleted`,
        subtitle: `Branch ${branchName} was purged from repository.`,
        metaItems: [
          { label: 'Branch', value: branchName },
          { label: 'Status', value: 'Purged' },
        ],
      };
    });
  };

  if (!branchName) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {workflow.phase !== 'idle' ? (
              <ActionVerificationTracker
                phase={workflow.phase}
                steps={workflow.steps}
                activeStepIndex={workflow.activeStepIndex}
                resultSummary={workflow.resultSummary}
                errorMsg={workflow.errorMsg}
                countdownRemaining={workflow.countdownRemaining}
                onDismissNow={workflow.dismissNow}
                onBackToEdit={workflow.reset}
                onRetry={handleDelete}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h3 className="text-base font-bold text-text-main">Delete Branch</h3>
                    <p className="text-xs text-text-muted font-medium break-all">
                      Are you sure you want to delete <span className="font-mono font-bold text-text-main bg-hover px-1.5 py-0.5 rounded border border-border/50">{branchName}</span>?
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-error/5 border border-error/15 rounded-xl">
                  <p className="text-xs text-error leading-relaxed">
                    This action is permanent. All commits unique to this branch will be removed from your catalog.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 text-xs font-semibold text-text-muted bg-hover rounded-xl hover:text-text-main transition-colors cursor-pointer border border-border/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-2.5 text-xs font-bold text-white bg-error rounded-xl hover:bg-error/90 transition-colors shadow-md shadow-error/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Branch</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
