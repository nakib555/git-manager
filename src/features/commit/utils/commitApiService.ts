import { formatTime } from '../../../AppContext';
import { CommitFilter, normalizeDateRange } from './commitFilterUtils';

interface FetchRemoteCommitsParams {
  owner: string;
  repo: string;
  token?: string | null;
  filters: CommitFilter;
}

export const fetchRemoteCommits = async ({
  owner,
  repo,
  token,
  filters,
}: FetchRemoteCommitsParams) => {
  const { sinceDate, untilDate } = normalizeDateRange(filters.since, filters.until);
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const isSearch = !!filters.query;
  const selectedPageSize = filters.pageSize === -1 ? 100 : (filters.pageSize || 10);
  let url = '';
  let totalCount = 0;

  if (isSearch) {
    headers['Accept'] = 'application/vnd.github.cloak-preview';
    let q = `repo:${owner}/${repo}`;
    if (filters.query) q += ` ${filters.query}`;
    if (filters.author) q += ` author:${filters.author}`;
    if (filters.since && filters.until) q += ` committer-date:${filters.since}..${filters.until}`;
    else if (filters.since) q += ` committer-date:>=${filters.since}`;
    else if (filters.until) q += ` committer-date:<=${filters.until}`;
    url = `https://api.github.com/search/commits?q=${encodeURIComponent(q)}&per_page=${selectedPageSize}&page=${filters.page}`;
  } else {
    url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${selectedPageSize}&page=${filters.page}`;
    if (filters.branch) url += `&sha=${encodeURIComponent(filters.branch)}`;
    if (filters.author) url += `&author=${encodeURIComponent(filters.author)}`;
    if (sinceDate) url += `&since=${sinceDate.toISOString()}`;
    if (untilDate) url += `&until=${untilDate.toISOString()}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch commits (${res.status})`);
  }

  const data = await res.json();
  if (isSearch) {
    totalCount = data.total_count || 0;
  } else {
    try {
      const linkHeader = res.headers.get('Link');
      if (linkHeader) {
        const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
        if (match) totalCount = parseInt(match[1], 10);
      } else {
        totalCount = Array.isArray(data) ? data.length : 0;
      }
    } catch {
      totalCount = Array.isArray(data) ? data.length : 0;
    }
  }

  const rawItems = isSearch ? (data.items || []) : (Array.isArray(data) ? data : []);
  const items = rawItems.map((c: any) => {
    const authorDate = c.commit?.author?.date || c.commit?.committer?.date || new Date().toISOString();
    const parents = Array.isArray(c.parents) ? c.parents.map((p: any) => (typeof p === 'string' ? p : p.sha)) : [];
    return {
      hash: (c.sha || '').substring(0, 7),
      fullHash: c.sha || '',
      timestamp: authorDate,
      msg: c.commit?.message || '',
      author: c.commit?.author?.name || c.author?.login || "GitHub User",
      time: formatTime(authorDate),
      avatar: c.author?.avatar_url,
      add: c.stats ? `+${c.stats.additions || 0}` : '+0',
      del: c.stats ? `-${c.stats.deletions || 0}` : '-0',
      parents,
    };
  });

  return { items, totalCount };
};
