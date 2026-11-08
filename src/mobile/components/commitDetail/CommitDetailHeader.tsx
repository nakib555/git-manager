import React from 'react';
import { GitCommitHorizontal, X } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

interface CommitDetailHeaderProps {
  commit: any;
  onClose: () => void;
}

export const CommitDetailHeader: React.FC<CommitDetailHeaderProps> = ({ commit, onClose }) => {
  const sha = commit?.fullHash || commit?.hash || '';
  const shortSha = commit?.hash ? commit.hash.slice(0, 7) : sha ? sha.slice(0, 7) : '';
  const relativeTime = formatRelativeTime(commit?.timestamp || commit?.date || Date.now());
  const authorName = commit?.author || 'Unknown Author';

  return (
    <div className="px-5 py-4 flex items-center justify-between gap-3 shrink-0 border-b border-border/40">
      <div className="flex items-center gap-3 min-w-0">
        {/* Circular Node Icon */}
        <div className="w-10 h-10 rounded-full bg-[#131f37] border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
          <GitCommitHorizontal size={18} className="stroke-[2.2]" />
        </div>

        {/* Title, Hash Pill & Subtitle */}
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base text-text-primary tracking-tight">
              Commit Detail
            </h3>
            {shortSha && (
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-surface-2 border border-border/80 text-text-secondary font-medium tracking-wide">
                {shortSha}
              </span>
            )}
          </div>
          <div className="text-xs text-text-tertiary mt-0.5 truncate">
            <span>{authorName}</span>
            <span className="mx-1.5 opacity-60">·</span>
            <span>{relativeTime}</span>
          </div>
        </div>
      </div>

      {/* Circular Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close commit details"
        className="w-9 h-9 rounded-full bg-surface-2 hover:bg-surface-3 text-text-tertiary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-border/60"
      >
        <X size={16} />
      </button>
    </div>
  );
};
