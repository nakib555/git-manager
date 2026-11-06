export const filterChips = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
  { id: 'forks', label: 'Forks' },
  { id: 'sources', label: 'Sources' },
] as const;

export const sortOptions = [
  { id: 'updated', label: 'Recently Updated' },
  { id: 'stars', label: 'Most Stars' },
  { id: 'forks', label: 'Most Forks' },
  { id: 'name', label: 'Repository Name' },
] as const;
