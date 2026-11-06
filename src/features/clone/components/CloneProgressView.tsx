import React from 'react';
import { RefreshCw, Activity, Terminal } from 'lucide-react';
import { CloneProgressInfo } from '../types';

interface CloneProgressViewProps {
  progressInfo: CloneProgressInfo;
  onCancel?: () => void;
}

export const CloneProgressView: React.FC<CloneProgressViewProps> = ({
  progressInfo,
  onCancel,
}) => {
  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
          <RefreshCw size={22} className="animate-spin text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm text-text-main truncate">Cloning Repository</h3>
          <p className="text-xs text-text-muted mt-0.5 truncate">{progressInfo.activity}</p>
        </div>
        <span className="font-mono text-base font-extrabold text-primary tabular-nums shrink-0">
          {progressInfo.pct}%
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-hover/40 rounded-full overflow-hidden border border-border/80">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressInfo.pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
          <span>Speed: {progressInfo.speed}</span>
          <span>ETA: {progressInfo.timeRemaining}</span>
        </div>
      </div>

      <div className="bg-main border border-border rounded-xl p-3.5 font-mono text-[11px] space-y-1.5">
        <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase font-bold tracking-wider pb-1 border-b border-border/60">
          <Terminal size={12} className="text-primary" />
          <span>Git Process Terminal</span>
        </div>
        <div className="text-text-muted">
          remote: Enumerating objects: <span className="text-text-main font-bold">{progressInfo.receivedObjects.total}</span>, done.
        </div>
        <div className="text-text-muted">
          remote: Counting objects: 100% ({progressInfo.receivedObjects.total}/{progressInfo.receivedObjects.total}), done.
        </div>
        <div className="text-text-muted">
          Receiving objects: {progressInfo.pct}% ({progressInfo.receivedObjects.current}/{progressInfo.receivedObjects.total})
        </div>
        {progressInfo.resolvingDeltas && (
          <div className="text-emerald-400 font-bold">
            Resolving deltas: 100% (done).
          </div>
        )}
      </div>

      {onCancel && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-text-muted hover:text-text-main px-3 py-1.5 rounded-lg border border-border hover:bg-hover cursor-pointer"
          >
            Cancel Clone
          </button>
        </div>
      )}
    </div>
  );
};
