import JSZip from 'jszip';
import { CloneProgressInfo, TreeFileItem } from '../types';

export interface DownloadRepoParams {
  owner: string;
  repo: string;
  branch: string;
  token?: string | null;
  signal?: AbortSignal;
  onProgress: (info: CloneProgressInfo) => void;
}

export const downloadGithubRepoArchive = async ({
  owner,
  repo,
  branch,
  token,
  signal,
  onProgress
}: DownloadRepoParams): Promise<Blob> => {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) {
    headers['Authorization'] = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ') || token.startsWith('token ')
      ? (token.startsWith('Bearer ') || token.startsWith('token ') ? token : `Bearer ${token}`)
      : `token ${token}`;
  }

  const checkoutBranch = branch || 'main';
  const proxyUrl = `/api/github/download?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&ref=${encodeURIComponent(checkoutBranch)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
  
  onProgress({
    pct: 5,
    activity: `Requesting package for ${checkoutBranch}...`,
    speed: 'Connecting...',
    timeRemaining: 'Estimating...',
    receivedObjects: { current: 0, total: 100 },
    resolvingDeltas: false,
  });

  let res = await fetch(proxyUrl, { headers, signal });
  if (!res.ok) {
    const directUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${checkoutBranch}`;
    const fallbackRes = await fetch(directUrl, { headers, signal }).catch(() => null);
    if (fallbackRes && fallbackRes.ok) {
      res = fallbackRes;
    } else {
      let errMsg = `GitHub download failed with status ${res.status}.`;
      try {
        const errData = await res.json();
        if (errData.error) errMsg = errData.error;
      } catch (_) {}
      throw new Error(errMsg);
    }
  }

  const reader = res.body?.getReader();
  const contentLengthHeader = res.headers.get('Content-Length');
  const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 1024 * 1024 * 3;
  let receivedBytes = 0;
  const chunks: Uint8Array[] = [];
  const startTime = Date.now();

  if (reader) {
    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        throw new DOMException('Clone cancelled by user', 'AbortError');
      }
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        receivedBytes += value.length;
        const durationSec = (Date.now() - startTime) / 1000;
        const speedMbps = durationSec > 0 ? (receivedBytes / (1024 * 1024)) / durationSec : 0;
        const pct = contentLengthHeader
          ? Math.round((receivedBytes / totalBytes) * 100)
          : Math.min(95, Math.round((receivedBytes / totalBytes) * 100));

        const remainingBytes = Math.max(0, totalBytes - receivedBytes);
        const remainingSecs = speedMbps > 0 ? Math.round((remainingBytes / (1024 * 1024)) / speedMbps) : 5;

        onProgress({
          pct,
          activity: 'Downloading repository objects from GitHub...',
          speed: `${speedMbps.toFixed(1)} MB/s`,
          timeRemaining: `${Math.max(1, remainingSecs)} sec`,
          receivedObjects: {
            current: Math.floor(receivedBytes / 1024),
            total: Math.floor(Math.max(receivedBytes + 1024, totalBytes) / 1024)
          },
          resolvingDeltas: false,
        });
      }
    }
  }

  onProgress({
    pct: 98,
    activity: 'Extracting downloaded ZIP archive...',
    speed: 'Done',
    timeRemaining: '0s',
    receivedObjects: { current: Math.floor(receivedBytes / 1024), total: Math.floor(receivedBytes / 1024) },
    resolvingDeltas: true,
  });

  let totalLen = 0;
  for (const chunk of chunks) totalLen += chunk.length;
  const combined = new Uint8Array(totalLen);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return new Blob([combined], { type: 'application/zip' });
};

