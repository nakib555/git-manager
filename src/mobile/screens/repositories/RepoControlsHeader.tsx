import React from 'react';
import { Search, Loader2, X, SlidersHorizontal } from 'lucide-react';

interface RepoControlsHeaderProps {
  repoSearchScope: 'personal' | 'global';
  localSearch: string;
  isFetchingRepos: boolean;
  repoTypeFilter: string;
  filterChips: readonly { readonly id: string; readonly label: string }[];
  onScopeChange: (scope: 'personal' | 'global') => void;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onOpenSortSheet: () => void;
  onFilterChange: (id: any) => void;
}

export const RepoControlsHeader: React.FC<RepoControlsHeaderProps> = ({
  repoSearchScope,
  localSearch,
  isFetchingRepos,
  repoTypeFilter,
  filterChips,
  onScopeChange,
  onSearchChange,
  onClearSearch,
  onOpenSortSheet,
  onFilterChange,
}) => {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 space-y-3 shrink-0">
      <div className="h-9 p-0.5 bg-surface-1 border border-border rounded-xl flex items-center gap-1 select-none">
        <button
          onClick={() => onScopeChange('personal')}
          className={`flex-1 h-full rounded-lg text-xs transition-all cursor-pointer ${
            repoSearchScope === 'personal' ? 'bg-text-primary text-background shadow-xs font-bold' : 'text-text-secondary hover:text-text-primary font-medium'
          }`}
        >
          Personal Repos
        </button>
        <button
          onClick={() => onScopeChange('global')}
          className={`flex-1 h-full rounded-lg text-xs transition-all cursor-pointer ${
            repoSearchScope === 'global' ? 'bg-text-primary text-background shadow-xs font-bold' : 'text-text-secondary hover:text-text-primary font-medium'
          }`}
        >
          Global GitHub
        </button>
      </div>

      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3.5 text-text-tertiary pointer-events-none" />
        <input
          type="text"
          placeholder={repoSearchScope === 'personal' ? 'Filter personal repos...' : 'Search all GitHub...'}
          value={localSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-11 pl-10 pr-20 bg-surface-1 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {isFetchingRepos ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <Loader2 size={15} className="text-accent animate-spin" />
            </div>
          ) : localSearch ? (
            <button onClick={onClearSearch} className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary cursor-pointer">
              <X size={15} />
            </button>
          ) : null}

          <button
            onClick={onOpenSortSheet}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 text-text-secondary hover:text-text-primary border border-border cursor-pointer active:scale-95 transition-all"
            title="Sort Options"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-0.5 select-none">
        {filterChips.map((chip) => {
          const isActive = repoTypeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => onFilterChange(chip.id)}
              className={`h-7 px-3 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive ? 'bg-text-primary text-background font-bold shadow-2xs' : 'bg-surface-1 text-text-secondary hover:text-text-primary border border-border/80 font-medium'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
