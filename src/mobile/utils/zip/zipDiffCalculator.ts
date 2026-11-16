import { ZipExtractedFile, DiffFileItem, TreeDiffResult, FileChangeStatus } from './zipTypes';
import { cleanPath, isBinaryFilename } from './zipParser';
import { alignZipPath } from './zipSyncHelpers';

const textEncoder = new TextEncoder();

export function computeLineDiff(oldText: string = '', newText: string = ''): {
  additions: number;
  deletions: number;
  lines: { type: 'add' | 'del' | 'same'; text: string; oldLine?: number; newLine?: number }[];
} {
  const oldLines = oldText ? oldText.split('\n') : [];
  const newLines = newText ? newText.split('\n') : [];
  const lines: { type: 'add' | 'del' | 'same'; text: string; oldLine?: number; newLine?: number }[] = [];
  let additions = 0;
  let deletions = 0;
  let oIdx = 0;
  let nIdx = 0;
  let oldLineNum = 1;
  let newLineNum = 1;

  while (oIdx < oldLines.length && nIdx < newLines.length) {
    if (oldLines[oIdx] === newLines[nIdx]) {
      lines.push({ type: 'same', text: oldLines[oIdx], oldLine: oldLineNum++, newLine: newLineNum++ });
      oIdx++;
      nIdx++;
    } else {
      const nextMatchInNew = newLines.indexOf(oldLines[oIdx], nIdx);
      const nextMatchInOld = oldLines.indexOf(newLines[nIdx], oIdx);

      if (nextMatchInNew !== -1 && (nextMatchInOld === -1 || nextMatchInNew - nIdx <= nextMatchInOld - oIdx)) {
        while (nIdx < nextMatchInNew) {
          additions++;
          lines.push({ type: 'add', text: newLines[nIdx], newLine: newLineNum++ });
          nIdx++;
        }
      } else if (nextMatchInOld !== -1) {
        while (oIdx < nextMatchInOld) {
          deletions++;
          lines.push({ type: 'del', text: oldLines[oIdx], oldLine: oldLineNum++ });
          oIdx++;
        }
      } else {
        deletions++;
        lines.push({ type: 'del', text: oldLines[oIdx], oldLine: oldLineNum++ });
        oIdx++;
        additions++;
        lines.push({ type: 'add', text: newLines[nIdx], newLine: newLineNum++ });
        nIdx++;
      }
    }
  }

  while (oIdx < oldLines.length) {
    deletions++;
    lines.push({ type: 'del', text: oldLines[oIdx], oldLine: oldLineNum++ });
    oIdx++;
  }
  while (nIdx < newLines.length) {
    additions++;
    lines.push({ type: 'add', text: newLines[nIdx], newLine: newLineNum++ });
    nIdx++;
  }

  return { additions, deletions, lines };
}

