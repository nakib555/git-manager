import React, { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { CommitBranchTagInputs } from './CommitBranchTagInputs';
import { CommitRestoreSheet } from '../CommitRestoreSheet';
import { CommitsDeleteHeadDialog } from '../../screens/repo/commits/CommitsDeleteHeadDialog';

interface CommitDetailActionsProps {
  commit: any;
  onClose: () => void;
}

export const CommitDetailActions: React.FC<CommitDetailActionsProps> = ({ commit, onClose }) => {
  const { createBranchAtCommit, createTagAtCommit, deleteCommit, showToast, activeCommits, currentBranch } = useAppContext();
  const [branchName, setBranchName] = useState('');
  const [tagName, setTagName] = useState('v1.0.0');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRestoreSheet, setShowRestoreSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const sha = commit.fullHash || commit.hash;
  const isHead = activeCommits.length > 0 && (activeCommits[0].hash === sha || activeCommits[0].fullHash === sha);
  const parentCommit = isHead ? activeCommits[1] : undefined;

  const handleCreateBranch = async () => {
    if (!branchName.trim()) return;
    try {
      await createBranchAtCommit(branchName.trim(), sha);
      showToast(`Branch ${branchName.trim()} created!`);
      setBranchName('');
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Branch creation failed', 'error');
    }
  };

  const handleCreateTag = async () => {
    if (!tagName.trim()) return;
    try {
      await createTagAtCommit(tagName.trim(), sha);
      showToast(`Tag ${tagName.trim()} created!`);
      setTagName('');
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Tag creation failed', 'error');
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
    <div className="space-y-4 pt-3 border-t border-border">
      <CommitBranchTagInputs
        branchName={branchName}
        setBranchName={setBranchName}
        tagName={tagName}
        setTagName={setTagName}
        onBranchCreate={handleCreateBranch}
        onTagCreate={handleCreateTag}
      />

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setShowRestoreSheet(true)}
          className="flex-1 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-xs font-bold text-text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-2xs"
        >
          <RotateCcw size={13} className="text-accent" />
          <span>Restore / Revert</span>
        </button>

        {isHead ? (
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="flex-1 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-2xs"
          >
            <Trash2 size={13} />
            <span>Delete HEAD</span>
          </button>
        ) : (
          <div className="flex-1 text-center text-[10px] text-text-tertiary font-mono py-1 px-2 border border-border/60 rounded-xl bg-surface-2/30">
            Use Revert for historical commits
          </div>
        )}
      </div>

      <CommitRestoreSheet
        isOpen={showRestoreSheet}
        commit={commit}
        onClose={() => setShowRestoreSheet(false)}
        onSuccess={onClose}
      />

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
