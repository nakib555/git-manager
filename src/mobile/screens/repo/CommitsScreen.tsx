import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { CommitCard } from '../../components/CommitCard';
import { CommitDetailModal } from '../../components/CommitDetailModal';
import { filterLocalCommits, DatePreset } from '../../../hooks/useCommits';
import { GitGraph } from '../../../components/commit/GitGraph';
import { PaginationControls } from '../../../components/common/PaginationControls';
import { EmptyState } from '../../components/EmptyState';
import { 
  GitCommit, Search, X, Filter, Calendar, User, 
  RotateCcw, Plus, GitGraph as GitGraphIcon, List,
  CheckCircle2, XCircle, ZoomIn, ZoomOut, RotateCcw as ResetIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CommitsScreen: React.FC = () => {
  const { activeCommits, showToast, currentRepo, openModal, githubUser } = useAppContext();
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | '7d' | '30d' | 'custom'>('all');
  const [sinceDate, setSinceDate] = useState('');
  const [untilDate, setUntilDate] = useState('');
  const [ciStatusFilter, setCiStatusFilter] = useState<'all' | 'passing' | 'failing'>('all');
  const [mergesOnly, setMergesOnly] = useState(false);
  const [headOnly, setHeadOnly] = useState(false);
  const [activeQuickChip, setActiveQuickChip] = useState<'all' | 'my' | 'week' | 'merges' | 'ci'>('all');

  // Filter Bottom Sheet State
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Staging / Draft filter state for the sheet
  const [draftDateRange, setDraftDateRange] = useState<'all' | 'today' | '7d' | '30d' | 'custom'>('all');
  const [draftAuthor, setDraftAuthor] = useState('all');
  const [draftCiStatus, setDraftCiStatus] = useState<'all' | 'passing' | 'failing'>('all');
  const [draftMergesOnly, setDraftMergesOnly] = useState(false);
  const [draftHeadOnly, setDraftHeadOnly] = useState(false);
  const [draftSinceDate, setDraftSinceDate] = useState('');
  const [draftUntilDate, setDraftUntilDate] = useState('');

  // Graph Zoom State
  const [graphZoom, setGraphZoom] = useState(1);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast(`Copied SHA: ${hash.substring(0, 7)}`, 'success');
  };

  // Distinct authors in current active commits
  const distinctAuthors = useMemo(() => {
    const set = new Set<string>();
    (activeCommits || []).forEach(c => {
      if (c.author) set.add(c.author);
    });
    return Array.from(set);
  }, [activeCommits]);

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (dateRangeFilter !== 'all') count++;
    if (authorFilter !== 'all') count++;
    if (ciStatusFilter !== 'all') count++;
    if (mergesOnly) count++;
    if (headOnly) count++;
    return count;
  }, [searchQuery, dateRangeFilter, authorFilter, ciStatusFilter, mergesOnly, headOnly]);

  // Quick Chips Handler
  const handleQuickChipSelect = (type: 'all' | 'my' | 'week' | 'merges' | 'ci') => {
    setActiveQuickChip(type);
    setCurrentPage(1);

    // Reset base constraints
    setDateRangeFilter('all');
    setSinceDate('');
    setUntilDate('');
    setAuthorFilter('all');
    setCiStatusFilter('all');
    setMergesOnly(false);
    setHeadOnly(false);

    if (type === 'my') {
      const myUsername = githubUser?.login || 'nakib555';
      setAuthorFilter(myUsername);
    } else if (type === 'week') {
      setDateRangeFilter('7d');
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setSinceDate(past.toISOString().split('T')[0]);
      setUntilDate(new Date().toISOString().split('T')[0]);
    } else if (type === 'merges') {
      setMergesOnly(true);
    } else if (type === 'ci') {
      setCiStatusFilter('failing');
    }
  };

  // Open Filter Sheet & sync draft states
  const openFilterSheet = () => {
    setDraftDateRange(dateRangeFilter);
    setDraftAuthor(authorFilter);
    setDraftCiStatus(ciStatusFilter);
    setDraftMergesOnly(mergesOnly);
    setDraftHeadOnly(headOnly);
    setDraftSinceDate(sinceDate);
    setDraftUntilDate(untilDate);
    setIsFilterSheetOpen(true);
  };

  // Apply Sheet Draft Filters
  const applyDraftFilters = () => {
    setDateRangeFilter(draftDateRange);
    setAuthorFilter(draftAuthor);
    setCiStatusFilter(draftCiStatus);
    setMergesOnly(draftMergesOnly);
    setHeadOnly(draftHeadOnly);
    setSinceDate(draftSinceDate);
    setUntilDate(draftUntilDate);

    // Check if it matches a quick chip
    if (draftDateRange === 'all' && draftAuthor === 'all' && draftCiStatus === 'all' && !draftMergesOnly && !draftHeadOnly) {
      setActiveQuickChip('all');
    } else if (draftDateRange === '7d' && draftAuthor === 'all' && draftCiStatus === 'all' && !draftMergesOnly && !draftHeadOnly) {
      setActiveQuickChip('week');
    } else if (draftMergesOnly && draftDateRange === 'all' && draftAuthor === 'all' && draftCiStatus === 'all' && !draftHeadOnly) {
      setActiveQuickChip('merges');
    } else if (draftCiStatus === 'failing' && draftDateRange === 'all' && draftAuthor === 'all' && !draftMergesOnly && !draftHeadOnly) {
      setActiveQuickChip('ci');
    } else {
      setActiveQuickChip('all');
    }

    setCurrentPage(1);
    setIsFilterSheetOpen(false);
    showToast('Filters applied', 'info');
  };

  // Reset Draft filters inside sheet
  const resetDraftFilters = () => {
    setDraftDateRange('all');
    setDraftAuthor('all');
    setDraftCiStatus('all');
    setDraftMergesOnly(false);
    setDraftHeadOnly(false);
    setDraftSinceDate('');
    setDraftUntilDate('');
  };

  // Reset all applied filters
  const resetAllFilters = () => {
    setSearchQuery('');
    setDateRangeFilter('all');
    setAuthorFilter('all');
    setCiStatusFilter('all');
    setMergesOnly(false);
    setHeadOnly(false);
    setSinceDate('');
    setUntilDate('');
    setActiveQuickChip('all');
    setCurrentPage(1);
    showToast('Filters reset', 'info');
  };

  // Individual filter removal
  const removeFilterKey = (key: 'date' | 'author' | 'ci' | 'merges' | 'head') => {
    if (key === 'date') {
      setDateRangeFilter('all');
      setSinceDate('');
      setUntilDate('');
    } else if (key === 'author') {
      setAuthorFilter('all');
    } else if (key === 'ci') {
      setCiStatusFilter('all');
    } else if (key === 'merges') {
      setMergesOnly(false);
    } else if (key === 'head') {
      setHeadOnly(false);
    }
  };

  // Filter pipeline computation
  const filteredCommits = useMemo(() => {
    let result = filterLocalCommits(activeCommits || [], {
      query: searchQuery,
      author: authorFilter !== 'all' ? authorFilter : '',
      since: sinceDate,
      until: untilDate,
    });

    if (ciStatusFilter === 'passing') {
      result = result.filter(c => (c as any).ciStatus !== 'failing');
    } else if (ciStatusFilter === 'failing') {
      result = result.filter(c => (c as any).ciStatus === 'failing');
    }

    if (mergesOnly) {
      result = result.filter(c => 
        (c as any).isMerge || 
        c.msg.toLowerCase().startsWith('merge') || 
        c.msg.toLowerCase().includes('pull request')
      );
    }

    if (headOnly && result.length > 0) {
      result = [result[0]];
    }

    return result;
  }, [activeCommits, searchQuery, authorFilter, sinceDate, untilDate, ciStatusFilter, mergesOnly, headOnly]);

  // Draft filter count preview inside bottom sheet
  const draftPreviewCount = useMemo(() => {
    let result = filterLocalCommits(activeCommits || [], {
      query: searchQuery,
      author: draftAuthor !== 'all' ? draftAuthor : '',
      since: draftSinceDate,
      until: draftUntilDate,
    });

    if (draftCiStatus === 'passing') {
      result = result.filter(c => (c as any).ciStatus !== 'failing');
    } else if (draftCiStatus === 'failing') {
      result = result.filter(c => (c as any).ciStatus === 'failing');
    }

    if (draftMergesOnly) {
      result = result.filter(c => 
        (c as any).isMerge || 
        c.msg.toLowerCase().startsWith('merge') || 
        c.msg.toLowerCase().includes('pull request')
      );
    }

    if (draftHeadOnly && result.length > 0) {
      result = [result[0]];
    }

    return result.length;
  }, [activeCommits, searchQuery, draftAuthor, draftSinceDate, draftUntilDate, draftCiStatus, draftMergesOnly, draftHeadOnly]);

  const totalCommitsCount = filteredCommits.length;
  const paginatedCommits = useMemo(() => {
    if (pageSize === -1) {
      return filteredCommits;
    }
    const start = (currentPage - 1) * pageSize;
    return filteredCommits.slice(start, start + pageSize);
  }, [filteredCommits, currentPage, pageSize]);

  return (
    <div className="px-4 py-4 space-y-3.5">
      {/* 1. Header Title & View Controls */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Commits</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            History of <span className="font-medium text-text-secondary">{currentRepo}</span> on current branch
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* List vs Graph Segmented Toggle */}
          <div className="flex bg-surface-1 p-0.5 rounded-xl border border-border shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-text-primary text-background shadow-xs font-bold'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              <List size={13} strokeWidth={2.2} />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === 'graph'
                  ? 'bg-text-primary text-background shadow-xs font-bold'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              <GitGraphIcon size={13} strokeWidth={2.2} />
              <span>Graph</span>
            </button>
          </div>

          {/* New Commit Action */}
          <button
            onClick={() => openModal('commit')}
            className="w-8 h-8 rounded-xl bg-text-primary hover:opacity-90 text-background flex items-center justify-center shadow-xs active:scale-95 transition cursor-pointer"
            title="Create New Commit"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 2. Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-tertiary">
          <Search size={14} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search commits by message, SHA, author..."
          className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-surface-1 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent placeholder:text-text-tertiary text-text-primary transition shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-primary cursor-pointer"
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* 3. Horizontal Quick Filter Carousel & Filter Sheet Trigger */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 py-0.5">
          {/* Filter Sheet Trigger Button */}
          <button
            type="button"
            onClick={openFilterSheet}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-1 border border-border rounded-xl text-xs font-bold text-text-primary shadow-xs hover:bg-surface-2 active:scale-95 transition shrink-0 cursor-pointer"
          >
            <Filter size={13} className="text-text-tertiary" strokeWidth={2.2} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 bg-accent text-white rounded-full text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick Pill: All Commits */}
          <button
            type="button"
            onClick={() => handleQuickChipSelect('all')}
            className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition active:scale-95 cursor-pointer ${
              activeQuickChip === 'all' && activeFilterCount === 0
                ? 'bg-text-primary text-background font-bold shadow-xs'
                : 'bg-surface-1 hover:bg-surface-2 text-text-secondary border border-border/70 font-semibold'
            }`}
          >
            All Commits
          </button>

          {/* Quick Pill: My Commits */}
          <button
            type="button"
            onClick={() => handleQuickChipSelect('my')}
            className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition active:scale-95 cursor-pointer ${
              activeQuickChip === 'my'
                ? 'bg-text-primary text-background font-bold shadow-xs'
                : 'bg-surface-1 hover:bg-surface-2 text-text-secondary border border-border/70 font-semibold'
            }`}
          >
            My Commits
          </button>

          {/* Quick Pill: Last 7 Days */}
          <button
            type="button"
            onClick={() => handleQuickChipSelect('week')}
            className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition active:scale-95 cursor-pointer ${
              activeQuickChip === 'week'
                ? 'bg-text-primary text-background font-bold shadow-xs'
                : 'bg-surface-1 hover:bg-surface-2 text-text-secondary border border-border/70 font-semibold'
            }`}
          >
            Last 7 Days
          </button>

          {/* Quick Pill: Merges */}
          <button
            type="button"
            onClick={() => handleQuickChipSelect('merges')}
            className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition active:scale-95 cursor-pointer ${
              activeQuickChip === 'merges'
                ? 'bg-text-primary text-background font-bold shadow-xs'
                : 'bg-surface-1 hover:bg-surface-2 text-text-secondary border border-border/70 font-semibold'
            }`}
          >
            Merges
          </button>

          {/* Quick Pill: CI Failed */}
          <button
            type="button"
            onClick={() => handleQuickChipSelect('ci')}
            className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition active:scale-95 cursor-pointer ${
              activeQuickChip === 'ci'
                ? 'bg-text-primary text-background font-bold shadow-xs'
                : 'bg-surface-1 hover:bg-surface-2 text-text-secondary border border-border/70 font-semibold'
            }`}
          >
            CI Failed
          </button>
        </div>

        {/* Dynamic Active Filter Tags Banner */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] font-bold text-text-tertiary mr-0.5 uppercase tracking-wider">Active:</span>
            {dateRangeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent/10 text-accent border border-accent/25 text-[11px] font-semibold">
                <span>{dateRangeFilter === '7d' ? 'Last 7 Days' : dateRangeFilter === 'today' ? 'Today' : dateRangeFilter === '30d' ? 'Last 30 Days' : 'Custom Date'}</span>
                <button onClick={() => removeFilterKey('date')} className="hover:text-accent font-bold">&times;</button>
              </span>
            )}
            {authorFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent/10 text-accent border border-accent/25 text-[11px] font-semibold">
                <span>Author: {authorFilter}</span>
                <button onClick={() => removeFilterKey('author')} className="hover:text-accent font-bold">&times;</button>
              </span>
            )}
            {ciStatusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent/10 text-accent border border-accent/25 text-[11px] font-semibold">
                <span>CI: {ciStatusFilter}</span>
                <button onClick={() => removeFilterKey('ci')} className="hover:text-accent font-bold">&times;</button>
              </span>
            )}
            {mergesOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent/10 text-accent border border-accent/25 text-[11px] font-semibold">
                <span>Merges only</span>
                <button onClick={() => removeFilterKey('merges')} className="hover:text-accent font-bold">&times;</button>
              </span>
            )}
            {headOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent/10 text-accent border border-accent/25 text-[11px] font-semibold">
                <span>HEAD commit</span>
                <button onClick={() => removeFilterKey('head')} className="hover:text-accent font-bold">&times;</button>
              </span>
            )}
            <button
              onClick={resetAllFilters}
              className="text-[11px] font-bold text-accent hover:underline ml-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 4. Count Status Header */}
      <div className="flex items-center justify-between text-xs text-text-tertiary pt-0.5">
        <div>
          Showing <span className="font-bold text-text-primary tabular-nums">{filteredCommits.length}</span> of {activeCommits.length} commits
        </div>
        <div className="text-[11px] text-text-tertiary">
          {activeFilterCount > 0 ? `${activeFilterCount} active filters` : 'All branches included'}
        </div>
      </div>

      {/* 5. Viewport: List View OR Interactive SVG Git Graph */}
      {viewMode === 'graph' ? (
        <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-sm pb-6">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-text-primary">Main</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-text-primary">Feature</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span><span className="text-text-primary">Merge</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full ring-2 ring-emerald-500 ring-offset-1 bg-emerald-500"></span><span className="text-text-primary">HEAD</span></div>
            </div>

            <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setGraphZoom(prev => Math.min(2.0, prev * 1.15))}
                className="p-1 hover:bg-surface-3 rounded text-text-secondary cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                onClick={() => setGraphZoom(prev => Math.max(0.6, prev * 0.85))}
                className="p-1 hover:bg-surface-3 rounded text-text-secondary cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={() => setGraphZoom(1)}
                className="p-1 hover:bg-surface-3 rounded text-text-secondary cursor-pointer"
                title="Reset zoom"
              >
                <ResetIcon size={13} />
              </button>
            </div>
          </div>

          <div className="h-[480px] w-full overflow-hidden transition-transform duration-200" style={{ transform: `scale(${graphZoom})`, transformOrigin: 'top left' }}>
            <GitGraph
              commits={filteredCommits.length > 0 ? filteredCommits : activeCommits}
              selectedCommitId={selectedCommit?.hash}
              onSelectCommit={(c) => setSelectedCommit(c)}
              isDesktop={false}
            />
          </div>
        </div>
      ) : filteredCommits.length === 0 ? (
        activeCommits.length === 0 ? (
          <EmptyState
            icon={GitCommit}
            title="No commits on this branch"
            description="Start building history by staging and creating your first commit on this branch."
            primaryAction={{
              label: 'Create First Commit',
              icon: Plus,
              onClick: () => openModal('commit'),
            }}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="No matching commits"
            description="Try clearing active filters or adjusting your query terms."
            primaryAction={{
              label: 'Reset Filters',
              onClick: resetAllFilters,
            }}
          />
        )
      ) : (
        <div className="space-y-2.5 pb-6">
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
              onClick={() => setSelectedCommit(commit)}
              onCopyHash={() => handleCopyHash(commit.hash)}
              isLatest={idx === 0 && currentPage === 1 && !searchQuery && dateRangeFilter === 'all' && authorFilter === 'all'}
            />
          ))}

          {/* Pagination Controls (10 items / page) */}
          <div className="pt-3 pb-6 border-t border-border/80">
            <PaginationControls
              currentPage={currentPage}
              totalItems={totalCommitsCount}
              pageSize={pageSize}
              pageSizeOptions={[10, 25, 50, -1]}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              onPageChange={(p) => setCurrentPage(p)}
              compact={false}
              itemName="commits"
            />
          </div>
        </div>
      )}

      {/* 6. Dedicated Mobile Filter Bottom Sheet */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSheetOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />

            {/* Sheet Content Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-[440px] mx-auto bg-surface-1 border-t border-x border-border rounded-t-3xl shadow-2xl z-10 max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Drag Handle */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5 mb-1 cursor-grab" />

              {/* Sheet Header */}
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-text-primary">
                    <Filter size={15} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Filter Commits</h3>
                    <p className="text-[11px] text-text-tertiary">Refine repository timeline</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetDraftFilters}
                  className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Scrollable Filter Form Controls */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs no-scrollbar">
                {/* SECTION 1: DATE RANGE */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Date Range</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'all', label: 'All Time' },
                      { id: 'today', label: 'Today' },
                      { id: '7d', label: 'Last 7 Days' },
                      { id: '30d', label: 'Last 30 Days' },
                      { id: 'custom', label: 'Custom Range' },
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setDraftDateRange(d.id as any);
                          if (d.id === 'all') {
                            setDraftSinceDate('');
                            setDraftUntilDate('');
                          } else if (d.id === 'today') {
                            const today = new Date().toISOString().split('T')[0];
                            setDraftSinceDate(today);
                            setDraftUntilDate(today);
                          } else if (d.id === '7d') {
                            const past = new Date();
                            past.setDate(past.getDate() - 7);
                            setDraftSinceDate(past.toISOString().split('T')[0]);
                            setDraftUntilDate(new Date().toISOString().split('T')[0]);
                          } else if (d.id === '30d') {
                            const past = new Date();
                            past.setDate(past.getDate() - 30);
                            setDraftSinceDate(past.toISOString().split('T')[0]);
                            setDraftUntilDate(new Date().toISOString().split('T')[0]);
                          }
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                          draftDateRange === d.id
                            ? 'bg-text-primary text-background border-text-primary shadow-xs'
                            : 'bg-surface-2 text-text-secondary border-border hover:bg-surface-3'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {draftDateRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <span className="text-[10px] text-text-tertiary block mb-1">Since Date</span>
                        <input
                          type="date"
                          value={draftSinceDate}
                          onChange={(e) => setDraftSinceDate(e.target.value)}
                          className="w-full h-8 px-2 bg-surface-2 border border-border rounded-lg text-xs text-text-primary"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-text-tertiary block mb-1">Until Date</span>
                        <input
                          type="date"
                          value={draftUntilDate}
                          onChange={(e) => setDraftUntilDate(e.target.value)}
                          className="w-full h-8 px-2 bg-surface-2 border border-border rounded-lg text-xs text-text-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 2: AUTHORS SELECTION */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Filter By Author</label>
                  <div className="space-y-1.5 border border-border rounded-2xl p-2 bg-surface-2/40">
                    {/* All Contributors Option */}
                    <label 
                      onClick={() => setDraftAuthor('all')} 
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                        draftAuthor === 'all' ? 'bg-surface-1 shadow-2xs' : 'hover:bg-surface-2'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-text-secondary text-[10px] font-bold">ALL</div>
                        <span className="text-xs font-semibold text-text-primary">All Contributors</span>
                      </div>
                      <input
                        type="radio"
                        name="filter-author"
                        checked={draftAuthor === 'all'}
                        onChange={() => setDraftAuthor('all')}
                        className="w-4 h-4 text-accent accent-accent"
                      />
                    </label>

                    {/* Current User */}
                    {githubUser && (
                      <label 
                        onClick={() => setDraftAuthor(githubUser.login)} 
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          draftAuthor === githubUser.login ? 'bg-surface-1 shadow-2xs' : 'hover:bg-surface-2'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={githubUser.avatar_url} alt="" className="w-6 h-6 rounded-full border border-border" />
                          <div>
                            <span className="text-xs font-semibold text-text-primary">{githubUser.login}</span>
                            <span className="text-[10px] text-text-tertiary ml-1">(You)</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="filter-author"
                          checked={draftAuthor === githubUser.login}
                          onChange={() => setDraftAuthor(githubUser.login)}
                          className="w-4 h-4 text-accent accent-accent"
                        />
                      </label>
                    )}

                    {/* Distinct other authors */}
                    {distinctAuthors.filter(a => !githubUser || a !== githubUser.login).slice(0, 4).map(authorName => (
                      <label 
                        key={authorName}
                        onClick={() => setDraftAuthor(authorName)} 
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          draftAuthor === authorName ? 'bg-surface-1 shadow-2xs' : 'hover:bg-surface-2'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold">
                            {authorName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-text-primary">{authorName}</span>
                        </div>
                        <input
                          type="radio"
                          name="filter-author"
                          checked={draftAuthor === authorName}
                          onChange={() => setDraftAuthor(authorName)}
                          className="w-4 h-4 text-accent accent-accent"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* SECTION 3: CI/CD STATUS */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-text-tertiary uppercase tracking-wider">CI / CD Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'Any Status' },
                      { id: 'passing', label: 'Passing' },
                      { id: 'failing', label: 'Failed Only' },
                    ].map(ci => (
                      <button
                        key={ci.id}
                        type="button"
                        onClick={() => setDraftCiStatus(ci.id as any)}
                        className={`py-2 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                          draftCiStatus === ci.id
                            ? 'border-text-primary bg-text-primary text-background shadow-xs'
                            : 'border-border bg-surface-2 text-text-secondary hover:bg-surface-3'
                        }`}
                      >
                        {ci.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION 4: COMMIT STRUCTURE */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Commit Structure</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDraftMergesOnly(prev => !prev)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                        draftMergesOnly
                          ? 'border-accent bg-accent/15 text-accent font-bold'
                          : 'border-border bg-surface-2 text-text-secondary hover:bg-surface-3'
                      }`}
                    >
                      {draftMergesOnly ? '✓ Include Merges' : 'Include Merges'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftHeadOnly(prev => !prev)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                        draftHeadOnly
                          ? 'border-accent bg-accent/15 text-accent font-bold'
                          : 'border-border bg-surface-2 text-text-secondary hover:bg-surface-3'
                      }`}
                    >
                      {draftHeadOnly ? '✓ HEAD Commit Only' : 'HEAD Commit Only'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sticky Sheet Footer */}
              <div className="p-4 border-t border-border bg-surface-1 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex-1 py-3 bg-surface-2 hover:bg-surface-3 text-text-secondary font-bold rounded-2xl text-xs transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={applyDraftFilters}
                  className="flex-[2] py-3 bg-text-primary hover:opacity-90 text-background font-bold rounded-2xl text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Apply Filters</span>
                  <span className="opacity-75 font-mono text-[11px]">({draftPreviewCount})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Full 3-Tab Commit Detail Bottom Sheet */}
      <CommitDetailModal
        commit={selectedCommit}
        onClose={() => setSelectedCommit(null)}
      />
    </div>
  );
};

export const MobileCommits = CommitsScreen;
