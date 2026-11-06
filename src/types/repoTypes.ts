export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  followers: number;
  following: number;
  bio?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  private: boolean;
  description: string;
  language: string;
  pushed_at: string;
  updated_at?: string;
  fork?: boolean;
  owner?: {
    login: string;
    avatar_url?: string;
  };
  stargazers_count?: number;
  forks_count?: number;
  watchers_count?: number;
}

export type RepoSearchScope = 'personal' | 'global';
export type RepoSortBy = 'updated' | 'stars' | 'forks' | 'name' | 'language';
export type RepoSortDirection = 'desc' | 'asc';
export type RepoTypeFilter = 'all' | 'public' | 'private' | 'forks' | 'sources';
