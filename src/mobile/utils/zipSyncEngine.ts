import JSZip from 'jszip';

export interface ZipExtractedFile {
  originalPath: string;
  normalizedPath: string;
  isDir: boolean;
  content?: string;
  binaryData?: Uint8Array;
  size: number;
}

export type FileChangeStatus = 'added' | 'modified' | 'removed' | 'unchanged';

export interface DiffFileItem {
  path: string;
  originalZipPath?: string;
  status: FileChangeStatus;
  selected: boolean;
  oldContent?: string;
  newContent?: string;
  additions: number;
  deletions: number;
  isBinary?: boolean;
  patch?: string;
}

export interface TreeDiffResult {
  commonRootDetected: string;
  totalFilesInZip: number;
  files: DiffFileItem[];
  counts: {
    added: number;
    modified: number;
    removed: number;
    unchanged: number;
    totalChanged: number;
  };
}

/**
 * Checks if a filename is likely binary
 */
export function isBinaryFilename(path: string): boolean {
  const binaryExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'svg', 'bmp', 'tiff',
    'pdf', 'zip', 'tar', 'gz', '7z', 'rar',
    'exe', 'dll', 'so', 'dylib', 'bin',
    'woff', 'woff2', 'ttf', 'otf', 'eot',
    'mp3', 'wav', 'ogg', 'mp4', 'mov', 'webm'
  ];
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return binaryExtensions.includes(ext);
}

/**
 * Normalizes slash separators and trims leading slashes
 */
export function cleanPath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

/**
 * Detects common root folder in a list of file paths (e.g. "my-project-main/src/index.ts" -> "my-project-main/")
 */
export function detectCommonRoot(paths: string[]): string {
  const filePaths = paths.filter(p => !p.endsWith('/') && p.trim().length > 0);
  if (filePaths.length === 0) return '';

  const firstParts = filePaths[0].split('/');
  if (firstParts.length <= 1) return ''; // files in root directory, no common folder wrapper

  const candidate = firstParts[0];
  // Check if all file paths start with this candidate directory
  const allMatch = filePaths.every(p => p.startsWith(`${candidate}/`));
  return allMatch ? `${candidate}/` : '';
}

/**
 * Parses an uploaded ZIP file using JSZip into memory
 */
export async function parseZipArchive(file: File): Promise<{
  files: ZipExtractedFile[];
  commonRoot: string;
  rawPaths: string[];
}> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  const rawPaths: string[] = [];
  zipContent.forEach((relativePath) => {
    // Ignore internal OS metadata folders
    if (!relativePath.includes('__MACOSX/') && !relativePath.endsWith('.DS_Store')) {
      rawPaths.push(relativePath);
    }
  });

  const commonRoot = detectCommonRoot(rawPaths);
  const extractedFiles: ZipExtractedFile[] = [];

  for (const rawPath of rawPaths) {
    const entry = zipContent.file(rawPath);
    if (!entry || entry.dir) continue;

    const normalizedPath = commonRoot && rawPath.startsWith(commonRoot)
      ? rawPath.slice(commonRoot.length)
      : rawPath;

    const isBinary = isBinaryFilename(normalizedPath);
    let content: string | undefined;
    let binaryData: Uint8Array | undefined;

    if (isBinary) {
      binaryData = await entry.async('uint8array');
    } else {
      try {
        content = await entry.async('string');
      } catch {
        binaryData = await entry.async('uint8array');
      }
    }

    extractedFiles.push({
      originalPath: rawPath,
      normalizedPath: cleanPath(normalizedPath),
      isDir: false,
      content,
      binaryData,
      size: binaryData ? binaryData.length : (content ? new TextEncoder().encode(content).length : 0),
    });
  }

  return {
    files: extractedFiles,
    commonRoot,
    rawPaths,
  };
}

