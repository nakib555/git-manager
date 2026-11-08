import React from 'react';
import { User, Github } from 'lucide-react';
import { GitHubUser } from '../../../../types';

interface DesktopSidebarUserCardProps {
  isSidebarCollapsed: boolean;
  githubUser: GitHubUser | null;
  githubToken: string | null;
  connectGitHub: () => void;
  disconnectGitHub: () => void;
}

export const DesktopSidebarUserCard: React.FC<DesktopSidebarUserCardProps> = ({
  isSidebarCollapsed,
  githubUser,
  githubToken,
  connectGitHub,
  disconnectGitHub,
}) => {
  if (isSidebarCollapsed) {
    return (
      <div className="mb-6">
        {githubUser ? (
          <img
            src={githubUser.avatar_url}
            alt="Avatar"
            className="w-8 h-8 rounded-full border border-border"
            title={githubUser.login}
          />
        ) : (
          <button
            onClick={connectGitHub}
            className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
            title="Connect GitHub"
          >
            <Github size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-hover/20 border border-border/60 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-3">
        {githubUser ? (
          <img src={githubUser.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border border-border" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-hover border border-border flex items-center justify-center text-text-muted">
            <User size={18} />
          </div>
        )}
        <div className="overflow-hidden">
          <span className="block font-semibold text-xs text-text-main truncate">
            {githubUser ? (githubUser.name || githubUser.login) : 'Guest Developer'}
          </span>
          <span className="block text-[10px] text-text-muted truncate mt-0.5">
            {githubUser ? `@${githubUser.login}` : 'Offline Mode'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {githubToken ? (
          <button 
            onClick={disconnectGitHub}
            className="flex-1 bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger h-8 px-3 rounded-xl text-[11px] font-medium btn-tactile cursor-pointer text-center flex items-center justify-center"
          >
            Disconnect
          </button>
        ) : (
          <button 
            onClick={connectGitHub}
            className="flex-1 bg-primary hover:bg-primary-hover text-white h-8 px-3 rounded-xl text-[11px] font-medium btn-tactile cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-primary/15"
          >
            <Github size={12} /> Connect GitHub
          </button>
        )}
      </div>
    </div>
  );
};
