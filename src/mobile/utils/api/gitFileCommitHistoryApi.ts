import { formatRelativeTime } from '../formatters';

export interface FileCommitItem {
  hash: string;
  fullHash: string;
  msg: string;
  author: string;
  avatar?: string;
  timestamp: string;
  time?: string;
  add?: string;
  del?: string;
  parents?: string[];
  isPrimary?: boolean;
}

/**
 * Fetches the complete commit history for an individual file path from the GitHub API,
 * falling back to all active branch commits from first to current.
 */
export async function fetchFileCommitHistorySafe({
  filePath,
  repoName,
  owner,
  branch = 'main',
  token,
  fallbackCommits = [],
}: {
  filePath: string;
  repoName: string;
  owner?: string | null;
  branch?: string | null;
  token?: string | null;
  fallbackCommits?: any[];
}): Promise<FileCommitItem[]> {
  const resolvedOwner = owner || '';
  const resolvedBranch = branch || 'main';

  // 1. If online token or public repo, query GitHub commits specifically for this file path
  if (repoName && resolvedOwner && resolvedOwner !== 'octodev' && repoName !== 'nexus-web-engine') {
    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
      };
      if (token) {
        headers['Authorization'] =
          token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
            ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
            : `token ${token}`;
      }

      const url = `https://api.github.com/repos/${encodeURIComponent(resolvedOwner)}/${encodeURIComponent(
        repoName
      )}/commits?path=${encodeURIComponent(filePath)}&sha=${encodeURIComponent(resolvedBranch)}&per_page=100`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((c: any) => {
            const dateStr = c.commit?.author?.date || c.commit?.committer?.date || '';
            return {
              hash: (c.sha || '').substring(0, 7),
              fullHash: c.sha || '',
              msg: c.commit?.message?.split('\n')[0] || 'Commit',
              author: c.commit?.author?.name || c.author?.login || 'Author',
              avatar: c.author?.avatar_url,
              timestamp: dateStr,
              time: formatRelativeTime(dateStr),
              add: c.stats?.additions ? `+${c.stats.additions}` : '+1',
              del: c.stats?.deletions ? `-${c.stats.deletions}` : '-0',
              parents: Array.isArray(c.parents) ? c.parents.map((p: any) => p.sha) : [],
              isPrimary: true,
            };
          });
        }
      }
    } catch (err) {
      console.warn('[GitAPI] Error fetching file commit history from GitHub:', err);
    }
  }

  // 2. Fallback to repository commits (all from first to current)
  if (fallbackCommits && fallbackCommits.length > 0) {
    const fileNameOnly = filePath.split('/').pop()?.toLowerCase() || '';
    const pathLower = filePath.toLowerCase();

    // Check if any commits in fallback specifically mention the file
    const matched = fallbackCommits.filter((c: any) => {
      const msg = (c.msg || '').toLowerCase();
      if (msg.includes(fileNameOnly) || msg.includes(pathLower)) return true;
      if (Array.isArray(c.files) && c.files.some((f: any) => (f.filename || '').toLowerCase().includes(fileNameOnly))) {
        return true;
      }
      return false;
    });

    // If specific commits matched, return them plus the initial commit if not present
    if (matched.length > 0) {
      // If the initial commit isn't in matched, ensure the genesis commit is included
      const initialCommit = fallbackCommits[fallbackCommits.length - 1];
      if (initialCommit && !matched.some(m => m.hash === initialCommit.hash)) {
        return [...matched, initialCommit];
      }
      return matched;
    }

    // Otherwise, return ALL commits from current down to the first initial commit
    return fallbackCommits;
  }

  return [];
}
