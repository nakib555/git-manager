import { AppState, GitHubRepo } from '../../types';
import { DEMO_COMMITS, DEMO_BRANCHES, DEMO_PRS, DEMO_FILES } from '../../data/demoData';
import { getLocalRepos, getLocalRepoDetails } from '../contextUtils';
import { fetchUserProfile, fetchUserRepos, searchGlobalRepositories, ensureWebhookInstalled } from '../gitApiServices';
import { fetchRemoteCommits, fetchRemoteBranches, fetchRemotePRs, fetchRemoteFilesTree } from '../gitRepoDetailServices';

export async function executeFetchGitHubData(
  token: string,
  state: AppState,
  pageOverride?: number,
  searchOverride?: string
): Promise<{
  sanitizedUser: any;
  githubRepos: GitHubRepo[];
  currentRepo: string | null;
  currentRepoOwner: string | null;
  repoTotalPages: number;
}> {
  const page = pageOverride !== undefined ? pageOverride : state.repoPage;
  const perPage = state.repoPerPage;
  const searchQuery = searchOverride !== undefined ? searchOverride : state.repoSearchQuery;

  let sanitizedUser = state.githubUser;
  if (!sanitizedUser || sanitizedUser.login === 'octodev') {
    try {
      sanitizedUser = await fetchUserProfile(token);
    } catch (_) {
      sanitizedUser = state.githubUser;
    }
  }

  let reposData: GitHubRepo[] = [];
  let totalPages = 1;

  if (state.repoSearchScope === 'global' && searchQuery?.trim()) {
    const result = await searchGlobalRepositories(token, searchQuery.trim(), page, perPage, state.repoSortBy, state.repoSortDirection);
    reposData = result.items;
    totalPages = result.totalPages;
  } else {
    reposData = await fetchUserRepos(token);
    totalPages = Math.max(1, Math.ceil(reposData.length / perPage));
  }

  const localRepos = getLocalRepos();
  const mergedRepos = [...reposData];
  for (const local of localRepos) {
    if (!mergedRepos.some(r => r.name === local.name)) mergedRepos.unshift(local);
  }

  const calculatedTotalPages = state.repoSearchScope === 'personal'
    ? Math.max(1, Math.ceil(mergedRepos.length / perPage))
    : totalPages;

  let nextRepo = state.currentRepo;
  let nextOwner = state.currentRepoOwner;
  const isDemoSelection = !nextRepo || nextRepo === 'nexus-web-engine' || nextOwner === 'octodev';
  if ((isDemoSelection || !mergedRepos.some(r => r.name === nextRepo)) && mergedRepos.length > 0) {
    nextRepo = mergedRepos[0].name;
    nextOwner = (mergedRepos[0].owner?.login) || sanitizedUser?.login || '';
    localStorage.setItem("currentRepo", nextRepo);
    localStorage.setItem("currentRepoOwner", nextOwner);
  }

  return {
    sanitizedUser,
    githubRepos: mergedRepos,
    currentRepo: nextRepo,
    currentRepoOwner: nextOwner,
    repoTotalPages: calculatedTotalPages,
  };
}

export async function executeFetchRepoDetails(
  repoName: string,
  owner: string,
  token: string | null,
  branchOverride?: string
) {
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (token) headers["Authorization"] = token.startsWith('Bearer ') || token.startsWith('token ') ? token : `Bearer ${token}`;

  if (!token || owner === 'octodev' || repoName === 'nexus-web-engine') {
    const localCommits = getLocalRepoDetails(repoName, "commits");
    const uniqueLocal = localCommits.filter((lc: any) => !DEMO_COMMITS.some((gc: any) => gc.hash === lc.hash));
    return {
      currentBranch: branchOverride || "main",
      activeCommits: [...uniqueLocal, ...DEMO_COMMITS],
      activeBranches: DEMO_BRANCHES,
      activePRs: DEMO_PRS,
      activeFiles: DEMO_FILES,
      activeLanguages: { TypeScript: 68, Rust: 22, CSS: 10 },
    };
  }

  ensureWebhookInstalled(token, owner, repoName);

  let activeBranch = branchOverride || "main";
  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
    if (repoRes.ok) {
      const repoData = await repoRes.json();
      if (!branchOverride && repoData.default_branch) activeBranch = repoData.default_branch;
    }
  } catch (_) {}

  const [commitsData, branchesData, prsData, filesData] = await Promise.all([
    fetchRemoteCommits(owner, repoName, activeBranch, headers),
    fetchRemoteBranches(owner, repoName, activeBranch, "main", headers),
    fetchRemotePRs(owner, repoName, headers),
    fetchRemoteFilesTree(owner, repoName, activeBranch, headers),
  ]);

  const localCommits = getLocalRepoDetails(repoName, "commits");
  const uniqueLocal = localCommits.filter((lc: any) => !commitsData.some((gc: any) => gc.hash === lc.hash));
  const mergedCommits = [...uniqueLocal, ...commitsData];

  try {
    localStorage.setItem(`local_details_${repoName}_commits`, JSON.stringify(mergedCommits.slice(0, 500)));
    if (branchesData.length) localStorage.setItem(`local_details_${repoName}_branches`, JSON.stringify(branchesData.slice(0, 100)));
    if (prsData.length) localStorage.setItem(`local_details_${repoName}_prs`, JSON.stringify(prsData.slice(0, 100)));
    if (filesData.length) localStorage.setItem(`local_details_${repoName}_files`, JSON.stringify(filesData));
    localStorage.setItem("currentBranch", activeBranch);
  } catch (_) {}

  return {
    currentBranch: activeBranch,
    activeCommits: mergedCommits,
    activeBranches: branchesData.length ? branchesData : getLocalRepoDetails(repoName, "branches"),
    activePRs: prsData.length ? prsData : getLocalRepoDetails(repoName, "prs"),
    activeFiles: filesData.length ? filesData : getLocalRepoDetails(repoName, "files"),
  };
}
