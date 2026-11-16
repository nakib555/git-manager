import React, { useState, useMemo } from 'react';
import { Check, Search, X } from 'lucide-react';
import { BulkResolutionType, DiffFileItem, getDefaultResolution } from '../../mobile/utils/zipSyncEngine';
import { SyncConflictHeader } from './conflict/SyncConflictHeader';
import { SyncConflictTabs } from './conflict/SyncConflictTabs';
import { SyncConflictItem, ConflictResolution } from './conflict/SyncConflictItem';
import { SyncConflictMobileSheet } from './conflict/SyncConflictMobileSheet';

export type { ConflictResolution } from './conflict/SyncConflictItem';

interface SyncConflictResolverProps {
  files: DiffFileItem[];
  resolutions: Map<string, ConflictResolution>;
  selectedFilePath: string | null;
  onSelectFile: (path: string) => void;
  onSetResolution: (path: string, resolution: ConflictResolution) => void;
  onBulkResolve: (type: BulkResolutionType) => void;
  onViewDiffMobile?: (file: DiffFileItem) => void;
}

export const SyncConflictResolver: React.FC<SyncConflictResolverProps> = ({
  files,
  resolutions,
  selectedFilePath,
  onSelectFile,
  onSetResolution,
  onBulkResolve,
  onViewDiffMobile,
}) => {
  const [filter, setFilter] = useState<'all' | 'conflicts' | 'missing' | 'added'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [activeSheetFile, setActiveSheetFile] = useState<DiffFileItem | null>(null);

  const modifiedConflicts = useMemo(() => files.filter(f => f.status === 'modified'), [files]);
  const missingFiles = useMemo(() => files.filter(f => f.status === 'removed'), [files]);
  const addedFiles = useMemo(() => files.filter(f => f.status === 'added'), [files]);

  const filteredFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return files.filter(f => {
      if (filter === 'conflicts' && f.status !== 'modified') return false;
      if (filter === 'missing' && f.status !== 'removed') return false;
      if (filter === 'added' && f.status !== 'added') return false;
      if (filter === 'all' && f.status === 'unchanged') return false;
      if (query && !f.path.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [files, filter, searchQuery]);

  const openResolutionSheet = (file: DiffFileItem) => {
    setActiveSheetFile(file);
    setIsMobileSheetOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-surface-1 overflow-hidden">
      <SyncConflictHeader
        modifiedCount={modifiedConflicts.length}
        addedCount={addedFiles.length}
        missingCount={missingFiles.length}
        onBulkResolve={onBulkResolve}
      />

      <SyncConflictTabs
        filter={filter}
        onFilterChange={setFilter}
        totalCount={files.filter(f => f.status !== 'unchanged').length}
        conflictsCount={modifiedConflicts.length}
        missingCount={missingFiles.length}
        addedCount={addedFiles.length}
      />

      {/* Search bar */}
      <div className="px-3 py-2 border-b border-border bg-surface-1 shrink-0">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter file paths..."
            aria-label="Filter changed files"
            className="w-full h-8 pl-8 pr-7 rounded-lg bg-surface-2/60 border border-border text-xs font-mono text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear file filter"
              className="absolute right-2 text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border/60 no-scrollbar">
        {filteredFiles.length === 0 ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6">
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-tertiary mb-2.5">
              <Check size={18} />
            </div>
            <span className="text-xs font-semibold text-text-primary">
              {searchQuery
                ? 'No matching changed files'
                : filter === 'all'
                  ? 'Repository matches ZIP contents'
                  : `No ${filter} files`}
            </span>
            <p className="text-[11px] text-text-secondary mt-1 max-w-[220px]">
              {searchQuery
                ? 'Try clearing your search query or switching tabs.'
                : 'Try adjusting the Root Folder Alignment in Step 1 if you expected differences.'}
            </p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <SyncConflictItem
              key={file.path}
              file={file}
              isSelected={selectedFilePath === file.path}
              currentRes={resolutions.get(file.path) ?? getDefaultResolution(file)}
              onSelectFile={onSelectFile}
              onSetResolution={onSetResolution}
              onOpenSheet={openResolutionSheet}
              onViewDiffMobile={onViewDiffMobile}
            />
          ))
        )}
      </div>

      <SyncConflictMobileSheet
        isOpen={isMobileSheetOpen}
        file={activeSheetFile}
        onClose={() => setIsMobileSheetOpen(false)}
        onSetResolution={onSetResolution}
        onViewDiffMobile={onViewDiffMobile}
      />
    </div>
  );
};