/**
 * Generate a line-by-line diff with additions and deletions count
 */
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

  // Simple LCS-based or line-matching diff algorithm for fast browser rendering
  let oIdx = 0;
  let nIdx = 0;
  let oldLineNum = 1;
  let newLineNum = 1;

  while (oIdx < oldLines.length && nIdx < newLines.length) {
    if (oldLines[oIdx] === newLines[nIdx]) {
      lines.push({
        type: 'same',
        text: oldLines[oIdx],
        oldLine: oldLineNum++,
        newLine: newLineNum++,
      });
      oIdx++;
      nIdx++;
    } else {
      // Look ahead for matching line
      const nextMatchInNew = newLines.indexOf(oldLines[oIdx], nIdx);
      const nextMatchInOld = oldLines.indexOf(newLines[nIdx], oIdx);

      if (nextMatchInNew !== -1 && (nextMatchInOld === -1 || nextMatchInNew - nIdx <= nextMatchInOld - oIdx)) {
        // Lines inserted in new
        while (nIdx < nextMatchInNew) {
          additions++;
          lines.push({
            type: 'add',
            text: newLines[nIdx],
            newLine: newLineNum++,
          });
          nIdx++;
        }
      } else if (nextMatchInOld !== -1) {
        // Lines removed from old
        while (oIdx < nextMatchInOld) {
          deletions++;
          lines.push({
            type: 'del',
            text: oldLines[oIdx],
            oldLine: oldLineNum++,
          });
          oIdx++;
        }
      } else {
        // Substitution
        deletions++;
        lines.push({
          type: 'del',
          text: oldLines[oIdx],
          oldLine: oldLineNum++,
        });
        oIdx++;

        additions++;
        lines.push({
          type: 'add',
          text: newLines[nIdx],
          newLine: newLineNum++,
        });
        nIdx++;
      }
    }
  }

  // Trailing removals
  while (oIdx < oldLines.length) {
    deletions++;
    lines.push({
      type: 'del',
      text: oldLines[oIdx],
      oldLine: oldLineNum++,
    });
    oIdx++;
  }

  // Trailing additions
  while (nIdx < newLines.length) {
    additions++;
    lines.push({
      type: 'add',
      text: newLines[nIdx],
      newLine: newLineNum++,
    });
    nIdx++;
  }

  return { additions, deletions, lines };
}

/**
 * Compares current repository files against extracted ZIP files
 */
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
  // Only look at file items in the repository, ignore folders
  const repoFileNames = new Set(
    repoFiles
      .filter(f => f.type === 'file' || (!f.type && !f.name.endsWith('/')))
      .map(f => cleanPath(f.name))
  );

  // Map of re-aligned zip files
  const zipFileMap = new Map<string, ZipExtractedFile>();
  for (const zf of zipFiles) {
    let alignedPath = zf.originalPath;
    if (rootPrefixToStrip && alignedPath.startsWith(rootPrefixToStrip)) {
      alignedPath = alignedPath.slice(rootPrefixToStrip.length);
    }
    alignedPath = cleanPath(alignedPath);
    if (alignedPath) {
      zipFileMap.set(alignedPath, zf);
    }
  }

  const diffItems: DiffFileItem[] = [];

  // 1. Process files present in ZIP (Added or Modified or Unchanged)
  for (const [path, zFile] of zipFileMap.entries()) {
    const isBinary = isBinaryFilename(path);
    const existsInRepo = repoFileNames.has(path);

    if (!existsInRepo) {
      // Newly added file
      const newContent = zFile.content || '';
      const additions = isBinary ? 0 : (newContent ? newContent.split('\n').length : 0);
      diffItems.push({
        path,
        originalZipPath: zFile.originalPath,
        status: 'added',
        selected: true,
        newContent,
        additions,
        deletions: 0,
        isBinary,
      });
    } else {
      // Exists in repo: compare contents
      if (isBinary) {
        // For binary files, assume modified if sizes or bytes exist
        diffItems.push({
          path,
          originalZipPath: zFile.originalPath,
          status: 'modified',
          selected: true,
          additions: 0,
          deletions: 0,
          isBinary: true,
        });
      } else {
        const oldContent = await fetchOldContent(path);
        const newContent = zFile.content || '';

        if (oldContent === newContent) {
          diffItems.push({
            path,
            originalZipPath: zFile.originalPath,
            status: 'unchanged',
            selected: false,
            oldContent,
            newContent,
            additions: 0,
            deletions: 0,
            isBinary: false,
          });
        } else {
          const diffStats = computeLineDiff(oldContent, newContent);
          diffItems.push({
            path,
            originalZipPath: zFile.originalPath,
            status: 'modified',
            selected: true,
            oldContent,
            newContent,
            additions: diffStats.additions,
            deletions: diffStats.deletions,
            isBinary: false,
          });
        }
      }
    }
  }

  // 2. Process files in repo that are missing in the ZIP (Removed)
  for (const repoPath of repoFileNames) {
    if (!zipFileMap.has(repoPath)) {
      // Filter out typical runtime or config files that might not be in a source export
      if (
        repoPath.startsWith('.git') ||
        repoPath.startsWith('node_modules') ||
        repoPath === '.env' ||
        repoPath === '.env.local'
      ) {
        continue;
      }

      const isBinary = isBinaryFilename(repoPath);
      const oldContent = isBinary ? '' : await fetchOldContent(repoPath);
      const deletions = isBinary ? 0 : (oldContent ? oldContent.split('\n').length : 0);

      diffItems.push({
        path: repoPath,
        status: 'removed',
        selected: false, // Default unselected so user consciously confirms deletion
        oldContent,
        additions: 0,
        deletions,
        isBinary,
      });
    }
  }

  // Sort: Modified first, then Added, then Removed, then Unchanged
  const statusWeight: Record<FileChangeStatus, number> = {
    modified: 1,
    added: 2,
    removed: 3,
    unchanged: 4,
  };
  diffItems.sort((a, b) => {
    if (statusWeight[a.status] !== statusWeight[b.status]) {
      return statusWeight[a.status] - statusWeight[b.status];
    }
    return a.path.localeCompare(b.path);
  });

  const counts = {
    added: diffItems.filter(f => f.status === 'added').length,
    modified: diffItems.filter(f => f.status === 'modified').length,
    removed: diffItems.filter(f => f.status === 'removed').length,
    unchanged: diffItems.filter(f => f.status === 'unchanged').length,
    totalChanged: diffItems.filter(f => f.status !== 'unchanged').length,
  };

  return {
    commonRootDetected: rootPrefixToStrip,
    totalFilesInZip: zipFiles.length,
    files: diffItems,
    counts,
  };
}

