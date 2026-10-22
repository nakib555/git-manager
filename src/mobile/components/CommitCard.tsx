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
  const shortSha = commit.hash ? commit.hash.substring(0, 7) : '';
  const isHead = isLatest || (commit as any).isHead;
  const isFailing = (commit as any).ciStatus === 'failing';

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
      className="group relative flex items-center justify-between p-3.5 bg-surface-1 border border-border/80 hover:border-accent/50 hover:bg-surface-2/40 rounded-2xl transition-all cursor-pointer shadow-xs select-none active:scale-[0.99]"
    >
      <div className="flex items-start gap-3 min-w-0 pr-2">
        {/* Author avatar or commit glyph with HEAD halo */}
        <div className="relative shrink-0 mt-0.5">
          {commit.avatarUrl ? (
            <img
              src={commit.avatarUrl}
              alt={commit.author}
              className="w-8 h-8 rounded-full border border-border/80 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface-2 border border-border/80 flex items-center justify-center text-text-secondary">
              <GitCommit size={15} />
            </div>
          )}
          {isHead && (
            <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface-1 ring-1 ring-emerald-300" title="HEAD Commit" />
          )}
        </div>

        {/* Commit Message & Metadata */}
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-text-primary leading-snug truncate group-hover:text-accent transition-colors">
            {commit.msg}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary mt-1 font-mono">
            <span className="font-sans font-medium text-text-secondary truncate max-w-[120px]">
              {commit.author}
            </span>
            <span aria-hidden="true" className="opacity-50">&bull;</span>
            <span className="tabular-nums font-sans">{formatRelativeTime(commit.date)}</span>
            {isFailing && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 ml-0.5" title="CI Failed" />
            )}
            {commit.stats && (
              <>
                <span aria-hidden="true" className="opacity-50">&bull;</span>
                <span className="tabular-nums text-emerald-500 font-semibold font-mono">+{commit.stats.additions}</span>
                <span className="tabular-nums text-rose-500 font-semibold font-mono">-{commit.stats.deletions}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Copyable SHA button and chevron */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopyHash?.();
          }}
          className="flex items-center gap-1 font-mono text-[11px] font-semibold text-text-primary bg-surface-2 hover:bg-surface-3 px-2 py-1 rounded-lg border border-border/90 transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Copy SHA"
          aria-label={`Copy SHA ${shortSha}`}
        >
          <span>{shortSha}</span>
          <Copy size={11} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
        </button>

        <ChevronRight size={15} className="text-text-tertiary group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
};

export const MobileCommitCard = CommitCard;
