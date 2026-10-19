import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../AppContext';
import { MobileRepoCard } from '../components/MobileRepoCard';
import { 
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, 
  Check, FolderGit2, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RepoSortBy } from '../../types';

export const MobileRepositories: React.FC = () => {
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

  const sortOptions: { id: RepoSortBy; label: string }[] = [
    { id: 'updated', label: 'Recently Updated' },
    { id: 'stars', label: 'Most Stars' },
    { id: 'forks', label: 'Most Forks' },
    { id: 'name', label: 'Repository Name' },
  ];

  return (
    <div ref={scrollRef} className="space-y-4 px-5 py-4">
      {/* 1. Sticky Controls under Header */}
      <div className="space-y-3">
        {/* Segmented Scope: Personal vs Global */}
        <div className="h-10 p-1 bg-[#121214] border border-[#2A2A2E] rounded-xl flex items-center gap-1 select-none">
          <button
            onClick={() => {
              setRepoSearchScope('personal');
              setRepoPage(1);
            }}
            className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              repoSearchScope === 'personal'
                ? 'bg-[#1A1A1D] text-[#F4F4F5] shadow-sm border border-[#2A2A2E]'
                : 'text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            Personal Workspace
          </button>
          <button
            onClick={() => {
              setRepoSearchScope('global');
              setRepoPage(1);
            }}
            className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              repoSearchScope === 'global'
                ? 'bg-[#1A1A1D] text-[#F4F4F5] shadow-sm border border-[#2A2A2E]'
                : 'text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            Global GitHub Search
          </button>
        </div>

        {/* 44px Search Input + Sort Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder={repoSearchScope === 'personal' ? 'Filter personal repositories...' : 'Search public repositories (e.g. react)...'}
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setRepoPage(1);
              }}
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#121214] border border-[#2A2A2E] text-xs font-medium text-[#F4F4F5] placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] transition-colors"
            />
            {localSearch && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  setRepoSearchQuery('');
                  setRepoPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F4F4F5] cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsSortSheetOpen(true)}
            className="w-11 h-11 rounded-xl bg-[#121214] border border-[#2A2A2E] hover:border-[#3B82F6]/40 flex items-center justify-center text-[#A1A1AA] hover:text-[#F4F4F5] transition-all cursor-pointer shrink-0"
            aria-label="Sort repositories"
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 select-none">
          {filterChips.map((chip) => {
            const isActive = repoTypeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  setRepoTypeFilter(chip.id);
                  setRepoPage(1);
                }}
                className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-[#3B82F6]/15 border border-[#3B82F6]/40 text-[#3B82F6]'
                    : 'bg-[#121214] border border-[#2A2A2E] text-[#71717A] hover:text-[#A1A1AA]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Repositories List */}
      <div className="space-y-3 pt-1">
        {isFetchingRepos ? (
          <div className="py-16 text-center text-xs text-[#71717A] flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#3B82F6]" />
            <span>Fetching repositories...</span>
          </div>
        ) : githubRepos.length === 0 ? (
          <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <FolderGit2 size={32} className="text-[#71717A] mb-2 opacity-50" />
            <span className="text-sm font-semibold text-[#F4F4F5] mb-1">No repositories found</span>
            <span className="text-xs text-[#71717A]">
              {localSearch ? `No matches found for "${localSearch}".` : 'Try adjusting your search filters.'}
            </span>
          </div>
        ) : (
          githubRepos.map((repo) => (
            <MobileRepoCard
              key={repo.id}
              repo={repo}
              isActive={currentRepo === repo.name}
              onClick={() => openRepo(repo.name, (repo as any).owner?.login || null)}
            />
          ))
        )}
      </div>

      {/* 3. Bottom Pagination Controls */}
      {repoTotalPages > 1 && (
        <div className="flex items-center justify-between pt-4 pb-2 border-t border-[#2A2A2E] select-none">
          <span className="text-xs font-mono text-[#71717A] tabular-nums">
            Page {repoPage} of {repoTotalPages}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setRepoPage(Math.max(1, repoPage - 1))}
              disabled={repoPage <= 1}
              className="w-9 h-9 rounded-xl bg-[#121214] border border-[#2A2A2E] flex items-center justify-center text-[#A1A1AA] hover:text-[#F4F4F5] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setRepoPage(Math.min(repoTotalPages, repoPage + 1))}
              disabled={repoPage >= repoTotalPages}
              className="w-9 h-9 rounded-xl bg-[#121214] border border-[#2A2A2E] flex items-center justify-center text-[#A1A1AA] hover:text-[#F4F4F5] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Sort Bottom Sheet */}
      <AnimatePresence>
        {isSortSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsSortSheetOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-[#121214] border-t border-x border-[#2A2A2E] rounded-t-[20px] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-5 shadow-2xl z-10"
            >
              <div className="w-10 h-1 bg-[#2A2A2E] rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] mb-3">
                <h3 className="text-sm font-semibold text-[#F4F4F5]">Sort Repositories</h3>
                <button
                  onClick={() => setIsSortSheetOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#1A1A1D] flex items-center justify-center text-[#71717A] hover:text-[#F4F4F5]"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Sort Fields */}
              <div className="space-y-1 mb-4">
                {sortOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setRepoSortBy(item.id);
                      setRepoPage(1);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      repoSortBy === item.id
                        ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30'
                        : 'text-[#A1A1AA] hover:bg-[#1A1A1D] border border-transparent'
                    }`}
                  >
                    <span>{item.label}</span>
                    {repoSortBy === item.id && <Check size={15} />}
                  </button>
                ))}
              </div>

              {/* Direction Toggle */}
              <div className="flex gap-2 pt-2 border-t border-[#2A2A2E]">
                <button
                  onClick={() => {
                    setRepoSortDirection('desc');
                    setRepoPage(1);
                  }}
                  className={`flex-1 h-10 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    repoSortDirection === 'desc'
                      ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                      : 'bg-[#1A1A1D] border-[#2A2A2E] text-[#A1A1AA]'
                  }`}
                >
                  Descending
                </button>
                <button
                  onClick={() => {
                    setRepoSortDirection('asc');
                    setRepoPage(1);
                  }}
                  className={`flex-1 h-10 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    repoSortDirection === 'asc'
                      ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                      : 'bg-[#1A1A1D] border-[#2A2A2E] text-[#A1A1AA]'
                  }`}
                >
                  Ascending
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
