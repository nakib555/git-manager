import { useQuery } from '@tanstack/react-query';
import { useAppContext, formatTime } from '../AppContext';

export interface CommitFilter {
  query: string;
  branch: string;
  author: string;
  since: string;
  until: string;
  page: number;
}

export const useCommits = (filters: CommitFilter) => {
  const { currentRepo, currentRepoOwner, githubToken, activeCommits } = useAppContext();

  return useQuery({
    queryKey: ['commits', currentRepoOwner, currentRepo, filters],
    queryFn: async () => {
      const headers: any = {};
      if (githubToken) {
        headers['Authorization'] = `Bearer ${githubToken}`;
      }

      const isSearch = !!filters.query;
      let url = '';
      let totalCount = 0;

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
        
        url = `https://api.github.com/search/commits?q=${encodeURIComponent(q)}&per_page=30&page=${filters.page}`;
      } else {
        url = `https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/commits?per_page=30&page=${filters.page}`;
        if (filters.branch) {
          url += `&sha=${filters.branch}`;
        }
        if (filters.author) {
          url += `&author=${filters.author}`;
        }
        if (filters.since) url += `&since=${new Date(filters.since).toISOString()}`;
        if (filters.until) url += `&until=${new Date(filters.until).toISOString()}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch commits');
      }
      const data = await res.json();
      
      if (isSearch) {
        totalCount = data.total_count || 0;
      } else {
        // We need to fetch total count using pagination logic if not search
        let countUrl = `https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/commits?per_page=1`;
        if (filters.branch) countUrl += `&sha=${filters.branch}`;
        if (filters.author) countUrl += `&author=${filters.author}`;
        if (filters.since) countUrl += `&since=${new Date(filters.since).toISOString()}`;
        if (filters.until) countUrl += `&until=${new Date(filters.until).toISOString()}`;
        
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
      }

      const rawItems = isSearch ? data.items : data;
      
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
              return {
                hash: c.sha.substring(0, 7),
                fullHash: c.sha,
                timestamp: c.commit.author?.date || c.commit.committer?.date || new Date().toISOString(),
                msg: c.commit.message,
                author: c.commit.author?.name || c.author?.login || "GitHub User",
                time: formatTime(c.commit.author?.date || c.commit.committer?.date),
                avatar: c.author?.avatar_url,
                add,
                del,
              };
           }));
           results.push(...batchResults);
        }
        return results;
      };

      const items = await fetchWithLimit(rawItems, 5);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / 30)
      };
    },
    enabled: !!currentRepo,
    staleTime: 60 * 1000,
  });
};
