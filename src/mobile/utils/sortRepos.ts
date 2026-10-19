import { GitHubRepo, RepoSortBy, RepoTypeFilter } from '../../types';

export interface RepoFilterOptions {
  searchQuery?: string;
  scope?: 'personal' | 'global';
  typeFilter?: RepoTypeFilter;
  sortBy?: RepoSortBy;
  sortDirection?: 'asc' | 'desc';
  languageFilter?: string;
}

/**
 * Pure deterministic repository filtering and sorting pipeline
 */
export function filterAndSortRepos(
  repos: GitHubRepo[],
  options: RepoFilterOptions
): GitHubRepo[] {
  let result = [...repos];

  const {
    searchQuery = '',
    scope = 'personal',
    typeFilter = 'all',
    sortBy = 'updated',
    sortDirection = 'desc',
    languageFilter = 'all',
  } = options;

  // 1. Text Search (Name, Description, Language)
  if (scope === 'personal' && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(repo => {
      const nameMatch = repo.name.toLowerCase().includes(q);
      const descMatch = repo.description ? repo.description.toLowerCase().includes(q) : false;
      const langMatch = repo.language ? repo.language.toLowerCase().includes(q) : false;
      return nameMatch || descMatch || langMatch;
    });
  }

  // 2. Type Filter (all, public, private, forks, sources)
  if (typeFilter === 'public') {
    result = result.filter(r => !r.private);
  } else if (typeFilter === 'private') {
    result = result.filter(r => !!r.private);
  } else if (typeFilter === 'forks') {
    result = result.filter(r => !!(r as any).fork);
  } else if (typeFilter === 'sources') {
    result = result.filter(r => !(r as any).fork);
  }

  // 3. Language Filter
  if (languageFilter && languageFilter !== 'all') {
    result = result.filter(
      r => r.language && r.language.toLowerCase() === languageFilter.toLowerCase()
    );
  }

  // 4. Multi-dimensional Sorting
  result.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'stars':
        comparison = (b.stargazers_count || 0) - (a.stargazers_count || 0);
        break;
      case 'forks':
        comparison = (b.forks_count || 0) - (a.forks_count || 0);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'updated':
      default: {
        const dateA = new Date(a.pushed_at || a.updated_at || 0).getTime();
        const dateB = new Date(b.pushed_at || b.updated_at || 0).getTime();
        comparison = dateB - dateA;
        break;
      }
    }

    return sortDirection === 'asc' ? -comparison : comparison;
  });

  return result;
}
