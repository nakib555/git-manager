import React, { useState, useMemo } from 'react';
import { RotateCcw, GitBranch, Copy, Check, Tag, Trash2, X } from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { CommitRestoreSheet } from '../CommitRestoreSheet';
import { CommitsDeleteHeadDialog } from '../../screens/repo/commits/CommitsDeleteHeadDialog';

interface CommitDetailActionsProps {
  commit: any;
  onClose: () => void;
}

export const CommitDetailActions: React.FC<CommitDetailActionsProps> = ({ commit, onClose }) => {
  const {
    createBranchAtCommit,
    createTagAtCommit,
    deleteCommit,
    showToast,
    activeCommits,
    currentBranch,
  } = useAppContext();

  const [copiedSha, setCopiedSha] = useState(false);
  const [showRestoreSheet, setShowRestoreSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Branch dialog state
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);

  // Tag dialog state
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tagName, setTagName] = useState('v1.0.0');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const sha = commit?.fullHash || commit?.hash || '';
  const shortSha = commit?.hash ? commit.hash.slice(0, 7) : sha ? sha.slice(0, 7) : '';

  const actualHeadCommit = useMemo(() => {
    if (!activeCommits || activeCommits.length === 0) return null;
    return [...activeCommits].sort((a, b) => {
      const tA = new Date(a.timestamp || a.date || 0).getTime();
      const tB = new Date(b.timestamp || b.date || 0).getTime();
      return tB - tA;
    })[0];
  }, [activeCommits]);

  const isHead = !!actualHeadCommit && (actualHeadCommit.hash === sha || actualHeadCommit.fullHash === sha);

  const parentCommit = useMemo(() => {
    if (!isHead || !commit) return undefined;
    if (commit.parents && commit.parents.length > 0) {
      const pRaw = commit.parents[0];
      const pSha = typeof pRaw === 'string' ? pRaw : (pRaw?.sha || '');
      const match = activeCommits.find(c => c.hash === pSha || c.fullHash === pSha);
      if (match) return match;
    }
    const cTime = new Date(commit.timestamp || commit.date || 0).getTime();
    const earlier = activeCommits
      .filter(c => c.hash !== commit.hash && c.fullHash !== commit.fullHash)
      .filter(c => new Date(c.timestamp || c.date || 0).getTime() <= cTime)
      .sort((a, b) => new Date(b.timestamp || b.date || 0).getTime() - new Date(a.timestamp || a.date || 0).getTime());
    return earlier[0];
  }, [isHead, commit, activeCommits]);

  const handleCopySha = () => {
    if (!sha) return;
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    showToast(`Copied SHA: ${shortSha}`);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = branchName.trim();
    if (!cleanName) return;
    setIsCreatingBranch(true);
    try {
      await createBranchAtCommit(cleanName, sha);
      showToast(`Branch "${cleanName}" created at ${shortSha}!`);
      setBranchName('');
      setShowBranchDialog(false);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Branch creation failed', 'error');
    } finally {
      setIsCreatingBranch(false);
    }
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = tagName.trim();
    if (!cleanName) return;
    setIsCreatingTag(true);
    try {
      await createTagAtCommit(cleanName, sha);
      showToast(`Tag "${cleanName}" created at ${shortSha}!`);
      setTagName('');
      setShowTagDialog(false);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Tag creation failed', 'error');
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteCommit(sha);
      showToast('HEAD commit deleted from history!');
      setShowDeleteDialog(false);
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Delete failed', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pt-2 space-y-3">
      {/* 2x2 ACTION BUTTON GRID - Matching Screenshot */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Top-Left: Restore Button */}
        <button
          type="button"
          onClick={() => setShowRestoreSheet(true)}
          className="h-12 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border/80 text-text-primary text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs"
        >
          <RotateCcw size={14} className="text-blue-400" />
          <span>Restore</span>
        </button>

        {/* Top-Right: High-Contrast White Branch Button */}
        <button
          type="button"
          onClick={() => {
            setBranchName(`branch-${shortSha}`);
            setShowBranchDialog(true);
          }}
          className="h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md"
        >
          <GitBranch size={14} className="text-slate-950 stroke-[2.2]" />
          <span>Branch</span>
        </button>

        {/* Bottom-Left: Copy SHA Button */}
        <button
          type="button"
          onClick={handleCopySha}
          className="h-12 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border/80 text-text-primary text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 font-mono shadow-2xs"
          title="Click to copy full commit SHA"
        >
          {copiedSha ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">{shortSha}</span>
            </>
          ) : (
            <>
              <Copy size={14} className="text-text-secondary" />
              <span>{shortSha}</span>
            </>
          )}
        </button>

        {/* Bottom-Right: Tag Button */}
        <button
          type="button"
          onClick={() => {
            setTagName('v1.0.0');
            setShowTagDialog(true);
          }}
          className="h-12 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border/80 text-text-primary text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs"
        >
          <Tag size={14} className="text-text-secondary" />
          <span>Tag</span>
        </button>
      </div>

      {/* Admin / HEAD Commit Action */}
      {isHead && (
        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          className="w-full h-11 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs mt-1"
        >
          <Trash2 size={14} />
          <span>Delete HEAD Commit</span>
        </button>
      )}

      {/* Branch Creation Prompt Dialog */}
      {showBranchDialog && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-1 border border-border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <GitBranch size={16} className="text-blue-400" />
                <h4 className="text-sm font-bold text-text-primary">Create Branch at {shortSha}</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowBranchDialog(false)}
                className="text-text-tertiary hover:text-text-primary p-1"
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleBranchSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-text-tertiary block mb-1.5 uppercase">
                  Branch Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. feature/my-patch"
                  className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-primary outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBranchDialog(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-text-secondary transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!branchName.trim() || isCreatingBranch}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold text-white transition cursor-pointer"
                >
                  {isCreatingBranch ? 'Creating...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tag Creation Prompt Dialog */}
      {showTagDialog && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-1 border border-border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-amber-400" />
                <h4 className="text-sm font-bold text-text-primary">Create Tag at {shortSha}</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowTagDialog(false)}
                className="text-text-tertiary hover:text-text-primary p-1"
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleTagSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-text-tertiary block mb-1.5 uppercase">
                  Tag Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="e.g. v1.2.0"
                  className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-primary outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTagDialog(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-text-secondary transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!tagName.trim() || isCreatingTag}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-xs font-bold text-white transition cursor-pointer"
                >
                  {isCreatingTag ? 'Creating...' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restore / Revert Sheet */}
      <CommitRestoreSheet
        isOpen={showRestoreSheet}
        commit={commit}
        onClose={() => setShowRestoreSheet(false)}
        onSuccess={onClose}
      />

      {/* Delete HEAD Confirmation Dialog */}
      <CommitsDeleteHeadDialog
        commit={commit}
        parentCommit={parentCommit}
        branchName={currentBranch || 'main'}
        isOpen={showDeleteDialog}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