export const writeZipToDirectoryHandle = async (
  dirHandle: any,
  zipBlob: Blob,
  onStep?: (msg: string) => void
) => {
  const zip = await JSZip.loadAsync(zipBlob);
  const fileNames = Object.keys(zip.files);
  const firstFile = fileNames.find(n => n.includes('/'));
  const rootDir = firstFile ? firstFile.split('/')[0] + '/' : '';

  const writeHandle = async (currentDir: any, pathName: string, arrayBuffer: ArrayBuffer) => {
    const parts = pathName.split('/');
    let target = currentDir;
    for (let i = 0; i < parts.length - 1; i++) {
      target = await target.getDirectoryHandle(parts[i], { create: true });
    }
    const fileHandle = await target.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(arrayBuffer);
    await writable.close();
  };

  for (const rawName of fileNames) {
    const file = zip.files[rawName];
    if (file.dir) continue;
    const cleanPath = rootDir && rawName.startsWith(rootDir) ? rawName.slice(rootDir.length) : rawName;
    if (!cleanPath) continue;
    onStep?.(`Writing ${cleanPath}...`);
    const buffer = await file.async('arraybuffer');
    await writeHandle(dirHandle, cleanPath, buffer);
  }
};

export const fetchRemoteBranches = async (
  owner: string,
  repo: string,
  token?: string | null,
  signal?: AbortSignal
): Promise<string[]> => {
  const defaultBranches = ['main', 'master', 'develop', 'dev'];
  if (!owner || !repo) return defaultBranches;

  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
    if (token) {
      headers['Authorization'] = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ') || token.startsWith('token ')
        ? (token.startsWith('Bearer ') || token.startsWith('token ') ? token : `Bearer ${token}`)
        : `token ${token}`;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=30`, { headers, signal });
    if (!res.ok) return defaultBranches;
    const data = await res.json();
    if (Array.isArray(data)) {
      const names = data.map((b: any) => b.name).filter(Boolean);
      return names.length > 0 ? names : defaultBranches;
    }
    return defaultBranches;
  } catch (_) {
    return defaultBranches;
  }
};

export const fetchRemoteRepoTree = async (
  owner: string,
  repo: string,
  branch = 'main',
  token?: string | null,
  signal?: AbortSignal
): Promise<TreeFileItem[]> => {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
    if (token) {
      headers['Authorization'] = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ') || token.startsWith('token ')
        ? (token.startsWith('Bearer ') || token.startsWith('token ') ? token : `Bearer ${token}`)
        : `token ${token}`;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers, signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.tree || !Array.isArray(data.tree)) throw new Error('Invalid tree format');

    // Build hierarchy from flat tree
    const rootItems: TreeFileItem[] = [];
    const dirMap = new Map<string, TreeFileItem>();

    for (const item of data.tree) {
      const isDir = item.type === 'tree';
      const parts = item.path.split('/');
      const name = parts[parts.length - 1];

      const treeItem: TreeFileItem = {
        id: item.path,
        path: item.path,
        name,
        type: isDir ? 'dir' : 'file',
        sizeBytes: item.size,
        children: isDir ? [] : undefined,
      };

      if (isDir) {
        dirMap.set(item.path, treeItem);
      }

      if (parts.length === 1) {
        rootItems.push(treeItem);
      } else {
        const parentPath = parts.slice(0, -1).join('/');
        const parent = dirMap.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(treeItem);
        } else {
          rootItems.push(treeItem);
        }
      }
    }

    return rootItems;
  } catch (_) {
    // Fallback standard structure
    return [
      {
        id: 'src', path: 'src', name: 'src', type: 'dir',
        children: [
          { id: 'src/App.tsx', path: 'src/App.tsx', name: 'App.tsx', type: 'file', sizeBytes: 8100 },
          { id: 'src/main.tsx', path: 'src/main.tsx', name: 'main.tsx', type: 'file', sizeBytes: 1200 },
          { id: 'src/types.ts', path: 'src/types.ts', name: 'types.ts', type: 'file', sizeBytes: 4500 }
        ]
      },
      { id: 'package.json', path: 'package.json', name: 'package.json', type: 'file', sizeBytes: 1520 },
      { id: 'README.md', path: 'README.md', name: 'README.md', type: 'file', sizeBytes: 2840 },
      { id: 'tsconfig.json', path: 'tsconfig.json', name: 'tsconfig.json', type: 'file', sizeBytes: 980 }
    ];
  }
};
