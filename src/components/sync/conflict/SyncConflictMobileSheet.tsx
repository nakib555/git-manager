import React from 'react';
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
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-60 flex flex-col justify-end bg-black/75 backdrop-blur-xs select-none sm:hidden">
      <div onClick={onClose} className="absolute inset-0" />
      <div className="relative w-full bg-surface-1 border-t border-border rounded-t-3xl pt-3 pb-[calc(env(safe-area-inset-bottom)+20px)] px-5 shadow-2xl flex flex-col gap-4 z-10 animate-fade-up">
        <div className="w-10 h-1.5 bg-surface-3 rounded-full mx-auto shrink-0" />
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="min-w-0 pr-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary block">Resolve Conflict</span>
            <span className="font-mono text-xs font-bold text-text-primary truncate block" title={file.path}>
              {file.path}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary bg-surface-2"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {onViewDiffMobile && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewDiffMobile(file);
              }}
              className="min-h-[44px] w-full px-4 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-sky-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <FileCode size={15} />
              <span>Inspect Side-by-Side Diff</span>
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
                className="min-h-[48px] w-full px-4 rounded-xl bg-accent text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
              >
                <Check size={16} />
                <span>Take Uploaded ZIP Version</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSetResolution(file.path, 'keep_original');
                  onClose();
                }}
                className="min-h-[48px] w-full px-4 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
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
                className="min-h-[48px] w-full px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <RotateCcw size={16} />
                <span>Restore / Retain in Repository</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSetResolution(file.path, 'delete');
                  onClose();
                }}
                className="min-h-[48px] w-full px-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Trash2 size={16} />
                <span>Confirm Delete from Repository in Git</span>
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
                className="min-h-[48px] w-full px-4 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
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
                className="min-h-[48px] w-full px-4 rounded-xl bg-surface-2 border border-border text-text-secondary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Skip This File</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
