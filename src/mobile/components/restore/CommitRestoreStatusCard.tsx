import React from 'react';
import { ActionVerificationTracker } from '../../../components/common/actionWorkflow/ActionVerificationTracker';
import { WorkflowPhase, WorkflowStep, ActionResultSummary } from '../../../components/common/actionWorkflow/types';
import { RestoreMode } from '../CommitRestoreSheet';

export const RESTORE_COMMIT_STEPS: WorkflowStep[] = [
  { id: 'rev', label: 'Validating commit revision & tree', sublabel: 'Checking parent commits & file paths' },
  { id: 'delta', label: 'Generating rollback commit object', sublabel: 'Recording reverse delta in branch history' },
  { id: 'ver', label: 'Verifying repository working tree', sublabel: 'Refreshing commit catalog & local cache' },
];

interface CommitRestoreStatusCardProps {
  phase: WorkflowPhase;
  selectedMode: RestoreMode;
  shortSha: string;
  activeStepIndex: number;
  resultSummary: ActionResultSummary | null;
  errorMsg?: string;
  countdownRemaining: number;
  onDismissNow: () => void;
  onBackToEdit: () => void;
  onRetry?: () => void;
}

export const CommitRestoreStatusCard: React.FC<CommitRestoreStatusCardProps> = ({
  phase,
  activeStepIndex,
  resultSummary,
  errorMsg = '',
  countdownRemaining,
  onDismissNow,
  onBackToEdit,
  onRetry,
}) => {
  if (phase === 'idle') return null;

  return (
    <div className="py-2">
      <ActionVerificationTracker
        phase={phase}
        steps={RESTORE_COMMIT_STEPS}
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
