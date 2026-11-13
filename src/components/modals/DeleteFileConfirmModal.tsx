import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  AlertCircle,
  Trash2,
  Folder,
  FileCode,
  X,
  GitCommit,
  Layers,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
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

type ModalStatus = 'idle' | 'deleting' | 'success' | 'error';

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
  const prefersReducedMotion = useReducedMotion();
  const [customMessage, setCustomMessage] = useState<string>('');
  const [status, setStatus] = useState<ModalStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<boolean>(false);
  const [committedMessage, setCommittedMessage] = useState<string>('');
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  const normalizedTarget = useMemo(
    () => targetPath.replace(/^\/+|\/+$/g, ''),
    [targetPath]
  );

  const branchName = currentBranch || 'main';
  const repoLabel = currentRepo || 'Repository';

  const affectedFiles = useMemo(() => {
    if (!isFolder) {
      const match = (allFiles || []).find(
        (f) => (f.path || f.name || '').replace(/^\/+/, '') === normalizedTarget
      );
      return match ? [match] : [{ name: normalizedTarget, path: normalizedTarget }];
    }
    return (allFiles || []).filter((f) => {
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

  // Reset modal internal state when opened for a new target
  useEffect(() => {
    if (isOpen) {
      setCustomMessage('');
      setStatus('idle');
      setErrorMessage(null);
      setCopiedPath(false);
      setCommittedMessage('');
      setIsCountingDown(false);
      isSubmittingRef.current = false;
    }
  }, [isOpen, targetPath, isFolder]);

  // Save and restore trigger focus strictly on modal open/close
  useEffect(() => {
    if (!isOpen) return;
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    return () => {
      clearTimeout(focusTimer);
      if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === 'function'
      ) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  // Focus Done button when transitioning to success state
  useEffect(() => {
    if (isOpen && status === 'success') {
      const timer = setTimeout(() => {
        doneButtonRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status]);

  // Keyboard Escape and Tab focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (status !== 'deleting') {
          e.preventDefault();
          onClose();
        }
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, status, onClose]);

  const handleCopyPath = useCallback(async () => {
    if (!normalizedTarget) return;
    try {
      await navigator.clipboard?.writeText(normalizedTarget);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 1800);
    } catch (_) {}
  }, [normalizedTarget]);

  const handleExecute = useCallback(async () => {
    if (isSubmittingRef.current || status === 'deleting' || status === 'success') {
      return;
    }

    isSubmittingRef.current = true;
    const messageToCommit = customMessage.trim() || defaultCommitMessage;
    setStatus('deleting');
    setErrorMessage(null);

    try {
      const success = await onConfirmDelete({
        targetPath,
        isFolder,
        commitMessage: messageToCommit,
      });

      if (success) {
        setCommittedMessage(messageToCommit);
        setStatus('success');
      } else {
        setErrorMessage(
          `Unable to delete '${normalizedTarget}' from branch '${branchName}'. Please verify repository permissions and try again.`
        );
        setStatus('error');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || `Failed to delete '${normalizedTarget}'. Please try again.`
      );
      setStatus('error');
    } finally {
      isSubmittingRef.current = false;
    }
  }, [status, customMessage, defaultCommitMessage, onConfirmDelete, targetPath, isFolder, normalizedTarget, branchName]);

  const isDeleting = status === 'deleting';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="delete-file-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
          onClick={() => {
            if (!isDeleting) onClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md"
        >
          <motion.div
            ref={dialogRef}
            key="delete-file-dialog"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 14 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.01 }
                : { type: 'spring', stiffness: 420, damping: 32, mass: 0.9 }
            }
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface-1 border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby={status === 'success' ? 'delete-dialog-success-desc' : 'delete-dialog-warning'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {status === 'success' ? (
                <motion.div
                  key="success-view"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="p-6 sm:p-8 flex flex-col items-center text-center"
                >
                  <motion.div
                    initial={prefersReducedMotion ? { scale: 1 } : { scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.01 }
                        : { type: 'spring', stiffness: 360, damping: 20, delay: 0.04 }
                    }
                    className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-5 shadow-[0_0_28px_-6px_rgba(34,197,94,0.45)]"
                  >
                    <CheckCircle2 size={32} strokeWidth={2.2} />
                  </motion.div>

                  <h3
                    id="delete-dialog-title"
                    className="text-lg font-bold text-text-primary tracking-tight headline-balance"
                  >
                    {isFolder ? 'Folder Deleted Successfully!' : 'File Deleted Successfully!'}
                  </h3>

                  <p
                    id="delete-dialog-success-desc"
                    className="text-xs sm:text-[13px] text-text-secondary mt-2 max-w-sm leading-relaxed"
                  >
                    {isFolder
                      ? 'The directory and its contents have been removed and committed to branch '
                      : 'The file has been removed and committed to branch '}
                    <span className="font-mono font-semibold text-text-primary">{branchName}</span>.
                  </p>

                  <div className="w-full mt-5 rounded-xl bg-background border border-border p-3.5 text-left space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                      <span className="font-semibold tracking-wider uppercase">Committed Removal</span>
                      <span className="font-mono truncate max-w-[180px]">{repoLabel}</span>
                    </div>
                    <div className="font-mono text-xs text-text-primary break-all line-through decoration-rose-500/60 opacity-85">
                      {normalizedTarget}
                    </div>
                    {committedMessage && (
                      <div className="pt-2 border-t border-border/70 flex items-center gap-2 text-[11px] text-text-secondary font-mono truncate">
                        <GitCommit size={12} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{committedMessage}</span>
                      </div>
                    )}
                  </div>

                  <motion.button
                    ref={doneButtonRef}
                    type="button"
                    onClick={onClose}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.975 }}
                    className="mt-6 w-full sm:w-auto min-w-[160px] h-11 px-6 rounded-xl bg-accent hover:opacity-95 text-white text-xs font-semibold cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 transition-all"
                  >
                    Done
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="confirm-view"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.15 }}
                  className="flex flex-col max-h-[92vh]"
                >
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 bg-surface-2/40 shrink-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/12 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0">
                        <Trash2 size={18} strokeWidth={2.1} />
                      </div>
                      <div className="min-w-0">
                        <h3
                          id="delete-dialog-title"
                          className="text-base font-bold text-text-primary tracking-tight headline-balance truncate"
                        >
                          {isFolder ? 'Delete Folder?' : 'Delete File?'}
                        </h3>
                        <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-0.5 truncate">
                          <span className="truncate font-medium text-text-primary/85">{repoLabel}</span>
                          <span aria-hidden="true" className="text-text-tertiary">·</span>
                          <span className="font-mono text-text-secondary shrink-0">{branchName} branch</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={onClose}
                      className="w-10 h-10 rounded-xl border border-border bg-surface-1 text-text-tertiary hover:text-text-primary hover:bg-surface-2 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Close dialog"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4 overflow-y-auto flex-1">
                    {/* Warning Section */}
                    <div
                      id="delete-dialog-warning"
                      className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3"
                    >
                      <motion.div
                        initial={prefersReducedMotion ? false : { scale: 0.92 }}
                        animate={prefersReducedMotion ? undefined : { scale: [1, 1.16, 1] }}
                        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
                        className="text-rose-500 shrink-0 mt-0.5"
                      >
                        <AlertTriangle size={17} strokeWidth={2.2} />
                      </motion.div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {isFolder ? (
                          <>
                            This action will permanently delete this folder (
                            <strong className="text-text-primary font-semibold tabular-nums">
                              {affectedFiles.length} file{affectedFiles.length === 1 ? '' : 's'}
                            </strong>
                            ) from the{' '}
                            <span className="font-mono font-semibold text-text-primary">{branchName}</span>{' '}
                            branch. A dedicated deletion commit will be created.
                          </>
                        ) : (
                          <>
                            This action will permanently delete this file from the{' '}
                            <span className="font-mono font-semibold text-text-primary">{branchName}</span>{' '}
                            branch. A dedicated deletion commit will be created.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Inline Error State */}
                    <AnimatePresence>
                      {status === 'error' && errorMessage && (
                        <motion.div
                          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: prefersReducedMotion ? 0.01 : 0.18 }}
                          role="alert"
                          className="p-3.5 rounded-xl bg-rose-500/12 border border-rose-500/40 flex items-start gap-3"
                        >
                          <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="text-xs font-semibold text-rose-500">Deletion Failed</p>
                            <p className="text-xs text-text-primary/90 leading-relaxed break-words">
                              {errorMessage}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* File Information */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
                          {isFolder ? 'FOLDER TO DELETE' : 'FILE TO DELETE'}
                        </span>
                        {isFolder && (
                          <span className="text-[11px] font-mono text-text-secondary tabular-nums">
                            {affectedFiles.length} {affectedFiles.length === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </div>

                      <div className="rounded-xl bg-background border border-border px-3 py-2.5 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-7 h-7 rounded-lg bg-surface-2 border border-border/80 flex items-center justify-center text-accent shrink-0">
                            {isFolder ? <Folder size={14} /> : <FileCode size={14} />}
                          </span>
                          <span
                            className="font-mono text-xs text-text-primary select-all break-all leading-snug"
                            title={normalizedTarget}
                          >
                            {normalizedTarget}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPath}
                          className="min-h-[34px] px-2.5 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 text-[11px] font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          title="Copy file path"
                          aria-label="Copy file path"
                        >
                          {copiedPath ? (
                            <>
                              <Check size={12} className="text-emerald-500" />
                              <span className="text-emerald-500 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Affected Files Preview for Folders */}
                    {isFolder && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
                          <span className="flex items-center gap-1.5">
                            <Layers size={12} />
                            <span>AFFECTED FILES IN BATCH COMMIT</span>
                          </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto rounded-xl bg-background border border-border p-1.5 space-y-0.5 font-mono text-[11px] text-text-secondary">
                          {affectedFiles.length === 0 ? (
                            <p className="text-text-tertiary p-2 text-center font-sans">Empty directory</p>
                          ) : (
                            affectedFiles.map((file, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-surface-2/60"
                              >
                                <span className="truncate pr-2 text-text-primary">
                                  {(file.path || file.name || '').replace(/^\/+/, '')}
                                </span>
                                {typeof file.size === 'number' && file.size > 0 && (
                                  <span className="text-text-tertiary text-[10px] tabular-nums shrink-0">
                                    {formatBytes(file.size)}
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Commit Message */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="delete-commit-message"
                        className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-text-tertiary uppercase"
                      >
                        <GitCommit size={12} className="text-accent" />
                        <span>COMMIT MESSAGE</span>
                      </label>
                      <input
                        ref={inputRef}
                        id="delete-commit-message"
                        type="text"
                        disabled={isDeleting}
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder={defaultCommitMessage}
                        className="w-full h-11 bg-background border border-border rounded-xl px-3.5 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <p className="text-[11px] text-text-tertiary">
                        Leave empty to use the suggested commit message.
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-border bg-surface-2/35 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 shrink-0">
                    <motion.button
                      type="button"
                      disabled={isDeleting}
                      onClick={onClose}
                      whileHover={isDeleting || prefersReducedMotion ? undefined : { scale: 1.01 }}
                      whileTap={isDeleting || prefersReducedMotion ? undefined : { scale: 0.975 }}
                      className="h-11 px-5 rounded-xl border border-border bg-surface-1 text-text-secondary hover:text-text-primary hover:bg-surface-2 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Cancel
                    </motion.button>
                    <div className="w-full sm:w-56 shrink-0">
                      <ConfirmationCountdownButton
                        label={
                          status === 'error'
                            ? isFolder
                              ? 'Retry Delete Folder'
                              : 'Retry Delete'
                            : isFolder
                            ? 'Delete Folder'
                            : 'Delete File'
                        }
                        confirmingLabel={isCountingDown ? 'Confirming... (Tap to Cancel)' : 'Hold...'}
                        executingLabel="Deleting..."
                        countdownSeconds={3}
                        onConfirm={handleExecute}
                        onCountdownChange={setIsCountingDown}
                        disabled={isDeleting}
                        variant="danger"
                        icon={<Trash2 size={14} />}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

