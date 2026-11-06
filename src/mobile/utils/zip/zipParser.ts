import JSZip from 'jszip';
import { ZipExtractedFile } from './zipTypes';

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

export function cleanPath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

export function detectCommonRoot(paths: string[]): string {
  const filePaths = paths.filter(p => !p.endsWith('/') && p.trim().length > 0);
  if (filePaths.length === 0) return '';

  const firstParts = filePaths[0].split('/');
  if (firstParts.length <= 1) return '';

  const candidate = firstParts[0];
  const allMatch = filePaths.every(p => p.startsWith(`${candidate}/`));
  return allMatch ? `${candidate}/` : '';
}

export async function parseZipArchive(file: File): Promise<{
  files: ZipExtractedFile[];
  commonRoot: string;
  rawPaths: string[];
}> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  const rawPaths: string[] = [];
  zipContent.forEach((relativePath) => {
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
