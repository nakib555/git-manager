import { AppState, DeleteFileOrFolderParams, GitCommitNode } from '../../types';
import { deleteRemoteSingleFile, deleteRemoteFolderBatch } from '../gitDeleteFileService';
import { isRepositoryOwnedByUser } from '../../mobile/utils/repoOwnership';

interface ExecuteFileOrFolderDeleteParams {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  params: DeleteFileOrFolderParams;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  fetchRepoDetails: (repo: string, owner: string, isBg?: boolean, branch?: string) => Promise<void>;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export const executeFileOrFolderDelete = async ({
  state,
  setState,
  params,
  showToast,
  fetchRepoDetails,
  setRefreshTrigger,
}: ExecuteFileOrFolderDeleteParams): Promise<boolean> => {
  const { targetPath, isFolder, commitMessage, branch } = params;
  if (!state.currentRepo) {
    showToast('No repository currently selected.', 'error');
    return false;
  }

  const isOwner = isRepositoryOwnedByUser({
    repoName: state.currentRepo,
    repoOwner: state.currentRepoOwner,
    userLogin: state.githubUser?.login,
    reposList: state.githubRepos,
  });

  if (!isOwner) {
    showToast('Unauthorized: You can only delete files and folders in repositories you own.', 'error');
    return false;
  }

  const cleanMessage = commitMessage.trim() || `chore: delete ${targetPath}`;
  const repo = state.currentRepo;
  const targetBranch = branch || state.currentBranch || 'main';
  const owner = state.currentRepoOwner || state.githubUser?.login || 'local-user';

  // Remote GitHub execution
  if (state.githubToken && state.currentRepoOwner) {
    try {
      if (isFolder) {
        const { commitSha, deletedCount } = await deleteRemoteFolderBatch({
          owner,
          repo,
          folderPath: targetPath,
          message: cleanMessage,
          branch: targetBranch,
          token: state.githubToken,
        });
        showToast(`Deleted folder '${targetPath}' (${deletedCount} files removed, SHA: ${commitSha.slice(0, 7)})`, 'success');
      } else {
        const { commitSha } = await deleteRemoteSingleFile({
          owner,
          repo,
          filePath: targetPath,
          message: cleanMessage,
          branch: targetBranch,
          token: state.githubToken,
        });
        showToast(`Deleted file '${targetPath}' (SHA: ${commitSha ? commitSha.slice(0, 7) : 'head'})`, 'success');
      }
      setState(p => ({ ...p, sessionCommitsCount: p.sessionCommitsCount + 1 }));
      await fetchRepoDetails(repo, owner, false, targetBranch);
      setRefreshTrigger(p => p + 1);
      return true;
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message || err}`, 'error');
      return false;
    }
  }

  // Local / Demo execution
  const normalizedTarget = targetPath.replace(/^\/+|\/+$/g, '');
  let deletedCount = 0;
  const remainingFiles = (state.activeFiles || []).filter((file: any) => {
    const rawPath = (file.path || file.name || '').replace(/^\/+/, '');
    if (isFolder) {
      const isInside = rawPath.startsWith(`${normalizedTarget}/`) || rawPath === normalizedTarget;
      if (isInside) deletedCount++;
      return !isInside;
    } else {
      const isMatch = rawPath === normalizedTarget;
      if (isMatch) deletedCount++;
      return !isMatch;
    }
  });

  if (deletedCount === 0 && !isFolder) {
    showToast(`File '${targetPath}' not found in active files.`, 'warning');
    return false;
  }

  const newSha = Math.random().toString(16).substring(2, 9);
  const now = new Date();
  const newCommit: GitCommitNode = {
    hash: newSha,
    fullHash: newSha + '000000000000000000000000000000000',
    msg: cleanMessage,
    author: state.githubUser?.name || 'Local Developer',
    time: 'Just now',
    timestamp: now.toISOString(),
    add: '+0',
    del: `-${deletedCount}`,
    parents: state.activeCommits.length > 0 ? [state.activeCommits[0].hash] : [],
    isPrimary: true,
  };

  const updatedCommits = [newCommit, ...state.activeCommits];

  try {
    localStorage.setItem(`local_details_${repo}_files`, JSON.stringify(remainingFiles));
    localStorage.setItem(`local_details_${repo}_commits`, JSON.stringify(updatedCommits));
  } catch (_) {}

  setState(p => ({
    ...p,
    activeFiles: remainingFiles,
    activeCommits: updatedCommits,
    sessionCommitsCount: p.sessionCommitsCount + 1,
  }));

  showToast(
    isFolder
      ? `Deleted folder '${targetPath}' (${deletedCount} files pruned locally).`
      : `Deleted file '${targetPath}' locally.`,
    'success'
  );
  setRefreshTrigger(p => p + 1);
  return true;
};
