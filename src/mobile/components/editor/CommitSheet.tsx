import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GitCommit, GitBranch, X, User, Check, AlertCircle, Loader2 } from 'lucide-react';

interface CommitSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (params: { message: string; description?: string }) => Promise<void>;
  filePath: string;
  targetBranch: string;
  authorName: string;
  authorAvatar?: string;
  stats: { additions: number; deletions: number };
  isSubmitting: boolean;
}

export const CommitSheet: React.FC<CommitSheetProps> = ({
  isOpen,
  onClose,
  onCommit,
  filePath,
  targetBranch,
  authorName,
  authorAvatar,
  stats,
  isSubmitting,
}) => {
  const [isStaged, setIsStaged] = useState<boolean>(true);
  const [commitSummary, setCommitSummary] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const summaryTrimmed = commitSummary.trim();
  const isOverLength = summaryTrimmed.length > 72;
  const isFormValid = summaryTrimmed.length > 0 && isStaged && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStaged) {
      setErrorMsg('Please stage the file before committing.');
      return;
    }
    if (!summaryTrimmed) {
      setErrorMsg('Commit summary is required according to GitHub rules.');
      return;
    }
    setErrorMsg(null);
    await onCommit({
      message: summaryTrimmed,
      description: commitDescription.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="commit-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full max-w-lg bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
      >
        {/* Drag handle pill */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Header (48px height) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 min-h-[48px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-accent">
              <GitCommit size={16} />
            </div>
            <div>
              <h2 id="commit-sheet-title" className="text-sm font-bold text-text-primary leading-tight">
                Commit changes
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary font-mono">
                <GitBranch size={11} className="text-accent" />
                <span className="text-text-secondary font-semibold">{targetBranch}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[180px]">{filePath}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition cursor-pointer"
            aria-label="Close commit sheet"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* File Staging Control & Stats (8-point grid rhythm) */}
          <div className="p-3 bg-surface-2/60 border border-border rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary">Staged changes (1 file)</span>
              <button
                type="button"
                onClick={() => setIsStaged(!isStaged)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                  isStaged
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-surface-3 border-border text-text-tertiary'
                }`}
              >
                {isStaged ? '✓ Staged' : '+ Stage file'}
              </button>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1.5 bg-surface-1/70 border border-border/70 rounded-xl text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <input
                  type="checkbox"
                  id="stage-checkbox"
                  checked={isStaged}
                  onChange={(e) => setIsStaged(e.target.checked)}
                  className="rounded text-accent accent-accent cursor-pointer w-4 h-4"
                />
                <label htmlFor="stage-checkbox" className="truncate text-text-secondary cursor-pointer">
                  {filePath}
                </label>
              </div>
              <div className="flex items-center gap-1.5 font-bold tabular-nums shrink-0 pl-2">
                <span className="text-emerald-500">+{stats.additions}</span>
                <span className="text-rose-500">-{stats.deletions}</span>
              </div>
            </div>

            {!isStaged && (
              <p className="text-[11px] text-amber-500 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>File must be staged before committing.</span>
              </p>
            )}
          </div>

          {/* Author Attribution */}
          <div className="flex items-center justify-between px-3 py-2 bg-surface-2/40 border border-border/80 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-6 h-6 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-text-secondary">
                  <User size={12} />
                </div>
              )}
              <span className="text-text-secondary font-medium truncate max-w-[180px]">
                {authorName}
              </span>
            </div>
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              Author
            </span>
          </div>

          {/* Commit Summary (Required) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="commit-summary" className="font-semibold text-text-primary">
                Commit message <span className="text-rose-500">*</span>
              </label>
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  isOverLength ? 'text-amber-500 font-semibold' : 'text-text-tertiary'
                }`}
              >
                {summaryTrimmed.length}/72
              </span>
            </div>
            <input
              id="commit-summary"
              type="text"
              required
              autoFocus
              value={commitSummary}
              onChange={(e) => {
                setCommitSummary(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={`Update ${filePath.split('/').pop() || 'file'}`}
              className="w-full h-12 px-3.5 bg-surface-2 border border-border rounded-xl text-xs font-sans text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
            />
            {isOverLength && (
              <p className="text-[11px] text-amber-500 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>GitHub recommends keeping commit summaries under 72 characters.</span>
              </p>
            )}
            {errorMsg && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Extended Description (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="commit-description" className="font-semibold text-text-secondary">
                Extended description <span className="text-text-tertiary font-normal">(optional)</span>
              </label>
            </div>
            <textarea
              id="commit-description"
              rows={3}
              value={commitDescription}
              onChange={(e) => setCommitDescription(e.target.value)}
              placeholder="Add optional extended description explaining what changed and why..."
              className="w-full p-3 bg-surface-2 border border-border rounded-xl text-xs font-sans text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition resize-none leading-relaxed"
            />
          </div>

          {/* Primary Action Button (min-h-[48px] for 8pt grid touch target) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full h-12 bg-accent hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Committing changes...</span>
                </>
              ) : !isStaged ? (
                <>
                  <AlertCircle size={16} />
                  <span>Stage file to commit</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Commit changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
