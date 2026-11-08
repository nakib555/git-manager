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
    <div
      onClick={onOpen}
      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative btn-tactile ${
        isActive 
          ? 'bg-primary/5 border-primary/40 shadow-xs' 
          : 'bg-card border-border hover:border-primary/30 hover:bg-hover/20'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <FolderGit2 size={16} className={isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary transition-colors'} />
            <h4 className="font-bold text-xs text-text-main truncate">{repo.name}</h4>
            {isActive && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                ACTIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {repo.private ? (
              <span className="flex items-center gap-1 text-[10px] text-text-muted bg-hover px-1.5 py-0.5 rounded">
                <Lock size={10} /> Private
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-text-muted bg-hover px-1.5 py-0.5 rounded">
                <Globe size={10} /> Public
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete repository"
              className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/10 text-text-muted hover:text-danger flex items-center justify-center transition-all cursor-pointer btn-tactile"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <p className="text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed">
          {repo.description || 'No description provided for this repository.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50 text-[11px] text-text-muted">
        <div className="flex items-center gap-3">
          {repo.language && (
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="w-2 h-2 rounded-full bg-primary" />
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
        <span className="text-[10px]">Updated {formatTime(repo.pushed_at || repo.updated_at || new Date().toISOString())}</span>
      </div>
    </div>
  );
};
