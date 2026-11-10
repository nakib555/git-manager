import { useEffect, useRef, useCallback } from 'react';
import { AppState, Screen, RepoSearchScope, RepoSortBy, RepoSortDirection, RepoTypeFilter, ToastItem, ToastType } from '../../types';

interface UseUISliceParams {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const useUISlice = ({ state, setState }: UseUISliceParams) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark-theme', 'dark');
    document.body.classList.remove('dark-theme', 'dark');
    try {
      localStorage.setItem('theme', 'light');
    } catch (_) {}
  }, [state.theme]);

  const setTheme = (_newTheme: 'dark' | 'light' | 'slate' | 'fantasy' = 'light') => {
    localStorage.setItem("theme", "light");
    setState((prev) => ({ ...prev, theme: 'light' }));
  };

  const toggleTheme = () => {
    localStorage.setItem("theme", "light");
    setState((prev) => ({ ...prev, theme: 'light' }));
  };

  const toastTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
    setState((prev) => {
      const remaining = (prev.toasts || []).filter((t) => t.id !== id);
      const latest = remaining[remaining.length - 1];
      return {
        ...prev,
        toasts: remaining,
        toastMessage: latest ? latest.message : null,
        toastType: latest ? latest.type : 'info',
      };
    });
  }, [setState]);

  const showToast = useCallback((
    msg: string,
    type: ToastType = 'info',
    options?: { duration?: number; title?: string; action?: { label: string; onClick: () => void } }
  ) => {
    const defaultDurations: Record<ToastType, number> = {
      error: 5000,
      warning: 4500,
      success: 3000,
      info: 3000,
    };
    const duration = options?.duration ?? defaultDurations[type];
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newToast: ToastItem = {
      id,
      message: msg,
      type,
      title: options?.title,
      duration,
      action: options?.action,
      createdAt: Date.now(),
    };

    setState((prev) => {
      const currentList = prev.toasts || [];
      // Keep maximum 4 active toasts (FIFO eviction)
      const updatedList = [...currentList, newToast].slice(-4);
      return {
        ...prev,
        toasts: updatedList,
        toastMessage: msg,
        toastType: type,
      };
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      toastTimersRef.current.set(id, timer);
    }
  }, [dismissToast, setState]);

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

  const toggleAdminMode = () => {
    setState((prev) => {
      const next = !prev.adminModeOverride;
      try {
        localStorage.setItem("gm_admin_override", String(next));
      } catch (_) {}
      showToast(next ? "Admin Level Authority Enabled" : "Standard Authority Mode Enabled", "info");
      return { ...prev, adminModeOverride: next };
    });
  };

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
    dismissToast,
    setTheme,
    toggleTheme,
    toggleAdminMode,
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
