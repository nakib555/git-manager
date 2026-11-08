import React from 'react';
import { X, Folder, GitBranch, GitPullRequest, GitCommit, Key, HardDrive } from 'lucide-react';

interface ModalHeaderProps {
  activeModal: 'repo' | 'branch' | 'pr' | 'commit' | 'clone' | 'oauth_setup' | null;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ activeModal, onClose }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-start gap-3 min-w-0 pr-2">
        {activeModal === 'repo' && (
          <>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Folder size={18} />
            </div>
            <div>
              <h2 className="font-bold text-text-main text-base leading-tight">Create Repository</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Initialize a new Git repository with project metadata</p>
            </div>
          </>
        )}
        {activeModal === 'branch' && (
          <>
            <div className="w-9 h-9 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0 mt-0.5">
              <GitBranch size={18} />
            </div>
            <div>
              <h2 className="font-bold text-text-main text-base leading-tight">Create Branch</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Start an isolated branch for safe feature development</p>
            </div>
          </>
        )}
        {activeModal === 'pr' && (
          <>
            <div className="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0 mt-0.5">
              <GitPullRequest size={18} />
            </div>
            <div>
              <h2 className="font-bold text-text-main text-base leading-tight">New Pull Request</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Compare and propose branch changes for code review</p>
            </div>
          </>
        )}
        {activeModal === 'commit' && (
          <>
            <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0 mt-0.5">
              <GitCommit size={18} />
            </div>
            <div>
              <h2 className="font-bold text-text-main text-base leading-tight">Commit Changes</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Record working directory modifications to branch history</p>
            </div>
          </>
        )}
        {activeModal === 'oauth_setup' && (
          <>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
              <Key size={18} />
            </div>
            <div>
              <h2 className="font-bold text-text-main text-base leading-tight">Connect GitHub</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Link your account to sync repositories and push commits</p>
            </div>
          </>
        )}
        {activeModal === 'clone' && (
          <>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0 mt-0.5">
              <HardDrive size={18} />
            </div>
            <div>
              <h2 className="font-bold text-text-main text-base leading-tight">Clone Repository</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Download a remote Git repository to your local studio</p>
            </div>
          </>
        )}
      </div>
      <button 
        onClick={onClose}
        className="text-text-muted hover:text-text-main w-9 h-9 rounded-xl flex items-center justify-center bg-hover transition-colors cursor-pointer btn-tactile"
        aria-label="Close modal"
      >
        <X size={17} />
      </button>
    </div>
  );
};
