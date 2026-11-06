import React from 'react';
import { GitCommit } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

interface CommitRestorePreviewCardProps {
  shortSha: string;
  firstLineMsg: string;
  authorName: string;
  commitTime?: string;
  stats?: { additions: number; deletions: number };
}

export const CommitRestorePreviewCard: React.FC<CommitRestorePreviewCardProps> = ({
  shortSha,
  firstLineMsg,
  authorName,
  commitTime,
  stats,
}) => {
  return (
    <div className="p-3.5 bg-surface-2/60 border border-border/80 rounded-2xl space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-surface-3 flex items-center justify-center text-text-secondary shrink-0">
            <GitCommit size={13} />
          </div>
          <span className="font-mono text-xs font-bold text-accent px-1.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 shrink-0">
            {shortSha}
          </span>
          <span className="text-xs font-semibold text-text-primary truncate">
            {firstLineMsg}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-text-tertiary font-mono pt-0.5">
        <span className="text-text-secondary font-sans truncate max-w-[130px]">{authorName}</span>
        {commitTime && (
          <>
            <span className="opacity-40">&bull;</span>
            <span className="font-sans">{formatRelativeTime(commitTime)}</span>
          </>
        )}
        {stats && (
          <>
            <span className="opacity-40">&bull;</span>
            <span className="text-emerald-500 font-semibold">+{stats.additions}</span>
            <span className="text-rose-500 font-semibold">-{stats.deletions}</span>
          </>
        )}
      </div>
    </div>
  );
};
