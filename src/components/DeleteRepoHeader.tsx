import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteRepoHeaderProps {
  onClose: () => void;
  isDeleting: boolean;
}

export const DeleteRepoHeader: React.FC<DeleteRepoHeaderProps> = ({ onClose, isDeleting }) => (
  <div className="p-5 border-b border-border bg-danger/10 flex items-start gap-3.5">
    <div className="w-10 h-10 rounded-xl bg-danger/15 text-danger border border-danger/30 flex items-center justify-center shrink-0">
      <AlertTriangle size={20} />
    </div>
    <div className="min-w-0 flex-1">
      <h2 id="delete-repo-title" className="text-base font-bold text-text-main flex items-center gap-2">
        <span>Delete Repository</span>
      </h2>
      <p className="text-xs text-text-muted mt-0.5">
        Permanently remove this repository and all associated Git history
      </p>
    </div>
    <button
      type="button"
      onClick={onClose}
      disabled={isDeleting}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover transition cursor-pointer shrink-0 disabled:opacity-40"
      aria-label="Close dialog"
    >
      <X size={16} />
    </button>
  </div>
);
