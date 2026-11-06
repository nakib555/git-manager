import { safeBase64Decode } from '../treeBuilder';
import { DEMO_FILE_CONTENTS } from '../../../data/demoData';

export async function fetchFileContentSafe({
  filePath,
  repoName,
  owner,
  branch = 'main',
  token,
}: {
  filePath: string;
  repoName: string;
  owner?: string | null;
  branch?: string | null;
  token?: string | null;
}): Promise<string> {
  const resolvedOwner = owner || '';
  const resolvedBranch = branch || 'main';

  if (!resolvedOwner && !repoName) {
    return `// Repository or owner not specified.`;
  }

  try {
    const localContent = localStorage.getItem(`local_file_${repoName}_${filePath}`);
    if (localContent !== null) {
      return localContent;
    }
  } catch (_) {}

  if (!token || repoName === 'nexus-web-engine') {
    if (DEMO_FILE_CONTENTS[filePath]) {
      return DEMO_FILE_CONTENTS[filePath];
    }
  }

  if (token) {
    try {
      const authHeader = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
        ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
        : `token ${token}`;

      const res = await fetch(
        `https://api.github.com/repos/${resolvedOwner}/${repoName}/contents/${filePath}?ref=${resolvedBranch}`,
        {
          headers: {
            Authorization: authHeader,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.encoding === 'base64' && data.content) {
          return safeBase64Decode(data.content);
        } else if (data.content) {
          return data.content;
        }
      }
    } catch (_) {}
  }

  try {
    const rawUrl = `https://raw.githubusercontent.com/${resolvedOwner}/${repoName}/${resolvedBranch}/${filePath}`;
    const rawRes = await fetch(rawUrl);
    if (rawRes.ok) {
      return await rawRes.text();
    }
  } catch (_) {}

  if (resolvedBranch !== 'master') {
    try {
      const rawMasterUrl = `https://raw.githubusercontent.com/${resolvedOwner}/${repoName}/master/${filePath}`;
      const rawRes = await fetch(rawMasterUrl);
      if (rawRes.ok) {
        return await rawRes.text();
      }
    } catch (_) {}
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${resolvedOwner}/${repoName}/contents/${filePath}?ref=${resolvedBranch}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.encoding === 'base64' && data.content) {
        return safeBase64Decode(data.content);
      } else if (data.content) {
        return data.content;
      }
    }
  } catch (_) {}

  return `// Unable to fetch remote content for "${filePath}".\n// If this repository is private, please configure a Personal Access Token in Settings.`;
}