export async function computeGitBlobSha(zFile: ZipExtractedFile): Promise<string | null> {
  if (typeof globalThis.crypto?.subtle === 'undefined') return null;
  try {
    const bodyBytes = zFile.binaryData ?? textEncoder.encode(zFile.content || '');
    const headerBytes = textEncoder.encode(`blob ${bodyBytes.byteLength}\0`);
    const combined = new Uint8Array(headerBytes.byteLength + bodyBytes.byteLength);
    combined.set(headerBytes, 0);
    combined.set(bodyBytes, headerBytes.byteLength);

    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-1', combined);
    const hashBytes = new Uint8Array(hashBuffer);
    let hex = '';
    for (let i = 0; i < hashBytes.length; i++) {
      hex += hashBytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  } catch {
    return null;
  }
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number = 12
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const current = nextIndex++;
      results[current] = await tasks[current]();
    }
  }

  const workerCount = Math.min(limit, Math.max(1, tasks.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

export async function compareZipWithRepo({
  zipFiles,
  repoFiles,
  rootPrefixToStrip = '',
  fetchOldContent,
  onProgress,
}: {
  zipFiles: ZipExtractedFile[];
  repoFiles: { name: string; type: 'file' | 'dir'; sha?: string; size?: number; lines?: number }[];
  rootPrefixToStrip?: string;
  fetchOldContent: (path: string) => Promise<string>;
  onProgress?: (completed: number, total: number, currentPath?: string) => void;
}): Promise<TreeDiffResult> {
  const repoFileMap = new Map<string, { name: string; sha?: string; size?: number; lines?: number }>();
  for (const f of repoFiles) {
    if (f.type === 'file' || (!f.type && !f.name.endsWith('/'))) {
      const cleaned = cleanPath(f.name);
      if (cleaned) {
        repoFileMap.set(cleaned, { name: cleaned, sha: f.sha, size: f.size, lines: f.lines });
      }
    }
  }

  const zipFileMap = new Map<string, ZipExtractedFile>();
  for (const zf of zipFiles) {
    const alignedPath = alignZipPath(zf.originalPath, rootPrefixToStrip);
    if (alignedPath) zipFileMap.set(alignedPath, zf);
  }

  const diffItems: DiffFileItem[] = [];
  const tasks: Array<() => Promise<void>> = [];

  const zipEntries = Array.from(zipFileMap.entries());
  const missingRepoPaths = Array.from(repoFileMap.keys()).filter(
    (repoPath) =>
      !zipFileMap.has(repoPath) &&
      !repoPath.startsWith('.git') &&
      !repoPath.startsWith('node_modules') &&
      repoPath !== '.env' &&
      repoPath !== '.env.local'
  );

  // Skip downloading contents for large missing sets (>25 files) so comparing stays sub-second
  const shouldFetchRemovedContents = missingRepoPaths.length <= 25;

  // Precompute SHA-1 hashes in parallel to short-circuit identical files with zero HTTP requests
  const shaMatchSet = new Set<string>();
  await Promise.all(
    zipEntries.map(async ([path, zFile]) => {
      const repoEntry = repoFileMap.get(path);
      if (repoEntry?.sha) {
        const localSha = await computeGitBlobSha(zFile);
        if (localSha && localSha === repoEntry.sha) {
          shaMatchSet.add(path);
        }
      }
    })
  );

  const totalToFetch =
    zipEntries.filter(([p]) => repoFileMap.has(p) && !isBinaryFilename(p) && !shaMatchSet.has(p)).length +
    (shouldFetchRemovedContents ? missingRepoPaths.filter((p) => !isBinaryFilename(p)).length : 0);
  let completedFetch = 0;

  onProgress?.(0, totalToFetch);

  for (const [path, zFile] of zipEntries) {
    const isBinary = isBinaryFilename(path) || Boolean(zFile.binaryData && zFile.content === undefined);
    const repoEntry = repoFileMap.get(path);

    if (!repoEntry) {
      const newContent = zFile.content || '';
      const additions = isBinary ? 0 : (newContent ? newContent.split('\n').length : 0);
      diffItems.push({ path, originalZipPath: zFile.originalPath, status: 'added', selected: true, newContent, additions, deletions: 0, isBinary });
    } else if (shaMatchSet.has(path)) {
      diffItems.push({
        path,
        originalZipPath: zFile.originalPath,
        status: 'unchanged',
        selected: false,
        oldContent: zFile.content,
        newContent: zFile.content,
        additions: 0,
        deletions: 0,
        isBinary,
      });
    } else if (isBinary) {
      diffItems.push({ path, originalZipPath: zFile.originalPath, status: 'modified', selected: true, additions: 0, deletions: 0, isBinary: true });
    } else {
      tasks.push(async () => {
        const oldContent = await fetchOldContent(path);
        completedFetch++;
        onProgress?.(completedFetch, totalToFetch, path);
        const newContent = zFile.content || '';
        if (oldContent === newContent) {
          diffItems.push({ path, originalZipPath: zFile.originalPath, status: 'unchanged', selected: false, oldContent, newContent, additions: 0, deletions: 0, isBinary: false });
        } else {
          const diffStats = computeLineDiff(oldContent, newContent);
          diffItems.push({ path, originalZipPath: zFile.originalPath, status: 'modified', selected: true, oldContent, newContent, additions: diffStats.additions, deletions: diffStats.deletions, isBinary: false });
        }
      });
    }
  }

  for (const repoPath of missingRepoPaths) {
    const isBinary = isBinaryFilename(repoPath);
    const repoEntry = repoFileMap.get(repoPath);
    if (isBinary || !shouldFetchRemovedContents) {
      const estDeletions = isBinary ? 0 : (repoEntry?.lines || (repoEntry?.size ? Math.max(1, Math.round(repoEntry.size / 36)) : 0));
      diffItems.push({ path: repoPath, status: 'removed', selected: false, oldContent: '', additions: 0, deletions: estDeletions, isBinary });
    } else {
      tasks.push(async () => {
        const oldContent = await fetchOldContent(repoPath);
        completedFetch++;
        onProgress?.(completedFetch, totalToFetch, repoPath);
        const deletions = oldContent ? oldContent.split('\n').length : 0;
        diffItems.push({ path: repoPath, status: 'removed', selected: false, oldContent, additions: 0, deletions, isBinary: false });
      });
    }
  }

  if (tasks.length > 0) {
    await runWithConcurrency(tasks, 12);
  }

  const statusWeight: Record<FileChangeStatus, number> = { modified: 1, added: 2, removed: 3, unchanged: 4 };
  diffItems.sort((a, b) => statusWeight[a.status] !== statusWeight[b.status] ? statusWeight[a.status] - statusWeight[b.status] : a.path.localeCompare(b.path));

  const counts = {
    added: diffItems.filter(f => f.status === 'added').length,
    modified: diffItems.filter(f => f.status === 'modified').length,
    removed: diffItems.filter(f => f.status === 'removed').length,
    unchanged: diffItems.filter(f => f.status === 'unchanged').length,
    totalChanged: diffItems.filter(f => f.status !== 'unchanged').length,
  };

  return { commonRootDetected: rootPrefixToStrip, totalFilesInZip: zipFiles.length, files: diffItems, counts };
}
