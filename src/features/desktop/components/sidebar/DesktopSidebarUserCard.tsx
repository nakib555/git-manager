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
  const [imgFailed, setImgFailed] = React.useState(false);

  if (isSidebarCollapsed) {
    return (
      <div className="mb-5">
        {githubUser ? (
          githubUser.avatar_url && !imgFailed ? (
            <img
              src={githubUser.avatar_url}
              alt={githubUser.login || 'Avatar'}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-8 h-8 rounded-full border border-border object-cover"
              title={githubUser.login}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-secondary"
              title={githubUser.login}
            >
              <User size={15} />
            </div>
          )
        ) : (
          <button
            type="button"
            onClick={connectGitHub}
            className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center cursor-pointer"
            title="Connect GitHub"
            aria-label="Connect GitHub"
          >
            <Github size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-hover/20 border border-border/60 rounded-2xl p-3.5 mb-5">
      <div className="flex items-center gap-3">
        {githubUser?.avatar_url && !imgFailed ? (
          <img
            src={githubUser.avatar_url}
            alt={githubUser.login || 'Avatar'}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-9 h-9 rounded-full border border-border object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-hover border border-border flex items-center justify-center text-text-muted shrink-0">
            <User size={17} />
          </div>
        )}
        <div className="overflow-hidden min-w-0">
          <span className="block font-semibold text-xs text-text-main truncate">
            {githubUser ? (githubUser.name || githubUser.login) : 'Guest Developer'}
          </span>
          <span className="block text-[10px] text-text-muted truncate mt-0.5">
            {githubUser ? `@${githubUser.login}` : 'Demo Workspace'}
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {githubToken ? (
          <button 
            type="button"
            onClick={disconnectGitHub}
            className="flex-1 bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger h-8 px-3 rounded-xl text-[11px] font-medium btn-tactile cursor-pointer text-center flex items-center justify-center"
          >
            Disconnect
          </button>
        ) : (
          <button 
            type="button"
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
