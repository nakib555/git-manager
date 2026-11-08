import React from 'react';
import { Lock, Globe, ChevronRight, FolderGit2, Trash2 } from 'lucide-react';
import { GitHubRepo } from '../../types';
import { RepoCardFooter } from './repoCard/RepoCardFooter';

export interface RepoCardProps {
  repo: GitHubRepo;
  onClick: () => void;
  isActive?: boolean;
  onDelete?: (repo: GitHubRepo) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({
  repo,
  onClick,
  isActive = false,
  onDelete,
}) => {
  const owner = (repo as any).owner?.login;
  const displayName = owner ? `${owner}/${repo.name}` : repo.name;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative w-full p-4 rounded-2xl bg-surface-1 border transition-all duration-150 cursor-pointer select-none btn-tactile shadow-xs flex flex-col justify-between gap-3 ${
        isActive
          ? 'border-accent/70 ring-2 ring-accent/30 bg-surface-1 shadow-sm'
          : 'border-border/80 hover:border-accent/50 hover:bg-surface-2/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-primary shrink-0 mt-0.5 group-hover:border-text-primary/30 transition-colors">
            <FolderGit2 size={16} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs text-text-primary truncate tracking-tight group-hover:text-accent transition-colors font-sans">
                {displayName}
              </h3>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent ring-2 ring-accent/30 shrink-0" title="Active Repo" />
              )}
            </div>

            {repo.description ? (
              <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed mt-1 font-sans">
                {repo.description}
              </p>
            ) : (
              <p className="text-[11px] text-text-tertiary italic mt-1 font-sans">
                No description provided.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center gap-1 text-[11px] font-mono text-text-tertiary">
            {repo.private ? <Lock size={11} /> : <Globe size={11} />}
            <span>{repo.private ? 'Private' : 'Public'}</span>
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(repo);
              }}
              className="p-1.5 rounded-md text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer btn-tactile"
              title={`Delete ${repo.name}`}
              aria-label={`Delete repository ${repo.name}`}
            >
              <Trash2 size={13} />
            </button>
          )}
          <ChevronRight size={15} className="text-text-tertiary group-hover:text-text-primary transition-colors shrink-0" />
        </div>
      </div>

      <RepoCardFooter repo={repo} />
    </div>
  );
};

export const MobileRepoCard = RepoCard;
