import React, { useState } from 'react';
import { GitCommit, Copy, Check, GitBranch } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

interface CommitRestorePreviewCardProps {
  shortSha: string;
  firstLineMsg: string;
  authorName: string;
  commitTime?: string;
  stats?: { additions: number; deletions: number };
  branchName?: string;
}

export const CommitRestorePreviewCard: React.FC<CommitRestorePreviewCardProps> = ({
  shortSha,
  firstLineMsg,
  authorName,
  commitTime,
  stats,
  branchName,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortSha);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-2/60 border border-border/80 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
          Target Commit
        </span>

        {branchName && (
          <div className="flex items-center gap-1 text-[11px] font-mono text-accent">
            <GitBranch size={12} />
            <span>{branchName}</span>
          </div>
        )}
      </div>

      {/* Commit Header Row */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-surface-3 border border-border flex items-center justify-center text-accent shrink-0 mt-0.5">
            <GitCommit size={15} />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-text-primary leading-snug break-words">
              {firstLineMsg || 'Commit revision'}
            </h4>

            {/* Unboxed Metadata Line */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-tertiary mt-1 font-mono">
              <span className="font-sans font-medium text-text-secondary">{authorName}</span>
              {commitTime && (
                <>
                  <span aria-hidden="true" className="opacity-40">&bull;</span>
                  <span className="font-sans">{formatRelativeTime(commitTime)}</span>
                </>
              )}
              {stats && (
                <>
                  <span aria-hidden="true" className="opacity-40">&bull;</span>
                  <span className="text-emerald-500 font-semibold tabular-nums font-mono">+{stats.additions}</span>
                  <span className="text-rose-500 font-semibold tabular-nums font-mono">-{stats.deletions}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Copy SHA Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 font-mono text-[11px] font-bold text-text-primary bg-surface-1 hover:bg-surface-3 px-2 py-1 rounded-lg border border-border transition-all cursor-pointer shrink-0 active:scale-95"
          title="Copy commit SHA"
        >
          <span>{shortSha}</span>
          {copied ? (
            <Check size={11} className="text-emerald-500" />
          ) : (
            <Copy size={11} className="text-text-tertiary" />
          )}
        </button>
      </div>
    </div>
  );
};
