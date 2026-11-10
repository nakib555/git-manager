import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { AppContextType, AppState } from "./types";
import { getInitialDefaultState, formatTime, sanitizeGitHubUser, getLocalRepoDetails, getLocalRepos } from "./context/contextUtils";
import { useUISlice } from "./context/slices/useUISlice";
import { useAuthSlice } from "./context/slices/useAuthSlice";
import { useRepoSlice } from "./context/slices/useRepoSlice";
import { useBranchSlice } from "./context/slices/useBranchSlice";
import { usePRSlice } from "./context/slices/usePRSlice";
import { useCommitSlice } from "./context/slices/useCommitSlice";
import { DEMO_REPOSITORIES } from "./data/demoData";

export { formatTime, sanitizeGitHubUser, getLocalRepoDetails, getLocalRepos };

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(getInitialDefaultState());
  const stateRef = useRef(state);
  stateRef.current = state;
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const uiSlice = useUISlice({ state, setState });
  const repoSlice = useRepoSlice({ state, setState, showToast: uiSlice.showToast });
  const authSlice = useAuthSlice({
    state,
    setState,
    showToast: uiSlice.showToast,
    openModal: uiSlice.openModal,
    fetchGitHubData: repoSlice.fetchGitHubData,
    setRefreshTrigger,
  });
  const branchSlice = useBranchSlice({
    state,
    setState,
    showToast: uiSlice.showToast,
    fetchRepoDetails: repoSlice.fetchRepoDetails,
  });
  const prSlice = usePRSlice({
    state,
    setState,
    showToast: uiSlice.showToast,
    fetchRepoDetails: repoSlice.fetchRepoDetails,
  });
  const commitSlice = useCommitSlice({
    state,
    setState,
    showToast: uiSlice.showToast,
    fetchRepoDetails: repoSlice.fetchRepoDetails,
    setRefreshTrigger,
  });

  // Global shortcut listener for Cmd+K and Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        uiSlice.toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [uiSlice]);

  // Load repositories on token/search change
  useEffect(() => {
    if (state.githubToken) {
      repoSlice.fetchGitHubData(state.githubToken, false, state.repoPage, state.repoSearchQuery);
    } else {
      const local = getLocalRepos();
      const reposToUse = local.length > 0 ? local : DEMO_REPOSITORIES;
      setState(prev => ({
        ...prev,
        githubRepos: reposToUse,
        repoTotalPages: Math.max(1, Math.ceil(reposToUse.length / (prev.repoPerPage || 10))),
      }));
    }
  }, [state.githubToken, state.repoPage, state.repoSearchQuery, state.repoSearchScope, state.repoSortBy, state.repoSortDirection, refreshTrigger]);

  // Load repository details when currentRepo changes
  useEffect(() => {
    if (state.currentRepo) {
      const owner = state.currentRepoOwner || (state.githubToken && state.githubUser?.login ? state.githubUser.login : null);
      if (owner) {
        repoSlice.fetchRepoDetails(state.currentRepo, owner, false, state.currentBranch || undefined);
      } else {
        const matched = state.githubRepos.find(r => r.name === state.currentRepo);
        const resolvedOwner = (matched as any)?.owner?.login || state.currentRepoOwner || '';
        if (resolvedOwner) {
          repoSlice.fetchRepoDetails(state.currentRepo, resolvedOwner, false, state.currentBranch || undefined);
        }
      }
    }
  }, [state.currentRepo, state.githubToken, state.currentRepoOwner, state.currentBranch, refreshTrigger]);


  const refreshData = async () => {
    setState(prev => ({ ...prev, isLoadingRepoDetails: true }));
    await new Promise(r => setTimeout(r, 600));
    if (state.githubToken) {
      await repoSlice.fetchGitHubData(state.githubToken);
      if (state.currentRepo && state.currentRepoOwner) {
        await repoSlice.fetchRepoDetails(state.currentRepo, state.currentRepoOwner, false, state.currentBranch || undefined);
      }
    } else {
      const local = getLocalRepos();
      setState(prev => ({ ...prev, githubRepos: local.length ? local : prev.githubRepos, isLoadingRepoDetails: false }));
    }
    uiSlice.showToast("Data refreshed successfully", "success");
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        ...uiSlice,
        ...authSlice,
        ...repoSlice,
        ...branchSlice,
        ...prSlice,
        ...commitSlice,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};
