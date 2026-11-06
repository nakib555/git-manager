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
      className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isSelected ? 'bg-surface-2/90 border-accent/50 shadow-xs' : 'bg-surface-1 hover:bg-surface-2/50 border-border/70'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isModified ? 'bg-accent/15 text-accent' : isRemoved ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
          }`}
        >
          <FileCode size={15} />
        </div>
        <div className="min-w-0">
          <span className="font-mono text-xs font-bold text-text-primary truncate block" title={file.path}>
            {file.path}
          </span>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-tertiary font-mono">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              {isModified ? 'Overlap Conflict' : isRemoved ? 'Missing in ZIP' : 'New File'}
            </span>
            {file.additions > 0 && <span className="text-emerald-400 font-semibold">+{file.additions}</span>}
            {file.deletions > 0 && <span className="text-rose-400 font-semibold">-{file.deletions}</span>}
          </div>
        </div>
      </div>

      <SyncConflictActions file={file} currentRes={currentRes} onSetResolution={onSetResolution} />

      <div className="sm:hidden flex items-center gap-2 pt-2 border-t border-border/40">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectFile(file.path);
            if (onViewDiffMobile) onViewDiffMobile(file);
          }}
          className="min-h-[44px] flex-1 px-3 py-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-xs font-bold text-sky-400 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <FileCode size={14} />
          <span>Inspect Diff</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSheet(file);
          }}
          className="min-h-[44px] flex-1 px-3 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-xl text-xs font-bold text-accent flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Sliders size={14} />
          <span className="truncate">Action ({currentRes.replace('_', ' ')})</span>
        </button>
      </div>
    </div>
  );
};
