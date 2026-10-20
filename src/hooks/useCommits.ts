import { useQuery } from '@tanstack/react-query';
import { useAppContext, formatTime } from '../AppContext';

export type DatePreset = 'all' | 'today' | '7d' | '30d' | 'year' | 'custom';

export interface CommitFilter {
  query: string;
  branch: string;
  author: string;
  since: string;
  until: string;
  datePreset?: DatePreset;
  page: number;
}

/**
 * Normalizes date inputs to ensure inclusive start-of-day and end-of-day bounds
 * without throwing RangeError on malformed dates.
 */
export const normalizeDateRange = (since?: string, until?: string) => {
  let sinceDate: Date | null = null;
  let untilDate: Date | null = null;

  if (since && since.trim()) {
    try {
      const d = new Date(since.includes('T') ? since : `${since}T00:00:00`);
      if (!isNaN(d.getTime())) {
        sinceDate = d;
      }
    } catch (_) {}
  }

  if (until && until.trim()) {
    try {
      const d = new Date(until.includes('T') ? until : `${until}T23:59:59.999`);
      if (!isNaN(d.getTime())) {
        untilDate = d;
      }
    } catch (_) {}
  }

  return { sinceDate, untilDate };
};

/**
 * Filter an array of commits locally based on query, author, and date range
 */
export const filterLocalCommits = (commits: any[], filters: Partial<CommitFilter>) => {
  if (!commits || !Array.isArray(commits)) return [];
  const q = (filters.query || '').trim().toLowerCase();
  const authorQ = (filters.author || '').trim().toLowerCase();
  const { sinceDate, untilDate } = normalizeDateRange(filters.since, filters.until);
  const sinceTime = sinceDate ? sinceDate.getTime() : null;
  const untilTime = untilDate ? untilDate.getTime() : null;

  return commits.filter((c: any) => {
    // 1. Query filter (matches commit message, short hash, or full hash)
    if (q) {
      const msgMatch = (c.msg || '').toLowerCase().includes(q);
      const hashMatch = (c.hash || '').toLowerCase().includes(q);
      const fullHashMatch = (c.fullHash || '').toLowerCase().includes(q);
      if (!msgMatch && !hashMatch && !fullHashMatch) return false;
    }

    // 2. Author filter
    if (authorQ) {
      const authorMatch = (c.author || '').toLowerCase().includes(authorQ);
      if (!authorMatch) return false;
    }

    // 3. Date range filter
    if (sinceTime !== null || untilTime !== null) {
      const rawDate = c.timestamp || c.date;
      if (rawDate) {
        const commitTime = new Date(rawDate).getTime();
        if (!isNaN(commitTime)) {
          if (sinceTime !== null && commitTime < sinceTime) return false;
          if (untilTime !== null && commitTime > untilTime) return false;
        }
      }
    }

    return true;
  });
};

