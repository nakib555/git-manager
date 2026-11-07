import { getGitHubAuthHeader } from './gitMutationServices';

export interface DeleteFileParams {
  owner: string;
  repo: string;
  filePath: string;
  message: string;
  branch: string;
  token: string;
  sha?: string;
}

export interface DeleteFolderBatchParams {
  owner: string;
  repo: string;
  folderPath: string;
  message: string;
  branch: string;
  token: string;
}

export const deleteRemoteSingleFile = async ({
  owner,
  repo,
  filePath,
  message,
  branch,
  token,
  sha,
}: DeleteFileParams): Promise<{ commitSha?: string }> => {
  const headers: Record<string, string> = {
    Authorization: getGitHubAuthHeader(token),
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
  };

  let fileSha = sha;
  if (!fileSha) {
    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      { headers }
    );
    if (!fileRes.ok) {
      const err = await fileRes.json().catch(() => ({}));
      throw new Error(err.message || `File not found on branch ${branch}`);
    }
    const fileData = await fileRes.json();
    fileSha = fileData.sha;
  }

  const deleteRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        message,
        sha: fileSha,
        branch,
      }),
    }
  );

  if (!deleteRes.ok) {
    const err = await deleteRes.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete file from GitHub (${deleteRes.status})`);
  }

  const result = await deleteRes.json();
  return { commitSha: result.commit?.sha };
};

export const deleteRemoteFolderBatch = async ({
  owner,
  repo,
  folderPath,
  message,
  branch,
  token,
}: DeleteFolderBatchParams): Promise<{ commitSha: string; deletedCount: number }> => {
  const headers: Record<string, string> = {
    Authorization: getGitHubAuthHeader(token),
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
  };

  // 1. Get current branch head ref
  const refRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    { headers }
  );
  if (!refRes.ok) {
    throw new Error(`Failed to resolve head reference for branch '${branch}'`);
  }
  const refData = await refRes.json();
  const currentHeadSha = refData.object.sha;

  // 2. Fetch the commit to get root tree SHA
  const commitRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits/${currentHeadSha}`,
    { headers }
  );
  if (!commitRes.ok) {
    throw new Error(`Failed to read commit ${currentHeadSha}`);
  }
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  // 3. Fetch full tree recursively
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${baseTreeSha}?recursive=1`,
    { headers }
  );
  if (!treeRes.ok) {
    throw new Error(`Failed to read repository tree from GitHub`);
  }
  const treeData = await treeRes.json();
  const normalizedFolder = folderPath.replace(/^\/+|\/+$/g, '');

  const filesToDelete = (treeData.tree || []).filter((item: any) => {
    if (item.type !== 'blob') return false;
    const itemPath = item.path.replace(/^\/+/, '');
    return itemPath.startsWith(`${normalizedFolder}/`) || itemPath === normalizedFolder;
  });

  if (filesToDelete.length === 0) {
    throw new Error(`No files found inside folder '${folderPath}' to delete`);
  }

  // 4. Create new tree marking each file as deleted (sha: null)
  const treePayload = filesToDelete.map((f: any) => ({
    path: f.path,
    mode: f.mode || '100644',
    type: 'blob',
    sha: null,
  }));

  const createTreeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treePayload,
      }),
    }
  );

  if (!createTreeRes.ok) {
    const err = await createTreeRes.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create new Git tree with deletions');
  }
  const newTreeData = await createTreeRes.json();

  // 5. Create new commit
  const newCommitRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        tree: newTreeData.sha,
        parents: [currentHeadSha],
      }),
    }
  );

  if (!newCommitRes.ok) {
    const err = await newCommitRes.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create commit for folder deletion');
  }
  const newCommitData = await newCommitRes.json();

  // 6. Update branch ref
  const updateRefRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitData.sha,
      }),
    }
  );

  if (!updateRefRes.ok) {
    const err = await updateRefRes.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update branch reference with new commit');
  }

  return {
    commitSha: newCommitData.sha,
    deletedCount: filesToDelete.length,
  };
};
