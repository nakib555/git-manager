import React from 'react';
import { SyncConflictResolver, ConflictResolution } from '../../../components/sync/SyncConflictResolver';
import { MonacoDiffViewer } from '../../../components/sync/MonacoDiffViewer';
import { DiffFileItem } from '../../../mobile/utils/zipSyncEngine';

interface ZipSyncStepReviewProps {
  diffItems: DiffFileItem[];
  selectedFilePath: string | null;
  onSelectFilePath: (path: string) => void;
  resolutions: Map<string, ConflictResolution>;
  onSetResolution: (path: string, res: ConflictResolution) => void;
  onBulkResolve: (type: 'all_zip' | 'all_original' | 'all_restore' | 'all_delete') => void;
  theme: 'dark' | 'light' | 'slate' | 'fantasy';
}

export const ZipSyncStepReview: React.FC<ZipSyncStepReviewProps> = ({
  diffItems,
  selectedFilePath,
  onSelectFilePath,
  resolutions,
  onSetResolution,
  onBulkResolve,
  theme,
}) => {
  const activeDiffItem = diffItems.find((f) => f.path === selectedFilePath) || diffItems[0] || null;

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[440px] min-h-0 overflow-hidden">
      <div className="w-full md:w-80 flex flex-col shrink-0 min-h-0 bg-card border border-border rounded-xl overflow-hidden">
        <SyncConflictResolver
          files={diffItems}
          selectedFilePath={activeDiffItem?.path || null}
          onSelectFile={onSelectFilePath}
          resolutions={resolutions}
          onSetResolution={onSetResolution}
          onBulkResolve={onBulkResolve}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl overflow-hidden">
        {activeDiffItem ? (
          <MonacoDiffViewer
            file={activeDiffItem}
            theme={theme}
            resolution={resolutions.get(activeDiffItem.path) || 'take_zip'}
            onResolve={(res) => onSetResolution(activeDiffItem.path, res)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-text-muted">
            Select a file on the left to review unified diffs
          </div>
        )}
      </div>
    </div>
  );
};
