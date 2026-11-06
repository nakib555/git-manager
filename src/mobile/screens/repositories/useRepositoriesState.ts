import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { filterAndSortRepos } from '../../utils/sortRepos';

export function useRepositoriesState() {
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
    connectGitHub,
    openModal,
    navigate,
    refreshData,
    githubToken,
    showToast,
  } = useAppContext();

  const [syncError, setSyncError] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(repoSearchQuery);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => setRepoSearchQuery(localSearch), 300);
    return () => clearTimeout(handler);
  }, [localSearch, setRepoSearchQuery]);

  useEffect(() => setLocalSearch(repoSearchQuery), [repoSearchQuery]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [repoPage]);

  const [repoPageSize, setRepoPageSize] = useState<number>(10);
  const filteredPersonalRepos = useMemo(() => {
    if (repoSearchScope === 'personal') {
      return filterAndSortRepos(githubRepos, {
        searchQuery: repoSearchQuery,
        scope: repoSearchScope,
        typeFilter: repoTypeFilter,
        sortBy: repoSortBy,
        sortDirection: repoSortDirection,
      });
    }
    return githubRepos;
  }, [repoSearchScope, githubRepos, repoSearchQuery, repoTypeFilter, repoSortBy, repoSortDirection]);

  const totalItems = repoSearchScope === 'personal'
    ? filteredPersonalRepos.length
    : (repoTotalPages * (repoPageSize === -1 ? 100 : repoPageSize));

  const paginatedRepos = useMemo(() => {
    if (repoSearchScope === 'personal') {
      if (repoPageSize === -1) return filteredPersonalRepos;
      const start = (repoPage - 1) * repoPageSize;
      return filteredPersonalRepos.slice(start, start + repoPageSize);
    }
    return githubRepos;
  }, [repoSearchScope, filteredPersonalRepos, githubRepos, repoPage, repoPageSize]);

  return {
    githubRepos,
    openRepo,
    currentRepo,
    repoPage,
    repoPageSize,
    totalItems,
    paginatedRepos,
    syncError,
    localSearch,
    isSortSheetOpen,
    scrollRef,
    repoSearchScope,
    repoTypeFilter,
    repoSortBy,
    repoSortDirection,
    isFetchingRepos,
    githubToken,
    setRepoPage,
    setRepoPageSize,
    setSyncError,
    setLocalSearch,
    setIsSortSheetOpen,
    setRepoSearchScope,
    setRepoTypeFilter,
    setRepoSortBy,
    setRepoSortDirection,
    connectGitHub,
    openModal,
    navigate,
    refreshData,
    showToast,
  };
}
