import React from 'react';
import { Check, RotateCcw, Trash2 } from 'lucide-react';
import { DiffFileItem } from '../../../mobile/utils/zipSyncEngine';
import { ConflictResolution } from './SyncConflictItem';

interface SyncConflictActionsProps {
  file: DiffFileItem;
  currentRes: ConflictResolution;
  onSetResolution: (path: string, resolution: ConflictResolution) => void;
}

export const SyncConflictActions: React.FC<SyncConflictActionsProps> = ({
  file,
  currentRes,
  onSetResolution,
}) => {
  const isModified = file.status === 'modified';
  const isRemoved = file.status === 'removed';
  const isAdded = file.status === 'added';

  return (
    <div onClick={(e) => e.stopPropagation()} className="hidden sm:flex items-center bg-surface-2 p-1 rounded-xl border border-border text-xs font-semibold shrink-0">
      {isModified && (
        <>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'take_zip')}
            className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRes === 'take_zip' ? 'bg-accent text-white shadow-xs font-bold' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Check size={12} />
            <span>Take ZIP</span>
          </button>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'keep_original')}
            className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRes === 'keep_original' ? 'bg-surface-3 text-text-primary shadow-xs font-bold' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Keep Original</span>
          </button>
        </>
      )}
      {isRemoved && (
        <>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'restore')}
            className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRes === 'restore' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <RotateCcw size={12} />
            <span>Restore / Retain</span>
          </button>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'delete')}
            className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRes === 'delete' ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Trash2 size={12} />
            <span>Delete in Git</span>
          </button>
        </>
      )}
      {isAdded && (
        <>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'take_zip')}
            className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRes === 'take_zip' ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Check size={12} />
            <span>Include</span>
          </button>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'keep_original')}
            className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRes === 'keep_original' ? 'bg-surface-3 text-text-primary font-bold' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Skip</span>
          </button>
        </>
      )}
    </div>
  );
};
