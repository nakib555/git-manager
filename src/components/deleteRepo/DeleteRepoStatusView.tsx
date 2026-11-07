import React from 'react';
import { ActionVerificationTracker } from '../common/actionWorkflow/ActionVerificationTracker';
import { WorkflowPhase, WorkflowStep, ActionResultSummary } from '../common/actionWorkflow/types';

export const DELETE_REPO_STEPS: WorkflowStep[] = [
  { id: 'auth', label: 'Validating deletion authorization', sublabel: 'Verifying repository ownership token' },
  { id: 'purge', label: 'Purging Git branches & objects', sublabel: 'Removing branch heads and commit references' },
  { id: 'sync', label: 'Updating repository catalog', sublabel: 'Switching active workspace context' },
];

interface DeleteRepoStatusViewProps {
  phase: WorkflowPhase;
  activeStepIndex: number;
  resultSummary: ActionResultSummary | null;
  errorMsg: string;
  countdownRemaining: number;
  onDismissNow: () => void;
  onBackToEdit: () => void;
  onRetry?: () => void;
}

export const DeleteRepoStatusView: React.FC<DeleteRepoStatusViewProps> = ({
  phase,
  activeStepIndex,
  resultSummary,
  errorMsg,
  countdownRemaining,
  onDismissNow,
  onBackToEdit,
  onRetry,
}) => {
  return (
    <div className="py-2">
      <ActionVerificationTracker
        phase={phase}
        steps={DELETE_REPO_STEPS}
        activeStepIndex={activeStepIndex}
        resultSummary={resultSummary}
        errorMsg={errorMsg}
        countdownRemaining={countdownRemaining}
        onDismissNow={onDismissNow}
        onBackToEdit={onBackToEdit}
        onRetry={onRetry}
      />
    </div>
  );
};
