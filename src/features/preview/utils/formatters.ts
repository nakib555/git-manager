export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export interface HexRow {
  offset: string;
  hex: string[];
  ascii: string;
}

export function generateHexDump(data: Uint8Array, maxBytes: number = 32768): { rows: HexRow[]; totalBytes: number; isTruncated: boolean } {
  const totalBytes = data.length;
  const lengthToProcess = Math.min(totalBytes, maxBytes);
  const rows: HexRow[] = [];

  for (let i = 0; i < lengthToProcess; i += 16) {
    const chunk = data.subarray(i, Math.min(i + 16, lengthToProcess));
    const offset = i.toString(16).padStart(8, '0');
    const hex: string[] = [];
    let ascii = '';

    for (let j = 0; j < 16; j++) {
      if (j < chunk.length) {
        const byte = chunk[j];
        hex.push(byte.toString(16).padStart(2, '0'));
        // Printable ASCII between 32 and 126
        if (byte >= 32 && byte <= 126) {
          ascii += String.fromCharCode(byte);
        } else {
          ascii += '.';
        }
      } else {
        hex.push('  ');
        ascii += ' ';
      }
    }

    rows.push({ offset, hex, ascii });
  }

  return {
    rows,
    totalBytes,
    isTruncated: totalBytes > maxBytes,
  };
}
