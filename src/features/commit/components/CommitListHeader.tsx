import React from 'react';
import { Search, Filter, RefreshCw, GitGraph as GitGraphIcon, List, Columns, ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-react';

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
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
          <Search size={14} />
        </div>
        <input
          type="text"
          className="w-full bg-card border border-border text-text-main text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
          placeholder="Filter commit messages, hashes..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="flex items-center bg-card border border-border rounded-xl p-0.5 shrink-0">
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            viewMode === 'list' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main'
          }`}
          title="Timeline list view"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => setViewMode('graph')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            viewMode === 'graph' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main'
          }`}
          title="Interactive D3 graph view"
        >
          <GitGraphIcon size={14} />
        </button>
        {isDesktop && (
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'split' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main'
            }`}
            title="Split view (Graph + List)"
          >
            <Columns size={14} />
          </button>
        )}
      </div>

      {/* Dual Descending & Ascending Horizontal Buttons */}
      <div className="flex items-center bg-card border border-border rounded-xl p-0.5 shrink-0 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onSetSortDirection ? onSetSortDirection('desc') : onToggleSortDirection && onToggleSortDirection()}
          className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
            sortDirection === 'desc'
              ? 'bg-primary text-white shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Descending (Newest first - Default)"
        >
          <ArrowDownWideNarrow size={13} />
          <span className="hidden sm:inline">Desc</span>
        </button>
        <button
          type="button"
          onClick={() => onSetSortDirection ? onSetSortDirection('asc') : onToggleSortDirection && onToggleSortDirection()}
          className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
            sortDirection === 'asc'
              ? 'bg-primary text-white shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Ascending (Oldest first / Chronological)"
        >
          <ArrowUpNarrowWide size={13} />
          <span className="hidden sm:inline">Asc</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className={`px-3 py-2 border rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs shrink-0 ${
          showFilters || activeFilterCount > 0
            ? 'bg-primary/10 border-primary/40 text-primary font-semibold'
            : 'bg-card border-border text-text-muted hover:text-text-main'
        }`}
        title="Toggle filters"
      >
        <Filter size={14} />
        <span className="hidden sm:inline">Filter</span>
        {activeFilterCount > 0 && (
          <span className="min-w-[16px] h-4 px-1 rounded-md bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 border border-border rounded-xl bg-card hover:bg-hover text-text-muted hover:text-text-main transition-colors cursor-pointer shrink-0"
          title="Refresh commits"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin text-primary' : ''} />
        </button>
      )}
    </div>
  );
};
