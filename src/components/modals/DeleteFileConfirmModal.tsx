import React, { useState, useMemo } from 'react';
import { AlertTriangle, Trash2, Folder, FileCode, X, GitCommit, GitBranch, Layers } from 'lucide-react';
import { ConfirmationCountdownButton } from '../ui/ConfirmationCountdownButton';
import { formatBytes } from '../../mobile/utils/formatters';

interface DeleteFileConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPath: string;
  isFolder: boolean;
  currentRepo: string;
  currentBranch: string;
  allFiles: any[];
  onConfirmDelete: (params: { targetPath: string; isFolder: boolean; commitMessage: string }) => Promise<boolean>;
}

export const DeleteFileConfirmModal: React.FC<DeleteFileConfirmModalProps> = ({
  isOpen,
  onClose,
  targetPath,
  isFolder,
  currentRepo,
  currentBranch,
  allFiles,
  onConfirmDelete,
}) => {
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const normalizedTarget = targetPath.replace(/^\/+|\/+$/g, '');

  const affectedFiles = useMemo(() => {
    if (!isFolder) {
      const match = allFiles.find(f => (f.path || f.name || '').replace(/^\/+/, '') === normalizedTarget);
      return match ? [match] : [{ name: normalizedTarget, path: normalizedTarget }];
    }
    return (allFiles || []).filter(f => {
      const p = (f.path || f.name || '').replace(/^\/+/, '');
      return p.startsWith(`${normalizedTarget}/`) || p === normalizedTarget;
    });
  }, [allFiles, isFolder, normalizedTarget]);

  const defaultCommitMessage = useMemo(() => {
    if (isFolder) {
      return `chore: remove '${normalizedTarget}' directory (${affectedFiles.length} files)`;
    }
    return `chore: delete '${normalizedTarget}'`;
  }, [isFolder, normalizedTarget, affectedFiles.length]);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setIsDeleting(true);
    try {
      const success = await onConfirmDelete({
        targetPath,
        isFolder,
        commitMessage: customMessage.trim() || defaultCommitMessage,
      });
      if (success) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-lg bg-surface-1 border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-[scaleIn_0.15s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-2/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
              <Trash2 size={16} />
            </div>
            <div>
              <h3 id="delete-dialog-title" className="text-sm font-bold text-text-primary">
                {isFolder ? 'Delete Directory' : 'Delete File'}
              </h3>
              <p className="text-[11px] text-text-tertiary">
                Repository mutation on branch <span className="font-mono text-text-secondary">{currentBranch || 'main'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border bg-surface-1 text-text-tertiary hover:text-text-primary hover:bg-surface-2 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Warning Banner */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
            <AlertTriangle size={17} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs text-text-secondary leading-relaxed">
              <span className="font-semibold text-rose-400">Irreversible Git Action: </span>
              {isFolder ? (
                <>
                  Deleting this folder will permanently prune <strong className="text-text-primary">{affectedFiles.length} file{affectedFiles.length === 1 ? '' : 's'}</strong> in a single atomic batch commit.
                </>
              ) : (
                <>
                  This file will be permanently removed from branch <strong className="text-text-primary">{currentBranch || 'main'}</strong> with a dedicated deletion commit.
                </>
              )}
            </div>
          </div>

          {/* Structured Monospace Path Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-[11px] font-medium text-text-tertiary">
              <span className="flex items-center gap-1.5">
                {isFolder ? <Folder size={12} className="text-accent" /> : <FileCode size={12} className="text-accent" />}
                Target {isFolder ? 'Folder' : 'File'}
              </span>
              <span className="font-mono">{currentRepo}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-background border border-border/80 font-mono text-xs text-rose-400 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">/{normalizedTarget}</span>
              {isFolder && (
                <span className="text-[10px] bg-surface-2 text-text-secondary px-2 py-0.5 rounded font-sans shrink-0">
                  {affectedFiles.length} items
                </span>
              )}
            </div>
          </div>

          {/* Affected Files List Preview for Folders */}
          {isFolder && (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[11px] font-medium text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <Layers size={12} />
                  Affected Files in Batch Commit
                </span>
                <span className="text-[10px] font-mono text-text-tertiary tabular-nums">
                  {affectedFiles.length} file{affectedFiles.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto rounded-xl bg-background border border-border/70 p-2 space-y-1 font-mono text-[11px] text-text-secondary">
                {affectedFiles.length === 0 ? (
                  <p className="text-text-tertiary p-2 text-center">Empty directory</p>
                ) : (
                  affectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-2 rounded hover:bg-surface-1">
                      <span className="truncate pr-2 text-text-primary">
                        {(file.path || file.name || '').replace(/^\/+/, '')}
                      </span>
                      {typeof file.size === 'number' && file.size > 0 && (
                        <span className="text-text-tertiary text-[10px] shrink-0">
                          {formatBytes(file.size)}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Commit Message Form */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary mb-1.5">
              <GitCommit size={12} className="text-accent" />
              Commit Message
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={defaultCommitMessage}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors font-mono"
            />
            <p className="text-[10px] text-text-tertiary mt-1">
              Leave blank to use the default formatted commit message.
            </p>
          </div>
        </div>

        {/* Footer Actions with Confirmation Countdown */}
        <div className="p-4 border-t border-border bg-surface-2/30 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="h-11 px-4 rounded-xl border border-border bg-surface-1 text-text-secondary hover:text-text-primary hover:bg-surface-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <div className="w-56 shrink-0">
            <ConfirmationCountdownButton
              label={isFolder ? 'Delete Folder & Commit' : 'Delete File & Commit'}
              confirmingLabel="Confirming Deletion..."
              countdownSeconds={3}
              onConfirm={handleExecute}
              disabled={isDeleting}
              variant="danger"
              icon={<Trash2 size={13} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
