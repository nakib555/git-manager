import React from 'react';
import { File, Folder, Download } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export interface ArchiveEntry {
  name: string;
  dir: boolean;
  uncompressedSize: number;
  date: Date;
}

interface ArchiveFileListProps {
  entries: ArchiveEntry[];
  selectedEntry: string | null;
  onSelectEntry: (name: string) => void;
  onDownloadEntry: (name: string) => void;
}

export const ArchiveFileList: React.FC<ArchiveFileListProps> = ({
  entries,
  selectedEntry,
  onSelectEntry,
  onDownloadEntry,
}) => {
  return (
    <div className="w-full divide-y divide-border text-xs font-mono">
      {entries.map((entry) => (
        <div
          key={entry.name}
          onClick={() => !entry.dir && onSelectEntry(entry.name)}
          className={`flex items-center justify-between px-4 py-2 hover:bg-surface-2 transition-colors cursor-pointer ${
            selectedEntry === entry.name ? 'bg-surface-2 font-semibold' : ''
          }`}
        >
          <div className="flex items-center gap-2.5 truncate pr-4">
            {entry.dir ? (
              <Folder size={14} className="text-accent shrink-0" />
            ) : (
              <File size={14} className="text-text-tertiary shrink-0" />
            )}
            <span className="truncate text-text-primary">{entry.name}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-text-tertiary">
            {!entry.dir && (
              <>
                <span className="tabular-nums text-[11px]">{formatBytes(entry.uncompressedSize)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadEntry(entry.name);
                  }}
                  className="p-1 hover:text-text-primary rounded transition-colors"
                  title="Extract File"
                >
                  <Download size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
