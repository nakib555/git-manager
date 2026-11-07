import { AppState, CommitCreationPayload, SaveAndCommitFileParams } from '../../types';
import { getLocalRepoDetails } from '../contextUtils'; import { deleteRemoteHeadCommit } from '../gitCommitFileService';
import { executeRemoteOrLocalCommit, executeRevertCommitOperation, executeSaveAndCommitFileOperation } from './commitSliceServices';
import { executeCreateBranchAtCommit, executeCreateTagAtCommit } from './commitRefService';
import { isRepositoryOwnedByUser } from '../../mobile/utils/repoOwnership';

interface UseCommitSliceParams {
  state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>>;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  fetchRepoDetails: (repo: string, owner: string, isBg?: boolean, branch?: string) => Promise<void>;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export const useCommitSlice = ({ state, setState, showToast, fetchRepoDetails, setRefreshTrigger }: UseCommitSliceParams) => {
  const createLocalCommit = async (commit: CommitCreationPayload) => {
    if (!state.currentRepo) {
      showToast("Select or open a repository first to make a commit.", "warning");
      throw new Error("Select or open a repository first to make a commit.");
    }
    const repo = state.currentRepo, branch = state.currentBranch || "main";
    const owner = state.currentRepoOwner || state.githubUser?.login || "local-user";
    const authorName = commit.author || state.githubUser?.name || state.githubUser?.login || "Local Developer";

    try {
      const res = await executeRemoteOrLocalCommit({
        repo, owner, authorName, branch, msg: commit.msg, filePath: commit.filePath,
        fileContent: commit.fileContent, githubToken: state.githubToken, activeCommits: state.activeCommits,
        syncFileList: commit.updatedFileList || commit.files,
      });
      if (res.isRemote) {
        showToast(`Commit pushed to GitHub! SHA: ${res.sha}`, 'success');
        setState(p => ({ ...p, sessionCommitsCount: p.sessionCommitsCount + 1 }));
        await fetchRepoDetails(repo, owner, false, branch);
      } else {
        setState(p => ({
          ...p, activeCommits: res.updatedCommits || p.activeCommits,
          activeFiles: commit.updatedFileList?.length ? commit.updatedFileList : p.activeFiles,
          sessionCommitsCount: p.sessionCommitsCount + 1,
        }));
        showToast(`Commit created locally (${res.sha})!`, 'success');
      }
      setRefreshTrigger(p => p + 1);
      return { hash: res.sha, isRemote: res.isRemote };
    } catch (err: any) {
      showToast(`Failed to commit: ${err.message || err}`, 'error');
      throw err;
    }
  };

  const saveAndCommitFile = async ({ filePath, content, message, description, branch }: SaveAndCommitFileParams): Promise<boolean> => {
    if (!state.currentRepo) { showToast("No repository currently selected.", "error"); return false; }
    const isOwner = isRepositoryOwnedByUser({
      repoName: state.currentRepo, repoOwner: state.currentRepoOwner, userLogin: state.githubUser?.login, reposList: state.githubRepos,
    });
    if (!isOwner) { showToast("Unauthorized: You can only commit code to repositories you own.", "error"); return false; }
    if (!message.trim()) { showToast("Commit message is required.", "error"); return false; }
    const repo = state.currentRepo, targetBranch = branch || state.currentBranch || "main";
    const owner = state.currentRepoOwner || state.githubUser?.login || "local-user";
    const res = await executeSaveAndCommitFileOperation({
      repo, owner, authorName: state.githubUser?.name || "Local Developer", branch: targetBranch,
      filePath, content, message, description, githubToken: state.githubToken, activeCommits: state.activeCommits,
    });
    if (res.isRemote) {
      showToast(`Committed to ${targetBranch}! SHA: ${res.sha}`, 'success');
      setState(p => ({ ...p, sessionCommitsCount: p.sessionCommitsCount + 1 }));
      await fetchRepoDetails(repo, owner, false, targetBranch);
    } else {
      setState(p => ({ ...p, activeCommits: res.updatedCommits || p.activeCommits, sessionCommitsCount: p.sessionCommitsCount + 1 }));
      showToast(`Committed (${res.sha})! Changes saved.`, 'success');
    }
    setRefreshTrigger(p => p + 1);
    return true;
  };

  const deleteCommit = async (hash: string): Promise<boolean> => {
    const headCommit = state.activeCommits[0];
    if (!state.currentRepo || !headCommit || (headCommit.hash !== hash && headCommit.fullHash !== hash)) {
      if (state.currentRepo) showToast("Only the latest HEAD commit can be deleted.", "error");
      return false;
    }
    if (state.githubToken && state.currentRepoOwner) {
      try {
        const branch = state.currentBranch || "main";
        const parentSha = await deleteRemoteHeadCommit(state.currentRepoOwner, state.currentRepo, hash, branch, state.githubToken);
        showToast(`Deleted HEAD commit! Reset to ${parentSha.substring(0, 7)}.`, "success");
        await fetchRepoDetails(state.currentRepo, state.currentRepoOwner, false, branch);
        setRefreshTrigger(prev => prev + 1);
        return true;
      } catch (err: any) { showToast(`Failed to delete remote commit: ${err.message || err}`, "error"); return false; }
    }
    const existing = getLocalRepoDetails(state.currentRepo, "commits");
    if (existing.length <= 1) { showToast("Cannot delete the only remaining commit.", "warning"); return false; }
    const updated = existing.slice(1);
    try { localStorage.setItem(`local_details_${state.currentRepo}_commits`, JSON.stringify(updated)); } catch (_) {}
    setState(p => ({ ...p, activeCommits: updated }));
    showToast(`Deleted HEAD commit ${hash.substring(0, 7)}.`, "success");
    setRefreshTrigger(p => p + 1);
    return true;
  };

  const revertCommit = async (hash: string, msg?: string): Promise<boolean> => {
    if (!state.currentRepo) return false;
    const branch = state.currentBranch || "main";
    const res = await executeRevertCommitOperation({
      repo: state.currentRepo, owner: state.currentRepoOwner, hash, msg, branch,
      githubToken: state.githubToken, activeCommits: state.activeCommits, authorName: state.githubUser?.name || "Local Developer",
    });
    if (res.isRemote) {
      showToast(`Created revert commit (${res.sha}) on GitHub!`, 'success');
      await fetchRepoDetails(state.currentRepo, state.currentRepoOwner || '', false, branch);
    } else {
      setState(p => ({ ...p, activeCommits: res.updatedCommits || p.activeCommits, sessionCommitsCount: p.sessionCommitsCount + 1 }));
      showToast(`Reverted commit ${hash.substring(0, 7)} (created revert commit ${res.sha})`, 'success');
    }
    setRefreshTrigger(p => p + 1);
    return true;
  };

  return {
    createLocalCommit, saveAndCommitFile, deleteCommit, revertCommit,
    editCommitMessage: (h: string, m: string) => {
      setState(p => ({ ...p, activeCommits: p.activeCommits.map(c => c.hash === h ? { ...c, msg: m } : c) }));
      showToast("Commit message updated!");
    },
    undoLatestCommit: async () => state.activeCommits.length > 0 ? deleteCommit(state.activeCommits[0].hash) : false,
    restoreFilesToCommit: async (h: string, m?: string) => revertCommit(h, m),
    createBranchAtCommit: (branchName: string, commitSha: string) =>
      executeCreateBranchAtCommit({ state, branchName, commitSha, showToast, fetchRepoDetails, setState, setRefreshTrigger }),
    createTagAtCommit: (tagName: string, commitSha: string) =>
      executeCreateTagAtCommit({ state, tagName, commitSha, showToast, fetchRepoDetails, setState, setRefreshTrigger }),
    amendLatestCommit: (newMsg: string) => {
      if (!state.activeCommits.length) return false;
      const updated = [{ ...state.activeCommits[0], msg: newMsg }, ...state.activeCommits.slice(1)];
      localStorage.setItem(`local_details_${state.currentRepo}_commits`, JSON.stringify(updated));
      setState(p => ({ ...p, activeCommits: updated }));
      showToast('Amended latest commit message!', 'success');
      return true;
    },
    resetBranchToCommit: async (sha: string) => {
      const idx = state.activeCommits.findIndex(c => c.hash === sha || c.fullHash === sha);
      if (idx === -1) return false;
      const updated = state.activeCommits.slice(idx);
      localStorage.setItem(`local_details_${state.currentRepo}_commits`, JSON.stringify(updated));
      setState(p => ({ ...p, activeCommits: updated }));
      showToast(`Reset branch to ${sha.slice(0, 7)}!`, 'success');
      setRefreshTrigger(p => p + 1);
      return true;
    },
  };
};
