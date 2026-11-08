import React, { useMemo } from 'react';
import { Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface SqlitePreviewProps {
  rawBuffer?: Uint8Array;
  fileName: string;
}

export const SqlitePreview: React.FC<SqlitePreviewProps> = ({ rawBuffer, fileName }) => {
  const metadata = useMemo(() => {
    if (!rawBuffer || rawBuffer.length < 100) return null;

    // Check magic bytes: "SQLite format 3\0"
    const headerStr = String.fromCharCode.apply(null, Array.from(rawBuffer.subarray(0, 16)));
    const isValidSqlite = headerStr.startsWith('SQLite format 3');

    if (!isValidSqlite) return null;

    // Page size is a 2-byte integer at offset 16 (if 1, it represents 65536)
    const rawPageSize = (rawBuffer[16] << 8) | rawBuffer[17];
    const pageSize = rawPageSize === 1 ? 65536 : rawPageSize;

    // Total pages at offset 28 (4 bytes)
    const pageCount =
      (rawBuffer[28] << 24) |
      (rawBuffer[29] << 16) |
      (rawBuffer[30] << 8) |
      rawBuffer[31];

    // Text encoding at offset 56 (4 bytes: 1 = UTF-8, 2 = UTF-16le, 3 = UTF-16be)
    const encodingCode = rawBuffer[59];
    const encoding = encodingCode === 1 ? 'UTF-8' : encodingCode === 2 ? 'UTF-16le' : 'UTF-16be';

    // File change counter at offset 24
    const changeCounter =
      (rawBuffer[24] << 24) |
      (rawBuffer[25] << 16) |
      (rawBuffer[26] << 8) |
      rawBuffer[27];

    return {
      isValidSqlite,
      pageSize,
      pageCount: pageCount || Math.ceil(rawBuffer.length / (pageSize || 4096)),
      encoding,
      changeCounter,
      totalBytes: rawBuffer.length,
    };
  }, [rawBuffer]);

  if (!metadata || !metadata.isValidSqlite) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-text-secondary">
        <AlertCircle size={40} className="text-amber-500 mb-3 opacity-80" />
        <p className="text-sm font-medium text-text-primary">Not a valid SQLite 3 Database</p>
        <p className="text-xs text-text-tertiary mt-1 max-w-sm">
          {fileName} does not match the official SQLite binary specification header.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-surface-1 overflow-auto p-6 md:p-10">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-12 h-12 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">{fileName}</h3>
            <div className="flex items-center gap-2 text-xs text-emerald-600 mt-0.5">
              <CheckCircle2 size={13} />
              <span>Valid SQLite 3 Database File</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-surface-2/60 border border-border rounded-xl">
            <div className="text-[11px] text-text-tertiary">Page Size</div>
            <div className="text-sm font-semibold font-mono text-text-primary mt-1 tabular-nums">
              {formatBytes(metadata.pageSize)}
            </div>
          </div>
          <div className="p-3.5 bg-surface-2/60 border border-border rounded-xl">
            <div className="text-[11px] text-text-tertiary">Database Pages</div>
            <div className="text-sm font-semibold font-mono text-text-primary mt-1 tabular-nums">
              {metadata.pageCount}
            </div>
          </div>
          <div className="p-3.5 bg-surface-2/60 border border-border rounded-xl">
            <div className="text-[11px] text-text-tertiary">Text Encoding</div>
            <div className="text-sm font-semibold font-mono text-text-primary mt-1">
              {metadata.encoding}
            </div>
          </div>
          <div className="p-3.5 bg-surface-2/60 border border-border rounded-xl">
            <div className="text-[11px] text-text-tertiary">Change Counter</div>
            <div className="text-sm font-semibold font-mono text-text-primary mt-1 tabular-nums">
              {metadata.changeCounter}
            </div>
          </div>
          <div className="p-3.5 bg-surface-2/60 border border-border rounded-xl">
            <div className="text-[11px] text-text-tertiary">Total Size</div>
            <div className="text-sm font-semibold font-mono text-text-primary mt-1 tabular-nums">
              {formatBytes(metadata.totalBytes)}
            </div>
          </div>
          <div className="p-3.5 bg-surface-2/60 border border-border rounded-xl">
            <div className="text-[11px] text-text-tertiary">Storage Engine</div>
            <div className="text-sm font-semibold font-mono text-text-primary mt-1">
              B-Tree Paged
            </div>
          </div>
        </div>

        <div className="p-4 bg-surface-2/30 border border-border rounded-xl text-xs text-text-secondary leading-relaxed">
          SQLite databases are binary b-tree structures stored locally. To execute relational SQL queries against this file, export or query with the local sqlite3 CLI.
        </div>
      </div>
    </div>
  );
};
