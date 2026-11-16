import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileCode, Check, RotateCcw, Trash2 } from 'lucide-react';
import { DiffFileItem } from '../../../mobile/utils/zipSyncEngine';
import { ConflictResolution } from './SyncConflictItem';

interface SyncConflictMobileSheetProps {
  isOpen: boolean;
  file: DiffFileItem | null;
  onClose: () => void;
  onSetResolution: (path: string, resolution: ConflictResolution) => void;
  onViewDiffMobile?: (file: DiffFileItem) => void;
}

export const SyncConflictMobileSheet: React.FC<SyncConflictMobileSheetProps> = ({
  isOpen,
  file,
  onClose,
  onSetResolution,
  onViewDiffMobile,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && file && (
        <div className="fixed inset-0 z-[230] flex flex-col justify-end select-none md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75"
            aria-hidden="true"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340, mass: 0.8 }}
            role="dialog"
            aria-modal="true"
            aria-label="Resolve file conflict"
            className="relative w-full bg-surface-1 border-t border-border rounded-t-3xl pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] px-5 shadow-2xl flex flex-col gap-4 z-10"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto shrink-0" />
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <div className="min-w-0 pr-3">
                <span className="text-xs font-medium text-text-secondary block">File Resolution</span>
                <span className="font-mono text-xs font-bold text-text-primary truncate block mt-0.5" title={file.path}>
                  {file.path}
                </span>
              </div>
              <button
                type="button"
                aria-label="Close resolution sheet"
                onClick={onClose}
                className="touch-target-44 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary bg-surface-2 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {onViewDiffMobile && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewDiffMobile(file);
                  }}
                  className="min-h-[44px] w-full px-4 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-primary font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer btn-tactile"
                >
                  <FileCode size={15} className="text-accent" />
                  <span>Inspect Diff</span>
                </button>
              )}

              {file.status === 'modified' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(file.path, 'take_zip');
                      onClose();
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-accent text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer btn-tactile"
                  >
                    <Check size={16} />
                    <span>Use Uploaded ZIP Version</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(file.path, 'keep_original');
                      onClose();
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-primary font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer btn-tactile"
                  >
                    <span>Keep Existing Repository Version</span>
                  </button>
                </>
              )}

              {file.status === 'removed' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(file.path, 'restore');
                      onClose();
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-surface-2 border border-border text-warning font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer btn-tactile"
                  >
                    <RotateCcw size={16} />
                    <span>Retain in Repository</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(file.path, 'delete');
                      onClose();
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-danger/15 border border-danger/35 text-danger font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer btn-tactile"
                  >
                    <Trash2 size={16} />
                    <span>Delete from Repository</span>
                  </button>
                </>
              )}

              {file.status === 'added' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(file.path, 'take_zip');
                      onClose();
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-success text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer btn-tactile"
                  >
                    <Check size={16} />
                    <span>Include New File in Sync</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(file.path, 'keep_original');
                      onClose();
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-surface-2 border border-border text-text-secondary font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer btn-tactile"
                  >
                    <span>Skip This File</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
