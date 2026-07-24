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
  isActionSheetOpen: boolean;
  isDrawerOpen: boolean;
  toastMessage: string | null;
  isSearchFocused: boolean;
  theme: 'dark' | 'light';
  githubToken: string | null;
  githubUser: GitHubUser | null;
  githubRepos: GitHubRepo[];
}

export type AppContextType = AppState & {
  navigate: (screen: Screen) => void;
  openRepo: (repoName: string) => void;
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
};
