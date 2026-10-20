import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { CommitCard } from '../../components/CommitCard';
import { CommitDetailModal } from '../../components/CommitDetailModal';
import { filterLocalCommits, DatePreset } from '../../../hooks/useCommits';
import { GitGraph } from '../../../components/commit/GitGraph';
import { PaginationControls } from '../../../components/common/PaginationControls';
import { 
  GitCommit, Search, X, Filter, Calendar, User, 
  RotateCcw, Plus, ChevronDown, ChevronUp, GitGraph as GitGraphIcon, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CommitsScreen: React.FC = () => {
  const { activeCommits, showToast, currentRepo, openModal } = useAppContext();
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [sinceDate, setSinceDate] = useState('');
  const [untilDate, setUntilDate] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast(`Copied SHA: ${hash.substring(0, 7)}`, 'success');
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
      setSinceDate(todayStr);
      setUntilDate(todayStr);
      setDatePreset('today');
    } else if (preset === '7d') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setSinceDate(toYMD(past));
      setUntilDate(todayStr);
      setDatePreset('7d');
    } else if (preset === '30d') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      setSinceDate(toYMD(past));
      setUntilDate(todayStr);
      setDatePreset('30d');
    } else if (preset === 'year') {
      setSinceDate(`${now.getFullYear()}-01-01`);
      setUntilDate(todayStr);
      setDatePreset('year');
    } else if (preset === 'all') {
      setSinceDate('');
      setUntilDate('');
      setDatePreset('all');
    } else {
      setDatePreset('custom');
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setAuthorFilter('');
    setSinceDate('');
    setUntilDate('');
    setDatePreset('all');
  };

  const activeFilterCount = 
    (searchQuery.trim() ? 1 : 0) + 
    (authorFilter.trim() ? 1 : 0) + 
    ((sinceDate || untilDate) ? 1 : 0);

  // Filtered commits computed with memoization
  const filteredCommits = useMemo(() => {
    return filterLocalCommits(activeCommits || [], {
      query: searchQuery,
      author: authorFilter,
      since: sinceDate,
      until: untilDate,
    });
  }, [activeCommits, searchQuery, authorFilter, sinceDate, untilDate]);

  const [pageSize, setPageSize] = useState<number>(10);
  const totalCommitsCount = filteredCommits.length;
  const paginatedCommits = useMemo(() => {
    if (pageSize === -1) {
      return filteredCommits;
    }
    const start = (currentPage - 1) * pageSize;
    return filteredCommits.slice(start, start + pageSize);
  }, [filteredCommits, currentPage, pageSize]);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* 1. Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">Commits</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            History of {currentRepo} on current branch
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View switcher: List vs D3 Git Graph */}
          <div className="flex items-center bg-surface-1 border border-border rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-accent text-white shadow-xs font-bold' : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              <List size={12} />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'graph' ? 'bg-accent text-white shadow-xs font-bold' : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              <GitGraphIcon size={12} />
              <span>Graph</span>
            </button>
          </div>

          <button
            onClick={() => openModal('commit')}
            className="h-8 px-2.5 rounded-lg bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm shadow-accent/20 cursor-pointer active:scale-95"
            title="Create New Commit"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-tertiary">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commits by message, SHA..."
              className="w-full h-10 pl-9 pr-8 bg-surface-1 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-primary cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 px-3.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
              showFilters || activeFilterCount > 0
                ? 'bg-accent-soft border-accent/40 text-accent font-semibold'
                : 'bg-surface-1 border-border text-text-secondary hover:text-text-primary'
            }`}
            title="Toggle filters"
          >
            <Filter size={14} />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="min-w-[16px] h-4 px-1 rounded-md bg-accent text-white text-[10px] font-semibold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Feedback and Reset Line */}
        <div className="flex items-center justify-between px-1 text-[11px] text-text-tertiary">
          <span>
            Showing <strong className="text-text-primary font-semibold">{filteredCommits.length}</strong> of {activeCommits.length} commits
            {activeFilterCount > 0 && <span className="text-accent ml-1 font-medium">(filtered)</span>}
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAllFilters}
              className="text-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* 3. Collapsible Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-surface-1 border border-border rounded-xl space-y-3 mt-1 shadow-sm">
                {/* Date Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                      Date Range Filter
                    </span>
                    {(sinceDate || untilDate) && (
                      <span className="text-[10px] text-accent font-medium">
                        {sinceDate || 'Start'} → {untilDate || 'Now'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'All Time' },
                      { id: 'today', label: 'Today' },
                      { id: '7d', label: 'Last 7 Days' },
                      { id: '30d', label: 'Last 30 Days' },
                      { id: 'year', label: 'This Year' },
                      { id: 'custom', label: 'Custom' },
                    ].map((p) => {
                      const isSelected = datePreset === p.id || (p.id === 'all' && !sinceDate && !untilDate && !datePreset);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleApplyPreset(p.id as DatePreset)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-accent text-white border-accent shadow-xs'
                              : 'bg-surface-2 border-border text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Date Pickers */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-tertiary block font-medium pl-0.5">
                      Since (From)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-text-tertiary">
                        <Calendar size={12} />
                      </div>
                      <input
                        type="date"
                        value={sinceDate}
                        onChange={(e) => {
                          setSinceDate(e.target.value);
                          setDatePreset('custom');
                        }}
                        className="w-full h-8 pl-7 pr-2 bg-surface-2 border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-tertiary block font-medium pl-0.5">
                      Until (To)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-text-tertiary">
                        <Calendar size={12} />
                      </div>
                      <input
                        type="date"
                        value={untilDate}
                        onChange={(e) => {
                          setUntilDate(e.target.value);
                          setDatePreset('custom');
                        }}
                        className="w-full h-8 pl-7 pr-2 bg-surface-2 border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Author Filter Input */}
                <div className="space-y-1 pt-0.5">
                  <label className="text-[10px] text-text-tertiary block font-medium pl-0.5">
                    Filter by Author
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-text-tertiary">
                      <User size={12} />
                    </div>
                    <input
                      type="text"
                      value={authorFilter}
                      onChange={(e) => setAuthorFilter(e.target.value)}
                      placeholder="e.g. alex or octocat"
                      className="w-full h-8 pl-7 pr-7 bg-surface-2 border border-border rounded-lg text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                    />
                    {authorFilter && (
                      <button
                        onClick={() => setAuthorFilter('')}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-text-tertiary hover:text-text-primary cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Clear action */}
                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <span className="text-[10px] text-text-tertiary">
                    {activeFilterCount > 0 ? `${activeFilterCount} active filters` : 'No active filters'}
                  </span>
                  <button
                    onClick={handleClearAllFilters}
                    className="text-xs text-text-tertiary hover:text-danger transition-colors cursor-pointer font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Commit Feed List or D3 Git Graph */}
      {viewMode === 'graph' ? (
        <div className="h-[460px] w-full bg-surface-1 rounded-xl overflow-hidden border border-border">
          <GitGraph
            commits={filteredCommits.length > 0 ? filteredCommits : activeCommits}
            selectedCommitId={selectedCommit?.hash}
            onSelectCommit={(c) => setSelectedCommit(c)}
            isDesktop={false}
          />
        </div>
      ) : filteredCommits.length === 0 ? (
        <div className="bg-surface-1 border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <GitCommit size={32} className="text-text-tertiary mb-2 opacity-50" />
          <span className="text-sm font-semibold text-text-primary mb-1">
            {activeCommits.length === 0 ? 'No commits on branch' : 'No matching commits'}
          </span>
          <span className="text-xs text-text-tertiary max-w-[260px] leading-relaxed mb-3">
            {activeCommits.length === 0
              ? 'Create a commit to start building project history.'
              : 'Try adjusting your search query, author name, or date range filter.'}
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAllFilters}
              className="px-3 py-1.5 bg-accent-soft border border-accent/30 text-accent text-xs font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2.5">
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
                isLatest={idx === 0 && currentPage === 1 && !searchQuery && !sinceDate && !untilDate && !authorFilter}
              />
            ))}
          </div>

          {/* Enhanced pagination bar with page size selection and 8pt clearance */}
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

      {/* 5. Comprehensive Bitbucket/Git Commit View with Tab Features */}
      <CommitDetailModal
        commit={selectedCommit}
        onClose={() => setSelectedCommit(null)}
      />
    </div>
  );
};

// Aliases
export const MobileCommits = CommitsScreen;

