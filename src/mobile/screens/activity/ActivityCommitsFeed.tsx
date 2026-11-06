import React from 'react';
import { GitCommit } from 'lucide-react';
import { CommitCard } from '../../components/CommitCard';
import { PaginationControls } from '../../../components/common/PaginationControls';

interface ActivityCommitsFeedProps {
  commits: any[];
  paginatedCommits: any[];
  activityPage: number;
  activityPageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectCommit: (commit: any) => void;
  onCopyHash: (hash: string) => void;
}

export const ActivityCommitsFeed: React.FC<ActivityCommitsFeedProps> = ({
  commits,
  paginatedCommits,
  activityPage,
  activityPageSize,
  onPageChange,
  onPageSizeChange,
  onSelectCommit,
  onCopyHash,
}) => {
  if (commits.length === 0) {
    return (
      <div className="bg-surface-1 border border-border rounded-2xl p-8 text-center flex flex-col items-center justify-center">
        <GitCommit size={32} className="text-text-tertiary mb-2 opacity-50" />
        <span className="text-sm font-semibold text-text-primary mb-1">No commits on active branch</span>
        <span className="text-xs text-text-tertiary">
          Select a repository with commit history or commit changes to track activity here.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {paginatedCommits.map((commit, idx) => (
          <CommitCard
            key={`${commit.hash}-${idx}`}
            commit={{
              hash: commit.hash,
              msg: commit.msg,
              author: commit.author,
              date: commit.date || commit.timestamp,
              avatarUrl: commit.avatarUrl,
              stats: commit.stats,
            }}
            onClick={() => onSelectCommit(commit)}
            onCopyHash={() => onCopyHash(commit.hash)}
            isLatest={idx === 0 && activityPage === 1}
          />
        ))}
      </div>

      <div className="pt-3 pb-6 border-t border-border/80">
        <PaginationControls
          currentPage={activityPage}
          totalItems={commits.length}
          pageSize={activityPageSize}
          pageSizeOptions={[10, 25, 50, -1]}
          onPageSizeChange={onPageSizeChange}
          onPageChange={onPageChange}
          compact={false}
          itemName="commits"
        />
      </div>
    </div>
  );
};
