import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../AppContext';
import {
  CommitFilter,
  DatePreset,
  normalizeDateRange,
  filterLocalCommits,
} from '../features/commit/utils/commitFilterUtils';
import { fetchRemoteCommits } from '../features/commit/utils/commitApiService';

export type { DatePreset, CommitFilter };
export { normalizeDateRange, filterLocalCommits };

export const useCommits = (filters: CommitFilter) => {
  const { currentRepo, currentRepoOwner, githubToken, activeCommits } = useAppContext();

  return useQuery({
    queryKey: ['commits', currentRepoOwner, currentRepo, filters, activeCommits?.length],
    queryFn: async () => {
      const selectedPageSize = filters.pageSize === -1 ? 100 : (filters.pageSize || 10);

      const getFallbackResult = () => {
        let repoSpecificCommits = activeCommits || [];
        if (currentRepo) {
          try {
            const raw = localStorage.getItem(`local_details_${currentRepo}_commits`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) repoSpecificCommits = parsed;
            }
          } catch (_) {}
        }
        const filtered = filterLocalCommits(repoSpecificCommits, { ...filters, sortDirection: filters.sortDirection || 'desc' });
        const pageSize = filters.pageSize === -1 ? Math.max(1, filtered.length) : (filters.pageSize || 10);
        const startIndex = ((filters.page || 1) - 1) * pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + pageSize);
        return {
          items: pageItems,
          totalCount: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
          isFallback: true,
        };
      };

      if (!currentRepoOwner || !currentRepo) {
        return getFallbackResult();
      }

      try {
        const { items: remoteItems, totalCount: remoteCount } = await fetchRemoteCommits({
          owner: currentRepoOwner,
          repo: currentRepo,
          token: githubToken,
          filters,
        });

        let items = remoteItems;
        let totalCount = remoteCount;

        if ((!filters.page || filters.page === 1) && activeCommits && activeCommits.length > 0) {
          let repoSpecificLocalCommits: any[] = [];
          try {
            const raw = localStorage.getItem(`local_details_${currentRepo}_commits`);
            if (raw) repoSpecificLocalCommits = JSON.parse(raw);
          } catch (_) {}

          const localOnly = activeCommits.filter(
            (lc: any) =>
              repoSpecificLocalCommits.some((rsc: any) => rsc.hash === lc.hash || rsc.fullHash === lc.fullHash) &&
              !items.some((it: any) => it.hash === lc.hash || it.fullHash === lc.fullHash)
          );
          if (localOnly.length > 0) {
            items = [...localOnly, ...items];
            totalCount += localOnly.length;
          }
        }

        const direction = filters.sortDirection || 'desc';
        items.sort((a: any, b: any) => {
          const tA = new Date(a.timestamp || a.date || 0).getTime();
          const tB = new Date(b.timestamp || b.date || 0).getTime();
          return direction === 'desc' ? tB - tA : tA - tB;
        });

        return {
          items,
          totalCount,
          totalPages: Math.max(1, Math.ceil(totalCount / selectedPageSize)),
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
    placeholderData: (previousData: any) => previousData,
  });
};
