import { AppState } from '../../types';
import { getLocalRepoDetails } from '../contextUtils';
import { createRemoteGitHubBranch, deleteRemoteGitHubBranch } from '../gitMutationServices';

interface UseBranchSliceParams {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  fetchRepoDetails: (repo: string, owner: string, isBg?: boolean, branch?: string) => Promise<void>;
}

export const useBranchSlice = ({
  state, setState, showToast, fetchRepoDetails,
}: UseBranchSliceParams) => {
  const switchBranch = async (branchName: string) => {
    if (!state.currentRepo) throw new Error("No repository currently selected.");
    const owner = state.currentRepoOwner || state.githubUser?.login || 'octodev';
    localStorage.setItem("currentBranch", branchName);
    setState((prev) => ({ ...prev, currentBranch: branchName }));
    await fetchRepoDetails(state.currentRepo, owner, false, branchName);
  };

  const createLocalBranch = async (branch: { name: string; desc: string }) => {
    if (!state.currentRepo) throw new Error("Select or open a repository before creating a branch.");
    const cleanName = branch.name.trim();
    if (!cleanName) throw new Error("Branch name cannot be empty.");

    if (state.githubToken && state.currentRepoOwner) {
      try {
        const resName = await createRemoteGitHubBranch(state.currentRepoOwner, state.currentRepo, cleanName, state.githubToken);
        showToast(`Branch '${resName}' created on GitHub!`, 'success');
        await fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
        return { name: resName };
      } catch (error: any) {
        const msg = error.message || String(error);
        showToast(`Failed to create branch: ${msg}`, 'error');
        throw new Error(msg);
      }
    }

    const key = `local_details_${state.currentRepo}_branches`;
    const existing = getLocalRepoDetails(state.currentRepo, "branches");
    if (existing.some((b: any) => b.name === cleanName)) {
      const msg = `Branch '${cleanName}' already exists.`;
      showToast(msg, 'warning');
      throw new Error(msg);
    }

    const headCommit = state.activeCommits[0]?.hash || 'head';
    const newBranch = { name: cleanName, commitHash: headCommit, isDefault: false, behindBy: 0, aheadBy: 0 };
    const updated = [...existing, newBranch];
    try { localStorage.setItem(key, JSON.stringify(updated)); } catch (_) {}
    setState(prev => ({ ...prev, activeBranches: updated }));
    showToast(`Branch '${cleanName}' created locally!`, 'success');
    return newBranch;
  };

  const deleteBranch = async (branchName: string) => {
    if (!state.currentRepo) throw new Error("No repository currently selected.");
    const branchInfo = state.activeBranches.find((b) => b.name === branchName);
    const isDefault = branchInfo?.isDefault || branchName === 'main' || branchName === 'master';
    const isActive = branchName === (state.currentBranch || 'main');

    if (isDefault) {
      const msg = `Cannot delete protected branch '${branchName}'.`;
      showToast(msg, 'error');
      throw new Error(msg);
    }
    if (isActive) {
      const msg = `Cannot delete active branch '${branchName}'. Switch branches first.`;
      showToast(msg, 'error');
      throw new Error(msg);
    }

    if (state.githubToken && state.currentRepoOwner) {
      try {
        await deleteRemoteGitHubBranch(state.currentRepoOwner, state.currentRepo, branchName, state.githubToken);
        showToast(`Branch '${branchName}' deleted from GitHub!`, 'success');
        await fetchRepoDetails(state.currentRepo, state.currentRepoOwner, false, state.currentBranch || undefined);
      } catch (error: any) {
        const msg = error.message || String(error);
        showToast(`Failed to delete branch: ${msg}`, 'error');
        throw new Error(msg);
      }
    } else {
      const key = `local_details_${state.currentRepo}_branches`;
      const current = getLocalRepoDetails(state.currentRepo, "branches");
      const updated = current.filter((b: any) => b.name !== branchName);
      localStorage.setItem(key, JSON.stringify(updated));
      setState(prev => ({ ...prev, activeBranches: updated }));
      showToast(`Local branch '${branchName}' deleted!`, 'info');
    }
  };

  return { switchBranch, createLocalBranch, deleteBranch };
};
