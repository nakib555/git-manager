import React from 'react';
import { FileCode, Sliders } from 'lucide-react';
import { DiffFileItem } from '../../../mobile/utils/zipSyncEngine';
import { SyncConflictActions } from './SyncConflictActions';

export type ConflictResolution = 'take_zip' | 'keep_original' | 'delete' | 'restore';

interface SyncConflictItemProps {
  file: DiffFileItem;
  isSelected: boolean;
  currentRes: ConflictResolution;
  onSelectFile: (path: string) => void;
  onSetResolution: (path: string, resolution: ConflictResolution) => void;
  onOpenSheet: (file: DiffFileItem) => void;
  onViewDiffMobile?: (file: DiffFileItem) => void;
}

const STATUS_LABEL: Record<DiffFileItem['status'], string> = {
  modified: 'Modified',
  removed: 'Missing in ZIP',
  added: 'New file',
  unchanged: 'Unchanged',
};

const RES_LABEL: Record<ConflictResolution, string> = {
  take_zip: 'Use ZIP',
  keep_original: 'Keep Repo',
  delete: 'Delete',
  restore: 'Retain',
};

export const SyncConflictItem: React.FC<SyncConflictItemProps> = ({
  file,
  isSelected,
  currentRes,
  onSelectFile,
  onSetResolution,
  onOpenSheet,
  onViewDiffMobile,
}) => {
  const isModified = file.status === 'modified';
  const isRemoved = file.status === 'removed';

  return (
    <div
      onClick={() => onSelectFile(file.path)}
      className={`px-3.5 py-3 transition-colors cursor-pointer flex flex-col gap-2.5 ${
        isSelected
          ? 'bg-accent/8 border-l-2 border-l-accent'
          : 'bg-surface-1 hover:bg-surface-2/45 border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5 min-w-0">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isModified
                ? 'bg-accent/12 text-accent'
                : isRemoved
                  ? 'bg-danger/12 text-danger'
                  : 'bg-success/12 text-success'
            }`}
          >
            <FileCode size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-mono text-xs font-semibold text-text-primary truncate block" title={file.path}>
              {file.path}
            </span>
            <div className="flex items-center flex-wrap gap-1.5 mt-0.5 text-[11px] text-text-secondary tabular-nums">
              <span className={isRemoved ? 'text-danger font-medium' : isModified ? 'text-accent font-medium' : 'text-success font-medium'}>
                {STATUS_LABEL[file.status]}
              </span>
              {(file.additions > 0 || file.deletions > 0) && (
                <span aria-hidden="true" className="text-text-tertiary">·</span>
              )}
              {file.additions > 0 && <span className="font-mono text-addition font-medium">+{file.additions}</span>}
              {file.deletions > 0 && <span className="font-mono text-deletion font-medium">-{file.deletions}</span>}
              <span aria-hidden="true" className="text-text-tertiary hidden md:inline">·</span>
              <span className="hidden md:inline text-text-tertiary">{RES_LABEL[currentRes]}</span>
            </div>
          </div>
        </div>
      </div>

      <SyncConflictActions file={file} currentRes={currentRes} onSetResolution={onSetResolution} />

      <div className="md:hidden flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectFile(file.path);
            if (onViewDiffMobile) onViewDiffMobile(file);
          }}
          className="min-h-[40px] flex-1 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-xs font-semibold text-text-primary flex items-center justify-center gap-1.5 cursor-pointer btn-tactile"
        >
          <FileCode size={14} className="text-accent" />
          <span>Inspect Diff</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSheet(file);
          }}
          className="min-h-[40px] flex-1 px-3 py-1.5 bg-accent/12 hover:bg-accent/20 border border-accent/30 rounded-xl text-xs font-semibold text-accent flex items-center justify-center gap-1.5 cursor-pointer btn-tactile"
        >
          <Sliders size={14} />
          <span className="truncate">{RES_LABEL[currentRes]}</span>
        </button>
      </div>
    </div>
  );
};
