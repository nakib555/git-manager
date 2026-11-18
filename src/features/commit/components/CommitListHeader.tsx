import React from 'react';
import { Search, Filter, RefreshCw, GitGraph as GitGraphIcon, List, Columns, ArrowUpNarrowWide, ArrowDownWideNarrow, X } from 'lucide-react';

interface CommitListHeaderProps {
  searchInput: string;
  setSearchInput: (val: string) => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  activeFilterCount: number;
  viewMode: 'list' | 'graph' | 'split';
  setViewMode: (mode: 'list' | 'graph' | 'split') => void;
  sortDirection?: 'asc' | 'desc';
  onSetSortDirection?: (dir: 'asc' | 'desc') => void;
  onToggleSortDirection?: () => void;
  isDesktop?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
}

export const CommitListHeader: React.FC<CommitListHeaderProps> = ({
  searchInput,
  setSearchInput,
  showFilters,
  setShowFilters,
  activeFilterCount,
  viewMode,
  setViewMode,
  sortDirection = 'desc',
  onSetSortDirection,
  onToggleSortDirection,
  isDesktop,
  isFetching,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-text-muted">
            <Search size={13} />
          </div>
          <input
            type="text"
            aria-label="Filter commits by message or hash"
            className="w-full h-8 bg-surface-2/70 border border-border text-text-main text-xs rounded-xl pl-8 pr-7 focus:outline-none focus:border-primary focus:bg-surface-1 transition-colors placeholder:text-text-tertiary"
            placeholder="Filter commit messages, hashes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Clear commit search"
              className="absolute inset-y-0 right-1.5 flex items-center text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          className={`h-8 px-2.5 border rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs shrink-0 ${
            showFilters || activeFilterCount > 0
              ? 'bg-primary/10 border-primary/40 text-primary font-semibold'
              : 'bg-surface-2/70 border-border text-text-secondary hover:text-text-primary hover:bg-hover'
          }`}
          title="Toggle filters"
        >
          <Filter size={13} />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <span className="min-w-[16px] h-4 px-1 rounded-md bg-primary text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </button>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="w-8 h-8 border border-border rounded-xl bg-surface-2/70 hover:bg-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0 flex items-center justify-center"
            title="Refresh commits"
            aria-label="Refresh commits"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin text-primary' : ''} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 w-full">
        <div className="flex items-center bg-surface-2/80 border border-border rounded-xl p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            className={`h-7 px-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
              viewMode === 'list' ? 'bg-primary text-white shadow-xs font-semibold' : 'text-text-muted hover:text-text-main'
            }`}
            title="Timeline list view"
          >
            <List size={12} />
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            aria-pressed={viewMode === 'graph'}
            className={`h-7 px-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
              viewMode === 'graph' ? 'bg-primary text-white shadow-xs font-semibold' : 'text-text-muted hover:text-text-main'
            }`}
            title="Interactive D3 graph view"
          >
            <GitGraphIcon size={12} />
            <span>Graph</span>
          </button>
          {isDesktop && (
            <button
              type="button"
              onClick={() => setViewMode('split')}
              aria-pressed={viewMode === 'split'}
              className={`h-7 px-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
                viewMode === 'split' ? 'bg-primary text-white shadow-xs font-semibold' : 'text-text-muted hover:text-text-main'
              }`}
              title="Split view (Graph + List)"
            >
              <Columns size={12} />
              <span>Split</span>
            </button>
          )}
        </div>

        {/* Dual Descending & Ascending Horizontal Buttons */}
        <div className="flex items-center bg-surface-2/80 border border-border rounded-xl p-0.5 shrink-0 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => onSetSortDirection ? onSetSortDirection('desc') : onToggleSortDirection && onToggleSortDirection()}
            aria-pressed={sortDirection === 'desc'}
            className={`h-7 px-2 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              sortDirection === 'desc'
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
            title="Descending (Newest first - Default)"
          >
            <ArrowDownWideNarrow size={12} />
            <span>Desc</span>
          </button>
          <button
            type="button"
            onClick={() => onSetSortDirection ? onSetSortDirection('asc') : onToggleSortDirection && onToggleSortDirection()}
            aria-pressed={sortDirection === 'asc'}
            className={`h-7 px-2 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              sortDirection === 'asc'
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
            title="Ascending (Oldest first / Chronological)"
          >
            <ArrowUpNarrowWide size={12} />
            <span>Asc</span>
          </button>
        </div>
      </div>
    </div>
  );
};
