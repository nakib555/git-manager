import JSZip from 'jszip';
import { ZipExtractedFile } from './zipTypes';
import { sanitizeZipPath } from './zipSyncHelpers';

export function isBinaryFilename(path: string): boolean {
  const binaryExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'svg', 'bmp', 'tiff', 'avif',
    'pdf', 'zip', 'tar', 'gz', '7z', 'rar', 'wasm',
    'exe', 'dll', 'so', 'dylib', 'bin', 'db', 'sqlite',
    'woff', 'woff2', 'ttf', 'otf', 'eot',
    'mp3', 'wav', 'ogg', 'mp4', 'mov', 'webm'
  ];
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return binaryExtensions.includes(ext);
}

export function cleanPath(p: string): string {
  return sanitizeZipPath(p);
}

export function detectCommonRoot(paths: string[]): string {
  const filePaths = paths
    .map(p => sanitizeZipPath(p))
    .filter(p => p.length > 0 && !p.endsWith('/'));
  if (filePaths.length === 0) return '';

  const firstParts = filePaths[0].split('/');
  if (firstParts.length <= 1) return '';

  const candidate = firstParts[0];
  const allMatch = filePaths.every(p => p.startsWith(`${candidate}/`));
  return allMatch ? `${candidate}/` : '';
}

const utf8FatalDecoder = new TextDecoder('utf-8', { fatal: true });

function looksBinaryBytes(bytes: Uint8Array): boolean {
  const sampleLen = Math.min(bytes.length, 4096);
  for (let i = 0; i < sampleLen; i++) {
    if (bytes[i] === 0) return true;
  }
  return false;
}

export async function parseZipArchive(file: File): Promise<{
  files: ZipExtractedFile[];
  commonRoot: string;
  rawPaths: string[];
}> {
  const zip = new JSZip();
  let zipContent: JSZip;
  try {
    zipContent = await zip.loadAsync(file);
  } catch {
    throw new Error('Invalid or corrupted ZIP archive. Please export a valid .zip file.');
  }

  const entryMap = new Map<string, JSZip.JSZipObject>();
  const rawPaths: string[] = [];

  zipContent.forEach((relativePath, entry) => {
    if (entry.dir) return;
    if (!relativePath.includes('__MACOSX/') && !relativePath.endsWith('.DS_Store')) {
      const cleaned = sanitizeZipPath(relativePath);
      if (cleaned && !entryMap.has(cleaned)) {
        entryMap.set(cleaned, entry);
        rawPaths.push(cleaned);
      }
    }
  });

  if (rawPaths.length === 0) {
    throw new Error('This ZIP archive contains no syncable files.');
  }

  const commonRoot = detectCommonRoot(rawPaths);
  const extractedFiles: ZipExtractedFile[] = new Array(rawPaths.length);

  // Concurrent extraction in batches of 16 for fast archive processing
  const BATCH_SIZE = 16;
  for (let start = 0; start < rawPaths.length; start += BATCH_SIZE) {
    const slice = rawPaths.slice(start, start + BATCH_SIZE);
    await Promise.all(
      slice.map(async (rawPath, offset) => {
        const entry = entryMap.get(rawPath);
        if (!entry || entry.dir) return;

        const normalizedPath = commonRoot && rawPath.startsWith(commonRoot)
          ? rawPath.slice(commonRoot.length)
          : rawPath;

        const bytes = await entry.async('uint8array');
        const forceBinary = isBinaryFilename(normalizedPath) || looksBinaryBytes(bytes);

        let content: string | undefined;
        let binaryData: Uint8Array | undefined;

        if (forceBinary) {
          binaryData = bytes;
        } else {
          try {
            content = utf8FatalDecoder.decode(bytes);
          } catch {
            binaryData = bytes;
          }
        }

        extractedFiles[start + offset] = {
          originalPath: rawPath,
          normalizedPath: cleanPath(normalizedPath),
          isDir: false,
          content,
          binaryData,
          size: bytes.byteLength,
        };
      })
    );
  }

  const compactFiles = extractedFiles.filter(Boolean);
  if (compactFiles.length === 0) {
    throw new Error('Could not extract any readable files from this ZIP archive.');
  }

  return {
    files: compactFiles,
    commonRoot,
    rawPaths,
  };
}
