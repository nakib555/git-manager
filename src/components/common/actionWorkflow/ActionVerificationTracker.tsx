import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkflowPhase, WorkflowStep, ActionResultSummary } from './types';
import { ActionStepList } from './ActionStepList';
import { ActionSuccessCard } from './ActionSuccessCard';
import { ActionErrorCard } from './ActionErrorCard';

interface ActionVerificationTrackerProps {
  phase: WorkflowPhase;
  steps: WorkflowStep[];
  activeStepIndex: number;
  resultSummary: ActionResultSummary | null;
  errorMsg: string;
  countdownRemaining: number;
  onDismissNow: () => void;
  onBackToEdit: () => void;
  onRetry?: () => void;
}

export const ActionVerificationTracker: React.FC<ActionVerificationTrackerProps> = ({
  phase,
  steps,
  activeStepIndex,
  resultSummary,
  errorMsg,
  countdownRemaining,
  onDismissNow,
  onBackToEdit,
  onRetry,
}) => {
  return (
    <div role="status" aria-live="polite" className="w-full">
      <AnimatePresence mode="wait">
        {phase === 'success' ? (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ActionSuccessCard
              summary={resultSummary}
              countdownRemaining={countdownRemaining}
              onDismissNow={onDismissNow}
            />
          </motion.div>
        ) : phase === 'error' ? (
          <motion.div
            key="error-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ActionErrorCard
              errorMsg={errorMsg}
              onBackToEdit={onBackToEdit}
              onRetry={onRetry}
            />
          </motion.div>
        ) : (
          <motion.div
            key="step-list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 py-1"
          >
            <div className="flex items-center justify-between text-xs text-text-tertiary px-1 pb-1">
              <span>Executing verified operation</span>
              <span className="font-mono text-[11px] tabular-nums">
                Step {Math.min(activeStepIndex + 1, steps.length)} of {steps.length}
              </span>
            </div>
            <ActionStepList
              steps={steps}
              activeStepIndex={activeStepIndex}
              phase={phase}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
