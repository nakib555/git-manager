import React, { useState, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { ArchiveFileList, ArchiveEntry } from './ArchiveFileList';
import { Archive, Search, AlertCircle, FileText } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface ArchivePreviewProps {
  rawBuffer?: Uint8Array;
  fileName: string;
}

export const ArchivePreview: React.FC<ArchivePreviewProps> = ({ rawBuffer, fileName }) => {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [zipInstance, setZipInstance] = useState<JSZip | null>(null);
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [entryContent, setEntryContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawBuffer || rawBuffer.length === 0) {
      setError('Archive file buffer is empty.');
      return;
    }

    JSZip.loadAsync(rawBuffer)
      .then((zip) => {
        setZipInstance(zip);
        const list: ArchiveEntry[] = [];
        zip.forEach((relativePath, file) => {
          // Prevent directory traversal attacks
          if (relativePath.includes('..')) return;
          list.push({
            name: relativePath,
            dir: file.dir,
            uncompressedSize: (file as any)._data?.uncompressedSize || 0,
            date: file.date,
          });
        });
        setEntries(list);
      })
      .catch((err) => {
        setError(err.message || 'Failed to read ZIP archive');
      });
  }, [rawBuffer]);

  const handleSelectEntry = async (name: string) => {
    if (!zipInstance) return;
    setSelectedEntry(name);
    try {
      const file = zipInstance.file(name);
      if (file) {
        const text = await file.async('string');
        setEntryContent(text.slice(0, 10000));
      }
    } catch (_) {
      setEntryContent('[Binary content]');
    }
  };

  const handleDownloadEntry = async (name: string) => {
    if (!zipInstance) return;
    const file = zipInstance.file(name);
    if (!file) return;
    const blob = await file.async('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name.split('/').pop() || name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) => e.name.toLowerCase().includes(q));
  }, [entries, search]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-text-secondary">
        <AlertCircle size={40} className="text-rose-500 mb-3 opacity-80" />
        <p className="text-sm font-medium text-text-primary">Unable to read archive</p>
        <p className="text-xs text-text-tertiary mt-1 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-surface-1 overflow-hidden">
      <div className="w-full md:w-80 border-r border-border flex flex-col shrink-0 h-1/2 md:h-full">
        <div className="p-3 border-b border-border bg-surface-2/40">
          <div className="relative w-full">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter archive files..."
              className="w-full bg-surface-1 border border-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-text-primary outline-none focus:border-accent"
            />
          </div>
          <div className="mt-2 text-[11px] font-mono text-text-tertiary">
            {entries.length} items in archive
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ArchiveFileList
            entries={filteredEntries}
            selectedEntry={selectedEntry}
            onSelectEntry={handleSelectEntry}
            onDownloadEntry={handleDownloadEntry}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col h-1/2 md:h-full bg-surface-2/20">
        {selectedEntry ? (
          <div className="h-full flex flex-col">
            <div className="text-xs font-mono font-semibold text-text-primary mb-2 truncate">
              {selectedEntry}
            </div>
            <pre className="flex-1 overflow-auto bg-surface-1 border border-border rounded-lg p-3 text-xs font-mono whitespace-pre-wrap">
              {entryContent || 'Loading...'}
            </pre>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
            <Archive size={36} className="opacity-50 mb-2" />
            <p className="text-xs">Select a file inside the archive to preview</p>
          </div>
        )}
      </div>
    </div>
  );
};
