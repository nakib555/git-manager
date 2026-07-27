import React, { useRef, useState, useEffect } from 'react';
import { useCommits, CommitFilter } from '../../hooks/useCommits';
import { CommitItem } from './CommitItem';
import { Search, Loader2, RefreshCw, X, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import emptyStateImage from '../../assets/images/empty_commits_state_1784913881320.jpg';

export const CommitList = ({ 
  isDesktop, 
  onSelectCommit, 
  onActionClick, 
  selectedCommitId,
  parentRef 
}: any) => {
  const [filters, setFilters] = useState<CommitFilter>({ query: '', branch: '', author: '', since: '', until: '', page: 1 });
  const [searchInput, setSearchInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, query: searchInput, author: authorInput, branch: branchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, authorInput, branchInput]);

  const {
    data,
    isFetching,
    isLoading,
    isError,
    refetch,
  } = useCommits(filters);

  const commits = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = filters.page;
  
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: commits.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 130, // Estimate height of CommitItem + gap
    overscan: 5,
  });

  // Preserve scroll position by scrolling to top of the list when page changes, 
  // or keeping it in view. Since we replace the list, we can just scroll top.
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
    }
  }, [currentPage, commits]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className={`flex flex-col ${parentRef ? '' : 'h-full overflow-hidden'}`}>
      {/* Search and Filters */}
      <div className={`shrink-0 flex flex-col gap-2 ${isDesktop ? 'mb-4' : 'mb-3'}`}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-text-muted" />
            </div>
            <input
              type="text"
              className="w-full bg-card border border-border text-text-main text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-muted/60"
              placeholder="Search by message or SHA..."
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
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 border rounded-xl flex items-center justify-center transition-colors ${showFilters || authorInput || branchInput || filters.since || filters.until ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border text-text-muted hover:text-text-main'}`}
          >
            <Filter size={16} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col gap-2 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  className="w-full bg-card border border-border text-text-main text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 placeholder:text-text-muted/60"
                  placeholder="Filter by Author..."
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full bg-card border border-border text-text-main text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 placeholder:text-text-muted/60"
                  placeholder="Filter by Branch..."
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 items-start">
                <div className="flex flex-col gap-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Calendar size={12} className="text-text-muted" />
                    </div>
                    <input
                      type="date"
                      className="w-full bg-card border border-border text-text-main text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-text-muted"
                      value={filters.since}
                      onChange={(e) => setFilters(prev => ({ ...prev, since: e.target.value, page: 1 }))}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted/80 pl-2">Show commits from this date</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Calendar size={12} className="text-text-muted" />
                    </div>
                    <input
                      type="date"
                      className="w-full bg-card border border-border text-text-main text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-text-muted"
                      value={filters.until}
                      onChange={(e) => setFilters(prev => ({ ...prev, until: e.target.value, page: 1 }))}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted/80 pl-2">Show commits up to this date</span>
                </div>
              </div>
              <div className="flex justify-end">
                 <button 
                   onClick={() => {
                     setAuthorInput('');
                     setBranchInput('');
                     setFilters(prev => ({ ...prev, author: '', branch: '', since: '', until: '', page: 1 }));
                   }}
                   className="text-[11px] text-text-muted hover:text-text-main"
                 >
                   Clear Filters
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* List Container */}
      <div 
        ref={scrollElementRef} 
        className={`${parentRef ? '' : 'flex-1 overflow-y-auto no-scrollbar'} relative`}
      >
        {isLoading || isFetching ? (
          <div className="flex flex-col gap-4 animate-pulse pt-2 pl-8 relative">
            <div className="absolute top-4 bottom-0 left-[15px] w-[2px] bg-border/60 z-0"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="relative z-10">
                <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 bg-main border-2 border-border/70 rounded-full z-10"></div>
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
              {filters.query || filters.author || filters.branch || filters.since || filters.until ? 'No matching commits' : 'It is quiet here...'}
            </div>
            <div className="text-center text-text-muted text-xs leading-relaxed max-w-[250px]">
              {filters.query || filters.author || filters.branch || filters.since || filters.until 
                ? 'Try adjusting your search terms or filters.'
                : 'This repository has no commits yet. Make your first staging commit to start tracking changes!'}
            </div>
          </div>
        ) : (
          <div 
            className="relative pb-6 pt-2"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
            }}
          >
            {/* The continuous timeline line */}
            <div className="absolute top-4 bottom-6 left-[15px] w-[2px] bg-border/60 z-0"></div>
            
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const commit = commits[virtualItem.index];
              if (!commit) return null;
              const isLatest = virtualItem.index === 0 && !filters.query && filters.page === 1;

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                    paddingBottom: '24px', // Equivalent to gap-6
                    paddingLeft: '32px' // Equivalent to pl-8
                  }}
                >
                  <CommitItem
                    commit={commit}
                    isLatest={isLatest}
                    isSelected={selectedCommitId === commit.hash}
                    onSelect={onSelectCommit}
                    onActionClick={onActionClick}
                    isDesktop={isDesktop}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && !isError && totalPages > 0 && (
        <div className="shrink-0 flex items-center justify-between py-3 mt-2 border-t border-border">
          <div className="text-xs text-text-muted">
             Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isFetching}
              className="p-1.5 rounded-lg border border-border text-text-main disabled:opacity-30 disabled:cursor-not-allowed hover:bg-hover/10 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1 mx-1">
               {/* Display some page numbers */}
               {[...Array(totalPages)].map((_, i) => {
                 const pageNum = i + 1;
                 // Show first, last, current, and adjacent
                 if (
                   pageNum === 1 || 
                   pageNum === totalPages || 
                   (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                 ) {
                   return (
                     <button
                       key={pageNum}
                       onClick={() => handlePageChange(pageNum)}
                       disabled={isFetching}
                       className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors disabled:opacity-50 ${currentPage === pageNum ? 'bg-primary text-white font-bold' : 'text-text-main hover:bg-hover/10'}`}
                     >
                       {pageNum}
                     </button>
                   );
                 } else if (
                   pageNum === currentPage - 2 || 
                   pageNum === currentPage + 2
                 ) {
                   return <span key={pageNum} className="text-text-muted text-xs">...</span>;
                 }
                 return null;
               })}
            </div>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isFetching}
              className="p-1.5 rounded-lg border border-border text-text-main disabled:opacity-30 disabled:cursor-not-allowed hover:bg-hover/10 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
