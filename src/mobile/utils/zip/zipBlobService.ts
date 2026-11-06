import { DiffFileItem, ZipExtractedFile } from './zipTypes';

export async function uploadGitBlob(
  file: DiffFileItem,
  zipFilesMap: Map<string, ZipExtractedFile>,
  owner: string,
  repo: string,
  headers: Record<string, string>
): Promise<string> {
  const zFile = zipFilesMap.get(file.path);
  let base64Content = '';

  if (zFile?.binaryData) {
    let binaryStr = '';
    const bytes = zFile.binaryData;
    for (let i = 0; i < bytes.byteLength; i++) binaryStr += String.fromCharCode(bytes[i]);
    base64Content = btoa(binaryStr);
  } else {
    const text = file.newContent !== undefined ? file.newContent : (zFile?.content || '');
    const utf8Bytes = new TextEncoder().encode(text);
    let binaryStr = '';
    for (let i = 0; i < utf8Bytes.length; i++) binaryStr += String.fromCharCode(utf8Bytes[i]);
    base64Content = btoa(binaryStr);
  }

  const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content: base64Content, encoding: 'base64' }),
  });

  if (!blobRes.ok) {
    const err = await blobRes.json().catch(() => ({}));
    throw new Error(`Failed to create blob for ${file.path}: ${err.message || blobRes.statusText}`);
  }
  const blobData = await blobRes.json();
  return blobData.sha;
}
