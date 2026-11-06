import React from 'react';
import { GitCommit, Clock, User } from 'lucide-react';
import { PRCommit } from '../types';

interface PRDetailCommitsProps {
  commits: PRCommit[];
  isLoading?: boolean;
}

export const PRDetailCommits: React.FC<PRDetailCommitsProps> = ({
  commits,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="py-10 text-center text-xs text-text-muted">
        Loading PR commits...
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-text-muted">
        No commits found for this pull request.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
      {commits.map((c) => (
        <div
          key={c.hash}
          className="p-3 bg-card border border-border rounded-xl flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <GitCommit size={14} />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-text-main block truncate">{c.msg}</span>
              <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                <span className="font-mono text-primary font-bold">{c.hash}</span>
                <span>by {c.author}</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] text-text-muted shrink-0 flex items-center gap-1">
            <Clock size={10} />
            <span>{c.time}</span>
          </span>
        </div>
      ))}
    </div>
  );
};
