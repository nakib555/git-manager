import React from 'react';
import { Undo2, RotateCcw, Check, Sparkles, History, Terminal, Loader2 } from 'lucide-react';
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
    <div className="space-y-3">
      {/* Option 1: Revert Specific Commit (Delta Inverse) */}
      <div
        onClick={() => !isSubmitting && onSelectMode('revert')}
        role="button"
        tabIndex={0}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
          selectedMode === 'revert'
            ? 'bg-accent/10 border-accent text-text-primary ring-1 ring-accent/30 shadow-xs'
            : 'bg-surface-2/40 border-border/80 text-text-secondary hover:bg-surface-2/70 hover:border-border'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
            selectedMode === 'revert'
              ? 'border-accent bg-accent text-white'
              : 'border-border bg-surface-3'
          }`}
        >
          {isSubmitting && selectedMode === 'revert' ? (
            <Loader2 size={12} className="animate-spin" />
          ) : selectedMode === 'revert' ? (
            <Check size={12} className="stroke-[3]" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
              <Undo2 size={13} className="text-accent" />
              <span>Revert This Commit</span>
            </div>
            {isSubmitting && selectedMode === 'revert' ? (
              <span className="text-[10px] font-bold text-accent bg-accent/20 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                <Loader2 size={10} className="animate-spin" />
                Reverting...
              </span>
            ) : (
              <span className="text-[10px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles size={10} />
                Recommended
              </span>
            )}
          </div>

          <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
            Inverts only the changes from commit <code className="font-mono text-text-primary font-semibold">{shortSha}</code>. Later commits and subsequent features are safely kept.
          </p>

          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-text-tertiary bg-surface-1/90 px-2.5 py-1.5 rounded-xl border border-border">
            <Terminal size={11} className="text-text-tertiary shrink-0" />
            <span className="text-text-secondary">git revert {shortSha}</span>
            <span className="text-text-tertiary ml-auto hidden sm:inline">&rarr; Creates Revert "{firstLineMsg.slice(0, 18)}..."</span>
          </div>
        </div>
      </div>

      {/* Option 2: Full Snapshot Rollback */}
      <div
        onClick={() => !isSubmitting && onSelectMode('snapshot')}
        role="button"
        tabIndex={0}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
          selectedMode === 'snapshot'
            ? 'bg-accent/10 border-accent text-text-primary ring-1 ring-accent/30 shadow-xs'
            : 'bg-surface-2/40 border-border/80 text-text-secondary hover:bg-surface-2/70 hover:border-border'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
            selectedMode === 'snapshot'
              ? 'border-accent bg-accent text-white'
              : 'border-border bg-surface-3'
          }`}
        >
          {isSubmitting && selectedMode === 'snapshot' ? (
            <Loader2 size={12} className="animate-spin" />
          ) : selectedMode === 'snapshot' ? (
            <Check size={12} className="stroke-[3]" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
              <RotateCcw size={13} className="text-accent" />
              <span>Restore Snapshot (Entire Tree)</span>
            </div>
            {isSubmitting && selectedMode === 'snapshot' ? (
              <span className="text-[10px] font-bold text-accent bg-accent/20 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                <Loader2 size={10} className="animate-spin" />
                Restoring...
              </span>
            ) : (
              <span className="text-[10px] font-bold text-text-tertiary bg-surface-3 px-2 py-0.5 rounded-md flex items-center gap-1">
                <History size={10} />
                Full Rollback
              </span>
            )}
          </div>

          <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
            Restores all files across the repository to match commit <code className="font-mono text-text-primary font-semibold">{shortSha}</code>, generating a forward restore commit.
          </p>

          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-text-tertiary bg-surface-1/90 px-2.5 py-1.5 rounded-xl border border-border">
            <Terminal size={11} className="text-text-tertiary shrink-0" />
            <span className="text-text-secondary">git checkout {shortSha} -- .</span>
            <span className="text-text-tertiary ml-auto hidden sm:inline">&rarr; Restore snapshot to {shortSha}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
