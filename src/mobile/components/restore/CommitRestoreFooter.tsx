import React, { useState, useEffect } from 'react';
import { RotateCcw, Undo2, ArrowRight } from 'lucide-react';
import { RestoreMode } from '../CommitRestoreSheet';
import { ConfirmationCountdownButton } from '../../../components/ui/ConfirmationCountdownButton';
import { RollbackTransitionLoader } from '../../../components/ui/RollbackTransitionLoader';

interface CommitRestoreFooterProps {
  selectedMode: RestoreMode;
  shortSha: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const CommitRestoreFooter: React.FC<CommitRestoreFooterProps> = ({
  selectedMode,
  shortSha,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (isSubmitting) {
      setStepIdx(0);
      const t1 = setTimeout(() => setStepIdx(1), 500);
      const t2 = setTimeout(() => setStepIdx(2), 1000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isSubmitting]);

  const buttonLabel = selectedMode === 'snapshot'
    ? `Restore Files to ${shortSha}`
    : `Revert Commit ${shortSha}`;

  return (
    <div className="p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] border-t border-border bg-surface-1 space-y-3 shrink-0">
      {isSubmitting && (
        <RollbackTransitionLoader
          steps={['Analyzing commit delta...', 'Generating forward patch...', 'Committing to branch...']}
          activeStepIndex={stepIdx}
          isComplete={stepIdx >= 2}
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-1/3 h-11 bg-surface-2 hover:bg-surface-3 text-text-secondary font-bold rounded-2xl text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex-1">
          <ConfirmationCountdownButton
            label={buttonLabel}
            countdownSeconds={2}
            onConfirm={onSubmit}
            disabled={isSubmitting}
            variant="accent"
            icon={selectedMode === 'snapshot' ? <RotateCcw size={14} /> : <Undo2 size={14} />}
          />
        </div>
      </div>
    </div>
  );
};
