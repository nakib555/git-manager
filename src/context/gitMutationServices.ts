export * from './gitPrMutationServices';

export const findBaseSha = async (owner: string, repo: string, headers: any): Promise<string> => {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data?.object?.sha) return data.object.sha;
    }
  } catch (_) {}
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/master`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data?.object?.sha) return data.object.sha;
    }
  } catch (_) {}
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data?.[0]?.sha) return data[0].sha;
    }
  } catch (_) {}
  throw new Error("Could not find a base commit/branch to branch off of.");
};

export const deleteRemoteGitHubRepo = async (owner: string, repo: string, token: string): Promise<boolean> => {
  const headers = {
    Authorization: token.startsWith('Bearer ') || token.startsWith('token ') ? token : `token ${token}`,
    Accept: "application/vnd.github.v3+json",
  };
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    let errMsg = errData.message || `Status ${res.status}`;
    if (res.status === 403) {
      errMsg = "Must have admin rights and 'delete_repo' scope on your GitHub token.";
    }
    throw new Error(errMsg);
  }
  return true;
};

export const createRemoteGitHubBranch = async (
  owner: string,
  repo: string,
  branchName: string,
  token: string
) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
  const baseSha = await findBaseSha(owner, repo, headers);
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
    throw new Error(errData.message || `Status ${res.status}`);
  }
  return cleanName;
};

export const deleteRemoteGitHubBranch = async (owner: string, repo: string, branchName: string, token: string) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branchName}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Status ${res.status}`);
  }
};
