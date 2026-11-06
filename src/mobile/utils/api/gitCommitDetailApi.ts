import { DetailedCommitInfo, ChangedFileDiff, CheckRunItem } from './gitApiTypes';

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
    const res = await fetch(`https://api.github.com/repos/${resolvedOwner}/${repoName}/commits/${commitSha}`, { headers });
    if (res.ok) {
      const data = await res.json();
      const files: ChangedFileDiff[] = (data.files || []).map((f: any) => ({
        filename: f.filename,
        status: f.status || 'modified',
        additions: f.additions || 0,
        deletions: f.deletions || 0,
        patch: f.patch || (f.status === 'added' ? '(New file added)' : '(Diff omitted by GitHub API or binary file)'),
      }));

      const checkRuns = await fetchCommitCheckRuns({ owner: resolvedOwner, repo: repoName, ref: commitSha, token });

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
