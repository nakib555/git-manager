import React from 'react';
import { Cpu, Activity, Gauge } from 'lucide-react';
import { useCiCdStatus } from '../hooks/useCiCdStatus';
import { CiCdPipelineMetrics } from './CiCdPipelineMetrics';
import { CiCdStepItem } from './CiCdStepItem';

export const CiCdPipelineFlow: React.FC<{ hash: string; inline?: boolean }> = ({ hash, inline = false }) => {
  const { cicd, isReal, isPolling } = useCiCdStatus(hash);
  const shortHash = hash ? hash.substring(0, 7) : 'head';

  if (!isReal || !cicd || !cicd.steps || cicd.steps.length === 0) {
    if (inline) {
      return (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-border text-xs">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
            <Cpu size={14} className="text-text-tertiary shrink-0" />
            <span className="font-medium text-text-secondary">CI/CD Workflows</span>
            <span className="text-border" aria-hidden="true">·</span>
            <span className="text-text-muted">
              No check runs reported for <span className="font-mono text-text-primary">{shortHash}</span>
            </span>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-card border border-border text-left">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Cpu size={16} />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-text-main leading-tight">No CI/CD Workflows Reported</h4>
          <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
            No GitHub Actions runs detected for <span className="font-mono text-primary">{shortHash}</span>.
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
