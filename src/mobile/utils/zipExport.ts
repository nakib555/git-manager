import JSZip from 'jszip';

export interface FileTreeItem {
  path: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
  content?: string;
  sha?: string;
}

/**
 * Client-side zip packager for selective repository files.
 * Uses JSZip to construct an in-memory archive and trigger a browser download.
 */
export async function packageAndDownloadZip(
  files: { path: string; content?: string; binaryData?: Uint8Array }[],
  zipFilename: string
): Promise<void> {
  const zip = new JSZip();

  for (const file of files) {
    if (file.binaryData) {
      zip.file(file.path, file.binaryData);
    } else {
      // Default to content or placeholder source if empty
      const fileContent = file.content !== undefined 
        ? file.content 
        : `// Exported from repository\n// Path: ${file.path}\n`;
      zip.file(file.path, fileContent);
    }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
}

/**
 * Downloads a single file directly as raw text or binary blob.
 */
export function downloadSingleFile(filename: string, content: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
}
