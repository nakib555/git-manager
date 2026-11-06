export const createRemoteGitHubPR = async (
  owner: string,
  repo: string,
  pr: { title: string; desc: string; source: string; target: string; isDraft?: boolean },
  token: string
) => {
  const headers = {
    Authorization: `Bearer ${token}`,
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
    throw new Error(errData.message || `Status ${res.status}`);
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
    Authorization: `Bearer ${token}`,
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
      throw new Error(errData.message || `Status ${res.status}`);
    }
  } else {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ state: status === 'Closed' ? 'closed' : 'open' })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Status ${res.status}`);
    }
  }
};
