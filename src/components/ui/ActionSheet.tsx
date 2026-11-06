import React from 'react';
import { useAppContext } from '../../AppContext';
import { Folder, GitBranch, GitPullRequest, HardDrive, LogOut } from 'lucide-react';

export const ActionSheet: React.FC = () => {
  const { isActionSheetOpen, closeModals, openModal, navigate, closeActionSheet, githubToken, disconnectGitHub } = useAppContext();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-200 ${isActionSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeModals}
      />
      <div className={`fixed left-0 w-full bg-surface-1 rounded-t-xl z-[101] px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] transition-all duration-200 ease-out border-t border-border shadow-lg ${isActionSheetOpen ? 'bottom-0' : '-bottom-full'}`}>
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4"></div>
        <div className="text-sm font-semibold text-text-primary mb-2 px-1">Quick Actions</div>
        
        <div className="space-y-1">
          <div 
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg hover:bg-surface-2 border border-transparent hover:border-border cursor-pointer transition-colors"
            onClick={() => { closeActionSheet(); openModal('repo'); }}
          >
            <div className="w-9 h-9 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0 border border-accent/20">
              <Folder size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-text-primary">New Repository</div>
              <div className="text-[11px] text-text-secondary truncate">Initialize a new Git repository</div>
            </div>
          </div>

          <div 
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg hover:bg-surface-2 border border-transparent hover:border-border cursor-pointer transition-colors"
            onClick={() => { closeActionSheet(); navigate('clone'); }}
          >
            <div className="w-9 h-9 rounded-md bg-success/10 text-success flex items-center justify-center shrink-0 border border-success/20">
              <HardDrive size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-text-primary">Clone Repository</div>
              <div className="text-[11px] text-text-secondary truncate">Clone a remote repository to local workspace</div>
            </div>
          </div>

          <div 
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg hover:bg-surface-2 border border-transparent hover:border-border cursor-pointer transition-colors"
            onClick={() => { closeActionSheet(); openModal('branch'); }}
          >
            <div className="w-9 h-9 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0 border border-accent/20">
              <GitBranch size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-text-primary">Create Branch</div>
              <div className="text-[11px] text-text-secondary truncate">Branch off from current HEAD</div>
            </div>
          </div>

          <div 
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg hover:bg-surface-2 border border-transparent hover:border-border cursor-pointer transition-colors"
            onClick={() => { closeActionSheet(); openModal('pr'); }}
          >
            <div className="w-9 h-9 rounded-md bg-warning/10 text-warning flex items-center justify-center shrink-0 border border-warning/20">
              <GitPullRequest size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-text-primary">Create Pull Request</div>
              <div className="text-[11px] text-text-secondary truncate">Propose and compare branch changes</div>
            </div>
          </div>

          {githubToken && (
            <div 
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg hover:bg-danger/10 border border-transparent hover:border-danger/20 cursor-pointer transition-colors mt-2 pt-2 border-t border-border text-danger"
              onClick={() => { closeActionSheet(); disconnectGitHub(); }}
            >
              <div className="w-9 h-9 rounded-md bg-danger/10 text-danger flex items-center justify-center shrink-0 border border-danger/20">
                <LogOut size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-danger">Disconnect GitHub</div>
                <div className="text-[11px] text-danger/80 truncate">Clear stored credentials and session</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
