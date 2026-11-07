import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { WorkflowStep, WorkflowPhase } from './types';

interface ActionStepListProps {
  steps: WorkflowStep[];
  activeStepIndex: number;
  phase: WorkflowPhase;
}

export const ActionStepList: React.FC<ActionStepListProps> = ({
  steps,
  activeStepIndex,
  phase,
}) => {
  return (
    <div className="space-y-3 py-2">
      {steps.map((step, idx) => {
        const isCompleted = phase === 'success' || idx < activeStepIndex;
        const isActive = phase !== 'success' && phase !== 'error' && idx === activeStepIndex;
        const isPending = !isCompleted && !isActive;

        return (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
              isActive
                ? 'bg-accent/10 border-accent/30 text-text-primary shadow-xs'
                : isCompleted
                ? 'bg-surface-2/60 border-border/80 text-text-secondary'
                : 'bg-surface-1/40 border-border/40 text-text-tertiary opacity-65'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isCompleted ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Check size={12} strokeWidth={2.5} />
                </div>
              ) : isActive ? (
                <div className="w-5 h-5 rounded-full bg-accent/20 text-accent border border-accent/40 flex items-center justify-center">
                  <Loader2 size={12} className="animate-spin" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[10px] font-mono text-text-tertiary">
                  {idx + 1}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold ${isActive ? 'text-accent' : isCompleted ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {step.label}
                </span>
                {isActive && (
                  <span className="text-[10px] font-mono text-accent animate-pulse font-medium">
                    in progress...
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[10px] font-mono text-emerald-400 font-medium">
                    verified
                  </span>
                )}
              </div>
              {step.sublabel && (
                <p className="text-[11px] text-text-tertiary mt-0.5 leading-snug">
                  {step.sublabel}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
