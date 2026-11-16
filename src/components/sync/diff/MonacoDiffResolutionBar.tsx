import React from 'react';
import { Check } from 'lucide-react';
import { DiffFileItem } from '../../../mobile/utils/zipSyncEngine';

interface MonacoDiffResolutionBarProps {
  file: DiffFileItem;
  resolution?: 'take_zip' | 'keep_original' | 'delete' | 'restore';
  onResolve: (action: 'take_zip' | 'keep_original' | 'delete' | 'restore') => void;
}

const STATUS_LABEL: Record<DiffFileItem['status'], string> = {
  modified: 'Conflict Resolution',
  removed: 'Missing in ZIP',
  added: 'New File',
  unchanged: 'Unchanged',
};

export const MonacoDiffResolutionBar: React.FC<MonacoDiffResolutionBarProps> = ({
  file,
  resolution = 'take_zip',
  onResolve,
}) => {
  if (file.status === 'unchanged') return null;

  return (
    <div className="md:hidden p-2.5 bg-surface-2/50 border-t border-border flex items-center justify-between gap-2 shrink-0">
      <div className="min-w-0 pr-1">
        <span className="text-[11px] text-text-secondary block">
          {STATUS_LABEL[file.status]}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {file.status === 'modified' && (
          <>
            <button
              type="button"
              onClick={() => onResolve('take_zip')}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 btn-tactile ${
                resolution === 'take_zip'
                  ? 'bg-accent text-white'
                  : 'bg-surface-1 text-text-secondary border border-border'
              }`}
            >
              <Check size={13} />
              <span>Use ZIP</span>
            </button>
            <button
              type="button"
              onClick={() => onResolve('keep_original')}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 btn-tactile ${
                resolution === 'keep_original'
                  ? 'bg-surface-3 text-text-primary border border-border'
                  : 'bg-surface-1 text-text-secondary border border-border'
              }`}
            >
              <span>Keep Repo</span>
            </button>
          </>
        )}

        {file.status === 'removed' && (
          <>
            <button
              type="button"
              onClick={() => onResolve('restore')}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 btn-tactile ${
                resolution === 'restore'
                  ? 'bg-warning text-white'
                  : 'bg-surface-1 text-text-secondary border border-border'
              }`}
            >
              <span>Retain</span>
            </button>
            <button
              type="button"
              onClick={() => onResolve('delete')}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 btn-tactile ${
                resolution === 'delete'
                  ? 'bg-danger text-white'
                  : 'bg-surface-1 text-text-secondary border border-border'
              }`}
            >
              <span>Delete</span>
            </button>
          </>
        )}

        {file.status === 'added' && (
          <>
            <button
              type="button"
              onClick={() => onResolve('take_zip')}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 btn-tactile ${
                resolution === 'take_zip'
                  ? 'bg-success text-white'
                  : 'bg-surface-1 text-text-secondary border border-border'
              }`}
            >
              <Check size={13} />
              <span>Include</span>
            </button>
            <button
              type="button"
              onClick={() => onResolve('keep_original')}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 btn-tactile ${
                resolution === 'keep_original'
                  ? 'bg-surface-3 text-text-primary border border-border'
                  : 'bg-surface-1 text-text-secondary border border-border'
              }`}
            >
              <span>Skip</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
