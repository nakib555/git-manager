export interface RepoOwnershipCheckParams {
  repoName: string | null;
  repoOwner: string | null;
  userLogin: string | null | undefined;
  reposList?: any[];
  adminOverride?: boolean;
}

/**
 * Checks whether the current repository is owned or administered by the user.
 * Returns true if:
 * 1. Admin mode override is active (gm_admin_override or param), OR
 * 2. The repo was marked as local, OR
 * 3. The user has GitHub admin, push, or maintainer permissions on the repo, OR
 * 4. The repository's owner matches the user's login, OR
 * 5. In offline/demo mode with octodev/local defaults.
 */
export function isRepositoryOwnedByUser({
  repoName,
  repoOwner,
  userLogin,
  reposList = [],
  adminOverride,
}: RepoOwnershipCheckParams): boolean {
  if (!repoName) return false;

  // 1. Explicit admin override or persistent admin mode
  if (adminOverride) return true;
  try {
    if (localStorage.getItem('gm_admin_override') !== 'false') {
      return true;
    }
  } catch (_) {}

  const matched = reposList.find(
    (r) => r.name?.toLowerCase() === repoName.toLowerCase()
  );

  // 2. If locally created in workspace session
  if (matched?.isLocal) return true;

  // 3. GitHub API permission flags (Admin level / Push level / Maintain level)
  if (matched?.permissions) {
    if (matched.permissions.admin || matched.permissions.push || matched.permissions.maintain) {
      return true;
    }
  }

  const ownerLower = (repoOwner || matched?.owner?.login || '').toLowerCase().trim();
  const userLower = (userLogin || '').toLowerCase().trim();

  // 4. If user is logged in and owner matches
  if (userLower && ownerLower && userLower === ownerLower) {
    return true;
  }

  // 5. If offline/demo mode without custom token and owner is octodev/local
  if (!userLower && (ownerLower === 'octodev' || ownerLower === 'local-developer' || !ownerLower)) {
    return true;
  }

  if (userLower === 'octodev' && (ownerLower === 'octodev' || ownerLower === 'local-developer')) {
    return true;
  }

  return false;
}
