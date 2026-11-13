import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CommitItem } from '../../../components/commit/CommitItem';
import { EmptyState } from '../../../mobile/components/EmptyState';
import { InlineErrorCard } from '../../../mobile/components/InlineErrorCard';
import { CommitCardSkeleton } from '../../../mobile/components/skeleton/BaseSkeleton';
import { GitCommit } from 'lucide-react';

interface CommitListVirtualScrollerProps {
  commits: any[];
  isLoading: boolean;
  isError: boolean;
  selectedCommitHash?: string;
  onSelectCommit?: (commit: any) => void;
  onActionClick?: (commit: any, e: React.MouseEvent) => void;
  isDesktop?: boolean;
}

export const CommitListVirtualScroller: React.FC<CommitListVirtualScrollerProps> = ({
  commits,
  isLoading,
  isError,
  selectedCommitHash,
  onSelectCommit,
  onActionClick,
  isDesktop,
}) => {
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: commits.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  if (isLoading && commits.length === 0) {
    return (
      <div className="flex-1 p-3 space-y-2.5 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <CommitCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError && commits.length === 0) {
    return (
      <div className="p-4">
        <InlineErrorCard title="Failed to load commits" message="Please verify connection or token permissions." />
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState icon={GitCommit} title="No commits found" description="Try adjusting search parameters or branch filter." />
      </div>
    );
  }

  return (
    <div ref={scrollElementRef} className="flex-1 overflow-y-auto no-scrollbar relative min-h-0 pr-1">
      <div
        style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const commit = commits[virtualRow.index];
          if (!commit) return null;
          const isSelected = selectedCommitHash === commit.hash || selectedCommitHash === commit.fullHash;

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <CommitItem
                commit={commit}
                isSelected={isSelected}
                isLatest={virtualRow.index === 0}
                onSelect={() => onSelectCommit?.(commit)}
                onActionClick={(e: any) => onActionClick?.(commit, e)}
                isDesktop={isDesktop}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
