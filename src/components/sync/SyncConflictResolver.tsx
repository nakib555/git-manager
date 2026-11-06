import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { DiffFileItem } from '../../mobile/utils/zipSyncEngine';
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
  onBulkResolve: (type: 'all_zip' | 'all_original' | 'all_restore' | 'all_delete') => void;
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
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [activeSheetFile, setActiveSheetFile] = useState<DiffFileItem | null>(null);

  const modifiedConflicts = files.filter(f => f.status === 'modified');
  const missingFiles = files.filter(f => f.status === 'removed');
  const addedFiles = files.filter(f => f.status === 'added');

  const filteredFiles = files.filter(f => {
    if (filter === 'conflicts') return f.status === 'modified';
    if (filter === 'missing') return f.status === 'removed';
    if (filter === 'added') return f.status === 'added';
    return f.status !== 'unchanged';
  });

  const openResolutionSheet = (file: DiffFileItem) => {
    setActiveSheetFile(file);
    setIsMobileSheetOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-surface-1 rounded-2xl border border-border overflow-hidden">
      <SyncConflictHeader
        modifiedCount={modifiedConflicts.length}
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

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 no-scrollbar">
        {filteredFiles.length === 0 ? (
          <div className="h-48 sm:h-64 flex flex-col items-center justify-center text-center p-6 bg-surface-1/50 rounded-2xl border border-dashed border-border/80">
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-tertiary mb-2">
              <Check size={20} />
            </div>
            <span className="text-xs font-semibold text-text-primary">
              {filter === 'all' ? 'No file differences found' : `No ${filter} files`}
            </span>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <SyncConflictItem
              key={file.path}
              file={file}
              isSelected={selectedFilePath === file.path}
              currentRes={resolutions.get(file.path) || (file.status === 'removed' ? 'restore' : 'take_zip')}
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
