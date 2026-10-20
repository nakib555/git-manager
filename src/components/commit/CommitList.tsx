import React, { useRef, useState, useEffect } from 'react';
import { useCommits, CommitFilter, DatePreset } from '../../hooks/useCommits';
import { CommitItem } from './CommitItem';
import { Search, Loader2, RefreshCw, X, Filter, ChevronLeft, ChevronRight, Calendar, Check, RotateCcw } from 'lucide-react';
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
  const [filters, setFilters] = useState<CommitFilter>({ 
    query: '', 
    branch: '', 
    author: '', 
    since: '', 
    until: '', 
    datePreset: 'all',
    page: 1 
  });
  const [searchInput, setSearchInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, query: searchInput, author: authorInput, branch: branchInput, page: 1 }));
    }, 400);
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

  const handleApplyPreset = (preset: DatePreset) => {
    const now = new Date();
    const toYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const todayStr = toYMD(now);

    if (preset === 'today') {
      setFilters(prev => ({ ...prev, since: todayStr, until: todayStr, datePreset: 'today', page: 1 }));
    } else if (preset === '7d') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setFilters(prev => ({ ...prev, since: toYMD(past), until: todayStr, datePreset: '7d', page: 1 }));
    } else if (preset === '30d') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      setFilters(prev => ({ ...prev, since: toYMD(past), until: todayStr, datePreset: '30d', page: 1 }));
    } else if (preset === 'year') {
      const yearStart = `${now.getFullYear()}-01-01`;
      setFilters(prev => ({ ...prev, since: yearStart, until: todayStr, datePreset: 'year', page: 1 }));
    } else if (preset === 'all') {
      setFilters(prev => ({ ...prev, since: '', until: '', datePreset: 'all', page: 1 }));
    } else {
      setFilters(prev => ({ ...prev, datePreset: 'custom' }));
    }
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setAuthorInput('');
    setBranchInput('');
    setFilters({
      query: '',
      author: '',
      branch: '',
      since: '',
      until: '',
      datePreset: 'all',
      page: 1,
    });
  };

  const activeFilterCount = 
    (filters.query ? 1 : 0) + 
    (filters.author ? 1 : 0) + 
    (filters.branch ? 1 : 0) + 
    ((filters.since || filters.until) ? 1 : 0);

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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 border rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              showFilters || activeFilterCount > 0 
                ? 'bg-primary/10 border-primary/40 text-primary' 
                : 'bg-card border-border text-text-muted hover:text-text-main'
            }`}
            title="Toggle filters"
          >
            <Filter size={15} />
            {activeFilterCount > 0 && (
              <span className="min-w-[16px] h-4 px-1 rounded-md bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Status header with total counts */}
        <div className="flex items-center justify-between px-1 text-[11px] text-text-muted">
          <span>
            {isLoading ? (
              'Loading commits...'
            ) : (
              <>
                <span className="font-semibold text-text-main">{data?.totalCount ?? commits.length}</span> commits found
                {activeFilterCount > 0 && <span className="text-primary ml-1 font-medium">(filtered)</span>}
              </>
            )}
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAllFilters}
              className="text-primary hover:underline text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col gap-2.5 overflow-hidden p-3 bg-secondary/20 rounded-xl border border-border/80"
            >
              {/* Date Filter Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Date Range Filter
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: '7d', label: 'Last 7 Days' },
                    { id: '30d', label: 'Last 30 Days' },
                    { id: 'year', label: 'This Year' },
                    { id: 'custom', label: 'Custom' },
                  ].map((p) => {
                    const isSelected = filters.datePreset === p.id || (p.id === 'all' && !filters.since && !filters.until && !filters.datePreset);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyPreset(p.id as DatePreset)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-card border-border text-text-muted hover:text-text-main hover:border-text-muted/40'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Author & Branch Inputs */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  className="w-full bg-card border border-border text-text-main text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 placeholder:text-text-muted/60"
                  placeholder="Author (e.g. alex)"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full bg-card border border-border text-text-main text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 placeholder:text-text-muted/60"
                  placeholder="Branch (e.g. main)"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                />
              </div>

              {/* Custom Date Pickers */}
              <div className="grid grid-cols-2 gap-2 items-start pt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-muted pl-1">Since (From)</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                       <Calendar size={12} className="text-text-muted" />
                    </div>
                    <input
                      type="date"
                      className="w-full bg-card border border-border text-text-main text-xs rounded-xl pl-8 pr-2 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
                      value={filters.since}
                      onChange={(e) => setFilters(prev => ({ ...prev, since: e.target.value, datePreset: 'custom', page: 1 }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-muted pl-1">Until (To)</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                       <Calendar size={12} className="text-text-muted" />
                    </div>
                    <input
                      type="date"
                      className="w-full bg-card border border-border text-text-main text-xs rounded-xl pl-8 pr-2 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
                      value={filters.until}
                      onChange={(e) => setFilters(prev => ({ ...prev, until: e.target.value, datePreset: 'custom', page: 1 }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                 <span className="text-[10px] text-text-muted">
                   {filters.since || filters.until 
                     ? `Filter: ${filters.since || 'Start'} → ${filters.until || 'Now'}`
                     : 'Showing commits for all dates'}
                 </span>
                 <button 
                   onClick={handleClearAllFilters}
                   className="text-[11px] text-text-muted hover:text-danger transition-colors cursor-pointer"
                 >
                   Clear All Filters
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
            <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-3 border border-danger/20">
              <RefreshCw size={24} />
            </div>
            <p className="text-sm font-semibold text-text-main mb-1">Failed to load commits</p>
            <p className="text-xs text-text-muted mb-4 max-w-[250px]">There was an error fetching the commit history. Please try again.</p>
            <button onClick={() => refetch()} className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer">
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
