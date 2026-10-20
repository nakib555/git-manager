import React from 'react';
import { GitCommit, Copy, Clock, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

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
      className="group relative flex items-start gap-3 p-4 bg-surface-1 border border-border hover:border-accent/40 hover:bg-surface-2 rounded-2xl transition-all cursor-pointer select-none min-h-[64px]"
    >
      {/* Author avatar or commit glyph (32px = 4x8pt) */}
      <div className="relative shrink-0 mt-0.5">
        {commit.avatarUrl ? (
          <img
            src={commit.avatarUrl}
            alt={commit.author}
            className="w-8 h-8 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-secondary">
            <GitCommit size={15} />
          </div>
        )}
        {isLatest && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-surface-1" />
        )}
      </div>

      {/* Main Commit Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary leading-relaxed line-clamp-2 group-hover:text-accent transition-colors">
          {commit.msg}
        </p>

        {/* Unboxed metadata with typographic separator on 8pt rhythm */}
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-text-tertiary flex-wrap">
          <span className="font-medium text-text-secondary truncate max-w-[130px]">
            {commit.author}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 font-mono tabular-nums">
            <Clock size={12} />
            <span>{formatRelativeTime(commit.date)}</span>
          </span>
          {commit.stats && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[11px] text-[#3FB950] font-bold">+{commit.stats.additions}</span>
              <span className="font-mono tabular-nums text-[11px] text-[#F85149] font-bold">-{commit.stats.deletions}</span>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Copyable SHA button and chevron */}
      <div className="flex items-center gap-2 shrink-0 self-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopyHash?.();
          }}
          className="h-8 px-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs font-mono tabular-nums text-accent flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Copy SHA"
          aria-label={`Copy SHA ${shortSha}`}
        >
          <span>{shortSha}</span>
          <Copy size={12} className="opacity-70 group-hover:opacity-100" />
        </button>

        <ChevronRight size={16} className="text-text-tertiary group-hover:text-text-secondary transition-colors" />
      </div>
    </div>
  );
};

export const MobileCommitCard = CommitCard;
