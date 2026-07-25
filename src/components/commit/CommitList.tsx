import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCommits, CommitFilter } from '../../hooks/useCommits';
import { CommitItem } from './CommitItem';
import { Search, Loader2, RefreshCw, X, GitCommit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import emptyStateImage from '../../assets/images/empty_commits_state_1784913881320.jpg';

export const CommitList = ({ 
  isDesktop, 
  onSelectCommit, 
  onActionClick, 
  selectedCommitId,
  parentRef 
}: any) => {
  const [filters, setFilters] = useState<CommitFilter>({ query: '', branch: '', author: '' });
  const [searchInput, setSearchInput] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, query: searchInput }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useCommits(filters);

  const commits = data?.pages.flatMap((page) => page.items) || [];
  
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const resolvedParentRef = parentRef || scrollElementRef;

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? commits.length + 1 : commits.length,
    getScrollElement: () => {
      if (typeof resolvedParentRef === 'function') return resolvedParentRef();
      if (resolvedParentRef && 'current' in resolvedParentRef) return resolvedParentRef.current;
      return resolvedParentRef;
    },
    estimateSize: () => isDesktop ? 90 : 130,
    overscan: 10,
  });

  // Infinite scroll hook-up
  const virtualItems = rowVirtualizer.getVirtualItems();
  
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;
    
    if (
      lastItem.index >= commits.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualItems, commits.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={`flex flex-col ${parentRef ? '' : 'h-full overflow-hidden'}`}>
      {/* Search and Filters */}
      <div className={`shrink-0 flex gap-2 ${isDesktop ? 'mb-4' : 'mb-3'}`}>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-text-muted" />
          </div>
          <input
            type="text"
            className="w-full bg-card border border-border text-text-main text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-muted/60"
            placeholder="Search commits by message or hash..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button 
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* List Container */}
      <div 
        ref={scrollElementRef} 
        className={`${parentRef ? '' : 'flex-1 overflow-y-auto no-scrollbar'} relative ${isDesktop ? 'pl-4 border-l-2 border-border/60' : 'pl-5 border-l-2 border-border/60'}`}
      >
        {isLoading ? (
          <div className="flex flex-col gap-4 animate-pulse pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[27px] top-1.5 w-3 h-3 bg-main border-2 border-border/70 rounded-full z-10"></div>
                <div className="w-20 bg-border/40 border border-border/20 h-6 rounded-lg mb-2"></div>
                <div className="w-[70%] bg-border/60 h-4 rounded mb-2.5"></div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-border/60"></div>
                    <div className="w-24 bg-border/50 h-3 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-3">
              <RefreshCw size={24} />
            </div>
            <p className="text-sm font-bold text-text-main mb-1">Failed to load commits</p>
            <p className="text-xs text-text-muted mb-4 max-w-[250px]">There was an error fetching the commit history. Please try again.</p>
            <button onClick={() => refetch()} className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
              Retry
            </button>
          </div>
        ) : commits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in h-full">
            <img src={emptyStateImage} alt="Empty repository" className="w-40 h-40 mb-6 rounded-2xl shadow-sm opacity-90 object-cover pointer-events-none" />
            <div className="text-sm font-bold text-text-main mb-2">
              {filters.query ? 'No matching commits' : 'It is quiet here...'}
            </div>
            <div className="text-center text-text-muted text-xs leading-relaxed max-w-[250px]">
              {filters.query 
                ? 'Try adjusting your search terms or filters.'
                : 'This repository has no commits yet. Make your first staging commit to start tracking changes!'}
            </div>
          </div>
        ) : (
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
            <AnimatePresence>
              {virtualItems.map((virtualRow) => {
                const isLoaderRow = virtualRow.index > commits.length - 1;
                const commit = commits[virtualRow.index];
                const isLatest = virtualRow.index === 0 && !filters.query;

                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                      paddingBottom: '1.5rem',
                    }}
                  >
                    {isLoaderRow ? (
                      <div className="flex justify-center p-4">
                        <Loader2 size={20} className="text-primary animate-spin" />
                      </div>
                    ) : (
                      <CommitItem
                        commit={commit}
                        isLatest={isLatest}
                        isSelected={selectedCommitId === commit.hash}
                        onSelect={onSelectCommit}
                        onActionClick={onActionClick}
                        isDesktop={isDesktop}
                      />
                    )}
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
