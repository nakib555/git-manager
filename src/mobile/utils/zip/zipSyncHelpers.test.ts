import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {
  sanitizeZipPath,
  alignZipPath,
  isValidZipFile,
  buildAlignedZipMap,
  applyBulkResolution,
  computeSyncSummary,
  formatFileSize,
} from './zipSyncHelpers';
import { parseZipArchive } from './zipParser';
import { compareZipWithRepo } from './zipDiffCalculator';
import { commitSyncToGitHub, isSyncAbortError } from './zipGitCommitService';
import {
  buildDiffTree,
  collectFolderPaths,
  getNodeSelectionState,
  applyTreeNodeSelection,
} from './zipDiffTree';
import type { DiffFileItem, ZipExtractedFile } from './zipTypes';

test('sanitizeZipPath normalizes slashes and drops path traversal segments', () => {
  assert.equal(sanitizeZipPath('/src\\components/App.tsx/'), 'src/components/App.tsx');
  assert.equal(sanitizeZipPath('../../etc/passwd'), 'etc/passwd');
  assert.equal(sanitizeZipPath('./foo/./bar/../baz.ts'), 'foo/bar/baz.ts');
});

test('alignZipPath strips root prefix accurately', () => {
  assert.equal(alignZipPath('my-app-main/src/App.tsx', 'my-app-main/'), 'src/App.tsx');
  assert.equal(alignZipPath('my-app-main/nested/src/App.tsx', 'my-app-main/nested'), 'src/App.tsx');
  assert.equal(alignZipPath('src/App.tsx', ''), 'src/App.tsx');
  assert.equal(alignZipPath('other/App.tsx', 'my-app-main/'), 'other/App.tsx');
});

test('isValidZipFile performs case-insensitive .zip validation', () => {
  assert.equal(isValidZipFile({ name: 'export.zip', type: 'application/zip' }), true);
  assert.equal(isValidZipFile({ name: 'EXPORT.ZIP', type: '' }), true);
  assert.equal(isValidZipFile({ name: 'archive.tar.gz', type: 'application/gzip' }), false);
});

test('formatFileSize renders human-readable sizes', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(2 * 1024 * 1024), '2.00 MB');
});

test('buildAlignedZipMap preserves binary & text lookup when activeRoot differs from commonRoot', () => {
  const files: ZipExtractedFile[] = [
    {
      originalPath: 'wrapper/apps/web/logo.png',
      normalizedPath: 'apps/web/logo.png',
      isDir: false,
      binaryData: new Uint8Array([1, 2, 3]),
      size: 3,
    },
    {
      originalPath: 'wrapper/apps/web/src/index.ts',
      normalizedPath: 'apps/web/src/index.ts',
      isDir: false,
      content: 'console.log(1);',
      size: 15,
    },
  ];

  const alignedMap = buildAlignedZipMap(files, 'wrapper/apps/web/');
  assert.equal(alignedMap.get('logo.png')?.size, 3);
  assert.equal(alignedMap.get('src/index.ts')?.content, 'console.log(1);');
});

test('applyBulkResolution and computeSyncSummary handle modified, added, and removed files', () => {
  const diffItems: DiffFileItem[] = [
    { path: 'src/a.ts', status: 'modified', selected: true, additions: 2, deletions: 1 },
    { path: 'src/b.ts', status: 'added', selected: true, additions: 10, deletions: 0 },
    { path: 'src/old.ts', status: 'removed', selected: false, additions: 0, deletions: 5 },
    { path: 'src/same.ts', status: 'unchanged', selected: false, additions: 0, deletions: 0 },
  ];

  // Initial defaults: modified -> take_zip, added -> take_zip, removed -> restore (skip)
  const initialSummary = computeSyncSummary(diffItems, new Map());
  assert.deepEqual(initialSummary, { toUpload: 2, toDelete: 0, skipped: 1, totalToSync: 2 });

  // Bulk keep_original skips modified and added
  const keptOriginal = applyBulkResolution(diffItems, new Map(), 'all_original');
  assert.deepEqual(computeSyncSummary(diffItems, keptOriginal), {
    toUpload: 0,
    toDelete: 0,
    skipped: 3,
    totalToSync: 0,
  });

  // Bulk take_zip + bulk delete missing
  const takeZip = applyBulkResolution(diffItems, keptOriginal, 'all_zip');
  const deleteMissing = applyBulkResolution(diffItems, takeZip, 'all_delete');
  assert.deepEqual(computeSyncSummary(diffItems, deleteMissing), {
    toUpload: 2,
    toDelete: 1,
    skipped: 0,
    totalToSync: 3,
  });

  // Restore all missing reverts removed files back to restore
  const restored = applyBulkResolution(diffItems, deleteMissing, 'all_restore');
  assert.deepEqual(computeSyncSummary(diffItems, restored), {
    toUpload: 2,
    toDelete: 0,
    skipped: 1,
    totalToSync: 2,
  });
});

