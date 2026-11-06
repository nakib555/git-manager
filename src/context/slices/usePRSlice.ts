import { AppState } from '../../types';
import { createRemoteGitHubPR, updateRemoteGitHubPRStatus } from '../gitMutationServices';

interface UsePRSliceParams {
  state: AppState;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  fetchRepoDetails: (repo: string, owner: string, isBg?: boolean, branch?: string) => Promise<void>;
}

export const usePRSlice = ({ state, showToast, fetchRepoDetails }: UsePRSliceParams) => {
  const createLocalPR = async (pr: {
    title: string;
    desc: string;
    source: string;
    target: string;
    isDraft?: boolean;
  }) => {
    if (!state.currentRepo || !state.currentRepoOwner || !state.githubToken) {
      showToast("GitHub token and repository owner are required to create a PR.");
      return;
    }
    try {
      const prData = await createRemoteGitHubPR(
        state.currentRepoOwner,
        state.currentRepo,
        pr,
        state.githubToken
      );
      showToast(`Pull Request #${prData.number} opened on GitHub!`, 'success');
      await fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
    } catch (error: any) {
      showToast(`Failed to open Pull Request: ${error.message || error}`, 'error');
    }
  };

  const updateLocalPRStatus = async (
    prId: number,
    status: 'Open' | 'Merged' | 'Closed',
    strategy: 'merge' | 'squash' = 'merge'
  ) => {
    if (!state.currentRepo || !state.currentRepoOwner || !state.githubToken) {
      showToast("Repository details and GitHub authentication are required.");
      return;
    }
    try {
      await updateRemoteGitHubPRStatus(
        state.currentRepoOwner,
        state.currentRepo,
        prId,
        status,
        strategy,
        state.githubToken
      );
      showToast(status === 'Merged' ? `Successfully merged Pull Request #${prId}!` : `Pull Request #${prId} set to ${status}!`, 'success');
      await fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
    } catch (error: any) {
      showToast(`Failed to update Pull Request: ${error.message || error}`, 'error');
      throw error;
    }
  };

  return {
    createLocalPR,
    updateLocalPRStatus,
  };
};
