import React, { useState } from 'react';
import { Check, X, Clock, RefreshCw, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { CiCdStep } from '../types';

interface CiCdStepItemProps {
  step: CiCdStep;
}

export const CiCdStepItem: React.FC<CiCdStepItemProps> = ({ step }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-hover/20 transition-colors select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          {step.status === 'success' && <Check size={14} className="text-emerald-500 shrink-0 stroke-[3]" />}
          {step.status === 'failed' && <X size={14} className="text-rose-500 shrink-0 stroke-[3]" />}
          {step.status === 'running' && <RefreshCw size={14} className="text-sky-500 animate-spin shrink-0 stroke-[2.5]" />}
          {step.status === 'pending' && <Clock size={14} className="text-text-muted/60 shrink-0" />}

          <div className="min-w-0">
            <span className="text-xs font-bold text-text-main block truncate">{step.name}</span>
            <span className="text-[9px] text-text-muted block mt-0.5">
              Duration: {step.duration}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {step.externalUrl && (
            <a
              href={step.externalUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-text-muted hover:text-primary transition-colors cursor-pointer"
            >
              <ExternalLink size={12} />
            </a>
          )}
          {isExpanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 bg-main border-t border-border font-mono text-[10px] text-text-muted space-y-1 max-h-48 overflow-y-auto">
          {step.log.split('\n').map((line, lIdx) => (
            <div key={lIdx} className="break-words">{line}</div>
          ))}
        </div>
      )}
    </div>
  );
};
