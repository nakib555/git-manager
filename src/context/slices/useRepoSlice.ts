import { AppState } from '../../types';
import { getLocalRepoDetails } from '../contextUtils';
import { deleteRemoteGitHubRepo, getGitHubAuthHeader } from '../gitMutationServices';
import { executeFetchGitHubData, executeFetchRepoDetails } from './repoSliceServices';
import { buildInitialLocalRepo } from './repoCreationHelper';

interface UseRepoSliceParams {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const useRepoSlice = ({ state, setState, showToast }: UseRepoSliceParams) => {
  const fetchGitHubData = async (token: string, isBackground = false, pageOverride?: number, searchOverride?: string) => {
    if (!isBackground) setState(prev => ({ ...prev, isFetchingRepos: true }));
    try {
      const data = await executeFetchGitHubData(token, state, pageOverride, searchOverride);
      const fallbackUser = data.sanitizedUser || state.githubUser || (() => {
        try {
          const raw = localStorage.getItem("githubUser");
          return raw ? JSON.parse(raw) : null;
        } catch (_) { return null; }
      })();

      setState(prev => ({
        ...prev,
        githubUser: fallbackUser || prev.githubUser,
        githubRepos: data.githubRepos,
        currentRepo: data.currentRepo,
        currentRepoOwner: data.currentRepoOwner,
        repoTotalPages: data.repoTotalPages,
        isFetchingRepos: false,
      }));
    } catch (error: any) {
      if (!isBackground) showToast(`Error loading GitHub data: ${error.message || error}`, 'error');
      setState(prev => ({ ...prev, isFetchingRepos: false }));
    }
  };

  const fetchRepoDetails = async (repoName: string, owner: string, isBackground = false, branchOverride?: string) => {
    if (!isBackground) setState(prev => ({ ...prev, isLoadingRepoDetails: true }));
    try {
      const details = await executeFetchRepoDetails(repoName, owner, state.githubToken, branchOverride);
      setState(prev => ({ ...prev, ...details, isLoadingRepoDetails: false }));
    } catch (err: any) {
      if (!isBackground) {
        showToast(`Error fetching repo '${owner}/${repoName}': ${err?.message || 'Failed to retrieve repository data'}`, 'error');
        setState(prev => ({
          ...prev, activeCommits: getLocalRepoDetails(repoName, "commits"), activeBranches: getLocalRepoDetails(repoName, "branches"),
          activePRs: getLocalRepoDetails(repoName, "prs"), activeFiles: getLocalRepoDetails(repoName, "files"), isLoadingRepoDetails: false,
        }));
      }
    }
  };

  const openRepo = (repoName: string, owner: string | null = null) => {
    setState(prev => {
      const matched = prev.githubRepos.find(r => r.name === repoName);
      const actualOwner = owner || (matched as any)?.owner?.login || prev.githubUser?.login || "custom-owner";
      localStorage.setItem("currentRepo", repoName);
      localStorage.setItem("currentRepoOwner", actualOwner);
      localStorage.removeItem("currentBranch");
      localStorage.setItem("currentScreen", "files");

      // Strictly isolate to the opened repository's own commits and tree
      const repoCommits = getLocalRepoDetails(repoName, "commits");
      const repoBranches = getLocalRepoDetails(repoName, "branches");
      const repoPRs = getLocalRepoDetails(repoName, "prs");
      const repoFiles = getLocalRepoDetails(repoName, "files");

      return {
        ...prev,
        currentRepo: repoName,
        currentRepoOwner: actualOwner,
        currentBranch: "",
        currentScreen: "files",
        activeCommits: repoCommits,
        activeBranches: repoBranches,
        activePRs: repoPRs,
        activeFiles: repoFiles,
        isLoadingRepoDetails: true,
      };
    });
  };

