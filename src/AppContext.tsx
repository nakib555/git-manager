import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppContextType, AppState, Screen, GitHubRepo, GitHubUser } from './types';

export const INITIAL_MOCK_REPOS: GitHubRepo[] = [];

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
      return [];
    }
  }
  return [];
};

export const getLocalRepoDetails = (repoId: string, type: 'commits' | 'branches' | 'prs' | 'files') => {
  const key = `local_details_${repoId}_${type}`;
  const local = localStorage.getItem(key);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  
  if (type === 'branches') {
    return [
      { name: 'main', desc: 'Default branch', isDefault: true, borderColor: '#38BDF8' }
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
  sessionCommitsCount: parseInt(sessionStorage.getItem('sessionCommitsCount') || '0', 10),
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
        openModal('oauth_setup');
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
      // Modern GitHub API prefers Bearer token format, but we fall back to token format if needed
      const headers = {
        Authorization: token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_')
          ? `Bearer ${token}`
          : `token ${token}`
      };

      // Fetch user profile
      const userRes = await fetch('https://api.github.com/user', { headers });
      if (!userRes.ok) {
        let errorMsg = `Status ${userRes.status}`;
        try {
          const errBody = await userRes.json();
          if (errBody.message) {
            errorMsg = errBody.message;
          }
        } catch (_) {}
        throw new Error(`Profile: ${errorMsg}`);
      }
      const userData = await userRes.json();

      // Fetch user repos
      const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', { headers });
      if (!reposRes.ok) {
        let errorMsg = `Status ${reposRes.status}`;
        try {
          const errBody = await reposRes.json();
          if (errBody.message) {
            errorMsg = errBody.message;
          }
        } catch (_) {}
        throw new Error(`Repositories: ${errorMsg}`);
      }
      const reposData = await reposRes.json();

      setState((prev) => ({
        ...prev,
        githubUser: userData,
        githubRepos: reposData,
      }));
    } catch (error: any) {
      console.error('GitHub fetch error:', error);
      showToast(`Error loading GitHub data: ${error.message || error}`);
      // Do not clear the token immediately if it's a manual entry error, let the user check it
    }
  };

  const fetchRepoDetails = async (repoName: string, owner: string) => {
    if (!state.githubToken) return;
    setState(prev => ({ ...prev, isLoadingRepoDetails: true }));
    try {
      const token = state.githubToken;
      const headers = {
        Authorization: token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_')
          ? `Bearer ${token}`
          : `token ${token}`
      };
      
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

      // Merge any local commits created in the app for this repository
      const localCommits = getLocalRepoDetails(repoName, 'commits');
      const uniqueLocal = localCommits.filter((lc: any) => !commitsData.some((gc: any) => gc.hash === lc.hash));
      const mergedCommits = [...uniqueLocal, ...commitsData];

      // Cache all fetched/merged details in localStorage for persistence and offline display
      localStorage.setItem(`local_details_${repoName}_commits`, JSON.stringify(mergedCommits));
      if (branchesData.length) {
        localStorage.setItem(`local_details_${repoName}_branches`, JSON.stringify(branchesData));
      }
      if (prsData.length) {
        localStorage.setItem(`local_details_${repoName}_prs`, JSON.stringify(prsData));
      }
      if (filesData.length) {
        localStorage.setItem(`local_details_${repoName}_files`, JSON.stringify(filesData));
      }

      setState(prev => ({
        ...prev,
        activeCommits: mergedCommits,
        activeBranches: branchesData.length ? branchesData : getLocalRepoDetails(repoName, 'branches'),
        activePRs: prsData.length ? prsData : getLocalRepoDetails(repoName, 'prs'),
        activeFiles: filesData.length ? filesData : getLocalRepoDetails(repoName, 'files'),
        activeLanguages: langData,
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
        activeLanguages: {},
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
          activeLanguages: {},
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

  const openModal = (modalType: 'repo' | 'branch' | 'pr' | 'commit' | 'oauth_setup') => {
    setState(prev => ({ ...prev, activeModal: modalType, isActionSheetOpen: false }));
  };

  const closeModal = () => {
    setState(prev => ({ ...prev, activeModal: null }));
  };

  const createLocalRepo = async (repo: { name: string; desc: string; isPrivate: boolean; lang: string }) => {
    if (state.githubToken) {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_')
            ? `Bearer ${token}`
            : `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        };

        const res = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: repo.name,
            description: repo.desc,
            private: repo.isPrivate,
            auto_init: true
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Status ${res.status}`);
        }

        const newRepoData = await res.json();
        showToast(`Repository '${repo.name}' created on GitHub!`);
        await fetchGitHubData(token);
      } catch (error: any) {
        console.error('Error creating GitHub repository:', error);
        showToast(`Failed to create repository: ${error.message || error}`);
      }
    } else {
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

      // Create an initial commit for this repo so it's not empty
      const initialCommit = {
        hash: Math.random().toString(16).substring(2, 9),
        msg: 'Initial commit',
        author: state.githubUser?.name || state.githubUser?.login || 'User',
        time: 'Just now',
        add: '+12',
        del: '-0',
        isPrimary: true
      };
      localStorage.setItem(`local_details_${repo.name}_commits`, JSON.stringify([initialCommit]));

      setState(prev => {
        const nextCount = prev.sessionCommitsCount + 1;
        sessionStorage.setItem('sessionCommitsCount', nextCount.toString());
        return {
          ...prev,
          githubRepos: updated,
          sessionCommitsCount: nextCount
        };
      });

      showToast(`Repository '${repo.name}' created!`);
    }
  };

  const findBaseSha = async (owner: string, repo: string, headers: any): Promise<string> => {
    const defaultBranch = state.activeBranches.find(b => b.isDefault)?.name || 'main';
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data?.object?.sha) return data.object.sha;
      }
    } catch (e) {
      console.warn('Failed to fetch default branch ref directly:', e);
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/master`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data?.object?.sha) return data.object.sha;
      }
    } catch (e) {}

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0 && data[0]?.sha) {
          return data[0].sha;
        }
      }
    } catch (e) {}

    throw new Error('Could not find a base commit/branch to branch off of.');
  };

  const createLocalBranch = async (branch: { name: string; desc: string }) => {
    if (!state.currentRepo) return;

    if (state.githubToken && state.currentRepoOwner && state.currentRepoOwner !== 'mock') {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_')
            ? `Bearer ${token}`
            : `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        };

        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;
        const baseSha = await findBaseSha(owner, repo, headers);
        const branchName = branch.name.trim().replace(/\s+/g, '-');

        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: baseSha
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Status ${res.status}`);
        }

        showToast(`Branch '${branchName}' created on GitHub!`);
        await fetchRepoDetails(repo, owner);
      } catch (error: any) {
        console.error('Error creating GitHub branch:', error);
        showToast(`Failed to create branch: ${error.message || error}`);
      }
    } else {
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
    }
  };

  const createLocalPR = async (pr: { title: string; desc: string; source: string; target: string }) => {
    if (!state.currentRepo) return;

    if (state.githubToken && state.currentRepoOwner && state.currentRepoOwner !== 'mock') {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_')
            ? `Bearer ${token}`
            : `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        };

        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;

        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: pr.title,
            body: pr.desc || 'No description provided.',
            head: pr.source,
            base: pr.target
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Status ${res.status}`);
        }

        const prData = await res.json();
        showToast(`Pull Request #${prData.number} opened on GitHub!`);
        await fetchRepoDetails(repo, owner);
      } catch (error: any) {
        console.error('Error creating GitHub Pull Request:', error);
        showToast(`Failed to open Pull Request: ${error.message || error}`);
      }
    } else {
      const key = `local_details_${state.currentRepo}_prs`;
      const current = getLocalRepoDetails(state.currentRepo, 'prs');
      const newPR = {
        id: current.length + 1,
        title: pr.title,
        desc: pr.desc || 'No description provided.',
        author: state.githubUser?.login || 'User',
        time: 'Just now',
        status: 'Open',
        avatar: state.githubUser?.avatar_url || '',
        hasConflicts: false
      };
      const updated = [newPR, ...current];
      localStorage.setItem(key, JSON.stringify(updated));
      
      setState(prev => ({
        ...prev,
        activePRs: updated
      }));
      showToast(`Pull Request #${newPR.id} opened!`);
    }
  };

  const createLocalCommit = async (commit: { msg: string; author: string; hash?: string; add?: string; del?: string; filePath?: string; fileContent?: string }) => {
    if (!state.currentRepo) return;

    if (state.githubToken && state.currentRepoOwner && state.currentRepoOwner !== 'mock') {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_')
            ? `Bearer ${token}`
            : `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        };

        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;
        const branch = state.activeBranches.find(b => b.isDefault)?.name || 'main';

        const path = commit.filePath?.trim() || 'README.md';
        const contentStr = commit.fileContent || `# ${repo}\n\nActivity log commit: ${commit.msg}\n\n_Committed via Git Manager App at ${new Date().toISOString()}_`;

        const utf8Bytes = new TextEncoder().encode(contentStr);
        let binaryStr = '';
        for (let i = 0; i < utf8Bytes.length; i++) {
          binaryStr += String.fromCharCode(utf8Bytes[i]);
        }
        const b64Content = btoa(binaryStr);

        let sha: string | undefined = undefined;
        try {
          const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers });
          if (fileRes.ok) {
            const fileData = await fileRes.json();
            sha = fileData.sha;
          }
        } catch (e) {
          console.warn('File might not exist yet, creating a new one.', e);
        }

        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: commit.msg,
            content: b64Content,
            sha,
            branch
          })
        });

        if (!commitRes.ok) {
          const errData = await commitRes.json().catch(() => ({}));
          throw new Error(errData.message || `Status ${commitRes.status}`);
        }

        const commitData = await commitRes.json();
        showToast(`Commit successfully pushed to GitHub! SHA: ${commitData.commit.sha.substring(0, 7)}`);
        await fetchRepoDetails(repo, owner);
      } catch (error: any) {
        console.error('Error committing to GitHub:', error);
        showToast(`Failed to commit to GitHub: ${error.message || error}`);
      }
    } else {
      const key = `local_details_${state.currentRepo}_commits`;
      const current = getLocalRepoDetails(state.currentRepo, 'commits');
      const newCommit = {
        hash: commit.hash || Math.random().toString(16).substring(2, 9),
        msg: commit.msg,
        author: commit.author || state.githubUser?.name || state.githubUser?.login || 'User',
        time: 'Just now',
        add: commit.add || `+${Math.floor(Math.random() * 30) + 1}`,
        del: commit.del || `-${Math.floor(Math.random() * 10) + 1}`,
        isPrimary: true
      };
      
      const updatedLocal = [newCommit, ...current];
      localStorage.setItem(key, JSON.stringify(updatedLocal));
      
      const updatedUI = [newCommit, ...(state.activeCommits || [])];
      
      setState(prev => {
        const nextCount = prev.sessionCommitsCount + 1;
        sessionStorage.setItem('sessionCommitsCount', nextCount.toString());
        return {
          ...prev,
          activeCommits: updatedUI,
          sessionCommitsCount: nextCount
        };
      });
      showToast(`Committed: ${newCommit.hash}`);
    }
  };

  const editCommitMessage = async (hash: string, newMsg: string) => {
    if (!state.currentRepo) return;
    
    if (state.githubToken && state.currentRepoOwner && state.currentRepoOwner !== 'mock') {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_')
            ? `Bearer ${token}`
            : `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        };
        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;
        const branch = state.activeBranches.find(b => b.isDefault)?.name || 'main';

        // 1. Get original commit
        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${hash}`, { headers });
        if (!commitRes.ok) throw new Error('Failed to fetch commit details');
        const commitData = await commitRes.json();

        // 2. Create new commit
        const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: newMsg,
            tree: commitData.tree.sha,
            parents: commitData.parents.map((p: any) => p.sha)
          })
        });
        if (!newCommitRes.ok) throw new Error('Failed to create new commit');
        const newCommitData = await newCommitRes.json();

        // 3. Update branch ref
        const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            sha: newCommitData.sha,
            force: true
          })
        });
        if (!refRes.ok) throw new Error('Failed to update branch reference');

        showToast('Commit message updated on GitHub!');
        await fetchRepoDetails(repo, owner);
      } catch (error: any) {
        console.error('Error editing commit message:', error);
        showToast(`Failed to edit commit: ${error.message || error}`);
      }
    } else {
      const key = `local_details_${state.currentRepo}_commits`;
      
      const updatedCommits = state.activeCommits.map((c: any) => {
        if (c.hash === hash) {
          return { ...c, msg: newMsg };
        }
        return c;
      });

      localStorage.setItem(key, JSON.stringify(updatedCommits));

      setState(prev => ({
        ...prev,
        activeCommits: updatedCommits
      }));
      showToast(`Commit message updated!`);
    }
  };

  const deleteCommit = async (hash: string) => {
    if (!state.currentRepo) return;
    
    if (state.githubToken && state.currentRepoOwner && state.currentRepoOwner !== 'mock') {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_')
            ? `Bearer ${token}`
            : `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        };
        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;
        const branch = state.activeBranches.find(b => b.isDefault)?.name || 'main';

        // 1. Get original commit
        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${hash}`, { headers });
        if (!commitRes.ok) throw new Error('Failed to fetch commit details');
        const commitData = await commitRes.json();

        if (!commitData.parents || commitData.parents.length === 0) {
          throw new Error('Cannot delete initial commit');
        }

        const parentSha = commitData.parents[0].sha;

        // 2. Update branch ref to parent
        const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            sha: parentSha,
            force: true
          })
        });
        if (!refRes.ok) throw new Error('Failed to update branch reference');

        showToast('Commit deleted from GitHub!');
        await fetchRepoDetails(repo, owner);
      } catch (error: any) {
        console.error('Error deleting commit:', error);
        showToast(`Failed to delete commit: ${error.message || error}`);
      }
    } else {
      const key = `local_details_${state.currentRepo}_commits`;

      const updatedCommits = state.activeCommits.filter((c: any) => c.hash !== hash);
      localStorage.setItem(key, JSON.stringify(updatedCommits));

      setState(prev => ({
        ...prev,
        activeCommits: updatedCommits
      }));
      showToast(`Commit deleted successfully!`);
    }
  };

  const amendLatestCommit = (msg: string, contentOnly: boolean, messageOnly: boolean, changes?: { add?: string; del?: string }) => {
    if (!state.currentRepo || state.activeCommits.length === 0) return;
    const key = `local_details_${state.currentRepo}_commits`;
    
    const updatedCommits = state.activeCommits.map((c: any, idx: number) => {
      if (idx === 0) {
        const updated = { ...c };
        if (!contentOnly) {
          updated.msg = msg;
        }
        if (!messageOnly) {
          updated.add = changes?.add || `+${Math.floor(Math.random() * 45) + 5}`;
          updated.del = changes?.del || `-${Math.floor(Math.random() * 15) + 1}`;
        }
        return updated;
      }
      return c;
    });

    localStorage.setItem(key, JSON.stringify(updatedCommits));
    setState(prev => ({
      ...prev,
      activeCommits: updatedCommits
    }));
    showToast(`Latest commit amended successfully!`);
  };

  const undoLatestCommit = () => {
    if (!state.currentRepo || state.activeCommits.length === 0) return;
    const key = `local_details_${state.currentRepo}_commits`;
    
    const updatedCommits = state.activeCommits.slice(1);
    localStorage.setItem(key, JSON.stringify(updatedCommits));
    setState(prev => ({
      ...prev,
      activeCommits: updatedCommits
    }));
    showToast(`Undone latest commit! Changes moved to index staging area.`);
  };

  const restoreFilesToCommit = (hash: string) => {
    if (!state.currentRepo) return;
    const key = `local_details_${state.currentRepo}_commits`;
    
    const newCommit = {
      hash: Math.random().toString(16).substring(2, 9),
      msg: `Restore files to match state at ${hash}`,
      author: state.githubUser?.name || state.githubUser?.login || 'User',
      time: 'Just now',
      add: `+0`,
      del: `-0`,
      isPrimary: true
    };

    const updatedCommits = [newCommit, ...state.activeCommits];
    localStorage.setItem(key, JSON.stringify(updatedCommits));
    setState(prev => ({
      ...prev,
      activeCommits: updatedCommits
    }));
    showToast(`Restored files to ${hash}! Created new commit.`);
  };

  const resetBranchToCommit = (hash: string) => {
    if (!state.currentRepo) return;
    const key = `local_details_${state.currentRepo}_commits`;
    
    const targetIdx = state.activeCommits.findIndex((c: any) => c.hash === hash);
    if (targetIdx === -1) return;
    
    const updatedCommits = state.activeCommits.slice(targetIdx);
    
    localStorage.setItem(key, JSON.stringify(updatedCommits));
    setState(prev => ({
      ...prev,
      activeCommits: updatedCommits
    }));
    showToast(`Branch reset to ${hash}. Later commits removed.`);
  };

  const createBranchAtCommit = (hash: string, branchName: string) => {
    if (!state.currentRepo) return;
    const key = `local_details_${state.currentRepo}_branches`;
    const current = getLocalRepoDetails(state.currentRepo, 'branches');
    
    const newBranch = {
      name: branchName.trim().toLowerCase().replace(/\s+/g, '-'),
      desc: `Created from commit ${hash}`,
      isDefault: false,
      borderColor: 'transparent'
    };
    
    const updated = [...current, newBranch];
    localStorage.setItem(key, JSON.stringify(updated));
    setState(prev => ({
      ...prev,
      activeBranches: updated
    }));
    showToast(`Branch "${branchName}" created from commit ${hash}!`);
  };

  const createTagAtCommit = (hash: string, tagName: string) => {
    showToast(`Created tag "${tagName}" at commit ${hash}!`);
  };

  const refreshData = async () => {
    setState(prev => ({ ...prev, isLoadingRepoDetails: true }));
    // Simulate brief refreshing delay to show the loader feedback
    await new Promise(resolve => setTimeout(resolve, 800));

    if (state.githubToken) {
      try {
        await fetchGitHubData(state.githubToken);
        if (state.currentRepo && state.currentRepoOwner && state.currentRepoOwner !== 'mock') {
          await fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
        }
      } catch (error) {
        console.error('Refresh error:', error);
      }
    } else {
      // Local mode refresh
      setState(prev => {
        const repos = getLocalRepos();
        let commits = prev.activeCommits;
        let branches = prev.activeBranches;
        let prs = prev.activePRs;
        let files = prev.activeFiles;
        
        if (prev.currentRepo) {
          commits = getLocalRepoDetails(prev.currentRepo, 'commits');
          branches = getLocalRepoDetails(prev.currentRepo, 'branches');
          prs = getLocalRepoDetails(prev.currentRepo, 'prs');
          files = getLocalRepoDetails(prev.currentRepo, 'files');
        }
        
        return {
          ...prev,
          githubRepos: repos,
          activeCommits: commits,
          activeBranches: branches,
          activePRs: prs,
          activeFiles: files,
          isLoadingRepoDetails: false
        };
      });
    }
    showToast('Data refreshed successfully');
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
        refreshData,
        openModal,
        closeModal,
        createLocalRepo,
        createLocalBranch,
        createLocalPR,
        createLocalCommit,
        editCommitMessage,
        deleteCommit,
        amendLatestCommit,
        undoLatestCommit,
        restoreFilesToCommit,
        resetBranchToCommit,
        createBranchAtCommit,
        createTagAtCommit,
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
