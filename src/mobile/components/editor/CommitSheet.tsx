import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GitCommit, GitBranch, X } from 'lucide-react';
import { CommitSheetStaging } from './CommitSheetStaging';
import { CommitSheetInputs } from './CommitSheetInputs';
import { useActionWorkflow } from '../../../components/common/actionWorkflow/useActionWorkflow';
import { ActionVerificationTracker } from '../../../components/common/actionWorkflow/ActionVerificationTracker';
import { WorkflowStep } from '../../../components/common/actionWorkflow/types';

interface CommitSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (params: { message: string; description?: string }) => Promise<void>;
  filePath: string;
  targetBranch: string;
  authorName: string;
  authorAvatar?: string;
  stats: { additions: number; deletions: number };
  isSubmitting?: boolean;
}

const EDITOR_COMMIT_STEPS: WorkflowStep[] = [
  { id: 'stage', label: 'Validating staged file delta', sublabel: 'Checking unified diff & line mutations' },
  { id: 'write', label: 'Writing commit tree to Git', sublabel: 'Creating commit object on target branch' },
  { id: 'ver', label: 'Verifying working tree sync', sublabel: 'Updating file cache and repository index' },
];

export const CommitSheet: React.FC<CommitSheetProps> = ({
  isOpen,
  onClose,
  onCommit,
  filePath,
  targetBranch,
  authorName,
  authorAvatar,
  stats,
}) => {
  const [isStaged, setIsStaged] = useState<boolean>(true);
  const [commitSummary, setCommitSummary] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const workflow = useActionWorkflow({
    steps: EDITOR_COMMIT_STEPS,
    autoCloseDelay: 2000,
    onClose,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const summaryTrimmed = commitSummary.trim();
    if (!isStaged) {
      setInputError('Please stage the file before committing.');
      return;
    }
    if (!summaryTrimmed) {
      setInputError('Commit summary is required.');
      return;
    }
    setInputError(null);

    workflow.execute(async () => {
      await onCommit({
        message: summaryTrimmed,
        description: commitDescription.trim() || undefined,
      });
      return {
        title: summaryTrimmed,
        subtitle: `Changes committed to ${filePath} on branch ${targetBranch}.`,
        metaItems: [
          { label: 'File', value: filePath },
          { label: 'Branch', value: targetBranch },
          { label: 'Author', value: authorName || 'Active User' },
        ],
      };
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="commit-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full max-w-lg bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 min-h-[48px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-accent">
              <GitCommit size={16} />
            </div>
            <div>
              <h2 id="commit-sheet-title" className="text-sm font-bold text-text-primary leading-tight">
                Commit changes
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary font-mono">
                <GitBranch size={11} className="text-accent" />
                <span className="text-text-secondary font-semibold">{targetBranch}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[180px]">{filePath}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={workflow.isBusy}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition cursor-pointer"
            aria-label="Close commit sheet"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
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
              onRetry={() => handleSubmit({ preventDefault: () => {} } as any)}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <CommitSheetStaging
                filePath={filePath}
                isStaged={isStaged}
                stats={stats}
                authorName={authorName}
                authorAvatar={authorAvatar}
                onToggleStaged={() => setIsStaged(!isStaged)}
                onSetStaged={setIsStaged}
              />

              <CommitSheetInputs
                filePath={filePath}
                commitSummary={commitSummary}
                commitDescription={commitDescription}
                errorMsg={inputError}
                isStaged={isStaged}
                isSubmitting={workflow.isBusy}
                onSummaryChange={(val) => {
                  setCommitSummary(val);
                  if (inputError) setInputError(null);
                }}
                onDescriptionChange={setCommitDescription}
              />
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
