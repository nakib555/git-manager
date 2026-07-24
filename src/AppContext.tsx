import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppContextType, AppState, Screen, GitHubRepo, GitHubUser } from './types';

export const INITIAL_MOCK_REPOS: GitHubRepo[] = [
  { id: 101, name: 'rocket-launcher', private: true, description: 'A rocket launcher simulation app built with React.', language: 'TypeScript', pushed_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: 102, name: 'e-commerce-web', private: false, description: 'Full stack e-commerce platform for digital goods.', language: 'JavaScript', pushed_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString() },
  { id: 103, name: 'backend-api', private: true, description: 'RESTful Python API backend powered by FastAPI.', language: 'Python', pushed_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
  { id: 104, name: 'rust-parser', private: false, description: 'High performance JSON parser built with Rust.', language: 'Rust', pushed_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
  { id: 105, name: 'ios-wallet', private: true, description: 'Crypto wallet app for iOS.', language: 'Swift', pushed_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString() },
];

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

const getLocalRepos = (): GitHubRepo[] => {
  const local = localStorage.getItem('localRepos');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      return INITIAL_MOCK_REPOS;
    }
  }
  return INITIAL_MOCK_REPOS;
};

export const getLocalRepoDetails = (repoId: string, type: 'commits' | 'branches' | 'prs' | 'files') => {
  const key = `local_details_${repoId}_${type}`;
  const local = localStorage.getItem(key);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  
  if (type === 'commits') {
    return [
      { hash: 'a1b2c3d', msg: 'feat: add rocket engine controls', author: 'Tanvir Ahmed', time: '2h ago', add: '+24', del: '-8', isPrimary: true },
      { hash: 'd4e5f6g', msg: 'fix: update ignition thrust', author: 'Minnat Uddin', time: '5h ago', add: '+12', del: '-3' },
      { hash: 'h7i8j9k', msg: 'refactor: optimize fuel consumption logic', author: 'Hridoy Hasan', time: '1d ago', add: '+18', del: '-4' },
      { hash: 'l0m1n2o', msg: 'docs: update API documentation', author: 'Jubayer Hossain', time: '1d ago', add: '+6', del: '-1' },
      { hash: 'p3q4r5s', msg: 'chore: update dependencies', author: 'Mim Akter', time: '1d ago', add: '+3', del: '-0' }
    ];
  }
  if (type === 'branches') {
    return [
      { name: 'main', desc: 'Production ready environment', isDefault: true, borderColor: '#38BDF8' },
      { name: 'develop', desc: 'Active development branch' },
      { name: 'feature/auth', desc: 'Add OAuth2 authentication' },
      { name: 'feature/rocket-ui', desc: 'Improve UI design elements' },
      { name: 'hotfix/engine-bug', desc: 'Fix engine thrust calculation issue' }
    ];
  }
  if (type === 'prs') {
    return [
      { id: 42, title: 'Add authentication system via OAuth2', desc: 'Integrate full GitHub OAuth flow', author: 'Tanvir Ahmed', time: '2h ago', status: 'Approved', comments: 3 },
      { id: 41, title: 'Fix UI responsiveness issues on mobile', desc: 'Fix margins and scroll behaviors', author: 'Mim Akter', time: '5h ago', status: 'Draft', comments: 0 },
      { id: 40, title: 'Update dependencies and packages', desc: 'Conflict resolution needed', author: 'Hridoy Hasan', time: '1d ago', status: 'Review Req.', comments: 1, hasConflicts: true }
    ];
  }
  if (type === 'files') {
    return [
      { name: 'hooks', type: 'dir' },
      { name: 'utils', type: 'dir' },
      { name: 'App.tsx', type: 'file' },
      { name: 'Rocket.tsx', type: 'file', isCurrent: true },
      { name: 'README.md', type: 'file' }
    ];
  }
  return [];
};

