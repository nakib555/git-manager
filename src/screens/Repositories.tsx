import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { 
  Search, Lock, Globe, FolderGit2, Star, GitFork, Eye, 
  ChevronLeft, ChevronRight, Loader2, Sliders, ArrowUpDown, 
  ArrowUp, ArrowDown, X, Sparkles, Filter, Check
} from 'lucide-react';
import { AnimatedSearchIcon, AnimatedGlobe, AnimatedLock } from '../components/Layout';
import { GitHubRepo, RepoSearchScope, RepoSortBy, RepoSortDirection, RepoTypeFilter } from '../types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'motion/react';

const getLanguageColor = (lang: string | null) => {
  if (!lang) return '#8F8F9D';
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Rust: '#DEA584',
    Swift: '#F05138',
    Go: '#00ADD8',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Shell: '#89e051',
  };
  return colors[lang] || '#8F8F9D';
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return 'recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 0) return 'just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const Repositories: React.FC = () => {
  const { 
    openRepo, 
    showToast, 
    isSearchFocused, 
    githubRepos,
    repoPage,
    repoPerPage,
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
    repoLanguageFilter,
    setRepoLanguageFilter,
    isFetchingRepos
  } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState(repoSearchQuery);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchFocused && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchFocused]);

  // Sync searchQuery from parent context initially
  useEffect(() => {
    setSearchQuery(repoSearchQuery);
  }, [repoSearchQuery]);

  // Debounce search query changes to global state
  useEffect(() => {
    const handler = setTimeout(() => {
      setRepoSearchQuery(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery, setRepoSearchQuery]);

  // Scroll list to top when page changes
  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = 0;
    }
  }, [repoPage]);

  // Map raw repo objects to standard visual items
  const displayRepos = useMemo(() => {
    return (githubRepos || []).map((repo: GitHubRepo) => {
      const lang = repo.language || 'Unknown';
      return {
        id: repo.name,
        name: repo.name,
        owner: (repo as any).owner?.login || null,
        isPrivate: !!repo.private,
        isFork: !!(repo as any).fork,
        desc: repo.description || 'No description provided.',
        lang,
        langColor: getLanguageColor(lang),
        rawPushedAt: repo.pushed_at || new Date().toISOString(),
        updated: formatTime(repo.pushed_at),
        icon: FolderGit2,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        watching: repo.watchers_count || 0,
      };
    });
  }, [githubRepos]);

  // Extract all distinct languages available
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    displayRepos.forEach(r => {
      if (r.lang && r.lang !== 'Unknown') langs.add(r.lang);
    });
    return Array.from(langs).sort();
  }, [displayRepos]);

  // Filter & Sort Pipeline
  const filteredAndSortedRepos = useMemo(() => {
    let result = [...displayRepos];

    // 1. Text Search filtering for personal scope
    if (repoSearchScope === 'personal' && searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(repo => 
        repo.name.toLowerCase().includes(q) ||
        repo.desc.toLowerCase().includes(q) ||
        repo.lang.toLowerCase().includes(q) ||
        (repo.owner && repo.owner.toLowerCase().includes(q))
      );
    }

    // 2. Type filtering
    if (repoTypeFilter === 'private') {
      result = result.filter(r => r.isPrivate);
    } else if (repoTypeFilter === 'public') {
      result = result.filter(r => !r.isPrivate);
    } else if (repoTypeFilter === 'forks') {
      result = result.filter(r => r.isFork);
    } else if (repoTypeFilter === 'sources') {
      result = result.filter(r => !r.isFork);
    }

    // 3. Language filtering
    if (repoLanguageFilter !== 'all') {
      result = result.filter(r => r.lang.toLowerCase() === repoLanguageFilter.toLowerCase());
    }

    // 4. Multi-dimension Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (repoSortBy) {
        case 'stars':
          comparison = a.stars - b.stars;
          break;
        case 'forks':
          comparison = a.forks - b.forks;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'language':
          comparison = a.lang.localeCompare(b.lang);
          break;
        case 'updated':
        default:
          comparison = new Date(a.rawPushedAt).getTime() - new Date(b.rawPushedAt).getTime();
          break;
      }
      return repoSortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [displayRepos, repoSearchScope, searchQuery, repoTypeFilter, repoLanguageFilter, repoSortBy, repoSortDirection]);

  // Calculate actual pagination
  const totalPages = useMemo(() => {
    if (repoSearchScope === 'personal') {
      return Math.max(1, Math.ceil(filteredAndSortedRepos.length / repoPerPage));
    }
    return repoTotalPages;
  }, [repoSearchScope, filteredAndSortedRepos.length, repoPerPage, repoTotalPages]);

  // Page sliced items
  const paginatedRepos = useMemo(() => {
    if (repoSearchScope === 'personal') {
      const start = (repoPage - 1) * repoPerPage;
      return filteredAndSortedRepos.slice(start, start + repoPerPage);
    }
    return filteredAndSortedRepos;
  }, [repoSearchScope, filteredAndSortedRepos, repoPage, repoPerPage]);

  const rowVirtualizer = useVirtualizer({
    count: paginatedRepos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 170,
    overscan: 4,
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setRepoSearchQuery('');
    setRepoTypeFilter('all');
    setRepoLanguageFilter('all');
    setRepoSortBy('updated');
    setRepoSortDirection('desc');
    setRepoPage(1);
    showToast('Filters reset to default', 'info');
  };

  const hasActiveCustomFilters = 
    repoTypeFilter !== 'all' || 
    repoLanguageFilter !== 'all' || 
    repoSortBy !== 'updated' || 
    repoSortDirection !== 'desc';

  return (
    <div className="animate-fade-up flex flex-col flex-1 min-h-0 w-full px-5">
      {/* 1. Sticky Controls Header Strip */}
      <div className="space-y-3.5 mb-4 shrink-0 pt-3">
        {/* Scope Selector: Personal vs Global Segmented Control */}
        <div className="flex bg-[#1A1A1D] p-1 rounded-xl border border-[#2A2A2E] h-10 w-full shadow-inner">
          <button
            onClick={() => {
              if (repoSearchScope !== 'personal') {
                setRepoSearchScope('personal');
                setRepoPage(1);
                showToast('Searching personal & local repositories', 'info');
              }
            }}
            className={`flex-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              repoSearchScope === 'personal'
                ? 'bg-[#242428] text-[#F4F4F5] shadow-sm font-bold border border-[#2A2A2E]'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
            }`}
          >
            <FolderGit2 size={14} className={repoSearchScope === 'personal' ? 'text-[#3B82F6]' : ''} />
            <span>Personal</span>
          </button>
          <button
            onClick={() => {
              if (repoSearchScope !== 'global') {
                setRepoSearchScope('global');
                setRepoPage(1);
                showToast('Searching entire GitHub directory', 'info');
              }
            }}
            className={`flex-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              repoSearchScope === 'global'
                ? 'bg-[#242428] text-[#F4F4F5] shadow-sm font-bold border border-[#2A2A2E]'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
            }`}
          >
            <Globe size={14} className={repoSearchScope === 'global' ? 'text-[#3B82F6]' : ''} />
            <span>Global GitHub</span>
          </button>
        </div>

        {/* Search Input & Sort Action Row */}
        <div className="flex items-center gap-2.5">
          <div className="bg-[#1A1A1D] rounded-[10px] px-3.5 h-11 flex items-center gap-2.5 border border-[#2A2A2E] flex-1 relative shadow-xs">
            <AnimatedSearchIcon size={17} className="text-[#71717A] shrink-0" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder={repoSearchScope === 'personal' ? "Filter personal repos..." : "Search GitHub..."} 
              className="bg-transparent border-none text-[#F4F4F5] w-full outline-none text-sm placeholder:text-[#71717A] pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[#71717A] hover:text-[#F4F4F5] p-1 cursor-pointer"
                title="Clear search query"
              >
                <X size={15} />
              </button>
            )}
            {isFetchingRepos && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <Loader2 size={16} className="text-[#3B82F6] animate-spin" />
              </div>
            )}
          </div>

          {/* Sort & Filter Button (44px target) */}
          <button
            onClick={() => setIsConfigDrawerOpen(true)}
            className={`w-11 h-11 rounded-[10px] border flex items-center justify-center transition-all cursor-pointer relative shrink-0 ${
              hasActiveCustomFilters 
                ? 'bg-[#3B82F6]/15 border-[#3B82F6]/40 text-[#3B82F6]' 
                : 'bg-[#1A1A1D] border-[#2A2A2E] text-[#A1A1AA] hover:text-[#F4F4F5]'
            }`}
            title="Sort and Filter Options"
          >
            <Sliders size={17} />
            {hasActiveCustomFilters && (
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] absolute top-1.5 right-1.5 ring-2 ring-[#121214]" />
            )}
          </button>
        </div>

        {/* Filter Chips Horizontal Strip */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 w-full">
            {(['all', 'public', 'private', 'forks', 'sources'] as RepoTypeFilter[]).map((type) => {
              const isActive = repoTypeFilter === type;
              const labels: Record<RepoTypeFilter, string> = {
                all: 'All',
                public: 'Public',
                private: 'Private',
                forks: 'Forks',
                sources: 'Sources'
              };
              return (
                <button
                  key={type}
                  onClick={() => {
                    setRepoTypeFilter(type);
                    setRepoPage(1);
                  }}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                    isActive
                      ? 'bg-[#3B82F6]/15 border-[#3B82F6]/40 text-[#3B82F6] font-bold shadow-xs'
                      : 'bg-[#1A1A1D] border-[#2A2A2E] text-[#A1A1AA] hover:text-[#F4F4F5]'
                  }`}
                >
                  {type === 'public' && <Globe size={12} />}
                  {type === 'private' && <Lock size={12} />}
                  {type === 'forks' && <GitFork size={12} />}
                  <span>{labels[type]}</span>
                </button>
              );
            })}
          </div>
          <span className="text-xs font-mono text-[#71717A] shrink-0 tabular-nums hidden sm:inline">
            {filteredAndSortedRepos.length}
          </span>
        </div>

        {/* Native Sliding Sort & Filter Bottom Sheet */}
        <AnimatePresence>
          {isConfigDrawerOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[110]"
                onClick={() => setIsConfigDrawerOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-[#121214] border-t border-[#2A2A2E] rounded-t-[20px] z-[111] px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl max-h-[85vh] overflow-y-auto"
              >
                {/* Tactile Drag Handle */}
                <div className="w-9 h-1 bg-[#2A2A2E] rounded-full mx-auto mb-4" />

                <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
                  <div>
                    <h3 className="text-base font-semibold text-[#F4F4F5]">Sort & Filter</h3>
                    <p className="text-xs text-[#A1A1AA]">Customize repository ranking and visibility</p>
                  </div>
                  {hasActiveCustomFilters && (
                    <button 
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-[#EF4444] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Sort Dimensions */}
                <div className="py-4 space-y-2.5">
                  <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider block">Sort by</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'updated', label: 'Recently Updated' },
                      { key: 'stars', label: 'Most Stars' },
                      { key: 'forks', label: 'Most Forks' },
                      { key: 'name', label: 'Repository Name' },
                      { key: 'language', label: 'Language' },
                    ].map((item) => {
                      const isSelected = repoSortBy === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            setRepoSortBy(item.key as RepoSortBy);
                            setRepoPage(1);
                          }}
                          className={`h-11 px-3.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-[#3B82F6]/50 bg-[#3B82F6]/10 text-[#3B82F6] font-bold'
                              : 'border-[#2A2A2E] bg-[#1A1A1D] text-[#A1A1AA] hover:text-[#F4F4F5]'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {isSelected && <Check size={14} className="text-[#3B82F6] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort Direction & Language Filter */}
                <div className="space-y-4 pt-2 border-t border-[#2A2A2E]">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider block">Order</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRepoSortDirection('desc')}
                        className={`h-10 flex-1 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          repoSortDirection === 'desc'
                            ? 'bg-[#3B82F6] text-white border-[#3B82F6] font-bold shadow-xs'
                            : 'bg-[#1A1A1D] border-[#2A2A2E] text-[#A1A1AA] hover:text-[#F4F4F5]'
                        }`}
                      >
                        <ArrowDown size={14} />
                        <span>Descending</span>
                      </button>
                      <button
                        onClick={() => setRepoSortDirection('asc')}
                        className={`h-10 flex-1 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          repoSortDirection === 'asc'
                            ? 'bg-[#3B82F6] text-white border-[#3B82F6] font-bold shadow-xs'
                            : 'bg-[#1A1A1D] border-[#2A2A2E] text-[#A1A1AA] hover:text-[#F4F4F5]'
                        }`}
                      >
                        <ArrowUp size={14} />
                        <span>Ascending</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider block">Language</span>
                    <select
                      value={repoLanguageFilter}
                      onChange={(e) => {
                        setRepoLanguageFilter(e.target.value);
                        setRepoPage(1);
                      }}
                      className="h-11 w-full bg-[#1A1A1D] border border-[#2A2A2E] text-[#F4F4F5] rounded-xl px-4 text-xs font-semibold outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
                    >
                      <option value="all">All Languages</option>
                      {availableLanguages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setIsConfigDrawerOpen(false)}
                    className="w-full h-11 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-[#3B82F6]/20 mt-2"
                  >
                    Apply Filters ({filteredAndSortedRepos.length} results)
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Repository List Viewport */}
      <div className="flex-1 overflow-hidden relative min-h-0">
        {paginatedRepos.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 border border-border text-center flex flex-col items-center justify-center my-4 h-64">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <FolderGit2 size={24} />
            </div>
            <p className="font-semibold text-sm mb-1 text-text-main">No repositories found</p>
            <p className="text-xs text-text-muted max-w-[280px] leading-relaxed mb-3">
              {searchQuery || hasActiveCustomFilters
                ? 'No repositories match your active search terms or filters.'
                : 'Create a new repository or connect GitHub to view your repositories.'}
            </p>
            {(searchQuery || hasActiveCustomFilters) && (
              <button
                onClick={clearAllFilters}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <div 
            ref={parentRef} 
            className={`overflow-y-auto no-scrollbar h-full w-full transition-opacity duration-200 ${
              isFetchingRepos ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const repo = paginatedRepos[virtualItem.index];
                if (!repo) return null;
                const Icon = repo.icon;
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
                      paddingBottom: '16px',
                    }}
                  >
                    <div 
                      className="bg-card p-4 rounded-xl cursor-pointer transition-all duration-200 hover:border-primary/40 border border-border h-full flex flex-col justify-between shadow-xs group"
                      onClick={() => openRepo(repo.id, repo.owner)}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Icon size={16} />
                          </div>
                          <span className="font-mono text-sm font-semibold text-text-main group-hover:text-primary transition-colors truncate">
                            {repo.name}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border border-border text-text-muted flex items-center gap-1 shrink-0 bg-hover/20">
                          {repo.isPrivate ? <AnimatedLock size={10} className="text-text-muted" /> : <AnimatedGlobe size={10} className="text-text-muted" />}
                          <span>{repo.isPrivate ? 'Private' : 'Public'}</span>
                        </div>
                      </div>

                      <div className="text-xs text-text-muted mb-3 line-clamp-2 leading-relaxed">{repo.desc}</div>
                      
                      {/* Repo Stats */}
                      <div className="flex items-center gap-4 text-xs text-text-muted mb-2 border-t border-border/80 pt-2">
                        <span className="flex items-center gap-1.5" title="Stars">
                          <Star size={12} className="text-amber-500 fill-amber-500/10" />
                          <span className="font-medium text-text-main">{repo.stars.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1.5" title="Forks">
                          <GitFork size={12} className="text-blue-500" />
                          <span className="font-medium text-text-main">{repo.forks.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1.5" title="Watching">
                          <Eye size={12} className="text-emerald-500" />
                          <span className="font-medium text-text-main">{repo.watching.toLocaleString()}</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-text-muted mt-auto pt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: repo.langColor }} />
                          <span>{repo.lang}</span>
                        </span>
                        <span className="text-[11px] text-text-muted/80">Updated {repo.updated}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Pagination Footer with Non-Overlapping Spacing */}
      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between gap-2 h-12 py-2 mt-2 border-t border-border bg-card/60 rounded-xl px-4 shadow-xs">
          <div className="text-xs text-text-muted font-medium whitespace-nowrap">
            Page <span className="font-bold text-text-main">{repoPage}</span> of {totalPages}
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setRepoPage(Math.max(1, repoPage - 1))}
              disabled={repoPage === 1 || isFetchingRepos}
              className="w-8 h-8 rounded-lg border border-border text-text-main disabled:opacity-30 disabled:cursor-not-allowed hover:bg-hover transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Smart Windowed Page Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - repoPage) <= 1)
                .map((pageNum, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && pageNum - prev > 1;
                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsis && (
                        <span className="text-text-muted text-xs px-1 select-none">...</span>
                      )}
                      <button
                        onClick={() => setRepoPage(pageNum)}
                        disabled={isFetchingRepos}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all disabled:opacity-50 cursor-pointer ${
                          repoPage === pageNum 
                            ? 'bg-primary text-white font-bold shadow-xs' 
                            : 'text-text-main hover:bg-hover border border-transparent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button 
              onClick={() => setRepoPage(Math.min(totalPages, repoPage + 1))}
              disabled={repoPage === totalPages || isFetchingRepos}
              className="w-8 h-8 rounded-lg border border-border text-text-main disabled:opacity-30 disabled:cursor-not-allowed hover:bg-hover transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
