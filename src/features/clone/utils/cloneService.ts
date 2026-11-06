import JSZip from 'jszip';
import { CloneProgressInfo } from '../types';

export interface DownloadRepoParams {
  owner: string;
  repo: string;
  branch: string;
  token?: string | null;
  onProgress: (info: CloneProgressInfo) => void;
}

export const downloadGithubRepoArchive = async ({
  owner,
  repo,
  branch,
  token,
  onProgress
}: DownloadRepoParams): Promise<Blob> => {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) {
    headers['Authorization'] = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_')
      ? `Bearer ${token}`
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

  let res = await fetch(proxyUrl, { headers });
  if (!res.ok) {
    const directUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${checkoutBranch}`;
    const fallbackRes = await fetch(directUrl, { headers }).catch(() => null);
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