test('parseZipArchive rejects empty archives and extracts real ZIP entries', async () => {
  const emptyZip = new JSZip();
  emptyZip.folder('__MACOSX');
  const emptyBlob = await emptyZip.generateAsync({ type: 'uint8array' });
  const emptyFile = new File([emptyBlob], 'empty.zip', { type: 'application/zip' });
  await assert.rejects(() => parseZipArchive(emptyFile), /no syncable files/i);

  const validZip = new JSZip();
  validZip.file('project/src/App.tsx', 'export const App = () => null;');
  validZip.file('project/README.md', '# App');
  const validBlob = await validZip.generateAsync({ type: 'uint8array' });
  const validFile = new File([validBlob], 'project.zip', { type: 'application/zip' });

  const parsed = await parseZipArchive(validFile);
  assert.equal(parsed.commonRoot, 'project/');
  assert.equal(parsed.files.length, 2);
});

test('compareZipWithRepo classifies added, modified, unchanged, and removed with progress', async () => {
  const zipFiles: ZipExtractedFile[] = [
    { originalPath: 'app/src/a.ts', normalizedPath: 'src/a.ts', isDir: false, content: 'v2', size: 2 },
    { originalPath: 'app/src/same.ts', normalizedPath: 'src/same.ts', isDir: false, content: 'same', size: 4 },
    { originalPath: 'app/src/new.ts', normalizedPath: 'src/new.ts', isDir: false, content: 'new', size: 3 },
  ];
  const repoFiles = [
    { name: 'src/a.ts', type: 'file' as const },
    { name: 'src/same.ts', type: 'file' as const },
    { name: 'src/removed.ts', type: 'file' as const },
  ];

  const remoteMap: Record<string, string> = {
    'src/a.ts': 'v1',
    'src/same.ts': 'same',
    'src/removed.ts': 'legacy',
  };

  let lastProgress = { completed: 0, total: 0 };
  const result = await compareZipWithRepo({
    zipFiles,
    repoFiles,
    rootPrefixToStrip: 'app/',
    fetchOldContent: async (p) => remoteMap[p] || '',
    onProgress: (completed, total) => {
      lastProgress = { completed, total };
    },
  });

  assert.equal(result.counts.modified, 1);
  assert.equal(result.counts.added, 1);
  assert.equal(result.counts.removed, 1);
  assert.equal(result.counts.unchanged, 1);
  assert.equal(lastProgress.completed, 3);
  assert.equal(lastProgress.total, 3);
});

test('buildDiffTree groups folders alphabetically and computes tri-state folder selection', () => {
  const diffItems: DiffFileItem[] = [
    { path: 'src/context/StoreContext.tsx', status: 'modified', selected: true, newContent: 'hello world', additions: 1, deletions: 0 },
    { path: 'src/context/ThemeContext.tsx', status: 'added', selected: true, newContent: 'export {}', additions: 1, deletions: 0 },
    { path: 'public/icon.svg', status: 'removed', selected: false, oldContent: '<svg/>', additions: 0, deletions: 1 },
    { path: 'README.md', status: 'unchanged', selected: false, additions: 0, deletions: 0 },
  ];

  const tree = buildDiffTree(diffItems);
  assert.equal(tree.length, 2); // public, src (README unchanged excluded)
  assert.equal(tree[0].name, 'public');
  assert.equal(tree[1].name, 'src');
  assert.equal(tree[1].totalFiles, 2);

  const folders = collectFolderPaths(tree);
  assert.deepEqual(folders, ['public', 'src', 'src/context']);

  // Initially public has 1 removed file (default restore -> unchecked) and src has 2 checked
  assert.equal(getNodeSelectionState(tree[0], new Map()), 'unchecked');
  assert.equal(getNodeSelectionState(tree[1], new Map()), 'checked');

  // Unchecking StoreContext makes src indeterminate
  const storeFileNode = tree[1].children[0].children[0];
  const partialRes = applyTreeNodeSelection(storeFileNode, new Map(), false);
  assert.equal(getNodeSelectionState(tree[1], partialRes), 'indeterminate');

  // Checking public marks missing file for deletion
  const deletedRes = applyTreeNodeSelection(tree[0], partialRes, true);
  assert.equal(deletedRes.get('public/icon.svg'), 'delete');
  assert.equal(getNodeSelectionState(tree[0], deletedRes), 'checked');
});

