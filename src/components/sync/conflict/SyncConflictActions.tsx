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

  if (file.status === 'unchanged') return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="hidden md:flex items-center gap-1 bg-surface-2/80 p-1 rounded-lg border border-border text-[11px] font-medium self-start"
    >
      {isModified && (
        <>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'take_zip')}
            className={`min-h-[28px] px-2.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              currentRes === 'take_zip'
                ? 'bg-accent text-white font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Check size={11} />
            <span>Use ZIP</span>
          </button>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'keep_original')}
            className={`min-h-[28px] px-2.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              currentRes === 'keep_original'
                ? 'bg-surface-1 text-text-primary border border-border font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Keep Repo</span>
          </button>
        </>
      )}
      {isRemoved && (
        <>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'restore')}
            className={`min-h-[28px] px-2.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              currentRes === 'restore'
                ? 'bg-surface-1 text-warning border border-border font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <RotateCcw size={11} />
            <span>Retain</span>
          </button>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'delete')}
            className={`min-h-[28px] px-2.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              currentRes === 'delete'
                ? 'bg-danger text-white font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Trash2 size={11} />
            <span>Delete</span>
          </button>
        </>
      )}
      {isAdded && (
        <>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'take_zip')}
            className={`min-h-[28px] px-2.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              currentRes === 'take_zip'
                ? 'bg-success text-white font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Check size={11} />
            <span>Include</span>
          </button>
          <button
            type="button"
            onClick={() => onSetResolution(file.path, 'keep_original')}
            className={`min-h-[28px] px-2.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              currentRes === 'keep_original'
                ? 'bg-surface-1 text-text-primary border border-border font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Skip</span>
          </button>
        </>
      )}
    </div>
  );
};
