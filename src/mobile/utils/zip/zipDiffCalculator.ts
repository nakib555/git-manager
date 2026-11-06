import { ZipExtractedFile, DiffFileItem, TreeDiffResult, FileChangeStatus } from './zipTypes';
import { cleanPath, isBinaryFilename } from './zipParser';

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

export async function compareZipWithRepo({
  zipFiles,
  repoFiles,
  rootPrefixToStrip = '',
  fetchOldContent,
}: {
  zipFiles: ZipExtractedFile[];
  repoFiles: { name: string; type: 'file' | 'dir' }[];
  rootPrefixToStrip?: string;
  fetchOldContent: (path: string) => Promise<string>;
}): Promise<TreeDiffResult> {
  const repoFileNames = new Set(
    repoFiles.filter(f => f.type === 'file' || (!f.type && !f.name.endsWith('/'))).map(f => cleanPath(f.name))
  );

  const zipFileMap = new Map<string, ZipExtractedFile>();
  for (const zf of zipFiles) {
    let alignedPath = zf.originalPath;
    if (rootPrefixToStrip && alignedPath.startsWith(rootPrefixToStrip)) {
      alignedPath = alignedPath.slice(rootPrefixToStrip.length);
    }
    alignedPath = cleanPath(alignedPath);
    if (alignedPath) zipFileMap.set(alignedPath, zf);
  }

  const diffItems: DiffFileItem[] = [];

  for (const [path, zFile] of zipFileMap.entries()) {
    const isBinary = isBinaryFilename(path);
    const existsInRepo = repoFileNames.has(path);

    if (!existsInRepo) {
      const newContent = zFile.content || '';
      const additions = isBinary ? 0 : (newContent ? newContent.split('\n').length : 0);
      diffItems.push({ path, originalZipPath: zFile.originalPath, status: 'added', selected: true, newContent, additions, deletions: 0, isBinary });
    } else {
      if (isBinary) {
        diffItems.push({ path, originalZipPath: zFile.originalPath, status: 'modified', selected: true, additions: 0, deletions: 0, isBinary: true });
      } else {
        const oldContent = await fetchOldContent(path);
        const newContent = zFile.content || '';
        if (oldContent === newContent) {
          diffItems.push({ path, originalZipPath: zFile.originalPath, status: 'unchanged', selected: false, oldContent, newContent, additions: 0, deletions: 0, isBinary: false });
        } else {
          const diffStats = computeLineDiff(oldContent, newContent);
          diffItems.push({ path, originalZipPath: zFile.originalPath, status: 'modified', selected: true, oldContent, newContent, additions: diffStats.additions, deletions: diffStats.deletions, isBinary: false });
        }
      }
    }
  }

  for (const repoPath of repoFileNames) {
    if (!zipFileMap.has(repoPath)) {
      if (repoPath.startsWith('.git') || repoPath.startsWith('node_modules') || repoPath === '.env' || repoPath === '.env.local') continue;
      const isBinary = isBinaryFilename(repoPath);
      const oldContent = isBinary ? '' : await fetchOldContent(repoPath);
      const deletions = isBinary ? 0 : (oldContent ? oldContent.split('\n').length : 0);
      diffItems.push({ path: repoPath, status: 'removed', selected: false, oldContent, additions: 0, deletions, isBinary });
    }
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
