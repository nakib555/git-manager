import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface ZipSyncStepperProps {
  currentStep: 1 | 2 | 3;
  onSelectStep: (step: 1 | 2 | 3) => void;
  canNavigateToStep2: boolean;
  canNavigateToStep3: boolean;
  isLocked?: boolean;
}

const STEPS: Array<{ id: 1 | 2 | 3; label: string; shortLabel: string }> = [
  { id: 1, label: 'Upload & Align', shortLabel: 'Upload' },
  { id: 2, label: 'Review Diffs', shortLabel: 'Review' },
  { id: 3, label: 'Commit & Push', shortLabel: 'Commit' },
];

export const ZipSyncStepper: React.FC<ZipSyncStepperProps> = ({
  currentStep,
  onSelectStep,
  canNavigateToStep2,
  canNavigateToStep3,
  isLocked = false,
}) => {
  const isStepEnabled = (id: 1 | 2 | 3) => {
    if (isLocked && currentStep !== id) return false;
    if (id === 1) return true;
    if (id === 2) return canNavigateToStep2;
    return canNavigateToStep3;
  };

  return (
    <nav
      aria-label="ZIP sync steps"
      className="px-4 sm:px-6 py-2.5 bg-surface-2/40 border-b border-border shrink-0"
    >
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id && !isLocked;
          const enabled = isStepEnabled(step.id);

          return (
            <React.Fragment key={step.id}>
              <li className="flex-1 min-w-0">
                <button
                  type="button"
                  disabled={!enabled}
                  onClick={() => onSelectStep(step.id)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`relative w-full min-h-[40px] px-2.5 sm:px-3 rounded-xl flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                    enabled ? 'cursor-pointer' : 'opacity-45 cursor-not-allowed'
                  } ${
                    isActive
                      ? 'text-text-primary'
                      : isCompleted
                        ? 'text-text-primary hover:bg-surface-2'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/60'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="zip-sync-active-step"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-xl bg-surface-1 border border-border shadow-2xs"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative z-10 w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-mono tabular-nums shrink-0 transition-colors ${
                      isActive
                        ? 'bg-accent text-white font-bold'
                        : isCompleted
                          ? 'bg-success/15 text-success font-bold'
                          : 'bg-surface-3 text-text-secondary'
                    }`}
                  >
                    {isCompleted ? <Check size={12} strokeWidth={2.75} /> : step.id}
                  </span>
                  <span className="relative z-10 hidden sm:inline truncate">{step.label}</span>
                  <span className="relative z-10 sm:hidden truncate">{step.shortLabel}</span>
                </button>
              </li>

              {index < STEPS.length - 1 && (
                <li aria-hidden="true" className="w-4 sm:w-8 h-px bg-border shrink-0 overflow-hidden rounded-full">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full bg-accent origin-left"
                  />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
