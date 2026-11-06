import React from 'react';
import { RotateCcw, Undo2, CheckCircle2 } from 'lucide-react';
import { RestoreMode } from '../CommitRestoreSheet';

interface CommitRestoreOptionCardProps {
  selectedMode: RestoreMode;
  shortSha: string;
  firstLineMsg: string;
  isSubmitting: boolean;
  onSelectMode: (mode: RestoreMode) => void;
}

export const CommitRestoreOptionCard: React.FC<CommitRestoreOptionCardProps> = ({
  selectedMode,
  shortSha,
  firstLineMsg,
  isSubmitting,
  onSelectMode,
}) => {
  return (
    <div className="space-y-2.5">
      <div
        onClick={() => !isSubmitting && onSelectMode('snapshot')}
        role="button"
        tabIndex={0}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
          selectedMode === 'snapshot'
            ? 'bg-accent/10 border-accent text-text-primary shadow-xs'
            : 'bg-surface-2/40 border-border/80 text-text-secondary hover:bg-surface-2'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
          selectedMode === 'snapshot' ? 'border-accent bg-accent text-white' : 'border-border bg-surface-3'
        }`}>
          {selectedMode === 'snapshot' && <CheckCircle2 size={13} className="stroke-[3]" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
            <RotateCcw size={13} className="text-accent" />
            <span>Restore Snapshot (Full Rollback)</span>
          </div>
          <p className="text-[11px] text-text-tertiary mt-1 leading-relaxed">
            Restores the entire repository working tree to the state of commit <strong className="font-mono text-text-primary">{shortSha}</strong> and generates a rollback commit.
          </p>
          <div className="mt-2 text-[10px] font-mono text-text-tertiary bg-surface-1 px-2 py-1 rounded-lg border border-border/70 inline-block">
            Revert to {shortSha}: {firstLineMsg.slice(0, 32)}...
          </div>
        </div>
      </div>

      <div
        onClick={() => !isSubmitting && onSelectMode('revert')}
        role="button"
        tabIndex={0}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
          selectedMode === 'revert'
            ? 'bg-accent/10 border-accent text-text-primary shadow-xs'
            : 'bg-surface-2/40 border-border/80 text-text-secondary hover:bg-surface-2'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
          selectedMode === 'revert' ? 'border-accent bg-accent text-white' : 'border-border bg-surface-3'
        }`}>
          {selectedMode === 'revert' && <CheckCircle2 size={13} className="stroke-[3]" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
            <Undo2 size={13} className="text-accent" />
            <span>Revert this Commit (Delta Inverse)</span>
          </div>
          <p className="text-[11px] text-text-tertiary mt-1 leading-relaxed">
            Reverses only the changes introduced in <strong className="font-mono text-text-primary">{shortSha}</strong> without altering subsequent commits.
          </p>
          <div className="mt-2 text-[10px] font-mono text-text-tertiary bg-surface-1 px-2 py-1 rounded-lg border border-border/70 inline-block">
            git revert {shortSha}
          </div>
        </div>
      </div>
    </div>
  );
};
