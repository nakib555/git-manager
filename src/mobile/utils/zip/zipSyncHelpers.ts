import { DiffFileItem, ZipExtractedFile } from './zipTypes';

export type ConflictResolution = 'take_zip' | 'keep_original' | 'delete' | 'restore';
export type BulkResolutionType = 'all_zip' | 'all_original' | 'all_restore' | 'all_delete';

export function sanitizeZipPath(rawPath: string): string {
  const normalized = rawPath.replace(/\\/g, '/').trim();
  const segments = normalized
    .split('/')
    .filter((seg) => seg.length > 0 && seg !== '.' && seg !== '..');
  return segments.join('/');
}

export function alignZipPath(originalPath: string, rootPrefixToStrip: string = ''): string {
  const cleanOriginal = sanitizeZipPath(originalPath);
  const cleanPrefix = sanitizeZipPath(rootPrefixToStrip);

  if (!cleanPrefix) return cleanOriginal;
  if (cleanOriginal === cleanPrefix) return '';
  if (cleanOriginal.startsWith(`${cleanPrefix}/`)) {
    return cleanOriginal.slice(cleanPrefix.length + 1);
  }
  return cleanOriginal;
}

export function isValidZipFile(file: Pick<File, 'name' | 'type'>): boolean {
  const name = (file.name || '').trim().toLowerCase();
  return name.endsWith('.zip');
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function buildAlignedZipMap(
  files: ZipExtractedFile[],
  rootPrefixToStrip: string = ''
): Map<string, ZipExtractedFile> {
  const map = new Map<string, ZipExtractedFile>();
  for (const file of files) {
    const aligned = alignZipPath(file.originalPath, rootPrefixToStrip);
    if (aligned) {
      map.set(aligned, file);
    }
    if (file.originalPath) {
      // Preserve fallback lookup by originalPath when distinct
      const cleanOrig = sanitizeZipPath(file.originalPath);
      if (cleanOrig && !map.has(cleanOrig)) {
        map.set(cleanOrig, file);
      }
    }
  }
  return map;
}

export function getDefaultResolution(item: Pick<DiffFileItem, 'status'>): ConflictResolution {
  return item.status === 'removed' ? 'restore' : 'take_zip';
}

export function applyBulkResolution(
  diffItems: DiffFileItem[],
  currentResolutions: Map<string, ConflictResolution>,
  type: BulkResolutionType
): Map<string, ConflictResolution> {
  const next = new Map(currentResolutions);
  for (const item of diffItems) {
    if (item.status === 'unchanged') continue;
    if (type === 'all_zip' && (item.status === 'modified' || item.status === 'added')) {
      next.set(item.path, 'take_zip');
    } else if (type === 'all_original' && (item.status === 'modified' || item.status === 'added')) {
      next.set(item.path, 'keep_original');
    } else if (type === 'all_restore' && item.status === 'removed') {
      next.set(item.path, 'restore');
    } else if (type === 'all_delete' && item.status === 'removed') {
      next.set(item.path, 'delete');
    }
  }
  return next;
}

export function computeSyncSummary(
  diffItems: DiffFileItem[],
  resolutions: Map<string, ConflictResolution>
): { toUpload: number; toDelete: number; skipped: number; totalToSync: number } {
  let toUpload = 0;
  let toDelete = 0;
  let skipped = 0;

  for (const item of diffItems) {
    if (item.status === 'unchanged') continue;
    const res = resolutions.get(item.path) ?? getDefaultResolution(item);
    if (item.status === 'added' || item.status === 'modified') {
      if (res === 'take_zip') toUpload++;
      else skipped++;
    } else if (item.status === 'removed') {
      if (res === 'delete') toDelete++;
      else skipped++;
    }
  }

  return {
    toUpload,
    toDelete,
    skipped,
    totalToSync: toUpload + toDelete,
  };
}
