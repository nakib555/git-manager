import { GitCommitNode } from '../types';
import { formatTime } from './contextUtils';

export const fetchRemoteCommits = async (
  owner: string,
  repo: string,
  branch: string,
  headers: Record<string, string>
): Promise<GitCommitNode[]> => {
  const commitsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=100`,
    { headers },
  );
  if (!commitsRes.ok) return [];
  const rawCommits = await commitsRes.json();
  return Promise.all(
    rawCommits.map(async (c: any, index: number) => {
      let add = "+0";
      let del = "-0";
      if (index < 10 && c.url) {
        try {
          const detailRes = await fetch(c.url, { headers });
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.stats) {
              add = `+${detailData.stats.additions || 0}`;
              del = `-${detailData.stats.deletions || 0}`;
            }
          }
        } catch (_) {}
      }
      const parents = Array.isArray(c.parents)
        ? c.parents.map((p: any) => (typeof p === 'string' ? p : p.sha))
        : [];
      return {
        hash: c.sha.substring(0, 7),
        fullHash: c.sha,
        timestamp: c.commit.author?.date || c.commit.committer?.date || new Date().toISOString(),
        msg: c.commit.message,
        author: c.commit.author?.name || c.author?.login || "GitHub User",
        time: formatTime(c.commit.author?.date || c.commit.committer?.date),
        add,
        del,
        parents,
        isPrimary: true,
      };
    })
  );
};

export const fetchRemoteBranches = async (
  owner: string,
  repo: string,
  activeBranch: string,
  actualDefaultBranch: string,
  headers: Record<string, string>
) => {
  const branchesRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/branches?per_page=15`,
    { headers },
  );
  if (!branchesRes.ok) return [];
  const rawBranches = await branchesRes.json();
  return rawBranches.map((b: any) => ({
    name: b.name,
    desc: `Branch head: ${b.commit.sha.substring(0, 7)}`,
    isDefault: b.name === actualDefaultBranch,
    borderColor: b.name === activeBranch ? "#38BDF8" : "transparent",
  }));
};

export const fetchRemotePRs = async (
  owner: string,
  repo: string,
  headers: Record<string, string>
) => {
  const prsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=15`,
    { headers },
  );
  if (!prsRes.ok) return [];
  const rawPRs = await prsRes.json();
  return rawPRs.map((p: any) => ({
    id: p.number,
    title: p.title,
    desc: p.body || "No description provided",
    author: p.user?.login || "unknown",
    avatar: p.user?.avatar_url || "",
    time: formatTime(p.created_at),
    created_at: p.created_at,
    status: p.draft ? "Draft" : p.state === "closed" ? (p.merged_at ? "Merged" : "Closed") : "Open",
    comments: p.comments || 0,
    hasConflicts: false,
    source: p.head?.ref || "feature-branch",
    target: p.base?.ref || "main",
  }));
};

export const fetchRemoteFilesTree = async (
  owner: string,
  repo: string,
  branch: string,
  headers: Record<string, string>
) => {
  const filesRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers },
  );
  if (!filesRes.ok) return [];
  const rawFiles = await filesRes.json();
  const tree = rawFiles.tree || (Array.isArray(rawFiles) ? rawFiles : []);
  const filtered = tree.filter((f: any) => {
    const p = f.path || f.name || '';
    return !p.startsWith('.git/') && !p.includes('/.git/') && !p.startsWith('node_modules/') && !p.includes('/node_modules/') && !p.startsWith('dist/') && !p.startsWith('build/');
  });

  return filtered.slice(0, 1500).map((f: any) => {
    const isDir = f.type === "tree" || f.type === "dir";
    const size = isDir ? undefined : (typeof f.size === 'number' ? f.size : 1240);
    const lines = isDir ? undefined : (f.lines || (typeof size === 'number' ? Math.max(1, Math.round(size / 32)) : 42));
    const p = f.path || f.name;
    return {
      name: p,
      path: p,
      type: isDir ? "dir" : "file",
      size,
      lines,
      sha: f.sha,
      isCurrent: p.toLowerCase().endsWith(".tsx") || p.toLowerCase().endsWith(".md"),
    };
  });
};
