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
  let isDemoParam = false;
  try {
    const params = new URLSearchParams(window.location.search);
    isDemoParam = params.get('demo') === '1' || params.get('autostart') === '1';
    if (isDemoParam && !storedToken) {
      localStorage.setItem('gm_demo_mode', 'true');
    }
  } catch (_) {}
  const storedDemo = !storedToken && (localStorage.getItem('gm_demo_mode') === 'true' || isDemoParam);
  const initialDefaultRepo = storedToken
    ? (localStorage.getItem("currentRepo") || "")
    : storedDemo
      ? (localStorage.getItem("currentRepo") || "nexus-web-engine")
      : null;
  const initialDefaultOwner = storedToken
    ? (localStorage.getItem("currentRepoOwner") || "")
    : storedDemo
      ? (localStorage.getItem("currentRepoOwner") || "octodev")
      : null;
  const initialDefaultBranch = storedToken
    ? (localStorage.getItem("currentBranch") || "")
    : storedDemo
      ? (localStorage.getItem("currentBranch") || "main")
      : null;
  const storedTheme = localStorage.getItem("theme");
  const initialTheme: AppState['theme'] = storedTheme === 'light' ? 'light' : 'dark';
  const localRepos = getLocalRepos();
  const initialRepos = storedToken ? localRepos : storedDemo ? (localRepos.length > 0 ? localRepos : DEMO_REPOSITORIES) : [];

  return {
    currentScreen: (localStorage.getItem("currentScreen") as Screen) || "dash",
    currentRepo: initialDefaultRepo,
    currentRepoOwner: initialDefaultOwner,
    currentBranch: initialDefaultBranch,
    isActionSheetOpen: false,
    isDrawerOpen: false,
    toastMessage: null,
    toastType: 'info',
    toasts: [],
    isSearchFocused: false,
    theme: initialTheme,
    demoMode: storedDemo,
    githubToken: storedToken || null,
    githubUser: storedToken
      ? (localStorage.getItem("githubUser") ? sanitizeGitHubUser(JSON.parse(localStorage.getItem("githubUser")!)) : null)
      : null,
    githubRepos: initialRepos,
    repoPage: 1,
    repoPerPage: 10,
    repoTotalPages: Math.max(1, Math.ceil(initialRepos.length / 10)),
    repoSearchQuery: "",
    repoSearchScope: 'personal',
    repoSortBy: 'updated',
    repoSortDirection: 'desc',
    repoTypeFilter: 'all',
    repoLanguageFilter: 'all',
    isFetchingRepos: false,
    activeCommits: (storedToken || storedDemo) && initialDefaultRepo ? getLocalRepoDetails(initialDefaultRepo, "commits") : [],
    activePRs: (storedToken || storedDemo) && initialDefaultRepo ? getLocalRepoDetails(initialDefaultRepo, "prs") : [],
    activeBranches: (storedToken || storedDemo) && initialDefaultRepo ? getLocalRepoDetails(initialDefaultRepo, "branches") : [],
    activeFiles: (storedToken || storedDemo) && initialDefaultRepo ? getLocalRepoDetails(initialDefaultRepo, "files") : [],
    activeLanguages: storedDemo && initialDefaultRepo ? (getCatalogOrDefault(initialDefaultRepo).languages || {}) : {},
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
