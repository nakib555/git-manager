export type Screen = 'dash' | 'repos' | 'commits' | 'prs' | 'branches' | 'files' | 'insights' | 'settings' | 'clone' | 'activity';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  followers: number;
  following: number;
  bio?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  private: boolean;
  description: string;
  language: string;
  pushed_at: string;
  updated_at?: string;
  fork?: boolean;
  owner?: {
    login: string;
    avatar_url?: string;
  };
  stargazers_count?: number;
  forks_count?: number;
  watchers_count?: number;
}

export type RepoSearchScope = 'personal' | 'global';
export type RepoSortBy = 'updated' | 'stars' | 'forks' | 'name' | 'language';
export type RepoSortDirection = 'desc' | 'asc';
export type RepoTypeFilter = 'all' | 'public' | 'private' | 'forks' | 'sources';

export interface GitCommitNode {
  hash: string;
  fullHash: string;
  timestamp: string;
  msg: string;
  author: string;
  time: string;
  avatar?: string;
  avatarUrl?: string;
  add?: string;
  del?: string;
  parents?: string[];
  isPrimary?: boolean;
  date?: string;
  stats?: any;
  files?: any[];
}

export interface AppState {
  currentScreen: Screen;
  currentRepo: string | null;
  currentRepoOwner: string | null;
  currentBranch: string | null;
  isActionSheetOpen: boolean;
  isDrawerOpen: boolean;
  toastMessage: string | null;
  toastType: 'info' | 'success' | 'warning' | 'error';
  isSearchFocused: boolean;
  theme: 'dark' | 'light' | 'slate' | 'fantasy';
  githubToken: string | null;
  githubUser: GitHubUser | null;
  githubRepos: GitHubRepo[];
  repoPage: number;
  repoPerPage: number;
  repoTotalPages: number;
  repoSearchQuery: string;
  repoSearchScope: RepoSearchScope;
  repoSortBy: RepoSortBy;
  repoSortDirection: RepoSortDirection;
  repoTypeFilter: RepoTypeFilter;
  repoLanguageFilter: string;
  isFetchingRepos: boolean;
  
  // Repo details state
  activeCommits: GitCommitNode[];
  activePRs: any[];
  activeBranches: any[];
  activeFiles: any[];
  activeLanguages: Record<string, number>;
  isLoadingRepoDetails: boolean;
  activeModal: 'repo' | 'branch' | 'pr' | 'commit' | 'clone' | 'oauth_setup' | null;
  sessionCommitsCount: number;
  recentClones: { name: string; url: string; dest: string; timestamp: number }[];
  isCommandPaletteOpen: boolean;
  lastSyncTimestamp: number;
  isAutoSyncing: boolean;
}

export type AppContextType = AppState & {
  navigate: (screen: Screen) => void;
  openRepo: (repoName: string, owner?: string | null) => void;
  setRepoPage: (page: number) => void;
  setRepoSearchQuery: (query: string) => void;
  switchBranch: (branchName: string) => Promise<void>;
  openActionSheet: () => void;
  closeActionSheet: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  setRepoSearchScope: (scope: RepoSearchScope) => void;
  setRepoSortBy: (sortBy: RepoSortBy) => void;
  setRepoSortDirection: (dir: RepoSortDirection) => void;
  setRepoTypeFilter: (filter: RepoTypeFilter) => void;
  setRepoLanguageFilter: (lang: string) => void;
  closeModals: () => void;
  setSearchFocus: (focus: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light' | 'slate' | 'fantasy') => void;
  connectGitHub: () => void;
  disconnectGitHub: () => void;
  setManualToken: (token: string) => void;
  refreshData: () => Promise<void>;
  
  // Details and local creation actions
  openModal: (modalType: 'repo' | 'branch' | 'pr' | 'commit' | 'clone' | 'oauth_setup') => void;
  closeModal: () => void;
  addRecentClone: (clone: { name: string; url: string; dest: string; timestamp: number }) => void;
  cloneRepository: (repo: { url: string; destFolder: string; branch: string; shallow: boolean; submodules: boolean }) => void;
  createLocalRepo: (repo: { name: string; desc: string; isPrivate: boolean; lang: string }) => void;
  createLocalBranch: (branch: { name: string; desc: string }) => void;
  deleteBranch: (branchName: string) => Promise<void>;
  createLocalPR: (pr: { title: string; desc: string; source: string; target: string; isDraft?: boolean }) => void;
  updateLocalPRStatus: (prId: number, status: 'Open' | 'Merged' | 'Closed', strategy?: 'merge' | 'squash') => Promise<void>;
  createLocalCommit: (commit: { msg: string; author: string; hash?: string; add?: string; del?: string }) => void;
  editCommitMessage: (hash: string, newMsg: string) => void;
  deleteCommit: (hash: string) => void;
  amendLatestCommit: (msg: string, contentOnly: boolean, messageOnly: boolean, changes?: { add?: string; del?: string }) => void;
  undoLatestCommit: () => void;
  restoreFilesToCommit: (hash: string) => void;
  resetBranchToCommit: (hash: string) => void;
  createBranchAtCommit: (hash: string, branchName: string) => void;
  createTagAtCommit: (hash: string, tagName: string) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
};

