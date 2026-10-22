import { safeBase64Decode } from './treeBuilder';

export interface ChangedFileDiff {
  filename: string;
  status: 'modified' | 'added' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
}

export interface CheckRunItem {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
  startedAt?: string;
  completedAt?: string;
  htmlUrl?: string;
}

export interface DetailedCommitInfo {
  hash: string;
  fullHash: string;
  msg: string;
  author: string;
  authorEmail?: string;
  authorAvatar?: string;
  date: string;
  verified?: boolean;
  parentSha?: string;
  stats: {
    total: number;
    additions: number;
    deletions: number;
  };
  files: ChangedFileDiff[];
  checkRuns?: CheckRunItem[];
}

export interface TimelineEventItem {
  id: string;
  type: string;
  actor: {
    login: string;
    avatarUrl?: string;
  };
  repo: {
    name: string;
  };
  createdAt: string;
  payload: any;
}

/**
 * Resilient multi-tier file content loader.
 * Works seamlessly whether authenticated or guest, public repo or private.
 */
export async function fetchFileContentSafe({
  filePath,
  repoName,
  owner,
  branch = 'main',
  token,
}: {
  filePath: string;
  repoName: string;
  owner?: string | null;
  branch?: string | null;
  token?: string | null;
}): Promise<string> {
  const resolvedOwner = owner || '';
  const resolvedBranch = branch || 'main';

  if (!resolvedOwner || !repoName) {
    return `// Repository or owner not specified.`;
  }

  // 1. If token is present, try authenticated GitHub contents API
  if (token) {
    try {
      const authHeader = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
        ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
        : `token ${token}`;

      const res = await fetch(
        `https://api.github.com/repos/${resolvedOwner}/${repoName}/contents/${filePath}?ref=${resolvedBranch}`,
        {
          headers: {
            Authorization: authHeader,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.encoding === 'base64' && data.content) {
          return safeBase64Decode(data.content);
        } else if (data.content) {
          return data.content;
        }
      }
    } catch (_) {}
  }

  // 2. Try raw.githubusercontent.com directly (unauthenticated, fast, rate-limit immune)
  try {
    const rawUrl = `https://raw.githubusercontent.com/${resolvedOwner}/${repoName}/${resolvedBranch}/${filePath}`;
    const rawRes = await fetch(rawUrl);
    if (rawRes.ok) {
      return await rawRes.text();
    }
  } catch (_) {}

  // 3. Fallback try 'master' branch on raw.githubusercontent.com if 'main' was specified
  if (resolvedBranch !== 'master') {
    try {
      const rawMasterUrl = `https://raw.githubusercontent.com/${resolvedOwner}/${repoName}/master/${filePath}`;
      const rawRes = await fetch(rawMasterUrl);
      if (rawRes.ok) {
        return await rawRes.text();
      }
    } catch (_) {}
  }

  // 4. Try unauthenticated public GitHub contents API
  try {
    const res = await fetch(
      `https://api.github.com/repos/${resolvedOwner}/${repoName}/contents/${filePath}?ref=${resolvedBranch}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.encoding === 'base64' && data.content) {
        return safeBase64Decode(data.content);
      } else if (data.content) {
        return data.content;
      }
    }
  } catch (_) {}

  return `// Unable to fetch remote content for "${filePath}".\n// If this repository is private, please configure a Personal Access Token in Settings.`;
}

/**
 * Fetches real commit changed files and unified diff patches from GitHub REST API.
 * Eliminates all dummy data and synthetic mocks.
 */
export async function fetchCommitDetailsSafe({
  commitSha,
  repoName,
  owner,
  token,
  fallbackCommit,
}: {
  commitSha: string;
  repoName: string;
  owner?: string | null;
  token?: string | null;
  fallbackCommit?: any;
}): Promise<DetailedCommitInfo> {
  const resolvedOwner = owner || '';
  if (!resolvedOwner || !repoName) {
    return {
      hash: fallbackCommit?.hash || commitSha.substring(0, 7),
      fullHash: fallbackCommit?.fullHash || commitSha,
      msg: fallbackCommit?.msg || 'Commit update',
      author: fallbackCommit?.author || 'Developer',
      authorAvatar: fallbackCommit?.avatarUrl,
      date: fallbackCommit?.date || fallbackCommit?.timestamp || new Date().toISOString(),
      verified: false,
      stats: { total: 0, additions: 0, deletions: 0 },
      files: [],
      checkRuns: [],
    };
  }
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
      ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
      : `token ${token}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${resolvedOwner}/${repoName}/commits/${commitSha}`,
      { headers }
    );

    if (res.ok) {
      const data = await res.json();
      const files: ChangedFileDiff[] = (data.files || []).map((f: any) => ({
        filename: f.filename,
        status: f.status || 'modified',
        additions: f.additions || 0,
        deletions: f.deletions || 0,
        patch: f.patch || (f.status === 'added' ? '(New file added)' : '(Diff omitted by GitHub API or binary file)'),
      }));

      // Fetch authentic check runs for this commit
      let checkRuns: CheckRunItem[] = [];
      try {
        const checksRes = await fetch(
          `https://api.github.com/repos/${resolvedOwner}/${repoName}/commits/${commitSha}/check-runs`,
          { headers }
        );
        if (checksRes.ok) {
          const checksData = await checksRes.json();
          checkRuns = (checksData.check_runs || []).map((cr: any) => ({
            id: cr.id,
            name: cr.name,
            status: cr.status,
            conclusion: cr.conclusion,
            startedAt: cr.started_at,
            completedAt: cr.completed_at,
            htmlUrl: cr.html_url,
          }));
        }
      } catch (_) {}

      return {
        hash: data.sha?.substring(0, 7) || commitSha.substring(0, 7),
        fullHash: data.sha || commitSha,
        msg: data.commit?.message || fallbackCommit?.msg || 'Commit update',
        author: data.commit?.author?.name || data.author?.login || fallbackCommit?.author || 'Developer',
        authorEmail: data.commit?.author?.email,
        authorAvatar: data.author?.avatar_url || fallbackCommit?.avatarUrl,
        date: data.commit?.author?.date || fallbackCommit?.date || new Date().toISOString(),
        verified: data.commit?.verification?.verified ?? false,
        parentSha: data.parents?.[0]?.sha,
        stats: {
          total: data.stats?.total || files.reduce((acc, f) => acc + f.additions + f.deletions, 0),
          additions: data.stats?.additions || files.reduce((acc, f) => acc + f.additions, 0),
          deletions: data.stats?.deletions || files.reduce((acc, f) => acc + f.deletions, 0),
        },
        files,
        checkRuns,
      };
    }
  } catch (err) {
    console.warn('[GitAPI] Error fetching remote commit detail:', err);
  }

  // Clean, honest fallback when remote API cannot be reached or for offline commits
  const fallbackFiles: ChangedFileDiff[] = Array.isArray(fallbackCommit?.files) ? fallbackCommit.files : [];
  return {
    hash: fallbackCommit?.hash || commitSha.substring(0, 7),
    fullHash: fallbackCommit?.fullHash || commitSha,
    msg: fallbackCommit?.msg || 'Commit update',
    author: fallbackCommit?.author || 'Developer',
    authorAvatar: fallbackCommit?.avatarUrl,
    date: fallbackCommit?.date || fallbackCommit?.timestamp || new Date().toISOString(),
    verified: false,
    stats: {
      total: fallbackFiles.reduce((acc, f) => acc + f.additions + f.deletions, 0),
      additions: fallbackFiles.reduce((acc, f) => acc + f.additions, 0),
      deletions: fallbackFiles.reduce((acc, f) => acc + f.deletions, 0),
    },
    files: fallbackFiles,
    checkRuns: [],
  };
}

/**
 * Fetches authentic GitHub check runs (CI/CD workflows) for a commit ref.
 */
export async function fetchCommitCheckRuns({
  owner,
  repo,
  ref,
  token,
}: {
  owner: string;
  repo: string;
  ref: string;
  token?: string | null;
}): Promise<CheckRunItem[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
      ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
      : `token ${token}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${ref}/check-runs`, { headers });
    if (res.ok) {
      const data = await res.json();
      return (data.check_runs || []).map((cr: any) => ({
        id: cr.id,
        name: cr.name,
        status: cr.status,
        conclusion: cr.conclusion,
        startedAt: cr.started_at,
        completedAt: cr.completed_at,
        htmlUrl: cr.html_url,
      }));
    }
  } catch (e) {
    console.warn('[GitAPI] Check runs fetch error:', e);
  }
  return [];
}

/**
 * Fetches authentic GitHub user timeline activity events or repository events.
 */
export async function fetchTimelineEvents({
  username,
  repoOwner,
  repoName,
  token,
}: {
  username?: string | null;
  repoOwner?: string | null;
  repoName?: string | null;
  token?: string | null;
}): Promise<TimelineEventItem[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
      ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
      : `token ${token}`;
  }

  let url = '';
  if (username && username !== 'guest') {
    url = `https://api.github.com/users/${username}/events?per_page=30`;
  } else if (repoOwner && repoName) {
    url = `https://api.github.com/repos/${repoOwner}/${repoName}/events?per_page=30`;
  } else {
    url = `https://api.github.com/events?per_page=30`;
  }

  try {
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          type: item.type,
          actor: {
            login: item.actor?.login || 'User',
            avatarUrl: item.actor?.avatar_url,
          },
          repo: {
            name: item.repo?.name || 'repository',
          },
          createdAt: item.created_at,
          payload: item.payload || {},
        }));
      }
    }
  } catch (err) {
    console.warn('[GitAPI] Error fetching timeline events:', err);
  }

  return [];
}
