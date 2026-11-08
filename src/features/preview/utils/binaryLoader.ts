import { FileBinaryPayload } from '../types/previewTypes';

export function base64ToUint8Array(base64: string): Uint8Array {
  // Strip whitespace, newlines, and data URL prefixes
  const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '').replace(/\s+/g, '');
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

export function createManagedBlobUrl(data: Uint8Array | Blob | string, mimeType: string): { url: string; revoke: () => void } {
  let blob: Blob;
  if (data instanceof Blob) {
    blob = data;
  } else if (typeof data === 'string') {
    blob = new Blob([data], { type: mimeType });
  } else {
    blob = new Blob([data], { type: mimeType });
  }

  const url = URL.createObjectURL(blob);
  const revoke = () => {
    try {
      URL.revokeObjectURL(url);
    } catch (_) {}
  };

  return { url, revoke };
}

export function safeTextDecode(buffer: Uint8Array): string {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(buffer);
  } catch (_) {
    let result = '';
    for (let i = 0; i < buffer.length; i++) {
      const code = buffer[i];
      if (code >= 32 && code <= 126) {
        result += String.fromCharCode(code);
      } else if (code === 10 || code === 13 || code === 9) {
        result += String.fromCharCode(code);
      } else {
        result += '·';
      }
    }
    return result;
  }
}
