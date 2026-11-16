import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { DiffTreeExplorer } from '../../../components/sync/DiffTreeExplorer';
import { MonacoDiffViewer } from '../../../components/sync/MonacoDiffViewer';
import {
  BulkResolutionType,
  ConflictResolution,
  DiffFileItem,
  getDefaultResolution,
} from '../../../mobile/utils/zipSyncEngine';
import { useResponsiveBreakpoints } from '../../../hooks/useIsDesktop';

interface ZipSyncStepReviewProps {
  diffItems: DiffFileItem[];
  selectedFilePath: string | null;
  onSelectFilePath: (path: string) => void;
  resolutions: Map<string, ConflictResolution>;
  onSetResolution: (path: string, res: ConflictResolution) => void;
  onUpdateResolutions: (next: Map<string, ConflictResolution>) => void;
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
  onUpdateResolutions,
  onBulkResolve,
  isComparing,
  compareProgress,
  theme,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isDesktop } = useResponsiveBreakpoints();

  const changedItems = diffItems.filter((f) => f.status !== 'unchanged');
  const activeDiffItem =
    diffItems.find((f) => f.path === selectedFilePath) ||
    changedItems[0] ||
    diffItems[0] ||
    null;

  const activeResolution = activeDiffItem
    ? resolutions.get(activeDiffItem.path) ?? getDefaultResolution(activeDiffItem)
    : 'take_zip';

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [isDrawerOpen]);

  const handleInspectDiff = (file: DiffFileItem) => {
    onSelectFilePath(file.path);
    if (!isDesktop) {
      setIsDrawerOpen(true);
    }
  };

  return (
    <div className="relative flex h-[480px] sm:h-[530px] min-h-0 border border-border rounded-2xl bg-surface-1 overflow-hidden">
      {isDesktop ? (
        <div className="flex w-full h-full min-h-0 divide-x divide-border">
          <div className="w-[390px] xl:w-[430px] flex flex-col shrink-0 min-h-0">
            <DiffTreeExplorer
              files={diffItems}
              selectedFilePath={activeDiffItem?.path || null}
              onSelectFile={onSelectFilePath}
              onInspectDiff={handleInspectDiff}
              resolutions={resolutions}
              onUpdateResolutions={onUpdateResolutions}
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
              isExpanded={isDrawerOpen}
              onToggleExpand={() => setIsDrawerOpen((v) => !v)}
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col min-h-0">
          <DiffTreeExplorer
            files={diffItems}
            selectedFilePath={activeDiffItem?.path || null}
            onSelectFile={onSelectFilePath}
            onInspectDiff={handleInspectDiff}
            resolutions={resolutions}
            onUpdateResolutions={onUpdateResolutions}
            onBulkResolve={onBulkResolve}
          />
        </div>
      )}

      {/* Slide-Over Diff Drawer (mobile, tablet, and desktop expanded mode) */}
      <AnimatePresence>
        {isDrawerOpen && activeDiffItem && (
          <div className="absolute inset-0 z-20 flex justify-end overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setIsDrawerOpen(false)}
              className="hidden sm:block absolute inset-0 bg-black/45 cursor-pointer"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full md:w-[92%] lg:w-[88%] h-full bg-surface-1 border-l border-border shadow-2xl flex flex-col min-h-0"
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
                onBack={() => setIsDrawerOpen(false)}
                backLabel="Tree"
                alwaysShowResolutionBar
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Re-comparing Loading Overlay */}
      <AnimatePresence>
        {isComparing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-30 bg-surface-1/90 flex flex-col items-center justify-center gap-3 p-6 text-center"
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
