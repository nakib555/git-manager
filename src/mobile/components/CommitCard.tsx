import React from 'react';
import { GitCommit, Copy, Clock, ChevronRight } from 'lucide-react';
import { formatRelativeTime, formatFullDateTime, formatShortDate } from '../utils/formatters';

export interface CommitCardProps {
  commit: {
    hash: string;
    msg: string;
    author: string;
    date: string;
    avatarUrl?: string;
    stats?: { additions: number; deletions: number };
  };
  onClick?: () => void;
  onCopyHash?: () => void;
  isLatest?: boolean;
}

export const CommitCard: React.FC<CommitCardProps> = ({
  commit,
  onClick,
  onCopyHash,
  isLatest = false,
}) => {
  const shortSha = commit.hash.substring(0, 7);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="group relative flex items-start gap-3 p-3.5 bg-surface-1 border border-border hover:border-accent/40 hover:bg-surface-2 rounded-xl transition-all cursor-pointer select-none"
    >
      {/* Author avatar or commit glyph */}
      <div className="relative shrink-0 mt-0.5">
        {commit.avatarUrl ? (
          <img
            src={commit.avatarUrl}
            alt={commit.author}
            className="w-7 h-7 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-secondary">
            <GitCommit size={14} />
          </div>
        )}
        {isLatest && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface-1" />
        )}
      </div>

      {/* Main Commit Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {commit.msg}
        </p>

        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-text-tertiary">
          <span className="font-medium text-text-secondary truncate max-w-[120px]">
            {commit.author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-mono">
            <Clock size={11} />
            <span>{formatRelativeTime(commit.date)}</span>
          </span>
        </div>
      </div>

      {/* Right Column: Copyable SHA pill */}
      <div className="flex items-center gap-1.5 shrink-0 self-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopyHash?.();
          }}
          className="h-6 px-2 rounded-md bg-surface-2 hover:bg-surface-3 border border-border text-[10px] font-mono text-accent flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          title="Copy SHA"
        >
          <span>{shortSha}</span>
          <Copy size={10} className="opacity-70 group-hover:opacity-100" />
        </button>

        <ChevronRight size={14} className="text-text-tertiary group-hover:text-text-secondary transition-colors" />
      </div>
    </div>
  );
};

// Aliases
export const MobileCommitCard = CommitCard;
