import { DiffFileItem, ZipExtractedFile } from './zipTypes';
import { uploadGitBlob } from './zipBlobService';
import { updateOrCreateBranch } from './zipRefService';

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
  onProgress?: (step: string) => void;
}): Promise<{
  commitSha: string;
  branchName: string;
  prNumber?: number;
  prUrl?: string;
  htmlUrl: string;
}> {
  const authHeader = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
    ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
    : `token ${token}`;

  const headers: Record<string, string> = {
    Authorization: authHeader,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  onProgress?.('Fetching current branch commit reference...');
  const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
  if (!refRes.ok) {
    const err = await refRes.json().catch(() => ({}));
    throw new Error(`Failed to get branch '${branch}': ${err.message || refRes.statusText}`);
  }
  const refData = await refRes.json();
  const baseCommitSha = refData.object.sha;

  onProgress?.('Fetching base git tree...');
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${baseCommitSha}`, { headers });
  if (!commitRes.ok) {
    const err = await commitRes.json().catch(() => ({}));
    throw new Error(`Failed to get base commit: ${err.message || commitRes.statusText}`);
  }
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  const treeEntries: { path: string; mode: string; type: 'blob'; sha: string | null }[] = [];
  const filesToUpload = selectedDiffFiles.filter(f => {
    const res = fileResolutions?.get(f.path);
    return (f.status === 'added' || f.status === 'modified') && (res === undefined || res === 'take_zip');
  });

  let uploadedCount = 0;
  for (const file of filesToUpload) {
    uploadedCount++;
    onProgress?.(`Uploading blob ${uploadedCount}/${filesToUpload.length}: ${file.path}...`);
    const sha = await uploadGitBlob(file, zipFilesMap, owner, repo, headers);
    treeEntries.push({ path: file.path, mode: '100644', type: 'blob', sha });
  }

  const filesToDelete = selectedDiffFiles.filter(f => f.status === 'removed' && fileResolutions?.get(f.path) === 'delete');
  for (const rFile of filesToDelete) {
    treeEntries.push({ path: rFile.path, mode: '100644', type: 'blob', sha: null });
  }

  if (treeEntries.length === 0) throw new Error('No files selected for synchronization.');

  onProgress?.('Constructing new Git tree object...');
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });
  if (!treeRes.ok) {
    const err = await treeRes.json().catch(() => ({}));
    throw new Error(`Failed to create Git tree: ${err.message || treeRes.statusText}`);
  }
  const newTreeData = await treeRes.json();

  onProgress?.('Creating atomic commit...');
  const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: commitMessage, tree: newTreeData.sha, parents: [baseCommitSha] }),
  });
  if (!newCommitRes.ok) {
    const err = await newCommitRes.json().catch(() => ({}));
    throw new Error(`Failed to create commit: ${err.message || newCommitRes.statusText}`);
  }
  const newCommit = await newCommitRes.json();
  const newCommitSha = newCommit.sha;

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
    selectedFilesCount: selectedDiffFiles.length,
    headers,
    onProgress,
  });

  return { commitSha: newCommitSha, branchName: targetBranch, prNumber, prUrl, htmlUrl: `https://github.com/${owner}/${repo}/commit/${newCommitSha}` };
}
