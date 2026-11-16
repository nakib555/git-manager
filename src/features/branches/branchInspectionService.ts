import { formatRelativeTime } from '../../mobile/utils/formatters';

export interface EnrichedBranch {
  name: string;
  commitSha: string;
  shortSha: string;
  desc: string;
  isDefault: boolean;
  isProtected: boolean;
  isActive: boolean;
  aheadBy: number | null;
  behindBy: number | null;
  lastCommitMsg: string;
  lastCommitAuthor: string;
  lastCommitTimestamp: string;
  relativeTime: string;
}

export interface BranchComparisonCommit {
  hash: string;
  fullHash: string;
  msg: string;
  author: string;
  avatar?: string;
  timestamp: string;
  time: string;
  add?: string;
  del?: string;
  parents?: string[];
  isPrimary?: boolean;
}

export interface BranchComparisonResult {
  baseBranch: string;
  headBranch: string;
  aheadBy: number;
  behindBy: number;
  status: 'identical' | 'ahead' | 'behind' | 'diverged';
  filesCount: number | null;
  commits: BranchComparisonCommit[];
  source: 'github' | 'demo' | 'local';
}

export interface BranchProtectionSummary {
  isProtected: boolean;
  directPushAllowed: boolean;
  requiresPrReview: boolean;
  requiredReviewsCount: number;
  requiresStatusChecks: boolean;
  checksLabel: string;
  enforceAdmins: boolean;
  source: 'github' | 'inferred';
}

export const resolveDefaultBranchName = (branches: any[]): string => {
  const explicitDefault = branches.find((b) => b?.isDefault);
  if (explicitDefault?.name) return explicitDefault.name;
  const mainOrMaster = branches.find((b) => b?.name === 'main' || b?.name === 'master');
  if (mainOrMaster?.name) return mainOrMaster.name;
  return branches[0]?.name || 'main';
};

export const enrichBranchesWithCommits = (
  branches: any[],
  activeCommits: any[],
  currentBranch: string | null,
  defaultBranch?: string
): EnrichedBranch[] => {
  const effectiveCurrent = currentBranch || defaultBranch || resolveDefaultBranchName(branches);
  const effectiveDefault = defaultBranch || resolveDefaultBranchName(branches);

  return branches.map((b) => {
    const name = b?.name || 'unknown';
    const isDefault = Boolean(b?.isDefault || name === effectiveDefault);
    const isActive = name === effectiveCurrent;
    const isProtected = Boolean(b?.isProtected || isDefault);

    const rawSha = String(b?.commitSha || b?.commitHash || '');
    const rawShort = String(b?.shortSha || (rawSha ? rawSha.slice(0, 7) : ''));

    // Match commit either by SHA prefix or if this is the active branch take top commit
    const matchedCommit =
      activeCommits.find(
        (c) =>
          (rawSha && (c?.fullHash === rawSha || c?.hash === rawSha)) ||
          (rawShort && c?.hash?.startsWith(rawShort))
      ) || (isActive && activeCommits.length > 0 ? activeCommits[0] : undefined);

    const shortSha = rawShort || matchedCommit?.hash?.slice(0, 7) || '';
    const commitSha = rawSha || matchedCommit?.fullHash || shortSha;
    const lastCommitMsg =
      matchedCommit?.msg || b?.lastCommitMsg || b?.desc || (shortSha ? `Head commit ${shortSha}` : 'Branch ref');
    const lastCommitAuthor = matchedCommit?.author || b?.lastCommitAuthor || '';
    const lastCommitTimestamp = matchedCommit?.timestamp || b?.lastCommitTimestamp || '';
    const relativeTime = lastCommitTimestamp
      ? formatRelativeTime(lastCommitTimestamp, matchedCommit?.time)
      : matchedCommit?.time || '';

    const aheadBy = typeof b?.aheadBy === 'number' ? b.aheadBy : isDefault ? 0 : null;
    const behindBy = typeof b?.behindBy === 'number' ? b.behindBy : isDefault ? 0 : null;

    const desc =
      b?.desc && !b.desc.startsWith('Branch head:') && !b.desc.startsWith('Branch tip ')
        ? b.desc
        : lastCommitMsg;

    return {
      name,
      commitSha,
      shortSha,
      desc,
      isDefault,
      isProtected,
      isActive,
      aheadBy,
      behindBy,
      lastCommitMsg,
      lastCommitAuthor,
      lastCommitTimestamp,
      relativeTime,
    };
  });
};

const isDemoOrLocalRepo = (owner?: string | null, repo?: string | null, token?: string | null): boolean => {
  if (!token || !owner || !repo) return true;
  if (owner === 'local-developer') return true;
  if (owner === 'octodev' && repo === 'nexus-web-engine') return true;
  return false;
};

