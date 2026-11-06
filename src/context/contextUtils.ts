import { GitHubRepo, GitHubUser, GitCommitNode, Screen, AppState } from '../types';
import { DEMO_USER, DEMO_REPOSITORIES, DEMO_COMMITS, DEMO_BRANCHES, DEMO_PRS, DEMO_FILES } from '../data/demoData';

export const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 1) {
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    return `${Math.max(1, diffInMins)}m ago`;
  }
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
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

export const getLocalRepoDetails = (
  repoId: string,
  type: "commits" | "branches" | "prs" | "files",
) => {
  const key = `local_details_${repoId}_${type}`;
  const local = localStorage.getItem(key);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  
  if (repoId === "nexus-web-engine" || !repoId) {
    if (type === "files") return DEMO_FILES;
    if (type === "commits") return DEMO_COMMITS;
    if (type === "branches") return DEMO_BRANCHES;
    if (type === "prs") return DEMO_PRS;
  }
  return [];
};

export const getInitialDefaultState = (): AppState => {
  const storedToken = localStorage.getItem("githubToken");
  const initialDefaultRepo = storedToken
    ? (localStorage.getItem("currentRepo") || "")
    : (localStorage.getItem("currentRepo") || "nexus-web-engine");
  const initialDefaultOwner = storedToken
    ? (localStorage.getItem("currentRepoOwner") || "")
    : (localStorage.getItem("currentRepoOwner") || "octodev");
  const initialDefaultBranch = storedToken
    ? (localStorage.getItem("currentBranch") || "")
    : (localStorage.getItem("currentBranch") || "main");

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
      : DEMO_USER,
    githubRepos: storedToken
      ? getLocalRepos()
      : (getLocalRepos().length > 0 ? getLocalRepos() : DEMO_REPOSITORIES),
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
    activeCommits: storedToken
      ? getLocalRepoDetails(initialDefaultRepo, "commits")
      : (getLocalRepoDetails(initialDefaultRepo, "commits").length > 0
          ? getLocalRepoDetails(initialDefaultRepo, "commits")
          : DEMO_COMMITS),
    activePRs: storedToken ? getLocalRepoDetails(initialDefaultRepo, "prs") : DEMO_PRS,
    activeBranches: storedToken ? getLocalRepoDetails(initialDefaultRepo, "branches") : DEMO_BRANCHES,
    activeFiles: storedToken ? getLocalRepoDetails(initialDefaultRepo, "files") : DEMO_FILES,
    activeLanguages: storedToken ? {} : { TypeScript: 68, Rust: 22, CSS: 10 },
    isLoadingRepoDetails: false,
    activeModal: null,
    sessionCommitsCount: parseInt(localStorage.getItem("sessionCommitsCount") || "0", 10),
    recentClones: JSON.parse(localStorage.getItem("recentClones") || "[]"),
    isCommandPaletteOpen: false,
    lastSyncTimestamp: Date.now(),
    isAutoSyncing: false,
    isZipSyncOpen: false,
  };
};
