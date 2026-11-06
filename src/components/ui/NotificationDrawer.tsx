import React from 'react';
import { useAppContext } from '../../AppContext';
import { Folder, X, Bell } from 'lucide-react';

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
