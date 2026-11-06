import React from 'react';
import { User, Github, LogOut } from 'lucide-react';
import { GitHubUser } from '../../../types';

interface DrawerAccountCardProps {
  githubUser: GitHubUser | null;
  githubToken: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  repoCount: number;
  commitCount: number;
}

export const DrawerAccountCard: React.FC<DrawerAccountCardProps> = ({
  githubUser,
  githubToken,
  onConnect,
  onDisconnect,
  repoCount,
  commitCount,
}) => {
  return (
    <>
      <div className="p-4 border-b border-border bg-surface-2/40">
        <div className="flex items-center gap-3">
          {githubUser?.avatar_url ? (
            <img
              src={githubUser.avatar_url}
              alt={githubUser.login}
              className="w-12 h-12 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-tertiary">
              <User size={22} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-text-primary truncate">
              {githubUser?.name || githubUser?.login || 'Guest Developer'}
            </div>
            <div className="text-xs text-text-tertiary truncate font-mono">
              {githubUser?.login ? `@${githubUser.login}` : 'Offline Mode'}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {githubToken ? (
            <button
              onClick={onDisconnect}
              className="w-full min-h-[48px] h-12 rounded-xl bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              <span>Disconnect Account</span>
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="w-full min-h-[48px] h-12 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-accent/20 cursor-pointer"
            >
              <Github size={16} />
              <span>Connect GitHub</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 border-b border-border">
        <div className="bg-surface-2 rounded-2xl p-4 border border-border">
          <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block mb-1">Repos</span>
          <span className="text-lg font-bold text-text-primary font-mono tabular-nums">{repoCount}</span>
        </div>
        <div className="bg-surface-2 rounded-2xl p-4 border border-border">
          <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block mb-1">Commits</span>
          <span className="text-lg font-bold text-text-primary font-mono tabular-nums">{commitCount}</span>
        </div>
      </div>
    </>
  );
};