/**
 * Atomic Commit to GitHub via Git Data Trees API
 */
export async function commitSyncToGitHub({
  token,
  owner,
  repo,
  branch,
  commitMessage,
  selectedDiffFiles,
  zipFilesMap,
  fileResolutions,
  createPR = false,
  newBranchName = '',
  prTitle = '',
  prBody = '',
  onProgress,
}: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  commitMessage: string;
  selectedDiffFiles: DiffFileItem[];
  zipFilesMap: Map<string, ZipExtractedFile>;
  fileResolutions?: Map<string, 'take_zip' | 'keep_original' | 'delete' | 'restore'>;
  createPR?: boolean;
  newBranchName?: string;
  prTitle?: string;
  prBody?: string;
  onProgress?: (step: string) => void;
}): Promise<{
  commitSha: string;
  branchName: string;
  prNumber?: number;
  prUrl?: string;
  htmlUrl: string;
}> {
  const authHeader = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
    ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
    : `token ${token}`;

  const headers: Record<string, string> = {
    Authorization: authHeader,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  onProgress?.('Fetching current branch commit reference...');
  // 1. Get branch ref SHA
  const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
  if (!refRes.ok) {
    const err = await refRes.json().catch(() => ({}));
    throw new Error(`Failed to get branch '${branch}': ${err.message || refRes.statusText}`);
  }
  const refData = await refRes.json();
  const baseCommitSha = refData.object.sha;

  onProgress?.('Fetching base git tree...');
  // 2. Get base tree SHA from base commit
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${baseCommitSha}`, { headers });
  if (!commitRes.ok) {
    const err = await commitRes.json().catch(() => ({}));
    throw new Error(`Failed to get base commit: ${err.message || commitRes.statusText}`);
  }
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  // 3. Create blobs for added and modified files
  const treeEntries: { path: string; mode: string; type: 'blob'; sha: string | null }[] = [];

  // Filter files to upload based on resolution ('take_zip' vs 'keep_original')
  const filesToUpload = selectedDiffFiles.filter(f => {
    const res = fileResolutions?.get(f.path);
    if (f.status === 'added' || f.status === 'modified') {
      return res === undefined || res === 'take_zip';
    }
    return false;
  });
  let uploadedCount = 0;

  for (const file of filesToUpload) {
    uploadedCount++;
    onProgress?.(`Uploading blob ${uploadedCount}/${filesToUpload.length}: ${file.path}...`);

    const zFile = zipFilesMap.get(file.path);
    let base64Content = '';

    if (zFile?.binaryData) {
      let binaryStr = '';
      const bytes = zFile.binaryData;
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binaryStr += String.fromCharCode(bytes[i]);
      }
      base64Content = btoa(binaryStr);
    } else {
      const text = file.newContent !== undefined ? file.newContent : (zFile?.content || '');
      const utf8Bytes = new TextEncoder().encode(text);
      let binaryStr = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binaryStr += String.fromCharCode(utf8Bytes[i]);
      }
      base64Content = btoa(binaryStr);
    }

    const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: base64Content,
        encoding: 'base64',
      }),
    });

    if (!blobRes.ok) {
      const err = await blobRes.json().catch(() => ({}));
      throw new Error(`Failed to create blob for ${file.path}: ${err.message || blobRes.statusText}`);
    }

    const blobData = await blobRes.json();
    treeEntries.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha,
    });
  }

  // Handle removed files conforming to Git rules:
  // Files confirmed for 'delete' are staged with sha: null.
  // Files marked 'restore' (kept) are omitted from treeEntries so they stay preserved in the base repository tree.
  const filesToDelete = selectedDiffFiles.filter(f => {
    if (f.status !== 'removed') return false;
    const res = fileResolutions?.get(f.path);
    return res === 'delete';
  });

  for (const rFile of filesToDelete) {
    treeEntries.push({
      path: rFile.path,
      mode: '100644',
      type: 'blob',
      sha: null,
    });
  }

  if (treeEntries.length === 0) {
    throw new Error('No files selected for synchronization.');
  }

  onProgress?.('Constructing new Git tree object...');
  // 4. Create new Git tree
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeEntries,
    }),
  });

  if (!treeRes.ok) {
    const err = await treeRes.json().catch(() => ({}));
    throw new Error(`Failed to create Git tree: ${err.message || treeRes.statusText}`);
  }
  const newTreeData = await treeRes.json();
  const newTreeSha = newTreeData.sha;

  onProgress?.('Creating atomic commit...');
  // 5. Create new Commit
  const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: commitMessage,
      tree: newTreeSha,
      parents: [baseCommitSha],
    }),
  });

  if (!newCommitRes.ok) {
    const err = await newCommitRes.json().catch(() => ({}));
    throw new Error(`Failed to create commit: ${err.message || newCommitRes.statusText}`);
  }
  const newCommit = await newCommitRes.json();
  const newCommitSha = newCommit.sha;

  let targetBranch = branch;
  let prNumber: number | undefined;
  let prUrl: string | undefined;

  if (createPR && newBranchName.trim()) {
    targetBranch = newBranchName.trim();
    onProgress?.(`Creating new branch '${targetBranch}'...`);

    // Create new branch pointing to new commit
    const createBranchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${targetBranch}`,
        sha: newCommitSha,
      }),
    });

    if (!createBranchRes.ok) {
      const err = await createBranchRes.json().catch(() => ({}));
      throw new Error(`Failed to create branch '${targetBranch}': ${err.message || createBranchRes.statusText}`);
    }

    onProgress?.(`Opening Pull Request from '${targetBranch}' into '${branch}'...`);
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: prTitle || commitMessage,
        body: prBody || `Synchronized changes from AI Studio ZIP package.\n\nFiles changed: ${selectedDiffFiles.length}`,
        head: targetBranch,
        base: branch,
      }),
    });

    if (prRes.ok) {
      const prData = await prRes.json();
      prNumber = prData.number;
      prUrl = prData.html_url;
    }
  } else {
    onProgress?.(`Updating branch '${branch}' ref...`);
    // Direct commit: update existing branch
    const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitSha,
        force: false,
      }),
    });

    if (!updateRefRes.ok) {
      const err = await updateRefRes.json().catch(() => ({}));
      throw new Error(`Failed to update branch '${branch}': ${err.message || updateRefRes.statusText}`);
    }
  }

  const htmlUrl = `https://github.com/${owner}/${repo}/commit/${newCommitSha}`;

  return {
    commitSha: newCommitSha,
    branchName: targetBranch,
    prNumber,
    prUrl,
    htmlUrl,
  };
}
