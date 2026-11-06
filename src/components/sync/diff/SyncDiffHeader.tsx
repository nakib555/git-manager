import React from 'react';
import { FileCode, AlignJustify, Columns, Check, Copy } from 'lucide-react';
import { DiffFileItem } from '../../../mobile/utils/zipSyncEngine';

interface SyncDiffHeaderProps {
  file: DiffFileItem;
  viewMode: 'unified' | 'split';
  isCopied: boolean;
  onSetViewMode: (mode: 'unified' | 'split') => void;
  onCopy: () => void;
}

export const SyncDiffHeader: React.FC<SyncDiffHeaderProps> = ({
  file,
  viewMode,
  isCopied,
  onSetViewMode,
  onCopy,
}) => {
  return (
    <div className="px-4 py-2.5 border-b border-border bg-surface-2/40 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <FileCode size={14} className="text-accent shrink-0" />
        <span className="font-mono text-xs font-semibold text-text-primary truncate" title={file.path}>
          {file.path}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {file.additions > 0 && (
            <span className="inline-flex items-center text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              +{file.additions}
            </span>
          )}
          {file.deletions > 0 && (
            <span className="inline-flex items-center text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
              -{file.deletions}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center bg-surface-2 rounded-lg p-0.5 border border-border text-xs">
          <button
            type="button"
            onClick={() => onSetViewMode('unified')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer ${
              viewMode === 'unified' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
            title="Unified View"
          >
            <AlignJustify size={12} />
            <span className="hidden sm:inline">Unified</span>
          </button>
          <button
            type="button"
            onClick={() => onSetViewMode('split')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer ${
              viewMode === 'split' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
            title="Side-by-Side Split View"
          >
            <Columns size={12} />
            <span className="hidden sm:inline">Split</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="p-1.5 rounded-lg border border-border hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Copy new file content"
        >
          {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
};