  const deleteRepo = async (repoName: string, owner?: string | null): Promise<boolean> => {
    const targetOwner = owner || state.currentRepoOwner || state.githubUser?.login || '';
    if (state.githubToken && targetOwner && targetOwner !== 'local-developer') {
      if (targetOwner === 'octodev' && repoName === 'nexus-web-engine') {
        showToast("Demo repository removed from local view.", 'info');
      } else {
        try {
          await deleteRemoteGitHubRepo(targetOwner, repoName, state.githubToken);
          showToast(`Repository '${targetOwner}/${repoName}' deleted from GitHub!`, 'success');
        } catch (err: any) {
          showToast(`Failed to delete repository on GitHub: ${err.message || err}`, 'error');
          throw err;
        }
      }
    } else {
      showToast(`Repository '${repoName}' removed locally.`, 'info');
    }

    try {
      ['commits', 'branches', 'prs', 'files'].forEach(t => localStorage.removeItem(`local_details_${repoName}_${t}`));
    } catch (_) {}

    const updated = state.githubRepos.filter(r => r.name !== repoName);
    const wasActive = state.currentRepo === repoName;
    const nextRepo = wasActive ? (updated[0]?.name || null) : state.currentRepo;
    const nextOwner = wasActive ? (updated[0]?.owner?.login || state.githubUser?.login || null) : state.currentRepoOwner;

    setState(prev => ({ ...prev, githubRepos: updated, currentRepo: nextRepo, currentRepoOwner: nextOwner }));
    if (wasActive && nextRepo && nextOwner) fetchRepoDetails(nextRepo, nextOwner);
    return true;
  };

  const addRecentClone = (clone: { name: string; url: string; dest: string; timestamp: number }) => {
    setState(prev => {
      const clones = [clone, ...prev.recentClones.filter(c => c.url !== clone.url)].slice(0, 5);
      localStorage.setItem("recentClones", JSON.stringify(clones));
      return { ...prev, recentClones: clones };
    });
  };

  const cloneRepository = async (repo: { url: string; destFolder: string; branch: string; shallow: boolean; submodules: boolean }) => {
    const parts = repo.url.trim().replace(/\.git$/, '').split('/');
    const name = parts[parts.length - 1] || 'cloned-repo';
    const owner = parts.length >= 2 ? parts[parts.length - 2] : 'custom-owner';
    addRecentClone({ name, url: repo.url, dest: repo.destFolder, timestamp: Date.now() });
    const newRepo = { id: Date.now(), name, private: false, description: `Cloned from ${repo.url}`, language: 'TypeScript', pushed_at: new Date().toISOString(), owner: { login: owner } };
    setState(prev => {
      const newRepos = [newRepo, ...prev.githubRepos.filter(r => r.name !== name)];
      localStorage.setItem("localRepos", JSON.stringify(newRepos));
      return { ...prev, githubRepos: newRepos };
    });
    showToast(`Clone success: Repository '${owner}/${name}' cloned successfully!`, 'success');
  };

  const createLocalRepo = async (repo: { name: string; desc: string; isPrivate: boolean; lang: string }) => {
    const cleanName = repo.name.trim();
    if (!cleanName) throw new Error("Repository name cannot be empty.");
    if (state.githubToken) {
      try {
        const headers = { Authorization: getGitHubAuthHeader(state.githubToken), "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" };
        const res = await fetch("https://api.github.com/user/repos", {
          method: "POST", headers, body: JSON.stringify({ name: cleanName, description: repo.desc, private: repo.isPrivate, auto_init: true }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          let msg = errData.message || `Status ${res.status}`;
          if (res.status === 401) msg = "GitHub authentication failed (401). Please re-authenticate.";
          if (res.status === 422) msg = `Repository '${cleanName}' already exists on your GitHub account.`;
          throw new Error(msg);
        }
        const newRepoData = await res.json();
        showToast(`Repository '${cleanName}' created on GitHub!`, 'success');
        await fetchGitHubData(state.githubToken);
        return { name: cleanName, id: newRepoData.id };
      } catch (e: any) {
        showToast(`Failed to create repository: ${e.message || e}`, 'error');
        throw e;
      }
    }
    const owner = state.githubUser?.login || 'local-developer';
    const { newRepoItem, initialCommit, initialFiles, initialBranches } = buildInitialLocalRepo(cleanName, repo.desc, repo.isPrivate, repo.lang, owner);
    setState(prev => {
      const updated = [newRepoItem, ...prev.githubRepos.filter(r => r.name !== cleanName)];
      localStorage.setItem("localRepos", JSON.stringify(updated));
      return {
        ...prev, githubRepos: updated, currentRepo: cleanName, currentRepoOwner: owner, currentBranch: 'main',
        activeCommits: [initialCommit], activeFiles: initialFiles, activeBranches: initialBranches, activePRs: [],
      };
    });
    showToast(`Repository '${cleanName}' created locally!`, 'success');
    return { name: cleanName };
  };

  return { fetchGitHubData, fetchRepoDetails, openRepo, deleteRepo, addRecentClone, cloneRepository, createLocalRepo };
};