export const useCommits = (filters: CommitFilter) => {
  const { currentRepo, currentRepoOwner, githubToken, activeCommits, lastSyncTimestamp } = useAppContext();

  return useQuery({
    queryKey: ['commits', currentRepoOwner, currentRepo, filters, activeCommits?.length, lastSyncTimestamp],
    queryFn: async () => {
      const { sinceDate, untilDate } = normalizeDateRange(filters.since, filters.until);
      const headers: any = {};
      if (githubToken) {
        headers['Authorization'] = `Bearer ${githubToken}`;
      }

      const isSearch = !!filters.query;
      let url = '';
      let totalCount = 0;

      // Helper to generate fallback result from activeCommits
      const getFallbackResult = () => {
        const filtered = filterLocalCommits(activeCommits || [], filters);
        const pageSize = 10;
        const startIndex = ((filters.page || 1) - 1) * pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + pageSize);
        return {
          items: pageItems,
          totalCount: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
          isFallback: true,
        };
      };

      try {
        if (!currentRepoOwner || !currentRepo) {
          return getFallbackResult();
        }

        if (isSearch) {
          headers['Accept'] = 'application/vnd.github.cloak-preview';
          let q = `repo:${currentRepoOwner}/${currentRepo}`;
          if (filters.query) q += ` ${filters.query}`;
          if (filters.author) q += ` author:${filters.author}`;
          if (filters.since && filters.until) {
            q += ` committer-date:${filters.since}..${filters.until}`;
          } else if (filters.since) {
            q += ` committer-date:>=${filters.since}`;
          } else if (filters.until) {
            q += ` committer-date:<=${filters.until}`;
          }
          
          url = `https://api.github.com/search/commits?q=${encodeURIComponent(q)}&per_page=10&page=${filters.page}`;
        } else {
          url = `https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/commits?per_page=10&page=${filters.page}`;
          if (filters.branch) {
            url += `&sha=${encodeURIComponent(filters.branch)}`;
          }
          if (filters.author) {
            url += `&author=${encodeURIComponent(filters.author)}`;
          }
          if (sinceDate) url += `&since=${sinceDate.toISOString()}`;
          if (untilDate) url += `&until=${untilDate.toISOString()}`;
        }

        const res = await fetch(url, { headers });
        if (!res.ok) {
          // If remote search rate limit (403) or 422 occurs, fallback gracefully to activeCommits
          if (activeCommits && activeCommits.length > 0) {
            console.warn(`Remote commits fetch returned status ${res.status}. Falling back to local commits cache.`);
            return getFallbackResult();
          }
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Failed to fetch commits (${res.status})`);
        }

        const data = await res.json();
        
        if (isSearch) {
          totalCount = data.total_count || 0;
        } else {
          let countUrl = `https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/commits?per_page=1`;
          if (filters.branch) countUrl += `&sha=${encodeURIComponent(filters.branch)}`;
          if (filters.author) countUrl += `&author=${encodeURIComponent(filters.author)}`;
          if (sinceDate) countUrl += `&since=${sinceDate.toISOString()}`;
          if (untilDate) countUrl += `&until=${untilDate.toISOString()}`;
          
          try {
            const countRes = await fetch(countUrl, { headers });
            if (countRes.ok) {
              const linkHeader = countRes.headers.get('Link');
              if (linkHeader) {
                const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
                if (match) {
                  totalCount = parseInt(match[1], 10);
                } else {
                  const singleData = await countRes.json();
                  totalCount = singleData.length || 0;
                }
              } else {
                const singleData = await countRes.json();
                totalCount = singleData.length || 0;
              }
            }
          } catch (_) {
            totalCount = Array.isArray(data) ? data.length : 0;
          }
        }

        const rawItems = isSearch ? (data.items || []) : (Array.isArray(data) ? data : []);
        
        const fetchWithLimit = async (items: any[], limit: number) => {
          const results = [];
          for (let i = 0; i < items.length; i += limit) {
             const batch = items.slice(i, i + limit);
             const batchResults = await Promise.all(batch.map(async (c: any) => {
                let add = "+0";
                let del = "-0";
                if (c.url) { 
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
                const authorDate = c.commit?.author?.date || c.commit?.committer?.date || new Date().toISOString();
                const parents = Array.isArray(c.parents) 
                  ? c.parents.map((p: any) => (typeof p === 'string' ? p : p.sha)) 
                  : [];
                return {
                  hash: (c.sha || '').substring(0, 7),
                  fullHash: c.sha || '',
                  timestamp: authorDate,
                  msg: c.commit?.message || '',
                  author: c.commit?.author?.name || c.author?.login || "GitHub User",
                  time: formatTime(authorDate),
                  avatar: c.author?.avatar_url,
                  add,
                  del,
                  parents,
                };
             }));
             results.push(...batchResults);
          }
          return results;
        };

        let items = await fetchWithLimit(rawItems, 5);

        // Prepend any local commits from activeCommits on page 1 if not present in items
        if ((!filters.page || filters.page === 1) && activeCommits && activeCommits.length > 0) {
          const localOnly = activeCommits.filter(
            (lc: any) => !items.some((it: any) => it.hash === lc.hash || it.fullHash === lc.fullHash)
          );
          if (localOnly.length > 0) {
            items = [...localOnly, ...items];
            totalCount += localOnly.length;
          }
        }

        return {
          items,
          totalCount,
          totalPages: Math.max(1, Math.ceil(totalCount / 10)),
          isFallback: false,
        };
      } catch (err: any) {
        if (activeCommits && activeCommits.length > 0) {
          console.warn('Commits fetch caught error, using local fallback:', err.message);
          return getFallbackResult();
        }
        throw err;
      }
    },
    enabled: !!currentRepo,
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000,
  });
};
