import React from 'react';
import { GitCommit, Copy, Clock, ChevronRight } from 'lucide-react';

interface MobileCommitCardProps {
  commit: {
    hash: string;
    msg: string;
    author: string;
    date: string;
    avatarUrl?: string;
    stats?: { additions: number; deletions: number };
  };
  onClick: () => void;
  onCopyHash?: (e: React.MouseEvent) => void;
  isLatest?: boolean;
}

export const MobileCommitCard: React.FC<MobileCommitCardProps> = ({
  commit,
  onClick,
  onCopyHash,
  isLatest = false,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="relative flex gap-3 p-3.5 rounded-xl bg-surface-1 border border-border hover:border-accent/30 hover:bg-surface-2 transition-all cursor-pointer select-none active:scale-[0.99] group"
    >
      {/* Left Avatar / Indicator */}
      <div className="shrink-0 pt-0.5">
        {commit.avatarUrl ? (
          <img
            src={commit.avatarUrl}
            alt={commit.author}
            className="w-8 h-8 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-accent">
            <GitCommit size={15} />
          </div>
        )}
      </div>

      {/* Middle Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-text-primary truncate">
            {commit.author}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-tertiary shrink-0">
            <Clock size={11} />
            <span>{commit.date}</span>
          </div>
        </div>

        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-2 font-medium">
          {commit.msg}
        </p>

        {/* Bottom row: SHA badge & diff stats */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span
              onClick={(e) => {
                if (onCopyHash) {
                  e.stopPropagation();
                  onCopyHash(e);
                }
              }}
              title="Click to copy SHA"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 border border-border text-[11px] font-mono text-accent font-semibold hover:border-accent/40 transition-colors"
            >
              <span>{commit.hash.substring(0, 7)}</span>
              <Copy size={10} className="text-text-tertiary hover:text-accent" />
            </span>

            {isLatest && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/20">
                HEAD
              </span>
            )}
          </div>

          {commit.stats && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium">
              <span className="text-success">+{commit.stats.additions}</span>
              <span className="text-danger">-{commit.stats.deletions}</span>
            </div>
          )}

          <ChevronRight size={14} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
};
