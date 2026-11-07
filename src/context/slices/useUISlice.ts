import { useEffect } from 'react';
import { AppState, Screen, RepoSearchScope, RepoSortBy, RepoSortDirection, RepoTypeFilter } from '../../types';

interface UseUISliceParams {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const useUISlice = ({ state, setState }: UseUISliceParams) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    if (state.theme === "dark" || state.theme === "slate" || state.theme === "fantasy") {
      document.documentElement.classList.add("dark-theme");
      document.body.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [state.theme]);

  const setTheme = (newTheme: 'dark' | 'light' | 'slate' | 'fantasy') => {
    const resolvedTheme = newTheme === 'fantasy' ? 'slate' : newTheme;
    localStorage.setItem("theme", resolvedTheme);
    setState((prev) => ({ ...prev, theme: resolvedTheme }));
  };

  const toggleTheme = () => {
    setState((prev) => {
      const cycle: Record<string, 'dark' | 'light' | 'slate'> = {
        dark: 'light',
        light: 'slate',
        slate: 'dark',
        fantasy: 'dark',
      };
      const newTheme = cycle[prev.theme] || 'dark';
      localStorage.setItem("theme", newTheme);
      return { ...prev, theme: newTheme };
    });
  };

  const showToast = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setState((prev) => ({ ...prev, toastMessage: msg, toastType: type }));
  };

  const navigate = (screen: Screen) => {
    localStorage.setItem("currentScreen", screen);
    setState((prev) => ({ ...prev, currentScreen: screen }));
  };

  const openActionSheet = () => setState((prev) => ({ ...prev, isActionSheetOpen: true }));
  const closeActionSheet = () => setState((prev) => ({ ...prev, isActionSheetOpen: false }));
  const openDrawer = () => setState((prev) => ({ ...prev, isDrawerOpen: true }));
  const closeDrawer = () => setState((prev) => ({ ...prev, isDrawerOpen: false }));

  const openModal = (modalType: 'repo' | 'branch' | 'pr' | 'commit' | 'clone' | 'oauth_setup') => {
    setState((prev) => ({ ...prev, activeModal: modalType, isActionSheetOpen: false }));
  };
  const closeModal = () => setState((prev) => (prev.activeModal ? { ...prev, activeModal: null } : prev));

  const closeModals = () => setState((prev) => ({
    ...prev,
    isActionSheetOpen: false,
    isDrawerOpen: false,
    activeModal: null,
  }));

  const setSearchFocus = (focus: boolean) => setState((prev) => ({ ...prev, isSearchFocused: focus }));

  const openCommandPalette = () => setState(prev => ({ ...prev, isCommandPaletteOpen: true }));
  const closeCommandPalette = () => setState(prev => ({ ...prev, isCommandPaletteOpen: false }));
  const toggleCommandPalette = () => setState(prev => ({ ...prev, isCommandPaletteOpen: !prev.isCommandPaletteOpen }));

  const openZipSync = () => {
    if (!state.currentRepo) {
      showToast("Please open a repository first to sync ZIP files.", "warning");
      return;
    }
    setState(prev => ({ ...prev, isZipSyncOpen: true }));
  };
  const closeZipSync = () => setState(prev => ({ ...prev, isZipSyncOpen: false }));
  const toggleZipSync = () => {
    if (!state.currentRepo && !state.isZipSyncOpen) {
      showToast("Please open a repository first to sync ZIP files.", "warning");
      return;
    }
    setState(prev => ({ ...prev, isZipSyncOpen: !prev.isZipSyncOpen }));
  };

  const setRepoPage = (page: number) => setState((prev) => ({ ...prev, repoPage: page }));
  const setRepoSearchQuery = (query: string) => setState((prev) => ({ ...prev, repoSearchQuery: query, repoPage: 1 }));
  const setRepoSearchScope = (scope: RepoSearchScope) => setState((prev) => ({ ...prev, repoSearchScope: scope, repoPage: 1 }));
  const setRepoSortBy = (sortBy: RepoSortBy) => setState((prev) => ({ ...prev, repoSortBy: sortBy, repoPage: 1 }));
  const setRepoSortDirection = (dir: RepoSortDirection) => setState((prev) => ({ ...prev, repoSortDirection: dir, repoPage: 1 }));
  const setRepoTypeFilter = (filter: RepoTypeFilter) => setState((prev) => ({ ...prev, repoTypeFilter: filter, repoPage: 1 }));
  const setRepoLanguageFilter = (lang: string) => setState((prev) => ({ ...prev, repoLanguageFilter: lang, repoPage: 1 }));

  return {
    navigate,
    openActionSheet,
    closeActionSheet,
    openDrawer,
    closeDrawer,
    openModal,
    closeModal,
    closeModals,
    showToast,
    setTheme,
    toggleTheme,
    setSearchFocus,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
    openZipSync,
    closeZipSync,
    toggleZipSync,
    setRepoPage,
    setRepoSearchQuery,
    setRepoSearchScope,
    setRepoSortBy,
    setRepoSortDirection,
    setRepoTypeFilter,
    setRepoLanguageFilter,
  };
};
