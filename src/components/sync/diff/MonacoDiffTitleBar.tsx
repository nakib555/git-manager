import React from 'react';
import { Columns, AlignJustify, Copy, Check, FileCode, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { DiffFileItem } from '../../../mobile/utils/zipSyncEngine';

interface MonacoDiffTitleBarProps {
  file: DiffFileItem;
  viewMode: 'split' | 'unified';
  onViewModeChange: (mode: 'split' | 'unified') => void;
  onCopy: () => void;
  isCopied: boolean;
  onBack?: () => void;
  backLabel?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const MonacoDiffTitleBar: React.FC<MonacoDiffTitleBarProps> = ({
  file,
  viewMode,
  onViewModeChange,
  onCopy,
  isCopied,
  onBack,
  backLabel = 'Back to Tree',
  isExpanded = false,
  onToggleExpand,
}) => {
  return (
    <div className="h-12 px-3 sm:px-4 border-b border-border bg-surface-2/45 flex items-center justify-between gap-2.5 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to changed files tree"
            className="min-h-[34px] px-2.5 bg-surface-1 hover:bg-surface-2 border border-border text-text-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 btn-tactile whitespace-nowrap"
            title={backLabel}
          >
            <ArrowLeft size={13} />
            <span>{backLabel}</span>
          </button>
        )}
        <FileCode size={15} className="text-accent shrink-0 hidden sm:inline" />
        <span className="font-mono text-xs font-semibold text-text-primary truncate" title={file.path}>
          {file.path}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono tabular-nums">
          {file.additions > 0 && (
            <span className="font-semibold text-addition">+{file.additions}</span>
          )}
          {file.deletions > 0 && (
            <span className="font-semibold text-deletion">-{file.deletions}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center bg-surface-2 p-0.5 rounded-lg border border-border text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('split')}
            className={`min-h-[28px] px-2.5 rounded-md flex items-center gap-1 font-medium transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'split'
                ? 'bg-surface-1 text-text-primary shadow-2xs font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Columns size={12} />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('unified')}
            className={`min-h-[28px] px-2.5 rounded-md flex items-center gap-1 font-medium transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'unified'
                ? 'bg-surface-1 text-text-primary shadow-2xs font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <AlignJustify size={12} />
            <span>Unified</span>
          </button>
        </div>

        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={isExpanded ? 'Exit full diff view' : 'Expand slide-over diff view'}
            title={isExpanded ? 'Dock diff view' : 'Expand slide-over diff view'}
            className="hidden lg:flex min-h-[32px] min-w-[32px] px-2 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors items-center justify-center cursor-pointer btn-tactile"
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        )}

        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy file content"
          className="min-h-[32px] min-w-[32px] px-2 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer btn-tactile"
          title="Copy content"
        >
          {isCopied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
};
