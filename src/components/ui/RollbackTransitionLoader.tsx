import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, GitBranch, ArrowDown } from 'lucide-react';

interface RollbackTransitionLoaderProps {
  steps: string[];
  activeStepIndex: number;
  isComplete?: boolean;
}

export const RollbackTransitionLoader: React.FC<RollbackTransitionLoaderProps> = ({
  steps,
  activeStepIndex,
  isComplete = false,
}) => {
  return (
    <div className="p-3 bg-surface-2/60 border border-border/80 rounded-xl space-y-2 text-xs">
      <div className="flex items-center justify-between text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
        <span>Operation Progress</span>
        <span className="font-mono text-accent">
          {Math.min(steps.length, activeStepIndex + 1)} of {steps.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {steps.map((step, idx) => {
          const isDone = idx < activeStepIndex || isComplete;
          const isCurrent = idx === activeStepIndex && !isComplete;

          return (
            <div
              key={idx}
              className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                isCurrent ? 'bg-surface-3 text-text-primary font-semibold' : 'text-text-tertiary'
              }`}
            >
              {isDone ? (
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 size={13} className="animate-spin text-accent shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-border bg-surface-2 shrink-0" />
              )}
              <span className="text-[11px] truncate">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
