export * from './gitPrMutationServices';

export const getGitHubAuthHeader = (token: string): string => {
  if (!token) return '';
  if (token.startsWith('Bearer ') || token.startsWith('token ')) return token;
  return token.startsWith('ghp_') || token.startsWith('github_pat_') ? `token ${token}` : `Bearer ${token}`;
};

export const findBaseSha = async (owner: string, repo: string, headers: any, preferredBranch?: string): Promise<string> => {
  const branchesToTry = [preferredBranch, 'main', 'master'].filter(Boolean) as string[];
  let sawAuthError = false;

  for (const b of branchesToTry) {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${b}`, { headers });
      if (res.status === 401) sawAuthError = true;
      if (res.ok) {
        const data = await res.json();
        if (data?.object?.sha) return data.object.sha;
      }
    } catch (_) {}
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers });
    if (res.status === 401) sawAuthError = true;
    if (res.ok) {
      const data = await res.json();
      if (data?.[0]?.sha) return data[0].sha;
    }
  } catch (_) {}

  if (sawAuthError) {
    throw new Error("GitHub authentication failed (401). Please re-authenticate your GitHub account.");
  }
  throw new Error(`Could not find a base commit for ${owner}/${repo}. Ensure repository is accessible.`);
};

export const deleteRemoteGitHubRepo = async (owner: string, repo: string, token: string): Promise<boolean> => {
  const headers = {
    Authorization: getGitHubAuthHeader(token),
    Accept: "application/vnd.github.v3+json",
  };
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    let errMsg = errData.message || `Status ${res.status}`;
    if (res.status === 401) {
      errMsg = "GitHub token expired or unauthorized. Please re-authenticate.";
    } else if (res.status === 403) {
      errMsg = "Must have admin rights and 'delete_repo' scope on your GitHub token.";
    } else if (res.status === 404) {
      errMsg = `Repository ${owner}/${repo} not found on GitHub.`;
    }
    throw new Error(errMsg);
  }
  return true;
};

export const createRemoteGitHubBranch = async (
  owner: string,
  repo: string,
  branchName: string,
  token: string,
  preferredBranch?: string
) => {
  const headers = {
    Authorization: getGitHubAuthHeader(token),
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
  const baseSha = await findBaseSha(owner, repo, headers, preferredBranch);
  const cleanName = branchName.trim().replace(/\s+/g, "-");
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ref: `refs/heads/${cleanName}`,
      sha: baseSha,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    let msg = errData.message || `Status ${res.status}`;
    if (res.status === 401) msg = "GitHub authentication failed (401). Please re-authenticate.";
    if (res.status === 422) msg = `Branch '${cleanName}' already exists or ref name is invalid.`;
    throw new Error(msg);
  }
  return cleanName;
};

export const deleteRemoteGitHubBranch = async (owner: string, repo: string, branchName: string, token: string) => {
  const headers = {
    Authorization: getGitHubAuthHeader(token),
    Accept: "application/vnd.github.v3+json",
  };
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branchName}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    let msg = errData.message || `Status ${res.status}`;
    if (res.status === 401) msg = "GitHub authentication failed (401). Please re-authenticate.";
    throw new Error(msg);
  }
};
