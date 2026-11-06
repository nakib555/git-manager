import { GitHubRepo, GitHubUser, RepoSortBy, RepoSortDirection } from '../types';
import { sanitizeGitHubUser } from './contextUtils';

export const fetchUserProfile = async (token: string): Promise<GitHubUser | null> => {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };
  const userRes = await fetch("https://api.github.com/user", { headers });
  if (userRes.ok) {
    const userData = await userRes.json();
    const sanitized = sanitizeGitHubUser(userData);
    if (sanitized) {
      localStorage.setItem("githubUser", JSON.stringify(sanitized));
    }
    return sanitized;
  }
  return null;
};

export const fetchUserRepos = async (token: string): Promise<GitHubRepo[]> => {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };
  let allUserRepos: GitHubRepo[] = [];
  let curPage = 1;
  let hasMore = true;

  while (hasMore && curPage <= 5) {
    const reposUrl = `https://api.github.com/user/repos?sort=updated&per_page=100&page=${curPage}&affiliation=owner,collaborator,organization_member`;
    const reposRes = await fetch(reposUrl, { headers });
    if (!reposRes.ok) break;
    const pageRepos: GitHubRepo[] = await reposRes.json();
    if (Array.isArray(pageRepos) && pageRepos.length > 0) {
      allUserRepos.push(...pageRepos);
      if (pageRepos.length < 100) hasMore = false;
      else curPage++;
    } else {
      hasMore = false;
    }
  }
  return allUserRepos;
};

export const searchGlobalRepositories = async (
  token: string,
  query: string,
  page: number,
  perPage: number,
  sortBy: RepoSortBy,
  sortDir: RepoSortDirection
): Promise<{ items: GitHubRepo[]; totalPages: number }> => {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };
  const apiSort = (sortBy === 'stars' || sortBy === 'forks' || sortBy === 'updated') ? sortBy : 'updated';
  const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${apiSort}&order=${sortDir}&per_page=${perPage}&page=${page}`;
  
  const searchRes = await fetch(searchUrl, { headers });
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    const items = searchData.items || [];
    const totalCount = searchData.total_count || 0;
    const totalPages = Math.max(1, Math.min(Math.ceil(totalCount / perPage), 67));
    return { items, totalPages };
  }
  return { items: [], totalPages: 1 };
};

export const ensureWebhookInstalled = async (token: string, owner: string, repoName: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    };
    const hooksRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/hooks`, { headers });
    if (hooksRes.ok) {
      const hooks = await hooksRes.json();
      const webhookUrl = `${window.location.origin}/api/webhooks/github`;
      const hasHook = hooks.some((hook: any) => hook.config?.url === webhookUrl);
      if (!hasHook) {
        await fetch(`https://api.github.com/repos/${owner}/${repoName}/hooks`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'web',
            active: true,
            events: ['push', 'pull_request', 'issues', 'issue_comment', 'create', 'delete'],
            config: { url: webhookUrl, content_type: 'json' },
          }),
        });
      }
    }
  } catch (e) {
    console.warn("Failed to ensure webhook:", e);
  }
};
