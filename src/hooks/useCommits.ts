import { useInfiniteQuery } from '@tanstack/react-query';
import { useAppContext, formatTime } from '../AppContext';

export interface CommitFilter {
  query: string;
  branch: string;
  author: string;
}

export const useCommits = (filters: CommitFilter) => {
  const { currentRepo, currentRepoOwner, githubToken, activeCommits } = useAppContext();

  return useInfiniteQuery({
    queryKey: ['commits', currentRepoOwner, currentRepo, filters],
    queryFn: async ({ pageParam = 1 }) => {
      // Offline / Local mocked repos
      if (!githubToken || !currentRepoOwner || !currentRepo) {
        const filtered = activeCommits.filter(c => {
          if (filters.query && !c.msg.toLowerCase().includes(filters.query.toLowerCase()) && !c.hash.includes(filters.query)) return false;
          if (filters.author && !c.author.toLowerCase().includes(filters.author.toLowerCase())) return false;
          return true;
        });
        const PAGE_SIZE = 30;
        const start = (pageParam - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return {
          items: filtered.slice(start, end),
          nextPage: filtered.length > end ? pageParam + 1 : undefined,
        };
      }

      const headers: any = { 
        Authorization: `Bearer ${githubToken}`,
      };

      const isSearch = filters.query || filters.author;
      let url = '';

      if (isSearch) {
        headers['Accept'] = 'application/vnd.github.cloak-preview';
        let q = `repo:${currentRepoOwner}/${currentRepo}`;
        if (filters.query) q += ` ${filters.query}`;
        if (filters.author) q += ` author:${filters.author}`;
        
        url = `https://api.github.com/search/commits?q=${encodeURIComponent(q)}&per_page=30&page=${pageParam}`;
      } else {
        url = `https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/commits?per_page=30&page=${pageParam}`;
        if (filters.branch) {
          url += `&sha=${filters.branch}`;
        }
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch commits');
      }

      const data = await res.json();
      const rawItems = isSearch ? data.items : data;

      const items = await Promise.all(
        rawItems.map(async (c: any, index: number) => {
          let add = "+0";
          let del = "-0";
          // Fetch detailed commit stats for first few to get real additions/deletions if we want
          // To save rate limits, we avoid fetching detail for all 30 commits per page.
          // In a real app with large data, we rely on the list view not needing exact add/del for every commit, or use GraphQL.
          if (index < 3 && c.url && !isSearch) {
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
        })
      );

      const linkHeader = res.headers.get('Link');
      const hasNext = linkHeader?.includes('rel="next"');

      return {
        items,
        nextPage: hasNext ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!currentRepo,
    staleTime: 60 * 1000,
  });
};