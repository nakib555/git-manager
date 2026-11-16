import React from 'react';
import { Layers, ChevronRight, Folder } from 'lucide-react';
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
    <div className="flex flex-col gap-3 min-w-0 flex-1">
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center flex-wrap gap-2">
          <Layers size={15} className="text-accent shrink-0" />
          <span className="text-xs font-bold text-text-primary">
            Root Folder Alignment
          </span>
          {activeRoot === suggestedRoot && suggestedRoot !== '' && (
            <>
              <span className="text-text-tertiary" aria-hidden="true">·</span>
              <span className="text-xs font-medium text-success">
                Auto-detected match
              </span>
            </>
          )}
        </div>

        <nav aria-label="Root Breadcrumbs" className="flex items-center flex-wrap gap-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => onSelectRoot('')}
            className={`min-h-[32px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeRoot === ''
                ? 'bg-accent text-white font-semibold'
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
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer truncate max-w-[260px] ${
                    isCurrent
                      ? 'bg-accent text-white font-semibold'
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
          <span className="text-xs font-medium text-text-secondary">
            Detected Project Roots
          </span>
          <div className="flex items-center flex-wrap gap-2">
            {candidates.map((cand) => {
              const isActive = activeRoot === cand.path;
              return (
                <button
                  key={cand.path}
                  type="button"
                  onClick={() => onSelectRoot(cand.path)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer border btn-tactile ${
                    isActive
                      ? 'bg-accent/15 text-text-primary border-accent font-semibold'
                      : 'bg-surface-2/60 hover:bg-surface-2 border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Folder size={13} className={isActive ? 'text-accent' : 'text-text-tertiary'} />
                  <span className="truncate max-w-[260px]">{cand.displayLabel}</span>
                  {cand.matchedLandmarks.length > 0 && (
                    <span className="text-[11px] font-sans text-text-tertiary tabular-nums">
                      · {cand.matchedLandmarks.slice(0, 2).join(', ')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
