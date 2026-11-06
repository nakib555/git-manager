import React from 'react';
import { ShieldCheck, FileCode, Server } from 'lucide-react';
import { CiCdState } from '../types';

interface CiCdPipelineMetricsProps {
  cicd: CiCdState;
  shortHash: string;
}

export const CiCdPipelineMetrics: React.FC<CiCdPipelineMetricsProps> = ({
  cicd,
  shortHash,
}) => {
  const passedCount = cicd.steps.filter((s) => s.status === 'success').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-main/40 border border-border rounded-xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <ShieldCheck size={16} />
        </div>
        <div className="min-w-0">
          <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">Workflow Suite</span>
          <span className="text-xs font-extrabold text-text-main block mt-0.5">
            {passedCount} of {cicd.steps.length} Passed
          </span>
          <span className="text-[8px] text-emerald-500 font-semibold">{cicd.label} Overall</span>
        </div>
      </div>

      <div className="bg-main/40 border border-border rounded-xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <FileCode size={16} />
        </div>
        <div className="min-w-0">
          <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">Total Duration</span>
          <span className="text-xs font-extrabold text-text-main block mt-0.5">{cicd.duration}</span>
          <span className="text-[8px] text-text-muted font-semibold">Execution elapsed</span>
        </div>
      </div>

      <div className="bg-main/40 border border-border rounded-xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <Server size={16} />
        </div>
        <div className="min-w-0">
          <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">Check Runner</span>
          <span className="text-xs font-extrabold text-text-main block mt-0.5">GitHub Actions Host</span>
          <span className="text-[8px] text-text-muted font-semibold">Ref: {shortHash}</span>
        </div>
      </div>
    </div>
  );
};
