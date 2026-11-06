import { AppState } from '../../types';
import { getLocalRepoDetails } from '../contextUtils';
import { deleteRemoteGitHubRepo } from '../gitMutationServices';
import { executeFetchGitHubData, executeFetchRepoDetails } from './repoSliceServices';

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
      setState(prev => ({
        ...prev,
        githubUser: data.sanitizedUser,
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
    } catch (error: any) {
      if (!isBackground) {
        setState(prev => ({
          ...prev,
          activeCommits: getLocalRepoDetails(repoName, "commits"),
          activeBranches: getLocalRepoDetails(repoName, "branches"),
          activePRs: getLocalRepoDetails(repoName, "prs"),
          activeFiles: getLocalRepoDetails(repoName, "files"),
          isLoadingRepoDetails: false,
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
      return { ...prev, currentRepo: repoName, currentRepoOwner: actualOwner, currentBranch: "", currentScreen: "files" };
    });
  };

  const deleteRepo = async (repoName: string, owner?: string | null): Promise<boolean> => {
    const targetOwner = owner || state.currentRepoOwner || state.githubUser?.login || '';
    if (state.githubToken && targetOwner) {
      try {
        await deleteRemoteGitHubRepo(targetOwner, repoName, state.githubToken);
        showToast(`Repository '${targetOwner}/${repoName}' deleted from GitHub!`, 'success');
      } catch (err: any) {
        showToast(`Failed to delete repository on GitHub: ${err.message || err}`, 'error');
        return false;
      }
    } else {
      showToast(`Repository '${repoName}' removed locally.`, 'info');
    }

    try {
      localStorage.removeItem(`local_details_${repoName}_commits`);
      localStorage.removeItem(`local_details_${repoName}_branches`);
      localStorage.removeItem(`local_details_${repoName}_prs`);
      localStorage.removeItem(`local_details_${repoName}_files`);
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
    const cleanUrl = repo.url.trim().replace(/\.git$/, '');
    const parts = cleanUrl.split('/');
    const name = parts[parts.length - 1] || 'cloned-repo';
    const owner = parts.length >= 2 ? parts[parts.length - 2] : 'custom-owner';

    addRecentClone({ name, url: repo.url, dest: repo.destFolder, timestamp: Date.now() });
    const newRepo = { id: Date.now(), name, private: false, description: `Cloned from ${repo.url}`, language: 'TypeScript', pushed_at: new Date().toISOString(), owner: { login: owner } };

    setState(prev => {
      const newRepos = [newRepo, ...prev.githubRepos.filter(r => r.name !== name)];
      localStorage.setItem("localRepos", JSON.stringify(newRepos));
      return { ...prev, githubRepos: newRepos };
    });
    showToast(`Repository ${name} cloned successfully`);
  };

  const createLocalRepo = async (repo: { name: string; desc: string; isPrivate: boolean; lang: string }) => {
    if (!state.githubToken) {
      showToast("GitHub token is required to create a repository.");
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${state.githubToken}`, "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" };
      const res = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: repo.name, description: repo.desc, private: repo.isPrivate, auto_init: true }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `Status ${res.status}`);
      showToast(`Repository '${repo.name}' created on GitHub!`);
      await fetchGitHubData(state.githubToken);
    } catch (e: any) {
      showToast(`Failed to create repository: ${e.message || e}`);
    }
  };

  return {
    fetchGitHubData,
    fetchRepoDetails,
    openRepo,
    deleteRepo,
    addRecentClone,
    cloneRepository,
    createLocalRepo,
  };
};
