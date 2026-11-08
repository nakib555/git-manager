import React, { useState, useEffect } from 'react';
import { useCommits, CommitFilter, DatePreset } from '../../hooks/useCommits';
import { useAppContext } from '../../AppContext';
import { GitGraph } from './GitGraph';
import { PaginationControls } from '../common/PaginationControls';
import { CommitListHeader } from '../../features/commit/components/CommitListHeader';
import { CommitListFilterPanel } from '../../features/commit/components/CommitListFilterPanel';
import { CommitListVirtualScroller } from '../../features/commit/components/CommitListVirtualScroller';

export const CommitList: React.FC<any> = ({
  isDesktop,
  onSelectCommit,
  onActionClick,
  selectedCommitHash,
}) => {
  const { activeCommits } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'split'>(isDesktop ? 'split' : 'list');
  const [filters, setFilters] = useState<CommitFilter>({
    query: '', branch: '', author: '', since: '', until: '', datePreset: 'all', sortDirection: 'desc', page: 1, pageSize: 10,
  });
  const [searchInput, setSearchInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, query: searchInput, author: authorInput, branch: branchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, authorInput, branchInput]);

  const { data, isFetching, isLoading, isError, refetch } = useCommits(filters);
  const commits = data?.items || [];
  const totalCount = data?.totalCount ?? commits.length;
  const totalPages = data?.totalPages || 1;

  const activeFilterCount = (filters.query ? 1 : 0) + (filters.author ? 1 : 0) + (filters.branch ? 1 : 0) + (filters.since || filters.until ? 1 : 0);

  const handleClearAll = () => {
    setSearchInput(''); setAuthorInput(''); setBranchInput('');
    setFilters({ query: '', branch: '', author: '', since: '', until: '', datePreset: 'all', sortDirection: 'desc', page: 1, pageSize: 10 });
  };

  const handleApplyPreset = (preset: DatePreset) => {
    const now = new Date();
    const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayStr = toYMD(now);
    if (preset === 'today') setFilters(p => ({ ...p, since: todayStr, until: todayStr, datePreset: 'today', page: 1 }));
    else if (preset === '7d') {
      const past = new Date(now); past.setDate(past.getDate() - 7);
      setFilters(p => ({ ...p, since: toYMD(past), until: todayStr, datePreset: '7d', page: 1 }));
    } else if (preset === '30d') {
      const past = new Date(now); past.setDate(past.getDate() - 30);
      setFilters(p => ({ ...p, since: toYMD(past), until: todayStr, datePreset: '30d', page: 1 }));
    } else {
      setFilters(p => ({ ...p, since: '', until: '', datePreset: 'all', page: 1 }));
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-3 min-h-0 overflow-hidden">
      <CommitListHeader
        searchInput={searchInput} setSearchInput={setSearchInput}
        showFilters={showFilters} setShowFilters={setShowFilters}
        activeFilterCount={activeFilterCount} viewMode={viewMode} setViewMode={setViewMode}
        sortDirection={filters.sortDirection || 'desc'}
        onSetSortDirection={(dir) => setFilters(prev => ({ ...prev, sortDirection: dir, page: 1 }))}
        onToggleSortDirection={() => setFilters(prev => ({ ...prev, sortDirection: prev.sortDirection === 'desc' ? 'asc' : 'desc', page: 1 }))}
        isDesktop={isDesktop} isFetching={isFetching} onRefresh={() => refetch()}
      />

      <CommitListFilterPanel
        showFilters={showFilters} filters={filters} setFilters={setFilters}
        authorInput={authorInput} setAuthorInput={setAuthorInput}
        branchInput={branchInput} setBranchInput={setBranchInput}
        onClearFilters={handleClearAll} onApplyPreset={handleApplyPreset}
      />

      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CommitListVirtualScroller
              commits={commits} isLoading={isLoading} isError={isError}
              selectedCommitHash={selectedCommitHash} onSelectCommit={onSelectCommit}
              onActionClick={onActionClick} isDesktop={isDesktop}
            />
          </div>
        )}
        {(viewMode === 'graph' || viewMode === 'split') && (
          <div className="flex-1 min-h-0 overflow-hidden bg-card border border-border rounded-xl">
            <GitGraph
              commits={commits}
              selectedHash={selectedCommitHash}
              onSelectCommit={(hash: string) => {
                const c = commits.find((it: any) => it.hash === hash || it.fullHash === hash);
                if (c) onSelectCommit?.(c);
              }}
            />
          </div>
        )}
      </div>

      <div className="shrink-0 pt-2 border-t border-border">
        <PaginationControls
          currentPage={filters.page}
          totalItems={totalCount}
          pageSize={filters.pageSize || 10}
          onPageChange={(page) => setFilters(p => ({ ...p, page }))}
          isLoading={isFetching}
        />
      </div>
    </div>
  );
};
