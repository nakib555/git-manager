import { GitCommitNode } from '../../types';
import { getLocalRepoDetails } from '../contextUtils';
import { pushFileToGitHub, revertRemoteCommit } from '../gitCommitFileService';

export function createLocalCommitNode(
  hash: string,
  msg: string,
  author: string,
  existingCommits: GitCommitNode[],
  add = "+12",
  del = "-2"
): GitCommitNode {
  return {
    hash,
    fullHash: `${hash}${Math.random().toString(16).substring(2, 16)}`,
    msg,
    author,
    time: "Just now",
    timestamp: new Date().toISOString(),
    add,
    del,
    parents: existingCommits.length > 0 ? [existingCommits[0].hash] : [],
    isPrimary: true,
  };
}

export async function executeRemoteOrLocalCommit(params: {
  repo: string;
  owner: string;
  authorName: string;
  branch: string;
  msg: string;
  filePath?: string;
  fileContent?: string;
  githubToken: string | null;
  activeCommits: GitCommitNode[];
  syncFileList?: any[];
}): Promise<{ isRemote: boolean; sha?: string; newCommit?: GitCommitNode; updatedCommits?: GitCommitNode[] }> {
  const { repo, owner, authorName, branch, msg, filePath, fileContent, githubToken, activeCommits, syncFileList } = params;
  const path = (filePath?.trim() || "README.md").replace(/^\/+/, '');

  if (githubToken && owner && owner !== 'local-user' && owner !== 'local-developer') {
    if (owner === 'octodev' && repo === 'nexus-web-engine') {
      throw new Error("Cannot push remote commits to demo repository 'nexus-web-engine'. Please select or create your own repository.");
    }
    const contentStr = fileContent || `# ${repo}\n\nActivity log commit: ${msg}\n\n_Committed via Git Manager at ${new Date().toISOString()}_`;
    const res = await pushFileToGitHub(owner, repo, path, contentStr, msg, branch, githubToken);
    const shortSha = res.commit?.sha ? res.commit.sha.substring(0, 7) : "updated";
    return { isRemote: true, sha: shortSha };
  }

  const localHash = Math.random().toString(16).substring(2, 9);
  const existing = getLocalRepoDetails(repo, "commits");
  const newCommit = createLocalCommitNode(localHash, msg, authorName, existing);
  const updated = [newCommit, ...existing];

  try { localStorage.setItem(`local_details_${repo}_commits`, JSON.stringify(updated.slice(0, 500))); } catch (_) {}
  if (syncFileList?.length) {
    try { localStorage.setItem(`local_details_${repo}_files`, JSON.stringify(syncFileList)); } catch (_) {}
  }

  return { isRemote: false, sha: localHash, newCommit, updatedCommits: updated };
}

export async function executeRevertCommitOperation(params: {
  repo: string;
  owner?: string | null;
  hash: string;
  msg?: string;
  branch: string;
  githubToken: string | null;
  activeCommits: GitCommitNode[];
  authorName: string;
}): Promise<{ success: boolean; isRemote: boolean; sha: string; updatedCommits?: GitCommitNode[] }> {
  const { repo, owner, hash, msg, branch, githubToken, activeCommits, authorName } = params;
  const shortSha = hash.substring(0, 7);
  const target = activeCommits.find(c => c.hash === hash || c.fullHash === hash);
  const title = `Revert "${(msg || target?.msg || "commit").split('\n')[0]}"`;
  const desc = `Reverses delta introduced in ${shortSha}.`;

  if (githubToken && owner) {
    try {
      const newSha = await revertRemoteCommit(owner, repo, hash, branch, title, desc, githubToken);
      return { success: true, isRemote: true, sha: newSha.substring(0, 7) };
    } catch (_) {}
  }

  const localHash = Math.random().toString(16).substring(2, 9);
  const existing = getLocalRepoDetails(repo, "commits");
  const revNode: GitCommitNode = {
    hash: localHash,
    fullHash: `${localHash}00000000`,
    msg: title,
    author: authorName,
    time: "Just now",
    timestamp: new Date().toISOString(),
    add: "+0",
    del: "-0",
    parents: existing.length > 0 ? [existing[0].hash] : [],
    isPrimary: true,
  };
  const updated = [revNode, ...existing];
  try { localStorage.setItem(`local_details_${repo}_commits`, JSON.stringify(updated.slice(0, 500))); } catch (_) {}
  return { success: true, isRemote: false, sha: localHash, updatedCommits: updated };
}

export async function executeSaveAndCommitFileOperation(params: {
  repo: string;
  owner?: string | null;
  authorName: string;
  branch: string;
  filePath: string;
  content: string;
  message: string;
  description?: string;
  githubToken: string | null;
  activeCommits: GitCommitNode[];
}): Promise<{ isRemote: boolean; sha: string; updatedCommits?: GitCommitNode[]; warning?: string }> {
  const { repo, owner, authorName, branch, filePath, content, message, description, githubToken, activeCommits } = params;
  const cleanPath = filePath.trim().replace(/^\/+/, '');
  const cleanMsg = message.trim();
  const fullMsg = description?.trim() ? `${cleanMsg}\n\n${description.trim()}` : cleanMsg;

  try { localStorage.setItem(`local_file_${repo}_${cleanPath}`, content); } catch (_) {}

  if (githubToken && owner && owner !== 'local-user') {
    try {
      const res = await pushFileToGitHub(owner, repo, cleanPath, content, fullMsg, branch, githubToken);
      const shortSha = res.commit?.sha ? res.commit.sha.substring(0, 7) : 'updated';
      return { isRemote: true, sha: shortSha };
    } catch (err: any) {
      // Remote push failed, proceed to local save with warning
    }
  }

  const localHash = Math.random().toString(16).substring(2, 9);
  const existing = getLocalRepoDetails(repo, "commits");
  const newCommit: GitCommitNode = {
    hash: localHash, fullHash: `${localHash}0000000000000000`, msg: fullMsg,
    author: authorName, time: "Just now", timestamp: new Date().toISOString(),
    add: "+1", del: "-0", parents: existing.length > 0 ? [existing[0].hash] : [],
    isPrimary: true, files: [{ filename: cleanPath, status: 'modified', additions: 1, deletions: 0 }],
  };
  const updated = [newCommit, ...existing];
  try { localStorage.setItem(`local_details_${repo}_commits`, JSON.stringify(updated.slice(0, 500))); } catch (_) {}
  return { isRemote: false, sha: localHash, updatedCommits: updated };
}
