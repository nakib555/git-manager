import React from 'react';
import { X, Folder, GitBranch, GitPullRequest, GitCommit, Key, HardDrive } from 'lucide-react';

interface ModalHeaderProps {
  activeModal: 'repo' | 'branch' | 'pr' | 'commit' | 'clone' | 'oauth_setup' | null;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ activeModal, onClose }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2.5 font-semibold text-text-main text-base">
        {activeModal === 'repo' && (
          <>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Folder size={18} />
            </div>
            <span>Create Repository</span>
          </>
        )}
        {activeModal === 'branch' && (
          <>
            <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <GitBranch size={18} />
            </div>
            <span>Create Branch</span>
          </>
        )}
        {activeModal === 'pr' && (
          <>
            <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <GitPullRequest size={18} />
            </div>
            <span>New Pull Request</span>
          </>
        )}
        {activeModal === 'commit' && (
          <>
            <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <GitCommit size={18} />
            </div>
            <span>Commit Changes</span>
          </>
        )}
        {activeModal === 'oauth_setup' && (
          <>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Key size={18} />
            </div>
            <span>Connect GitHub</span>
          </>
        )}
        {activeModal === 'clone' && (
          <>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <HardDrive size={18} />
            </div>
            <span>Clone Repository</span>
          </>
        )}
      </div>
      <button 
        onClick={onClose}
        className="text-text-muted hover:text-text-main w-9 h-9 rounded-xl flex items-center justify-center bg-hover transition-colors cursor-pointer"
        aria-label="Close modal"
      >
        <X size={17} />
      </button>
    </div>
  );
};
