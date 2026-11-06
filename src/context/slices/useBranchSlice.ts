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
  state,
  setState,
  showToast,
  fetchRepoDetails,
}: UseBranchSliceParams) => {
  const switchBranch = async (branchName: string) => {
    if (!state.currentRepo) return;
    const owner = state.currentRepoOwner || state.githubUser?.login || 'octodev';
    localStorage.setItem("currentBranch", branchName);
    setState((prev) => ({ ...prev, currentBranch: branchName }));
    await fetchRepoDetails(state.currentRepo, owner, false, branchName);
  };

  const createLocalBranch = async (branch: { name: string; desc: string }) => {
    if (!state.currentRepo) return;
    if (!state.githubToken || !state.currentRepoOwner) {
      showToast("GitHub token and repository owner are required to create a branch.");
      return;
    }
    try {
      const cleanName = await createRemoteGitHubBranch(
        state.currentRepoOwner,
        state.currentRepo,
        branch.name,
        state.githubToken
      );
      showToast(`Branch '${cleanName}' created on GitHub!`, 'success');
      await fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
    } catch (error: any) {
      showToast(`Failed to create branch: ${error.message || error}`, 'error');
    }
  };

  const deleteBranch = async (branchName: string) => {
    if (!state.currentRepo) return;
    const branchInfo = state.activeBranches.find((b) => b.name === branchName);
    const isDefault = branchInfo?.isDefault || branchName === 'main' || branchName === 'master';
    const isActive = branchName === (state.currentBranch || 'main');

    if (isDefault) {
      showToast(`Cannot delete protected branch '${branchName}': Default branch is protected.`, 'error');
      return;
    }
    if (isActive) {
      showToast(`Cannot delete active branch '${branchName}': Switch to another branch first.`, 'error');
      return;
    }

    if (state.githubToken && state.currentRepoOwner) {
      try {
        await deleteRemoteGitHubBranch(state.currentRepoOwner, state.currentRepo, branchName, state.githubToken);
        showToast(`Branch '${branchName}' deleted from GitHub!`, 'success');
        await fetchRepoDetails(state.currentRepo, state.currentRepoOwner, false, state.currentBranch || undefined);
      } catch (error: any) {
        showToast(`Failed to delete branch: ${error.message || error}`, 'error');
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

  return {
    switchBranch,
    createLocalBranch,
    deleteBranch,
  };
};