test('commitSyncToGitHub aborts immediately when AbortSignal is aborted', async () => {
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    () =>
      commitSyncToGitHub({
        token: 'test_token',
        owner: 'octodev',
        repo: 'demo',
        branch: 'main',
        commitMessage: 'Test',
        selectedDiffFiles: [{ path: 'README.md', status: 'modified', selected: true, newContent: '# New', additions: 1, deletions: 0 }],
        zipFilesMap: new Map(),
        signal: controller.signal,
      }),
    (err) => isSyncAbortError(err)
  );
});

test('analyzeZipRoots never selects partial nested subfolder over full 77-file archive root', async () => {
  const { analyzeZipRoots } = await import('../zipAutoDetect');
  const paths: string[] = [];
  for (let i = 0; i < 44; i++) {
    paths.push(`my-export/frontend/src/Comp${i}.tsx`);
  }
  paths.push('my-export/frontend/package.json', 'my-export/frontend/tsconfig.json', 'my-export/frontend/index.html');
  for (let i = 0; i < 30; i++) {
    paths.push(`my-export/backend/routes/r${i}.ts`);
  }
  assert.equal(paths.length, 77);

  const analysis = analyzeZipRoots(paths);
  assert.equal(analysis.suggestedRoot, 'my-export/');
});

test('compareZipWithRepo short-circuits unchanged files via Git Blob SHA-1 without HTTP fetches', async () => {
  const { computeGitBlobSha } = await import('./zipDiffCalculator');
  const zipFile: ZipExtractedFile = {
    originalPath: 'same.ts',
    normalizedPath: 'same.ts',
    isDir: false,
    content: 'export const x = 42;\n',
    size: 21,
  };
  const sha = await computeGitBlobSha(zipFile);
  assert.ok(sha);

  let fetchCount = 0;
  const result = await compareZipWithRepo({
    zipFiles: [zipFile],
    repoFiles: [{ name: 'same.ts', type: 'file', sha: sha! }],
    fetchOldContent: async () => {
      fetchCount++;
      return 'should not fetch';
    },
  });

  assert.equal(fetchCount, 0);
  assert.equal(result.counts.unchanged, 1);
});

test('commitSyncToGitHub uploads all 77 files concurrently and records 77 tree entries', async () => {
  const diffFiles: DiffFileItem[] = [];
  const zipMap = new Map<string, ZipExtractedFile>();
  for (let i = 0; i < 77; i++) {
    const p = `src/file_${i}.ts`;
    const content = `export const v${i} = ${i};`;
    diffFiles.push({ path: p, status: 'added', selected: true, newContent: content, additions: 1, deletions: 0 });
    zipMap.set(p, { originalPath: p, normalizedPath: p, isDir: false, content, size: content.length });
  }

  let blobCalls = 0;
  let treeEntriesCount = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('/git/ref/heads/')) {
      return new Response(JSON.stringify({ object: { sha: 'base_commit_1' } }), { status: 200 });
    }
    if (url.includes('/git/commits/base_commit_1')) {
      return new Response(JSON.stringify({ sha: 'base_commit_1', tree: { sha: 'base_tree_1' } }), { status: 200 });
    }
    if (url.includes('/git/blobs')) {
      blobCalls++;
      return new Response(JSON.stringify({ sha: `blob_${blobCalls}` }), { status: 201 });
    }
    if (url.includes('/git/trees')) {
      const body = JSON.parse(String(init?.body || '{}'));
      treeEntriesCount = Array.isArray(body.tree) ? body.tree.length : 0;
      return new Response(JSON.stringify({ sha: 'new_tree_sha' }), { status: 201 });
    }
    if (url.includes('/git/commits') && init?.method === 'POST') {
      return new Response(JSON.stringify({ sha: 'new_commit_77' }), { status: 201 });
    }
    if (url.includes('/git/refs/heads/') && init?.method === 'PATCH') {
      return new Response(JSON.stringify({ object: { sha: 'new_commit_77' } }), { status: 200 });
    }
    return new Response('{}', { status: 200 });
  }) as typeof fetch;

  try {
    const res = await commitSyncToGitHub({
      token: 'ghp_test',
      owner: 'acme',
      repo: 'app',
      branch: 'main',
      commitMessage: 'Upload 77 files',
      selectedDiffFiles: diffFiles,
      zipFilesMap: zipMap,
    });
    assert.equal(blobCalls, 77);
    assert.equal(treeEntriesCount, 77);
    assert.equal(res.uploadedCount, 77);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
