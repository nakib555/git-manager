import { DiffFileItem, ZipExtractedFile } from './zipTypes';

const textEncoder = new TextEncoder();

export function encodeUint8ArrayToBase64(bytes: Uint8Array): string {
  if (bytes.byteLength === 0) return '';
  const CHUNK_SIZE = 0x8000; // 32KB chunks prevent O(N^2) string concat and stack overflow
  const chunks: string[] = [];
  for (let i = 0; i < bytes.byteLength; i += CHUNK_SIZE) {
    const sub = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.byteLength));
    chunks.push(String.fromCharCode.apply(null, sub as unknown as number[]));
  }
  return btoa(chunks.join(''));
}

export async function uploadGitBlob(
  file: DiffFileItem,
  zipFilesMap: Map<string, ZipExtractedFile>,
  owner: string,
  repo: string,
  headers: Record<string, string>,
  signal?: AbortSignal
): Promise<string> {
  if (signal?.aborted) {
    throw new DOMException('Synchronization cancelled by user.', 'AbortError');
  }

  const zFile =
    zipFilesMap.get(file.path) ||
    (file.originalZipPath ? zipFilesMap.get(file.originalZipPath) : undefined);

  let base64Content = '';
  if (zFile?.binaryData) {
    base64Content = encodeUint8ArrayToBase64(zFile.binaryData);
  } else {
    const text = file.newContent !== undefined ? file.newContent : (zFile?.content || '');
    base64Content = encodeUint8ArrayToBase64(textEncoder.encode(text));
  }

  const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content: base64Content, encoding: 'base64' }),
    signal,
  });

  if (!blobRes.ok) {
    const err = await blobRes.json().catch(() => ({}));
    throw new Error(`Failed to create blob for ${file.path}: ${err.message || blobRes.statusText}`);
  }
  const blobData = await blobRes.json();
  return blobData.sha;
}
