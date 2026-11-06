import { AppState } from '../../types';
import { getLocalRepoDetails } from '../contextUtils';

interface CreateRefParams {
  state: AppState;
  branchName?: string;
  tagName?: string;
  commitSha: string;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  fetchRepoDetails: (repo: string, owner: string, isBg?: boolean, branch?: string) => Promise<void>;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export const executeCreateBranchAtCommit = async ({
  state, branchName, commitSha, showToast, fetchRepoDetails, setState, setRefreshTrigger
}: CreateRefParams): Promise<boolean> => {
  if (!state.currentRepo) return false;
  const cleanName = (branchName || '').trim();
  if (!cleanName) return false;

  if (state.githubToken && state.currentRepoOwner) {
    try {
      const res = await fetch(`https://api.github.com/repos/${state.currentRepoOwner}/${state.currentRepo}/git/refs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.githubToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ ref: `refs/heads/${cleanName}`, sha: commitSha }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Status ${res.status}`);
      }
      showToast(`Branch '${cleanName}' created at ${commitSha.slice(0, 7)}!`, 'success');
      await fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
      setRefreshTrigger(prev => prev + 1);
      return true;
    } catch (err: any) {
      showToast(`Failed to create branch: ${err.message || err}`, 'error');
      return false;
    }
  }

  const key = `local_details_${state.currentRepo}_branches`;
  const existing = getLocalRepoDetails(state.currentRepo, 'branches');
  if (existing.some((b: any) => b.name === cleanName)) {
    showToast(`Branch '${cleanName}' already exists.`, 'warning');
    return false;
  }
  const updated = [...existing, { name: cleanName, commitHash: commitSha, isDefault: false, behindBy: 0, aheadBy: 0 }];
  try { localStorage.setItem(key, JSON.stringify(updated)); } catch (_) {}
  setState(prev => ({ ...prev, activeBranches: updated }));
  showToast(`Branch '${cleanName}' created at ${commitSha.slice(0, 7)}!`, 'success');
  setRefreshTrigger(prev => prev + 1);
  return true;
};

export const executeCreateTagAtCommit = async ({
  state, tagName, commitSha, showToast
}: CreateRefParams): Promise<boolean> => {
  if (!state.currentRepo) return false;
  const cleanTag = (tagName || '').trim();
  if (!cleanTag) return false;

  if (state.githubToken && state.currentRepoOwner) {
    try {
      const res = await fetch(`https://api.github.com/repos/${state.currentRepoOwner}/${state.currentRepo}/git/refs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.githubToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ ref: `refs/tags/${cleanTag}`, sha: commitSha }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Status ${res.status}`);
      }
      showToast(`Tag '${cleanTag}' created at ${commitSha.slice(0, 7)}!`, 'success');
      return true;
    } catch (err: any) {
      showToast(`Failed to create tag: ${err.message || err}`, 'error');
      return false;
    }
  }

  const key = `local_details_${state.currentRepo}_tags`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const updated = [...existing.filter((t: any) => t.name !== cleanTag), { name: cleanTag, commit: commitSha }];
  try { localStorage.setItem(key, JSON.stringify(updated)); } catch (_) {}
  showToast(`Tag '${cleanTag}' created at ${commitSha.slice(0, 7)}!`, 'success');
  return true;
};
