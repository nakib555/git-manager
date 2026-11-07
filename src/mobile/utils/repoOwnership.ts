export interface RepoOwnershipCheckParams {
  repoName: string | null;
  repoOwner: string | null;
  userLogin: string | null | undefined;
  reposList?: any[];
}

/**
 * Checks whether the current repository is owned by the user.
 * Returns true if:
 * 1. The repository's owner matches the user's login, OR
 * 2. The repo was marked as local (created in current sandbox/session), OR
 * 3. In offline mode with no external owner specified and owner matches local default.
 */
export function isRepositoryOwnedByUser({
  repoName,
  repoOwner,
  userLogin,
  reposList = [],
}: RepoOwnershipCheckParams): boolean {
  if (!repoName) return false;

  const matched = reposList.find(
    (r) => r.name?.toLowerCase() === repoName.toLowerCase()
  );

  // If locally created in workspace session
  if (matched?.isLocal) return true;

  const ownerLower = (repoOwner || matched?.owner?.login || '').toLowerCase().trim();
  const userLower = (userLogin || '').toLowerCase().trim();

  // If user is logged in and owner matches
  if (userLower && ownerLower && userLower === ownerLower) {
    return true;
  }

  // If offline/demo mode without custom token and owner is octodev/local
  if (!userLower && (ownerLower === 'octodev' || ownerLower === 'local-developer' || !ownerLower)) {
    return true;
  }

  if (userLower === 'octodev' && (ownerLower === 'octodev' || ownerLower === 'local-developer')) {
    return true;
  }

  return false;
}
