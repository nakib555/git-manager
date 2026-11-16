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
