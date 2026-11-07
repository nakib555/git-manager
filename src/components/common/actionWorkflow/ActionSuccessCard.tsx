import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { ActionResultSummary } from './types';

interface ActionSuccessCardProps {
  summary: ActionResultSummary | null;
  countdownRemaining: number;
  onDismissNow: () => void;
}

export const ActionSuccessCard: React.FC<ActionSuccessCardProps> = ({
  summary,
  countdownRemaining,
  onDismissNow,
}) => {
  return (
    <div className="py-4 space-y-4">
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <CheckCircle2 size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary truncate">
              {summary?.title || 'Action Completed'}
            </h3>
            <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Verified
            </span>
          </div>

          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            {summary?.subtitle || 'Repository state synchronized and verified successfully.'}
          </p>

          {summary?.metaItems && summary.metaItems.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-tertiary">
              {summary.metaItems.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <div className="flex items-center gap-1">
                    <span className="text-text-muted">{item.label}:</span>
                    <span className="font-mono text-text-primary font-medium">{item.value}</span>
                  </div>
                  {idx < summary.metaItems!.length - 1 && (
                    <span aria-hidden="true" className="opacity-50">·</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-text-tertiary flex items-center gap-1.5">
          <span>Auto-closing in</span>
          <span className="font-mono font-bold text-accent tabular-nums bg-surface-2 px-1.5 py-0.5 rounded text-[11px] border border-border">
            {countdownRemaining}s
          </span>
        </span>

        <button
          type="button"
          onClick={onDismissNow}
          className="h-9 px-4 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-border"
        >
          <span>Done</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
