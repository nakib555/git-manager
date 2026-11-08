import { GitHubRepo, GitHubUser, GitCommitNode, Screen, AppState } from '../types';
import { DEMO_USER, DEMO_REPOSITORIES, DEMO_COMMITS, DEMO_BRANCHES, DEMO_PRS, DEMO_FILES } from '../data/demoData';
import { formatRelativeTime } from '../mobile/utils/formatters';

export const formatTime = (dateStr?: string | number | Date | null) => {
  return formatRelativeTime(dateStr);
};

export const getLocalRepos = (): GitHubRepo[] => {
  const local = localStorage.getItem("localRepos");
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return [];
};

export const sanitizeGitHubUser = (user: any): GitHubUser | null => {
  if (!user) return null;
  return {
    ...user,
    login: user.login || "github-user",
    name: user.name || user.login || "GitHub User",
  };
};

import { getCatalogOrDefault, isDemoCatalogRepo } from '../data/demoRepoCatalog';

export const getLocalRepoDetails = (
  repoId: string,
  type: "commits" | "branches" | "prs" | "files",
) => {
  if (!repoId) return [];
  const key = `local_details_${repoId}_${type}`;
  const local = localStorage.getItem(key);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        if (type === 'commits' && repoId !== 'nexus-web-engine' && !isDemoCatalogRepo(repoId)) {
          const cleaned = parsed.filter(
            (c: any) => !DEMO_COMMITS.some((dc: any) => dc.hash === c.hash || dc.fullHash === c.fullHash)
          );
          if (cleaned.length !== parsed.length) {
            try { localStorage.setItem(key, JSON.stringify(cleaned)); } catch (_) {}
          }
          return cleaned;
        }
        return parsed;
      }
    } catch (e) {}
  }
  
  if (isDemoCatalogRepo(repoId)) {
    const catalog = getCatalogOrDefault(repoId);
    return catalog[type] || [];
  }
  return [];
};

export const getInitialDefaultState = (): AppState => {
  const storedToken = localStorage.getItem("githubToken");
  const initialDefaultRepo = storedToken ? (localStorage.getItem("currentRepo") || "") : null;
  const initialDefaultOwner = storedToken ? (localStorage.getItem("currentRepoOwner") || "") : null;
  const initialDefaultBranch = storedToken ? (localStorage.getItem("currentBranch") || "") : null;

  return {
    currentScreen: (localStorage.getItem("currentScreen") as Screen) || "dash",
    currentRepo: initialDefaultRepo,
    currentRepoOwner: initialDefaultOwner,
    currentBranch: initialDefaultBranch,
    isActionSheetOpen: false,
    isDrawerOpen: false,
    toastMessage: null,
    toastType: 'info',
    isSearchFocused: false,
    theme: ((localStorage.getItem("theme") as "dark" | "light" | "slate" | "fantasy") === "fantasy" ? "slate" : (localStorage.getItem("theme") as "dark" | "light" | "slate") || "dark"),
    githubToken: storedToken || null,
    githubUser: storedToken
      ? (localStorage.getItem("githubUser") ? sanitizeGitHubUser(JSON.parse(localStorage.getItem("githubUser")!)) : null)
      : null,
    githubRepos: storedToken ? getLocalRepos() : [],
    repoPage: 1,
    repoPerPage: 10,
    repoTotalPages: 1,
    repoSearchQuery: "",
    repoSearchScope: 'personal',
    repoSortBy: 'updated',
    repoSortDirection: 'desc',
    repoTypeFilter: 'all',
    repoLanguageFilter: 'all',
    isFetchingRepos: false,
    activeCommits: storedToken && initialDefaultRepo ? getLocalRepoDetails(initialDefaultRepo, "commits") : [],
    activePRs: storedToken && initialDefaultRepo ? getLocalRepoDetails(initialDefaultRepo, "prs") : [],
    activeBranches: storedToken && initialDefaultRepo ? getLocalRepoDetails(initialDefaultRepo, "branches") : [],
    activeFiles: storedToken && initialDefaultRepo ? getLocalRepoDetails(initialDefaultRepo, "files") : [],
    activeLanguages: {},
    isLoadingRepoDetails: false,
    activeModal: null,
    sessionCommitsCount: parseInt(localStorage.getItem("sessionCommitsCount") || "0", 10),
    recentClones: JSON.parse(localStorage.getItem("recentClones") || "[]"),
    isCommandPaletteOpen: false,
    lastSyncTimestamp: Date.now(),
    isAutoSyncing: false,
    isZipSyncOpen: false,
    tokenScopes: [],
    hasDeleteRepoScope: false,
    adminModeOverride: localStorage.getItem('gm_admin_override') !== 'false',
  };
};
