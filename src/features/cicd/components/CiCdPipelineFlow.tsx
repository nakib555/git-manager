import React from 'react';
import { Cpu, Activity, Gauge } from 'lucide-react';
import { useCiCdStatus } from '../hooks/useCiCdStatus';
import { CiCdPipelineMetrics } from './CiCdPipelineMetrics';
import { CiCdStepItem } from './CiCdStepItem';

export const CiCdPipelineFlow: React.FC<{ hash: string }> = ({ hash }) => {
  const { cicd, isReal, isPolling } = useCiCdStatus(hash);
  const shortHash = hash ? hash.substring(0, 7) : 'head';

  if (!isReal || !cicd || !cicd.steps || cicd.steps.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-3 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Cpu size={20} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-text-main">No CI/CD Workflows Reported</h4>
          <p className="text-[11px] text-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
            No active GitHub Actions workflow runs or check suites detected for commit <span className="font-mono text-primary">{shortHash}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-primary" />
            <span className="text-xs font-bold text-text-main tracking-widest uppercase">Pipeline Workflow</span>
            {isPolling && (
              <span className="inline-flex items-center gap-1 text-[8px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-md border border-primary/20">
                <Activity size={8} /> Live Poll
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-md border border-emerald-500/20">
              GitHub Actions Checks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-semibold bg-main px-2 py-0.5 rounded-md border border-border">
              Ref: <span className="font-mono text-primary font-bold">{shortHash}</span>
            </span>
          </div>
        </div>
      </div>

      <CiCdPipelineMetrics cicd={cicd} shortHash={shortHash} />

      <div className="space-y-3">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Gauge size={12} className="text-text-muted" />
          <span>Detailed Pipeline Steps</span>
        </div>

        <div className="space-y-2">
          {cicd.steps.map((step) => (
            <CiCdStepItem key={step.name} step={step} />
          ))}
        </div>
      </div>
    </div>
  );
};
