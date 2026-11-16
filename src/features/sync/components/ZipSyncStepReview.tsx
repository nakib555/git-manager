import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { SyncConflictResolver, ConflictResolution } from '../../../components/sync/SyncConflictResolver';
import { MonacoDiffViewer } from '../../../components/sync/MonacoDiffViewer';
import { BulkResolutionType, DiffFileItem, getDefaultResolution } from '../../../mobile/utils/zipSyncEngine';
import { useResponsiveBreakpoints } from '../../../hooks/useIsDesktop';

interface ZipSyncStepReviewProps {
  diffItems: DiffFileItem[];
  selectedFilePath: string | null;
  onSelectFilePath: (path: string) => void;
  resolutions: Map<string, ConflictResolution>;
  onSetResolution: (path: string, res: ConflictResolution) => void;
  onBulkResolve: (type: BulkResolutionType) => void;
  isComparing: boolean;
  compareProgress: { completed: number; total: number } | null;
  theme: 'dark' | 'light' | 'slate' | 'fantasy';
}

export const ZipSyncStepReview: React.FC<ZipSyncStepReviewProps> = ({
  diffItems,
  selectedFilePath,
  onSelectFilePath,
  resolutions,
  onSetResolution,
  onBulkResolve,
  isComparing,
  compareProgress,
  theme,
}) => {
  const [mobilePane, setMobilePane] = useState<'list' | 'diff'>('list');
  const { isMobile } = useResponsiveBreakpoints();

  const changedItems = diffItems.filter((f) => f.status !== 'unchanged');
  const activeDiffItem =
    diffItems.find((f) => f.path === selectedFilePath) ||
    changedItems[0] ||
    diffItems[0] ||
    null;

  const activeResolution = activeDiffItem
    ? resolutions.get(activeDiffItem.path) ?? getDefaultResolution(activeDiffItem)
    : 'take_zip';

  const handleViewDiffMobile = (file: DiffFileItem) => {
    onSelectFilePath(file.path);
    setMobilePane('diff');
  };

  return (
    <div className="relative flex flex-col md:flex-row h-[470px] sm:h-[520px] min-h-0 border border-border rounded-2xl bg-surface-1 overflow-hidden">
      {!isMobile ? (
        <div className="flex w-full h-full min-h-0 divide-x divide-border">
          <div className="w-[340px] lg:w-[380px] flex flex-col shrink-0 min-h-0">
            <SyncConflictResolver
              files={diffItems}
              selectedFilePath={activeDiffItem?.path || null}
              onSelectFile={onSelectFilePath}
              resolutions={resolutions}
              onSetResolution={onSetResolution}
              onBulkResolve={onBulkResolve}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <MonacoDiffViewer
              file={activeDiffItem}
              theme={theme}
              resolution={activeResolution}
              onResolve={
                activeDiffItem
                  ? (res) => onSetResolution(activeDiffItem.path, res)
                  : undefined
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full min-h-0 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {mobilePane === 'list' ? (
              <motion.div
                key="mobile-list"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full flex flex-col min-h-0"
              >
                <SyncConflictResolver
                  files={diffItems}
                  selectedFilePath={activeDiffItem?.path || null}
                  onSelectFile={onSelectFilePath}
                  resolutions={resolutions}
                  onSetResolution={onSetResolution}
                  onBulkResolve={onBulkResolve}
                  onViewDiffMobile={handleViewDiffMobile}
                />
              </motion.div>
            ) : (
              <motion.div
                key="mobile-diff"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full flex flex-col min-h-0"
              >
                <MonacoDiffViewer
                  file={activeDiffItem}
                  theme={theme}
                  resolution={activeResolution}
                  onResolve={
                    activeDiffItem
                      ? (res) => onSetResolution(activeDiffItem.path, res)
                      : undefined
                  }
                  onBack={() => setMobilePane('list')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {isComparing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-20 bg-surface-1/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-6 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <RefreshCw size={18} className="animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-text-primary">Recalculating repository diffs</p>
              {compareProgress && compareProgress.total > 0 && (
                <p className="text-[11px] font-mono text-text-secondary tabular-nums">
                  {compareProgress.completed}/{compareProgress.total} files compared
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
