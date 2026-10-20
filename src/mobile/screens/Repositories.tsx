import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../AppContext';
import { RepoCard } from '../components/RepoCard';
import { 
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, 
  Check, FolderGit2, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RepoSortBy } from '../../types';

export const Repositories: React.FC = () => {
  const { 
    githubRepos, 
    openRepo, 
    currentRepo,
    repoPage,
    repoTotalPages,
    setRepoPage,
    repoSearchQuery,
    setRepoSearchQuery,
    repoSearchScope,
    setRepoSearchScope,
    repoSortBy,
    setRepoSortBy,
    repoSortDirection,
    setRepoSortDirection,
    repoTypeFilter,
    setRepoTypeFilter,
    isFetchingRepos,
  } = useAppContext();

  const [localSearch, setLocalSearch] = useState(repoSearchQuery);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Debounce search query to AppContext
  useEffect(() => {
    const handler = setTimeout(() => {
      setRepoSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, setRepoSearchQuery]);

  useEffect(() => {
    setLocalSearch(repoSearchQuery);
  }, [repoSearchQuery]);

  // Scroll to top on page change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [repoPage]);

  const filterChips = [
    { id: 'all', label: 'All' },
    { id: 'public', label: 'Public' },
    { id: 'private', label: 'Private' },
    { id: 'forks', label: 'Forks' },
    { id: 'sources', label: 'Sources' },
  ] as const;

  const sortOptions = [
    { id: 'updated', label: 'Recently Updated' },
    { id: 'stars', label: 'Most Stars' },
    { id: 'forks', label: 'Most Forks' },
    { id: 'name', label: 'Repository Name' },
  ] as const;

  return (
    <div className="flex flex-col h-full relative" ref={scrollRef}>
      {/* 1. Sticky Controls Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 space-y-3 shrink-0">
        {/* Segmented Scope Switcher */}
        <div className="h-9 p-1 bg-surface-1 border border-border rounded-xl flex items-center gap-1 select-none">
          <button
            onClick={() => {
              setRepoSearchScope('personal');
              setRepoPage(1);
            }}
            className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              repoSearchScope === 'personal'
                ? 'bg-accent text-white shadow-sm font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Personal Repos
          </button>
          <button
            onClick={() => {
              setRepoSearchScope('global');
              setRepoPage(1);
            }}
            className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              repoSearchScope === 'global'
                ? 'bg-accent text-white shadow-sm font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Global GitHub
          </button>
        </div>

        {/* 44px Search Input Bar */}
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder={repoSearchScope === 'personal' ? 'Filter personal repos...' : 'Search all GitHub...'}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-20 bg-surface-1 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {isFetchingRepos ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Loader2 size={15} className="text-accent animate-spin" />
              </div>
            ) : localSearch ? (
              <button
                onClick={() => setLocalSearch('')}
                className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                <X size={15} />
              </button>
            ) : null}

            <button
              onClick={() => setIsSortSheetOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 text-text-secondary hover:text-text-primary border border-border cursor-pointer active:scale-95 transition-all"
              title="Sort Options"
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Horizontal Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-0.5 select-none">
          {filterChips.map((chip) => {
            const isActive = repoTypeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  setRepoTypeFilter(chip.id as any);
                  setRepoPage(1);
                }}
                className={`h-7 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-accent text-white font-bold'
                    : 'bg-surface-1 text-text-secondary hover:text-text-primary border border-border'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Repositories List */}
      <div className="p-4 space-y-3 flex-1 min-h-0">
        {githubRepos.length === 0 ? (
          <div className="bg-surface-1 border border-border rounded-xl p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-tertiary">
              <FolderGit2 size={24} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">No repositories found</h3>
              <p className="text-xs text-text-tertiary mt-1">
                {localSearch ? 'Try a different search term or clear the filter.' : 'No repositories synchronized with your profile yet.'}
              </p>
            </div>
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="h-8 px-3 rounded-lg bg-surface-2 border border-border text-xs font-semibold text-text-primary hover:bg-hover transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          githubRepos.map((repo) => (
            <RepoCard
              key={repo.name}
              repo={repo}
              isActive={currentRepo === repo.name}
              onClick={() => openRepo(repo.name, (repo as any).owner?.login)}
            />
          ))
        )}
      </div>

      {/* 3. Pagination Controls (Sticky Bottom if multi-page) */}
      {repoTotalPages > 1 && (
        <div className="sticky bottom-0 bg-surface-1 border-t border-border px-4 py-2 flex items-center justify-between shrink-0 select-none">
          <span className="text-xs text-text-tertiary font-mono">
            Page <span className="font-bold text-text-primary">{repoPage}</span> of {repoTotalPages}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setRepoPage(Math.max(1, repoPage - 1))}
              disabled={repoPage <= 1 || isFetchingRepos}
              className="w-8 h-8 rounded-lg bg-surface-1 border border-border text-text-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setRepoPage(Math.min(repoTotalPages, repoPage + 1))}
              disabled={repoPage >= repoTotalPages || isFetchingRepos}
              className="w-8 h-8 rounded-lg bg-surface-1 border border-border text-text-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Bottom Sheet: Sort & Ordering */}
      <AnimatePresence>
        {isSortSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSortSheetOpen(false)}
              className="absolute inset-0 bg-black/60"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-surface-1 border-t border-x border-border rounded-t-xl pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-5 shadow-2xl z-10"
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-sm font-semibold text-text-primary">Sort Repositories</h3>
                <button
                  onClick={() => setIsSortSheetOpen(false)}
                  className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="py-2 divide-y divide-border">
                {sortOptions.map((opt) => {
                  const isSelected = repoSortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setRepoSortBy(opt.id as RepoSortBy);
                        setIsSortSheetOpen(false);
                      }}
                      className="w-full py-3.5 flex items-center justify-between text-left text-xs font-medium cursor-pointer"
                    >
                      <span className={isSelected ? 'text-accent font-bold' : 'text-text-primary'}>
                        {opt.label}
                      </span>
                      {isSelected && <Check size={16} className="text-accent" />}
                    </button>
                  );
                })}
              </div>

              {/* Ascending / Descending Direction */}
              <div className="pt-3 border-t border-border flex gap-2">
                <button
                  onClick={() => setRepoSortDirection('desc')}
                  className={`flex-1 h-9 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    repoSortDirection === 'desc'
                      ? 'bg-accent text-white border-accent font-bold'
                      : 'bg-surface-2 border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Descending (Z-A / Newest)
                </button>
                <button
                  onClick={() => setRepoSortDirection('asc')}
                  className={`flex-1 h-9 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    repoSortDirection === 'asc'
                      ? 'bg-accent text-white border-accent font-bold'
                      : 'bg-surface-2 border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Ascending (A-Z / Oldest)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Aliases
export const MobileRepositories = Repositories;
