import React from 'react';
import { Upload, Sliders, GitCommit } from 'lucide-react';

interface ZipSyncStepperProps {
  currentStep: 1 | 2 | 3;
  onSelectStep: (step: 1 | 2 | 3) => void;
  canNavigateToStep2: boolean;
  canNavigateToStep3: boolean;
}

export const ZipSyncStepper: React.FC<ZipSyncStepperProps> = ({
  currentStep,
  onSelectStep,
  canNavigateToStep2,
  canNavigateToStep3,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-main border-b border-border text-xs">
      <button
        type="button"
        onClick={() => onSelectStep(1)}
        className={`flex items-center gap-2 cursor-pointer font-bold ${
          currentStep === 1 ? 'text-primary' : 'text-text-muted hover:text-text-main'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono ${
            currentStep === 1
              ? 'bg-primary text-white shadow-xs'
              : 'bg-hover text-text-muted'
          }`}
        >
          1
        </div>
        <span>Upload & Align</span>
      </button>

      <div className="w-8 h-px bg-border" />

      <button
        type="button"
        disabled={!canNavigateToStep2}
        onClick={() => onSelectStep(2)}
        className={`flex items-center gap-2 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
          currentStep === 2 ? 'text-primary' : 'text-text-muted hover:text-text-main'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono ${
            currentStep === 2
              ? 'bg-primary text-white shadow-xs'
              : 'bg-hover text-text-muted'
          }`}
        >
          2
        </div>
        <span>Review Diffs</span>
      </button>

      <div className="w-8 h-px bg-border" />

      <button
        type="button"
        disabled={!canNavigateToStep3}
        onClick={() => onSelectStep(3)}
        className={`flex items-center gap-2 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
          currentStep === 3 ? 'text-primary' : 'text-text-muted hover:text-text-main'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono ${
            currentStep === 3
              ? 'bg-primary text-white shadow-xs'
              : 'bg-hover text-text-muted'
          }`}
        >
          3
        </div>
        <span>Commit & Push</span>
      </button>
    </div>
  );
};
