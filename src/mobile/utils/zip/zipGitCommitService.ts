import { DiffFileItem, ZipExtractedFile } from './zipTypes';
import { uploadGitBlob } from './zipBlobService';
import { updateOrCreateBranch } from './zipRefService';

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('Synchronization cancelled by user.', 'AbortError');
  }
}

export function isSyncAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException && error.name === 'AbortError'
  ) || (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'AbortError'
  );
}

const UPLOAD_CONCURRENCY = 8;

export async function commitSyncToGitHub({
  token,
  owner,
  repo,
  branch,
  commitMessage,
  selectedDiffFiles,
  zipFilesMap,
  fileResolutions,
  createPR = false,
  newBranchName = '',
  prTitle = '',
  prBody = '',
  onProgress,
  signal,
}: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  commitMessage: string;
  selectedDiffFiles: DiffFileItem[];
  zipFilesMap: Map<string, ZipExtractedFile>;
  fileResolutions?: Map<string, 'take_zip' | 'keep_original' | 'delete' | 'restore'>;
  createPR?: boolean;
  newBranchName?: string;
  prTitle?: string;
  prBody?: string;
  onProgress?: (step: string, completedCount?: number, totalCount?: number) => void;
  signal?: AbortSignal;
}): Promise<{
  commitSha: string;
  branchName: string;
  prNumber?: number;
  prUrl?: string;
  htmlUrl: string;
  uploadedCount: number;
  deletedCount: number;
  unchangedCount: number;
}> {
  throwIfAborted(signal);

  const authHeader = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
    ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
    : `token ${token}`;

  const headers: Record<string, string> = {
    Authorization: authHeader,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  onProgress?.('Fetching current branch commit reference...');
  const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`, {
    headers,
    signal,
  });
  if (!refRes.ok) {
    const err = await refRes.json().catch(() => ({}));
    throw new Error(`Failed to get branch '${branch}': ${err.message || refRes.statusText}`);
  }
  const refData = await refRes.json();
  const baseCommitSha = refData.object.sha;

  throwIfAborted(signal);
  onProgress?.('Fetching base git tree...');
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${baseCommitSha}`, {
    headers,
    signal,
  });
  if (!commitRes.ok) {
    const err = await commitRes.json().catch(() => ({}));
    throw new Error(`Failed to get base commit: ${err.message || commitRes.statusText}`);
  }
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  const filesToUpload = selectedDiffFiles.filter(f => {
    const res = fileResolutions?.get(f.path);
    return (f.status === 'added' || f.status === 'modified') && (res === undefined || res === 'take_zip');
  });

  const filesToDelete = selectedDiffFiles.filter(f => f.status === 'removed' && fileResolutions?.get(f.path) === 'delete');
  const unchangedCount = selectedDiffFiles.filter(f => f.status === 'unchanged').length;
  const totalOperations = filesToUpload.length + filesToDelete.length;

  if (totalOperations === 0) {
    throw new Error('No files selected for synchronization.');
  }

  // Concurrent blob upload worker pool (8 parallel connections, AbortSignal-aware)
  const uploadedEntries = new Array<{ path: string; mode: string; type: 'blob'; sha: string | null }>(filesToUpload.length);
  let nextIdx = 0;
  let completedBlobs = 0;

  async function blobWorker() {
    while (nextIdx < filesToUpload.length) {
      throwIfAborted(signal);
      const currentIdx = nextIdx++;
      const file = filesToUpload[currentIdx];
      const sha = await uploadGitBlob(file, zipFilesMap, owner, repo, headers, signal);
      throwIfAborted(signal);
      uploadedEntries[currentIdx] = { path: file.path, mode: '100644', type: 'blob', sha };
      completedBlobs++;
      onProgress?.(
        `Uploading blobs (${completedBlobs}/${filesToUpload.length}): ${file.path}`,
        completedBlobs,
        totalOperations
      );
    }
  }

  if (filesToUpload.length > 0) {
    onProgress?.(`Uploading ${filesToUpload.length} files in parallel...`, 0, totalOperations);
    const workers = Array.from(
      { length: Math.min(UPLOAD_CONCURRENCY, filesToUpload.length) },
      () => blobWorker()
    );
    await Promise.all(workers);
  }

  throwIfAborted(signal);

  const treeEntryMap = new Map<string, { path: string; mode: string; type: 'blob'; sha: string | null }>();
  for (const entry of uploadedEntries) {
    if (entry) treeEntryMap.set(entry.path, entry);
  }
  for (const rFile of filesToDelete) {
    throwIfAborted(signal);
    treeEntryMap.set(rFile.path, { path: rFile.path, mode: '100644', type: 'blob', sha: null });
  }
  const treeEntries = Array.from(treeEntryMap.values());

  throwIfAborted(signal);
  onProgress?.('Constructing new Git tree object...', totalOperations, totalOperations);
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
    signal,
  });
  if (!treeRes.ok) {
    const err = await treeRes.json().catch(() => ({}));
    throw new Error(`Failed to create Git tree: ${err.message || treeRes.statusText}`);
  }
  const newTreeData = await treeRes.json();

  throwIfAborted(signal);
  onProgress?.('Creating atomic commit...', totalOperations, totalOperations);
  const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: commitMessage, tree: newTreeData.sha, parents: [baseCommitSha] }),
    signal,
  });
  if (!newCommitRes.ok) {
    const err = await newCommitRes.json().catch(() => ({}));
    throw new Error(`Failed to create commit: ${err.message || newCommitRes.statusText}`);
  }
  const newCommit = await newCommitRes.json();
  const newCommitSha = newCommit.sha;

  throwIfAborted(signal);
  const { targetBranch, prNumber, prUrl } = await updateOrCreateBranch({
    owner,
    repo,
    branch,
    newCommitSha,
    createPR,
    newBranchName,
    prTitle,
    prBody,
    commitMessage,
    selectedFilesCount: treeEntries.length,
    headers,
    onProgress: (msg) => onProgress?.(msg, totalOperations, totalOperations),
    signal,
  });

  return {
    commitSha: newCommitSha,
    branchName: targetBranch,
    prNumber,
    prUrl,
    htmlUrl: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`,
    uploadedCount: filesToUpload.length,
    deletedCount: filesToDelete.length,
    unchangedCount,
  };
}
