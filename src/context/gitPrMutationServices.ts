const formatAuthHeader = (token: string): string => {
  if (!token) return '';
  if (token.startsWith('Bearer ') || token.startsWith('token ')) return token;
  return token.startsWith('ghp_') || token.startsWith('github_pat_') ? `token ${token}` : `Bearer ${token}`;
};

export const createRemoteGitHubPR = async (
  owner: string,
  repo: string,
  pr: { title: string; desc: string; source: string; target: string; isDraft?: boolean },
  token: string
) => {
  const headers = {
    Authorization: formatAuthHeader(token),
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: pr.title,
      body: pr.desc || "No description provided.",
      head: pr.source,
      base: pr.target,
      draft: pr.isDraft || false,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    let msg = errData.message || `Status ${res.status}`;
    if (res.status === 401) {
      msg = "GitHub authentication failed (401). Please re-authenticate.";
    } else if (res.status === 422) {
      msg = errData.errors?.[0]?.message || errData.message || `No commits between ${pr.source} and ${pr.target}, or branch does not exist on remote.`;
    }
    throw new Error(msg);
  }
  return res.json();
};

export const updateRemoteGitHubPRStatus = async (
  owner: string,
  repo: string,
  prId: number,
  status: 'Open' | 'Merged' | 'Closed',
  strategy: 'merge' | 'squash',
  token: string
) => {
  const headers = {
    Authorization: formatAuthHeader(token),
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
  if (status === 'Merged') {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prId}/merge`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ merge_method: strategy })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Merge failed (Status ${res.status})`);
    }
  } else {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ state: status === 'Closed' ? 'closed' : 'open' })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Update failed (Status ${res.status})`);
    }
  }
};
