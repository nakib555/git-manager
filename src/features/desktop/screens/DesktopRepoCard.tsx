import React from 'react';
import { GitHubRepo } from '../../../types';
import { FolderGit2, Star, GitFork, Lock, Globe, Trash2 } from 'lucide-react';
import { formatTime } from '../../../context/contextUtils';

interface DesktopRepoCardProps {
  repo: GitHubRepo;
  isActive: boolean;
  onOpen: () => void;
  onDelete: () => void;
}

export const DesktopRepoCard: React.FC<DesktopRepoCardProps> = ({
  repo,
  isActive,
  onOpen,
  onDelete,
}) => {
  return (
    <article
      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group relative ${
        isActive 
          ? 'bg-primary/5 border-primary/40 shadow-xs' 
          : 'bg-card border-border hover:border-primary/30 hover:bg-hover/20'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            type="button"
            onClick={onOpen}
            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            <FolderGit2 size={16} className={`shrink-0 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary transition-colors'}`} />
            <h4 className="font-bold text-xs text-text-main truncate">{repo.name}</h4>
            {isActive && (
              <span className="text-[10px] font-mono font-bold text-primary shrink-0">
                ACTIVE
              </span>
            )}
          </button>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="flex items-center gap-1 text-[10px] text-text-muted">
              {repo.private ? <Lock size={10} /> : <Globe size={10} />}
              <span>{repo.private ? 'Private' : 'Public'}</span>
            </span>
            <button
              type="button"
              onClick={onDelete}
              title={`Delete repository ${repo.name}`}
              aria-label={`Delete repository ${repo.name}`}
              className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 hover:bg-danger/10 text-text-muted hover:text-danger flex items-center justify-center transition-all cursor-pointer btn-tactile"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="w-full text-left cursor-pointer block"
        >
          <p className="text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed">
            {repo.description || 'No description provided for this repository.'}
          </p>
        </button>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50 text-[11px] text-text-muted">
        <div className="flex items-center gap-2.5">
          {repo.language && (
            <span className="font-mono text-[10px] text-text-secondary">
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1 font-mono text-[10px] tabular-nums">
            <Star size={11} className="text-amber-400" />
            {repo.stargazers_count || 0}
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] tabular-nums">
            <GitFork size={11} />
            {repo.forks_count || 0}
          </span>
        </div>
        <span className="text-[10px] tabular-nums">Updated {formatTime(repo.pushed_at || repo.updated_at || new Date().toISOString())}</span>
      </div>
    </article>
  );
};
