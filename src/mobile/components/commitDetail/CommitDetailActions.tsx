import React, { useState } from 'react';
import { RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { CommitBranchTagInputs } from './CommitBranchTagInputs';

interface CommitDetailActionsProps {
  commit: any;
  onClose: () => void;
}

export const CommitDetailActions: React.FC<CommitDetailActionsProps> = ({ commit, onClose }) => {
  const { createBranchAtCommit, createTagAtCommit, restoreFilesToCommit, deleteCommit, showToast } = useAppContext();
  const [branchName, setBranchName] = useState('');
  const [tagName, setTagName] = useState('v1.0.0');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sha = commit.fullHash || commit.hash;

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

  const handleRestore = async () => {
    try {
      await restoreFilesToCommit(sha);
      showToast('Files restored to commit snapshot!');
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Restore failed', 'error');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCommit(sha);
      showToast('Commit deleted from history!');
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

      <div className="flex items-center gap-3">
        <button
          onClick={handleRestore}
          className="flex-1 py-2.5 rounded-xl border border-border bg-card hover:bg-hover text-xs font-bold text-text-main flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Restore Files</span>
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex-1 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 size={13} />
          <span>Delete Commit</span>
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
            <AlertTriangle size={14} />
            <span>Confirm commit deletion?</span>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-text-muted hover:bg-hover"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-500 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
