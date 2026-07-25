export type Screen = 'dash' | 'repos' | 'commits' | 'prs' | 'branches' | 'files' | 'insights' | 'settings';

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
}

export interface AppState {
  currentScreen: Screen;
  currentRepo: string | null;
  currentRepoOwner: string | null;
  isActionSheetOpen: boolean;
  isDrawerOpen: boolean;
  toastMessage: string | null;
  isSearchFocused: boolean;
  theme: 'dark' | 'light';
  githubToken: string | null;
  githubUser: GitHubUser | null;
  githubRepos: GitHubRepo[];
  
  // Repo details state
  activeCommits: any[];
  activePRs: any[];
  activeBranches: any[];
  activeFiles: any[];
  activeLanguages: Record<string, number>;
  isLoadingRepoDetails: boolean;
  activeModal: 'repo' | 'branch' | 'pr' | 'commit' | 'oauth_setup' | null;
  sessionCommitsCount: number;
}

export type AppContextType = AppState & {
  navigate: (screen: Screen) => void;
  openRepo: (repoName: string, owner?: string | null) => void;
  openActionSheet: () => void;
  closeActionSheet: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  showToast: (msg: string) => void;
  closeModals: () => void;
  setSearchFocus: (focus: boolean) => void;
  toggleTheme: () => void;
  connectGitHub: () => void;
  disconnectGitHub: () => void;
  setManualToken: (token: string) => void;
  refreshData: () => Promise<void>;
  
  // Details and local creation actions
  openModal: (modalType: 'repo' | 'branch' | 'pr' | 'commit' | 'oauth_setup') => void;
  closeModal: () => void;
  createLocalRepo: (repo: { name: string; desc: string; isPrivate: boolean; lang: string }) => void;
  createLocalBranch: (branch: { name: string; desc: string }) => void;
  createLocalPR: (pr: { title: string; desc: string; source: string; target: string; isDraft?: boolean }) => void;
  updateLocalPRStatus: (prId: number, status: 'Open' | 'Merged' | 'Closed') => void;
  createLocalCommit: (commit: { msg: string; author: string; hash?: string; add?: string; del?: string }) => void;
  editCommitMessage: (hash: string, newMsg: string) => void;
  deleteCommit: (hash: string) => void;
  amendLatestCommit: (msg: string, contentOnly: boolean, messageOnly: boolean, changes?: { add?: string; del?: string }) => void;
  undoLatestCommit: () => void;
  restoreFilesToCommit: (hash: string) => void;
  resetBranchToCommit: (hash: string) => void;
  createBranchAtCommit: (hash: string, branchName: string) => void;
  createTagAtCommit: (hash: string, tagName: string) => void;
};