export const fetchBranchComparison = async ({
  owner,
  repo,
  baseBranch,
  headBranch,
  token,
  activeCommits = [],
  branchMeta,
  signal,
}: {
  owner?: string | null;
  repo?: string | null;
  baseBranch: string;
  headBranch: string;
  token?: string | null;
  activeCommits?: any[];
  branchMeta?: Partial<EnrichedBranch>;
  signal?: AbortSignal;
}): Promise<BranchComparisonResult> => {
  if (!headBranch || headBranch === baseBranch) {
    return {
      baseBranch,
      headBranch: headBranch || baseBranch,
      aheadBy: 0,
      behindBy: 0,
      status: 'identical',
      filesCount: 0,
      commits: activeCommits.slice(0, 12).map((c) => ({
        hash: (c.hash || '').slice(0, 7),
        fullHash: c.fullHash || c.hash || '',
        msg: c.msg || '',
        author: c.author || 'Developer',
        avatar: c.avatar,
        timestamp: c.timestamp || '',
        time: c.time || formatRelativeTime(c.timestamp),
        add: c.add,
        del: c.del,
        parents: c.parents,
        isPrimary: c.isPrimary,
      })),
      source: isDemoOrLocalRepo(owner, repo, token) ? 'demo' : 'github',
    };
  }

  if (!isDemoOrLocalRepo(owner, repo, token)) {
    const compareUrl = `https://api.github.com/repos/${owner}/${repo}/compare/${encodeURIComponent(
      baseBranch
    )}...${encodeURIComponent(headBranch)}`;
    const res = await fetch(compareUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      signal,
    });

    if (res.ok) {
      const data = await res.json();
      const rawCommits = Array.isArray(data.commits) ? data.commits : [];
      const mappedCommits: BranchComparisonCommit[] = [...rawCommits]
        .reverse()
        .slice(0, 20)
        .map((c: any) => {
          const ts = c.commit?.author?.date || c.commit?.committer?.date || '';
          return {
            hash: (c.sha || '').slice(0, 7),
            fullHash: c.sha || '',
            msg: c.commit?.message || '',
            author: c.commit?.author?.name || c.author?.login || 'GitHub User',
            avatar: c.author?.avatar_url,
            timestamp: ts,
            time: formatRelativeTime(ts),
            parents: Array.isArray(c.parents) ? c.parents.map((p: any) => p.sha) : [],
            isPrimary: true,
          };
        });

      const aheadBy = Number(data.ahead_by ?? 0);
      const behindBy = Number(data.behind_by ?? 0);
      const status: BranchComparisonResult['status'] =
        data.status === 'identical' || data.status === 'ahead' || data.status === 'behind' || data.status === 'diverged'
          ? data.status
          : aheadBy > 0 && behindBy > 0
            ? 'diverged'
            : aheadBy > 0
              ? 'ahead'
              : behindBy > 0
                ? 'behind'
                : 'identical';

      return {
        baseBranch,
        headBranch,
        aheadBy,
        behindBy,
        status,
        filesCount: Array.isArray(data.files) ? data.files.length : null,
        commits: mappedCommits,
        source: 'github',
      };
    }
  }

  // Deterministic demo / local comparison
  const aheadBy = typeof branchMeta?.aheadBy === 'number' ? branchMeta.aheadBy : 0;
  const behindBy = typeof branchMeta?.behindBy === 'number' ? branchMeta.behindBy : 0;
  const status: BranchComparisonResult['status'] =
    aheadBy > 0 && behindBy > 0
      ? 'diverged'
      : aheadBy > 0
        ? 'ahead'
        : behindBy > 0
          ? 'behind'
          : 'identical';

  const commitIndex = branchMeta?.shortSha
    ? activeCommits.findIndex((c) => c.hash?.startsWith(branchMeta.shortSha))
    : -1;
  const relevantCommits =
    commitIndex >= 0
      ? activeCommits.slice(commitIndex, commitIndex + Math.max(1, aheadBy || 3))
      : activeCommits.slice(0, 6);

  return {
    baseBranch,
    headBranch,
    aheadBy,
    behindBy,
    status,
    filesCount: aheadBy > 0 ? aheadBy * 2 : 0,
    commits: relevantCommits.map((c) => ({
      hash: (c.hash || '').slice(0, 7),
      fullHash: c.fullHash || c.hash || '',
      msg: c.msg || '',
      author: c.author || 'Developer',
      avatar: c.avatar,
      timestamp: c.timestamp || '',
      time: c.time || formatRelativeTime(c.timestamp),
      add: c.add,
      del: c.del,
      parents: c.parents,
      isPrimary: c.isPrimary,
    })),
    source: token ? 'demo' : 'local',
  };
};

export const fetchBranchProtection = async ({
  owner,
  repo,
  branchName,
  isProtectedFlag,
  isDefault,
  token,
  signal,
}: {
  owner?: string | null;
  repo?: string | null;
  branchName: string;
  isProtectedFlag?: boolean;
  isDefault?: boolean;
  token?: string | null;
  signal?: AbortSignal;
}): Promise<BranchProtectionSummary> => {
  if (!isDemoOrLocalRepo(owner, repo, token) && isProtectedFlag) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(branchName)}/protection`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
          signal,
        }
      );
      if (res.ok) {
        const data = await res.json();
        const reviewsCount = Number(data.required_pull_request_reviews?.required_approving_review_count ?? 0);
        const contexts: string[] = data.required_status_checks?.contexts || [];
        return {
          isProtected: true,
          directPushAllowed: false,
          requiresPrReview: Boolean(data.required_pull_request_reviews),
          requiredReviewsCount: reviewsCount,
          requiresStatusChecks: Boolean(data.required_status_checks),
          checksLabel: contexts.length > 0 ? `${contexts.length} required` : data.required_status_checks ? 'Configured' : 'Optional',
          enforceAdmins: Boolean(data.enforce_admins?.enabled),
          source: 'github',
        };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
    }
  }

  const protectedRef = Boolean(isProtectedFlag || isDefault);
  return {
    isProtected: protectedRef,
    directPushAllowed: !isProtectedFlag,
    requiresPrReview: Boolean(isProtectedFlag),
    requiredReviewsCount: isProtectedFlag ? 1 : 0,
    requiresStatusChecks: Boolean(isProtectedFlag),
    checksLabel: isProtectedFlag ? 'Protected ruleset' : 'None required',
    enforceAdmins: false,
    source: 'inferred',
  };
};
