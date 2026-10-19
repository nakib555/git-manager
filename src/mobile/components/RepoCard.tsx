import React from 'react';
import { Star, GitFork, Lock, Globe, Clock } from 'lucide-react';
import { GitHubRepo } from '../../types';
import { formatRelativeTime } from '../utils/formatters';

export interface RepoCardProps {
  repo: GitHubRepo;
  onClick: () => void;
  isActive?: boolean;
}

const getLanguageColor = (lang?: string | null): string => {
  switch (lang?.toLowerCase()) {
    case 'typescript':
      return '#3178C6';
    case 'javascript':
      return '#F7DF1E';
    case 'python':
      return '#3572A5';
    case 'rust':
      return '#DEA584';
    case 'go':
      return '#00ADD8';
    case 'html':
      return '#E34C26';
    case 'css':
      return '#563D7C';
    default:
      return '#388BFD';
  }
};

export const RepoCard: React.FC<RepoCardProps> = ({
  repo,
  onClick,
  isActive = false,
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
      className={`w-full rounded-xl p-3.5 transition-all duration-150 cursor-pointer border select-none ${
        isActive
          ? 'bg-surface-2 border-accent shadow-sm'
          : 'bg-surface-1 border-border hover:border-accent/40 hover:bg-surface-2 active:scale-99'
      }`}
    >
      {/* Top row: Name & Badges */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-sm text-text-primary truncate tracking-tight">
            {displayName}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
              repo.private
                ? 'bg-surface-2 text-text-tertiary border-border'
                : 'bg-surface-2 text-text-secondary border-border'
            }`}
          >
            {repo.private ? <Lock size={10} /> : <Globe size={10} />}
            <span>{repo.private ? 'Private' : 'Public'}</span>
          </span>
        </div>
      </div>

      {/* Description */}
      {repo.description ? (
        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3">
          {repo.description}
        </p>
      ) : (
        <p className="text-xs text-text-tertiary italic mb-3">
          No description provided.
        </p>
      )}

      {/* Bottom metadata row */}
      <div className="flex items-center justify-between text-xs text-text-tertiary font-mono pt-2 border-t border-border">
        {/* Language pill */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: getLanguageColor(repo.language) }}
          />
          <span className="truncate max-w-[80px]">{repo.language || 'Markdown'}</span>
        </div>

        {/* Stars, Forks & Updated */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-warning" />
            <span>{repo.stargazers_count || 0}</span>
          </span>

          <span className="flex items-center gap-1">
            <GitFork size={12} className="text-text-tertiary" />
            <span>{repo.forks_count || 0}</span>
          </span>

          <span className="flex items-center gap-1">
            <Clock size={11} className="text-text-tertiary" />
            <span>{formatRelativeTime(repo.pushed_at || repo.updated_at || '')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// Aliases
export const MobileRepoCard = RepoCard;
