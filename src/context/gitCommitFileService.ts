export const pushFileToGitHub = async (
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  token: string
) => {
  const headers: Record<string, string> = {
    Authorization: token.startsWith('Bearer ') || token.startsWith('token ') ? token : `token ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  const utf8Bytes = new TextEncoder().encode(content);
  let binaryStr = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryStr += String.fromCharCode(utf8Bytes[i]);
  }
  const b64Content = btoa(binaryStr);

  let sha: string | undefined = undefined;
  try {
    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers }
    );
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
    }
  } catch (_) {}

  const commitRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message,
        content: b64Content,
        sha,
        branch,
      }),
    }
  );

  if (!commitRes.ok) {
    const errData = await commitRes.json().catch(() => ({}));
    throw new Error(errData.message || `Status ${commitRes.status}`);
  }
  return commitRes.json();
};

export const deleteRemoteHeadCommit = async (
  owner: string,
  repo: string,
  hash: string,
  branch: string,
  token: string
) => {
  const headers: Record<string, string> = {
    Authorization: token.startsWith('Bearer ') || token.startsWith('token ') ? token : `token ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  const commitRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits/${hash}`,
    { headers }
  );
  if (!commitRes.ok) throw new Error("Failed to fetch commit details from GitHub");
  const commitData = await commitRes.json();
  if (!commitData.parents || commitData.parents.length === 0) {
    throw new Error("Cannot delete initial repository commit");
  }
  const parentSha = commitData.parents[0].sha;

  const refRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ sha: parentSha, force: true }),
    }
  );
  if (!refRes.ok) throw new Error("Failed to update branch reference on GitHub");
  return parentSha;
};

export const revertRemoteCommit = async (
  owner: string,
  repo: string,
  hash: string,
  branch: string,
  revertTitle: string,
  revertDesc: string,
  token: string
) => {
  const headers: Record<string, string> = {
    Authorization: token.startsWith('Bearer ') || token.startsWith('token ') ? token : `token ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  const targetRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${hash}`, { headers });
  if (!targetRes.ok) throw new Error("Failed to fetch commit from GitHub");
  const targetData = await targetRes.json();
  const parentSha = targetData.parents?.[0]?.sha;

  const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, { headers });
  if (!refRes.ok) throw new Error("Failed to fetch head ref from GitHub");
  const refData = await refRes.json();
  const currentHeadSha = refData.object.sha;

  let treeToUse = targetData.tree.sha;
  if (parentSha) {
    const parentRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${parentSha}`, { headers });
    if (parentRes.ok) {
      const parentData = await parentRes.json();
      treeToUse = parentData.tree.sha;
    }
  }

  const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: `${revertTitle}\n\n${revertDesc}`,
      tree: treeToUse,
      parents: [currentHeadSha],
    }),
  });
  if (!newCommitRes.ok) throw new Error("Failed to create revert commit on GitHub");
  const newCommit = await newCommitRes.json();

  await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ sha: newCommit.sha }),
  });
  return newCommit.sha;
};
