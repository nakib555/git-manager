import { safeBase64Decode } from '../treeBuilder';
import { DEMO_FILE_CONTENTS } from '../../../data/demoData';
import { getCatalogOrDefault } from '../../../data/demoRepoCatalog';

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

  if (!token || repoName === 'nexus-web-engine' || resolvedOwner === 'octodev') {
    const catalog = getCatalogOrDefault(repoName);
    if (catalog.fileContents && catalog.fileContents[filePath]) {
      return catalog.fileContents[filePath];
    }
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

export async function fetchFileBinarySafe({
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
}): Promise<{
  rawBuffer?: Uint8Array;
  text?: string;
  base64?: string;
  sizeBytes: number;
  downloadUrl?: string;
  error?: string;
}> {
  const resolvedOwner = owner || '';
  const resolvedBranch = branch || 'main';

  // Demo fallback
  if (!token || repoName === 'nexus-web-engine' || resolvedOwner === 'octodev') {
    const catalog = getCatalogOrDefault(repoName);
    const content = (catalog.fileContents && catalog.fileContents[filePath]) || DEMO_FILE_CONTENTS[filePath];
    if (content) {
      const encoder = new TextEncoder();
      const rawBuffer = encoder.encode(content);
      return {
        text: content,
        rawBuffer,
        sizeBytes: rawBuffer.length,
      };
    }
  }

  const authHeader = token
    ? (token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
      ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
      : `token ${token}`)
    : undefined;

  // 1. Try Contents API
  if (resolvedOwner && repoName) {
    try {
      const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
      if (authHeader) headers.Authorization = authHeader;

      const res = await fetch(
        `https://api.github.com/repos/${resolvedOwner}/${repoName}/contents/${filePath}?ref=${resolvedBranch}`,
        { headers }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.encoding === 'base64' && data.content) {
          const cleanB64 = data.content.replace(/\s+/g, '');
          const binaryStr = atob(cleanB64);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          return {
            rawBuffer: bytes,
            base64: cleanB64,
            sizeBytes: data.size || bytes.length,
            downloadUrl: data.download_url,
          };
        } else if (data.download_url) {
          // Download directly
          const dlRes = await fetch(data.download_url, { headers: authHeader ? { Authorization: authHeader } : {} });
          if (dlRes.ok) {
            const ab = await dlRes.arrayBuffer();
            const bytes = new Uint8Array(ab);
            return {
              rawBuffer: bytes,
              sizeBytes: bytes.length,
              downloadUrl: data.download_url,
            };
          }
        }
      }
    } catch (_) {}
  }

  // 2. Try raw GitHub content stream
  if (resolvedOwner && repoName) {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${resolvedOwner}/${repoName}/${resolvedBranch}/${filePath}`;
      const headers: Record<string, string> = {};
      if (authHeader) headers.Authorization = authHeader;

      const rawRes = await fetch(rawUrl, { headers });
      if (rawRes.ok) {
        const ab = await rawRes.arrayBuffer();
        const bytes = new Uint8Array(ab);
        return {
          rawBuffer: bytes,
          sizeBytes: bytes.length,
        };
      }
    } catch (_) {}
  }

  // 3. Last fallback: text content
  const textContent = await fetchFileContentSafe({
    filePath,
    repoName,
    owner,
    branch,
    token,
  });

  const encoder = new TextEncoder();
  const raw = encoder.encode(textContent);
  return {
    text: textContent,
    rawBuffer: raw,
    sizeBytes: raw.length,
  };
}

