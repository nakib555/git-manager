import React from 'react';
import { User, AlertCircle } from 'lucide-react';

interface CommitSheetStagingProps {
  filePath: string;
  isStaged: boolean;
  stats: { additions: number; deletions: number };
  authorName: string;
  authorAvatar?: string;
  onToggleStaged: () => void;
  onSetStaged: (val: boolean) => void;
}

export const CommitSheetStaging: React.FC<CommitSheetStagingProps> = ({
  filePath,
  isStaged,
  stats,
  authorName,
  authorAvatar,
  onToggleStaged,
  onSetStaged,
}) => {
  return (
    <>
      <div className="p-3 bg-surface-2/60 border border-border rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-primary">Staged changes (1 file)</span>
          <button
            type="button"
            onClick={onToggleStaged}
            className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
              isStaged ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-surface-3 border-border text-text-tertiary'
            }`}
          >
            {isStaged ? '✓ Staged' : '+ Stage file'}
          </button>
        </div>

        <div className="flex items-center justify-between px-2.5 py-1.5 bg-surface-1/70 border border-border/70 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2 truncate">
            <input
              type="checkbox"
              id="stage-checkbox"
              checked={isStaged}
              onChange={(e) => onSetStaged(e.target.checked)}
              className="rounded text-accent accent-accent cursor-pointer w-4 h-4"
            />
            <label htmlFor="stage-checkbox" className="truncate text-text-secondary cursor-pointer">
              {filePath}
            </label>
          </div>
          <div className="flex items-center gap-1.5 font-bold tabular-nums shrink-0 pl-2">
            <span className="text-emerald-500">+{stats.additions}</span>
            <span className="text-rose-500">-{stats.deletions}</span>
          </div>
        </div>

        {!isStaged && (
          <p className="text-[11px] text-amber-500 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>File must be staged before committing.</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between px-3 py-2 bg-surface-2/40 border border-border/80 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-6 h-6 rounded-full border border-border object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-text-secondary">
              <User size={12} />
            </div>
          )}
          <span className="text-text-secondary font-medium truncate max-w-[180px]">{authorName}</span>
        </div>
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Author</span>
      </div>
    </>
  );
};
