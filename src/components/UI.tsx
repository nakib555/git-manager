import React from 'react';
import { useAppContext } from '../AppContext';
import { Folder, GitBranch, GitPullRequest, X, CheckCircle2, AlertCircle, Info, Bell, HardDrive, LogOut } from 'lucide-react';
import { useCountUp } from '../hooks/useAnime';

export const ActionSheet: React.FC = () => {
  const { isActionSheetOpen, closeModals, openModal, navigate, closeActionSheet, githubToken, disconnectGitHub } = useAppContext();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-200 ${isActionSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeModals}
      />
      <div className={`fixed left-0 w-full bg-surface-1 rounded-t-xl z-[101] px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] transition-all duration-200 ease-out border-t border-border shadow-lg ${isActionSheetOpen ? 'bottom-0' : '-bottom-full'}`}>
        {/* Tactile Drag Handle */}
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

export const NotificationDrawer: React.FC = () => {
  const { isDrawerOpen, closeModals, githubUser, githubToken, connectGitHub, disconnectGitHub } = useAppContext();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-200 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeModals}
      />
      <div className={`fixed top-0 w-[85%] max-w-[340px] h-full bg-surface-1 z-[102] p-6 pt-[max(1.5rem,env(safe-area-inset-top))] transition-all duration-200 border-l border-border overflow-y-auto ${isDrawerOpen ? 'right-0' : '-right-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm font-semibold text-text-primary">Account & Alerts</div>
          <button onClick={closeModals} className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className="bg-surface-2 border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            {githubUser?.avatar_url ? (
              <img src={githubUser.avatar_url} alt="Profile" className="w-10 h-10 rounded-full border border-border object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-md bg-surface-3 border border-border flex items-center justify-center text-text-secondary">
                <Folder size={18} />
              </div>
            )}
            <div className="overflow-hidden">
              <span className="block font-semibold text-xs text-text-primary truncate">
                {githubUser ? (githubUser.name || githubUser.login) : 'Guest Developer'}
              </span>
              <span className="block text-[11px] text-text-secondary truncate mt-0.5 font-mono">
                {githubUser ? `@${githubUser.login}` : 'Offline Mode'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            {githubToken ? (
              <button 
                onClick={disconnectGitHub}
                className="w-full bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger h-8 rounded-md text-xs font-medium transition-colors cursor-pointer text-center"
              >
                Disconnect GitHub
              </button>
            ) : (
              <button 
                onClick={connectGitHub}
                className="w-full bg-accent hover:opacity-90 text-white h-8 rounded-md text-xs font-medium transition-colors cursor-pointer text-center border border-accent/20"
              >
                Connect GitHub Account
              </button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-10 h-10 rounded-md bg-surface-2 flex items-center justify-center text-text-tertiary mb-3 border border-border">
            <Bell size={18} />
          </div>
          <p className="text-xs font-semibold text-text-primary mb-1">No unread notifications</p>
          <p className="text-[11px] text-text-secondary max-w-[200px] leading-relaxed">Repository mentions, pull request reviews, and workflow status alerts will appear here.</p>
        </div>
      </div>
    </>
  );
};

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useAppContext();

  const getVariantStyles = () => {
    switch (toastType) {
      case 'error':
        return 'border-danger/40 text-text-primary bg-surface-1 shadow-sm';
      case 'success':
        return 'border-success/40 text-text-primary bg-surface-1 shadow-sm';
      case 'warning':
        return 'border-warning/40 text-text-primary bg-surface-1 shadow-sm';
      case 'info':
      default:
        return 'border-border text-text-primary bg-surface-1 shadow-sm';
    }
  };

  const getIcon = () => {
    switch (toastType) {
      case 'error':
        return <AlertCircle size={14} className="text-danger shrink-0" />;
      case 'success':
        return <CheckCircle2 size={14} className="text-success shrink-0" />;
      case 'warning':
        return <AlertCircle size={14} className="text-warning shrink-0" />;
      case 'info':
      default:
        return <Info size={14} className="text-accent shrink-0" />;
    }
  };

  return (
    <div 
      className={`fixed top-16 left-1/2 -translate-x-1/2 max-w-[90vw] sm:max-w-md border px-3.5 py-2 min-h-[36px] rounded-md text-xs font-medium transition-all duration-200 z-[300] flex items-center gap-2.5 pointer-events-none ${getVariantStyles()} ${
        toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95'
      }`}
    >
      {getIcon()}
      <span className="truncate">{toastMessage}</span>
    </div>
  );
};

export const AnimatedNumber: React.FC<{ value: number; className?: string; formatter?: (v: number) => string }> = ({ value, className, formatter }) => {
  const ref = useCountUp(value, 750, formatter);
  return <span ref={ref as any} className={className}>{formatter ? formatter(value) : value}</span>;
};