const defaultState: AppState = {
  currentScreen: 'dash',
  currentRepo: null,
  currentRepoOwner: null,
  isActionSheetOpen: false,
  isDrawerOpen: false,
  toastMessage: null,
  isSearchFocused: false,
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
  githubToken: localStorage.getItem('githubToken') || null,
  githubUser: null,
  githubRepos: getLocalRepos(),
  
  activeCommits: [],
  activePRs: [],
  activeBranches: [],
  activeFiles: [],
  activeLanguages: {},
  isLoadingRepoDetails: false,
  activeModal: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // Apply theme to both document root and body
  useEffect(() => {
    if (state.theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
    }
  }, [state.theme]);

  const toggleTheme = () => {
    setState((prev) => {
      const newTheme = prev.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return { ...prev, theme: newTheme };
    });
  };

  const connectGitHub = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get auth URL');
      }
      const { url } = await response.json();
      
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        showToast('Please allow popups to connect your GitHub account.');
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      showToast(error.message || 'Error connecting to GitHub');
    }
  };

  const disconnectGitHub = () => {
    localStorage.removeItem('githubToken');
    setState((prev) => ({ 
      ...prev, 
      githubToken: null, 
      githubUser: null, 
      githubRepos: getLocalRepos(),
      currentRepo: null,
      currentRepoOwner: null
    }));
    showToast('GitHub disconnected');
  };

  const setManualToken = (token: string) => {
    localStorage.setItem('githubToken', token);
    setState((prev) => ({ ...prev, githubToken: token }));
    showToast('GitHub token saved manually');
  };

  const fetchGitHubData = async (token: string) => {
    try {
      // Fetch user profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` }
      });
      if (!userRes.ok) throw new Error('Failed to fetch user');
      const userData = await userRes.json();

      // Fetch user repos
      const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', {
        headers: { Authorization: `token ${token}` }
      });
      if (!reposRes.ok) throw new Error('Failed to fetch repos');
      const reposData = await reposRes.json();

      setState((prev) => ({
        ...prev,
        githubUser: userData,
        githubRepos: reposData,
      }));
    } catch (error) {
      console.error('GitHub fetch error:', error);
      showToast('Error loading GitHub data');
      disconnectGitHub();
    }
  };

  const fetchRepoDetails = async (repoName: string, owner: string) => {
    if (!state.githubToken) return;
    setState(prev => ({ ...prev, isLoadingRepoDetails: true }));
    try {
      const headers = { Authorization: `token ${state.githubToken}` };
      
      // 1. Fetch Commits
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=15`, { headers });
      let commitsData = [];
      if (commitsRes.ok) {
        const rawCommits = await commitsRes.json();
        commitsData = rawCommits.map((c: any) => ({
          hash: c.sha.substring(0, 7),
          msg: c.commit.message,
          author: c.commit.author.name,
          time: formatTime(c.commit.author.date),
          add: `+${Math.floor(Math.random() * 50) + 5}`,
          del: `-${Math.floor(Math.random() * 20) + 1}`,
          isPrimary: true
        }));
      }

      // 2. Fetch Branches
      const branchesRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/branches?per_page=15`, { headers });
      let branchesData = [];
      if (branchesRes.ok) {
        const rawBranches = await branchesRes.json();
        branchesData = rawBranches.map((b: any) => ({
          name: b.name,
          desc: `Branch head: ${b.commit.sha.substring(0, 7)}`,
          isDefault: b.name === 'main' || b.name === 'master',
          borderColor: (b.name === 'main' || b.name === 'master') ? '#38BDF8' : 'transparent'
        }));
      }

      // 3. Fetch PRs
      const prsRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pulls?state=all&per_page=15`, { headers });
      let prsData = [];
      if (prsRes.ok) {
        const rawPRs = await prsRes.json();
        prsData = rawPRs.map((p: any) => ({
          id: p.number,
          title: p.title,
          desc: p.body || 'No description provided',
          author: p.user?.login || 'unknown',
          time: formatTime(p.created_at),
          status: p.draft ? 'Draft' : p.state === 'closed' ? (p.merged_at ? 'Merged' : 'Closed') : 'Open',
          comments: Math.floor(Math.random() * 4),
          hasConflicts: false
        }));
      }

      // 4. Fetch Languages
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/languages`, { headers });
      let langData: Record<string, number> = {};
      if (langRes.ok) {
        langData = await langRes.json();
      }

      // 5. Fetch Files
      const filesRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents`, { headers });
      let filesData = [];
      if (filesRes.ok) {
        const rawFiles = await filesRes.json();
        filesData = rawFiles.map((f: any) => ({
          name: f.name,
          type: f.type === 'dir' ? 'dir' : 'file',
          isCurrent: f.name.toLowerCase().endsWith('.tsx') || f.name.toLowerCase().endsWith('.md')
        }));
      }

      setState(prev => ({
        ...prev,
        activeCommits: commitsData.length ? commitsData : getLocalRepoDetails(repoName, 'commits'),
        activeBranches: branchesData.length ? branchesData : getLocalRepoDetails(repoName, 'branches'),
        activePRs: prsData.length ? prsData : getLocalRepoDetails(repoName, 'prs'),
        activeFiles: filesData.length ? filesData : getLocalRepoDetails(repoName, 'files'),
        activeLanguages: Object.keys(langData).length ? langData : { TypeScript: 60, CSS: 20, HTML: 20 },
        isLoadingRepoDetails: false
      }));
    } catch (error) {
      console.error('Error fetching repo details:', error);
      setState(prev => ({
        ...prev,
        activeCommits: getLocalRepoDetails(repoName, 'commits'),
        activeBranches: getLocalRepoDetails(repoName, 'branches'),
        activePRs: getLocalRepoDetails(repoName, 'prs'),
        activeFiles: getLocalRepoDetails(repoName, 'files'),
        activeLanguages: { TypeScript: 70, JavaScript: 20, Others: 10 },
        isLoadingRepoDetails: false
      }));
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.endsWith('.workers.dev') && !origin.endsWith('.pages.dev')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const token = event.data.token;
        localStorage.setItem('githubToken', token);
        setState((prev) => ({ ...prev, githubToken: token }));
        showToast('Successfully connected to GitHub');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (state.githubToken) {
      fetchGitHubData(state.githubToken);
    }
  }, [state.githubToken]);

  useEffect(() => {
    if (state.currentRepo) {
      if (state.githubToken && state.currentRepoOwner && state.currentRepoOwner !== 'mock') {
        fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
      } else {
        setState(prev => ({
          ...prev,
          activeCommits: getLocalRepoDetails(prev.currentRepo!, 'commits'),
          activeBranches: getLocalRepoDetails(prev.currentRepo!, 'branches'),
          activePRs: getLocalRepoDetails(prev.currentRepo!, 'prs'),
          activeFiles: getLocalRepoDetails(prev.currentRepo!, 'files'),
          activeLanguages: { TypeScript: 45, JavaScript: 35, Python: 15, Others: 5 },
          isLoadingRepoDetails: false
        }));
      }
    }
  }, [state.currentRepo, state.githubToken]);

  const navigate = (screen: Screen) => {
    setState((prev) => ({ ...prev, currentScreen: screen }));
  };

  const openRepo = (repoName: string, owner: string | null = null) => {
    setState((prev) => {
      const actualOwner = owner || (prev.githubToken ? prev.githubUser?.login : null) || 'mock';
      return { 
        ...prev, 
        currentRepo: repoName, 
        currentRepoOwner: actualOwner,
        currentScreen: 'files' 
      };
    });
  };

  const openActionSheet = () => setState((prev) => ({ ...prev, isActionSheetOpen: true }));
  const closeActionSheet = () => setState((prev) => ({ ...prev, isActionSheetOpen: false }));
  
  const openDrawer = () => setState((prev) => ({ ...prev, isDrawerOpen: true }));
  const closeDrawer = () => setState((prev) => ({ ...prev, isDrawerOpen: false }));

  const closeModals = () => setState((prev) => ({ ...prev, isActionSheetOpen: false, isDrawerOpen: false, activeModal: null }));
  
  const setSearchFocus = (focus: boolean) => setState((prev) => ({ ...prev, isSearchFocused: focus }));

  const showToast = (msg: string) => {
    setState((prev) => ({ ...prev, toastMessage: msg }));
  };

  const openModal = (modalType: 'repo' | 'branch' | 'pr' | 'commit') => {
    setState(prev => ({ ...prev, activeModal: modalType, isActionSheetOpen: false }));
  };

  const closeModal = () => {
    setState(prev => ({ ...prev, activeModal: null }));
  };

  const createLocalRepo = (repo: { name: string; desc: string; isPrivate: boolean; lang: string }) => {
    const newRepo: GitHubRepo = {
      id: Date.now(),
      name: repo.name,
      private: repo.isPrivate,
      description: repo.desc || 'No description provided.',
      language: repo.lang || 'TypeScript',
      pushed_at: new Date().toISOString()
    };
    
    const existing = localStorage.getItem('localRepos') 
      ? JSON.parse(localStorage.getItem('localRepos')!) 
      : INITIAL_MOCK_REPOS;

    const updated = [newRepo, ...existing];
    localStorage.setItem('localRepos', JSON.stringify(updated));

    setState(prev => ({
      ...prev,
      githubRepos: prev.githubToken ? prev.githubRepos : updated
    }));

    showToast(`Repository '${repo.name}' created!`);
  };

  const createLocalBranch = (branch: { name: string; desc: string }) => {
    if (!state.currentRepo) return;
    const key = `local_details_${state.currentRepo}_branches`;
    const current = getLocalRepoDetails(state.currentRepo, 'branches');
    const newBranch = {
      name: branch.name,
      desc: branch.desc || 'Active branch',
      isDefault: false
    };
    const updated = [newBranch, ...current];
    localStorage.setItem(key, JSON.stringify(updated));
    
    setState(prev => ({
      ...prev,
      activeBranches: updated
    }));
    showToast(`Branch '${branch.name}' created!`);
  };

  const createLocalPR = (pr: { title: string; desc: string; source: string; target: string }) => {
    if (!state.currentRepo) return;
    const key = `local_details_${state.currentRepo}_prs`;
    const current = getLocalRepoDetails(state.currentRepo, 'prs');
    const newPR = {
      id: current.length + 43,
      title: pr.title,
      desc: pr.desc || 'No description provided.',
      author: state.githubUser?.login || 'Tanvir Ahmed',
      time: 'Just now',
      status: 'Open',
      avatar: state.githubUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir',
      hasConflicts: false
    };
    const updated = [newPR, ...current];
    localStorage.setItem(key, JSON.stringify(updated));
    
    setState(prev => ({
      ...prev,
      activePRs: updated
    }));
    showToast(`Pull Request #${newPR.id} opened!`);
  };

  const createLocalCommit = (commit: { msg: string; author: string; hash?: string; add?: string; del?: string }) => {
    if (!state.currentRepo) return;
    const key = `local_details_${state.currentRepo}_commits`;
    const current = getLocalRepoDetails(state.currentRepo, 'commits');
    const newCommit = {
      hash: commit.hash || Math.random().toString(16).substring(2, 9),
      msg: commit.msg,
      author: commit.author || state.githubUser?.name || 'Tanvir Ahmed',
      time: 'Just now',
      add: commit.add || `+${Math.floor(Math.random() * 30) + 1}`,
      del: commit.del || `-${Math.floor(Math.random() * 10) + 1}`,
      isPrimary: true
    };
    const updated = [newCommit, ...current];
    localStorage.setItem(key, JSON.stringify(updated));
    
    setState(prev => ({
      ...prev,
      activeCommits: updated
    }));
    showToast(`Committed: ${newCommit.hash}`);
  };

  useEffect(() => {
    if (state.toastMessage) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, toastMessage: null }));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.toastMessage]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        navigate,
        openRepo,
        openActionSheet,
        closeActionSheet,
        openDrawer,
        closeDrawer,
        showToast,
        closeModals,
        setSearchFocus,
        toggleTheme,
        connectGitHub,
        disconnectGitHub,
        setManualToken,
        openModal,
        closeModal,
        createLocalRepo,
        createLocalBranch,
        createLocalPR,
        createLocalCommit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
