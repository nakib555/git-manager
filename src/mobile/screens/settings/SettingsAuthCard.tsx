import React from 'react';
import { Github } from 'lucide-react';
import { GitHubUser } from '../../../types';

interface SettingsAuthCardProps {
  githubUser: GitHubUser | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const SettingsAuthCard: React.FC<SettingsAuthCardProps> = ({
  githubUser,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
          GitHub Connection
        </span>
        <span className={`text-[11px] font-mono font-semibold ${
          githubUser ? 'text-success' : 'text-text-tertiary'
        }`}>
          {githubUser ? 'Connected' : 'Offline / Guest'}
        </span>
      </div>

      {githubUser ? (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <img 
              src={githubUser.avatar_url} 
              alt={githubUser.login} 
              className="w-12 h-12 rounded-full border border-border object-cover"
            />
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {githubUser.name || githubUser.login}
              </h3>
              <span className="text-xs text-text-tertiary block font-mono">
                @{githubUser.login}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onDisconnect}
            className="h-9 px-3.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-text-secondary leading-relaxed">
            Connect your GitHub account or use a Personal Access Token (PAT) to commit code, manage pull requests, and synchronize workspaces.
          </p>
          <button
            type="button"
            onClick={onConnect}
            className="w-full min-h-[48px] h-12 rounded-xl bg-accent hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-accent/20 active:scale-98 transition-all cursor-pointer shadow-sm shadow-accent/25"
          >
            <Github size={17} />
            <span>Connect with GitHub</span>
          </button>
        </div>
      )}
    </div>
  );
};
