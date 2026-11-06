export async function updateOrCreateBranch({
  owner,
  repo,
  branch,
  newCommitSha,
  createPR,
  newBranchName,
  prTitle,
  prBody,
  commitMessage,
  selectedFilesCount,
  headers,
  onProgress,
}: {
  owner: string;
  repo: string;
  branch: string;
  newCommitSha: string;
  createPR?: boolean;
  newBranchName?: string;
  prTitle?: string;
  prBody?: string;
  commitMessage: string;
  selectedFilesCount: number;
  headers: Record<string, string>;
  onProgress?: (step: string) => void;
}): Promise<{ targetBranch: string; prNumber?: number; prUrl?: string }> {
  let targetBranch = branch;
  let prNumber: number | undefined;
  let prUrl: string | undefined;

  if (createPR && newBranchName?.trim()) {
    targetBranch = newBranchName.trim();
    onProgress?.(`Creating new branch '${targetBranch}'...`);
    const createBranchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ref: `refs/heads/${targetBranch}`, sha: newCommitSha }),
    });
    if (!createBranchRes.ok) {
      const err = await createBranchRes.json().catch(() => ({}));
      throw new Error(`Failed to create branch '${targetBranch}': ${err.message || createBranchRes.statusText}`);
    }

    onProgress?.(`Opening Pull Request from '${targetBranch}' into '${branch}'...`);
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: prTitle || commitMessage,
        body: prBody || `Synchronized changes from AI Studio ZIP package.\n\nFiles changed: ${selectedFilesCount}`,
        head: targetBranch,
        base: branch,
      }),
    });
    if (prRes.ok) {
      const prData = await prRes.json();
      prNumber = prData.number;
      prUrl = prData.html_url;
    }
  } else {
    onProgress?.(`Updating branch '${branch}' ref...`);
    const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ sha: newCommitSha, force: false }),
    });
    if (!updateRefRes.ok) {
      const err = await updateRefRes.json().catch(() => ({}));
      throw new Error(`Failed to update branch '${branch}': ${err.message || updateRefRes.statusText}`);
    }
  }

  return { targetBranch, prNumber, prUrl };
}
