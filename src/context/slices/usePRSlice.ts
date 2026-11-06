import { AppState } from '../../types';
import { getLocalRepoDetails } from '../contextUtils';
import { createRemoteGitHubPR, updateRemoteGitHubPRStatus } from '../gitMutationServices';

interface UsePRSliceParams {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  fetchRepoDetails: (repo: string, owner: string, isBg?: boolean, branch?: string) => Promise<void>;
}

export const usePRSlice = ({ state, setState, showToast, fetchRepoDetails }: UsePRSliceParams) => {
  const createLocalPR = async (pr: {
    title: string;
    desc: string;
    source: string;
    target: string;
    isDraft?: boolean;
  }) => {
    if (!state.currentRepo) return;
    if (state.currentRepoOwner && state.githubToken) {
      try {
        const prData = await createRemoteGitHubPR(state.currentRepoOwner, state.currentRepo, pr, state.githubToken);
        showToast(`Pull Request #${prData.number} opened on GitHub!`, 'success');
        await fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
      } catch (error: any) {
        showToast(`Failed to open Pull Request: ${error.message || error}`, 'error');
      }
      return;
    }

    const newPR = {
      id: Date.now(),
      number: Math.floor(10 + Math.random() * 90),
      title: pr.title || 'Untitled Pull Request',
      author: state.githubUser?.login || 'local-developer',
      status: 'Open' as const,
      source: pr.source || 'feature',
      target: pr.target || 'main',
      time: 'Just now',
      date: new Date().toISOString(),
      body: pr.desc || '',
      comments: 0,
      avatar: state.githubUser?.avatar_url,
    };
    const key = `local_details_${state.currentRepo}_prs`;
    const existing = getLocalRepoDetails(state.currentRepo, 'prs');
    const updated = [newPR, ...existing];
    try { localStorage.setItem(key, JSON.stringify(updated)); } catch (_) {}
    setState(prev => ({ ...prev, activePRs: updated }));
    showToast(`Pull Request #${newPR.number} created locally!`, 'success');
  };

  const updateLocalPRStatus = async (
    prId: number,
    status: 'Open' | 'Merged' | 'Closed',
    strategy: 'merge' | 'squash' = 'merge'
  ) => {
    if (!state.currentRepo) return;
    if (state.currentRepoOwner && state.githubToken) {
      try {
        await updateRemoteGitHubPRStatus(state.currentRepoOwner, state.currentRepo, prId, status, strategy, state.githubToken);
        showToast(status === 'Merged' ? `Successfully merged Pull Request #${prId}!` : `Pull Request #${prId} set to ${status}!`, 'success');
        await fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
      } catch (error: any) {
        showToast(`Failed to update Pull Request: ${error.message || error}`, 'error');
        throw error;
      }
      return;
    }

    const key = `local_details_${state.currentRepo}_prs`;
    const existing = getLocalRepoDetails(state.currentRepo, 'prs');
    const updated = existing.map((p: any) => p.number === prId || p.id === prId ? { ...p, status } : p);
    try { localStorage.setItem(key, JSON.stringify(updated)); } catch (_) {}
    setState(prev => ({ ...prev, activePRs: updated }));
    showToast(status === 'Merged' ? `Merged Pull Request #${prId} locally!` : `Pull Request #${prId} set to ${status}!`, 'success');
  };

  return { createLocalPR, updateLocalPRStatus };
};
