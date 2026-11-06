import React from 'react';
import { Layers, ChevronRight, Folder, Sparkles } from 'lucide-react';
import { RootCandidate } from '../../../mobile/utils/zipAutoDetect';

interface VisualRootBreadcrumbsProps {
  activeRoot: string;
  suggestedRoot: string;
  breadcrumbSegments: string[];
  candidates: RootCandidate[];
  onSelectRoot: (rootPath: string) => void;
}

export const VisualRootBreadcrumbs: React.FC<VisualRootBreadcrumbsProps> = ({
  activeRoot,
  suggestedRoot,
  breadcrumbSegments,
  candidates,
  onSelectRoot,
}) => {
  return (
    <>
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-accent shrink-0" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            ZIP Root Alignment:
          </span>
          {activeRoot === suggestedRoot && suggestedRoot !== '' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              <Sparkles size={10} />
              <span>Auto-Detected Match</span>
            </span>
          )}
        </div>

        <nav aria-label="Root Breadcrumbs" className="flex items-center flex-wrap gap-1.5 text-xs font-mono mt-0.5">
          <button
            type="button"
            onClick={() => onSelectRoot('')}
            className={`min-h-[32px] px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              activeRoot === ''
                ? 'bg-accent text-white font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
            }`}
          >
            / (archive root)
          </button>

          {breadcrumbSegments.map((segment, idx) => {
            const currentSubPath = breadcrumbSegments.slice(0, idx + 1).join('/') + '/';
            const isCurrent = activeRoot === currentSubPath;
            return (
              <React.Fragment key={currentSubPath}>
                <ChevronRight size={12} className="text-text-tertiary shrink-0" />
                <button
                  type="button"
                  onClick={() => onSelectRoot(currentSubPath)}
                  className={`min-h-[32px] px-2 py-1 rounded-lg transition-colors cursor-pointer truncate max-w-[160px] ${
                    isCurrent
                      ? 'bg-accent text-white font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  {segment}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {candidates.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
            Suggested Candidate Roots:
          </span>
          <div className="flex items-center flex-wrap gap-2">
            {candidates.map((cand) => {
              const isActive = activeRoot === cand.path;
              return (
                <button
                  key={cand.path}
                  type="button"
                  onClick={() => onSelectRoot(cand.path)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border active:scale-95 ${
                    isActive
                      ? 'bg-accent text-white border-accent font-bold shadow-xs'
                      : 'bg-surface-2/80 hover:bg-surface-3 border-border text-text-secondary hover:text-text-primary font-medium'
                  }`}
                >
                  <Folder size={14} className={isActive ? 'text-white' : 'text-amber-400'} />
                  <span className="truncate max-w-[180px]">{cand.displayLabel}</span>
                  {cand.matchedLandmarks.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-sans ${isActive ? 'bg-white/20 text-white' : 'bg-surface-1 text-text-tertiary'}`}>
                      {cand.matchedLandmarks.slice(0, 2).join(', ')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
