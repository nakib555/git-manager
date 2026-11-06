import React from 'react';
import { Github } from 'lucide-react';

interface DashboardProfileHeaderProps {
  githubUser: any;
  onConnectGitHub: () => void;
}

export const DashboardProfileHeader: React.FC<DashboardProfileHeaderProps> = ({
  githubUser,
  onConnectGitHub,
}) => {
  return (
    <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {githubUser?.avatar_url ? (
              <img 
                src={githubUser.avatar_url} 
                alt={githubUser.login} 
                className="w-11 h-11 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-tertiary">
                <Github size={20} />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary font-medium">
              <span>Workspace</span>
              <span aria-hidden="true">&bull;</span>
              <span className="font-mono text-text-secondary">Ready</span>
            </div>
            <h2 className="text-base font-bold text-text-primary tracking-tight truncate">
              {githubUser?.name || githubUser?.login || 'Developer'}
            </h2>
          </div>
        </div>

        {!githubUser ? (
          <button
            type="button"
            onClick={onConnectGitHub}
            className="h-9 px-3.5 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Github size={14} />
            <span>Connect</span>
          </button>
        ) : (
          <div className="text-xs font-mono text-text-secondary">
            @{githubUser.login}
          </div>
        )}
      </div>
    </div>
  );
};
