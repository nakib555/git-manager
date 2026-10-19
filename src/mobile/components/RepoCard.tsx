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
      return '#3B82F6';
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
      className={`w-full rounded-xl p-4 transition-all duration-150 cursor-pointer border select-none ${
        isActive
          ? 'bg-surface-2 border-accent shadow-sm'
          : 'bg-surface-1 border-border hover:border-accent/40 hover:bg-surface-2 active:scale-99'
      }`}
    >
      {/* Top row: Name & Privacy status (Clean unboxed text, zero-pill discipline) */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-sm text-text-primary truncate tracking-tight">
            {displayName}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-text-tertiary text-xs">
          {repo.private ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-text-tertiary">
              <Lock size={11} /> Private
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-text-tertiary">
              <Globe size={11} /> Public
            </span>
          )}
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

      {/* Bottom metadata row (Unboxed text with tabular-nums) */}
      <div className="flex items-center justify-between text-xs text-text-tertiary font-mono pt-2.5 border-t border-border">
        {/* Language */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: getLanguageColor(repo.language) }}
          />
          <span className="truncate max-w-[90px] text-text-secondary">{repo.language || 'Markdown'}</span>
        </div>

        {/* Stars, Forks & Updated with Tabular Numbers */}
        <div className="flex items-center gap-3 shrink-0 tabular-nums">
          <span className="flex items-center gap-1 text-text-secondary">
            <Star size={12} className="text-warning shrink-0" />
            <span>{repo.stargazers_count || 0}</span>
          </span>

          <span className="flex items-center gap-1 text-text-tertiary">
            <GitFork size={12} className="shrink-0" />
            <span>{repo.forks_count || 0}</span>
          </span>

          <span className="flex items-center gap-1 text-text-tertiary">
            <Clock size={11} className="shrink-0" />
            <span>{formatRelativeTime(repo.pushed_at || repo.updated_at || '')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const MobileRepoCard = RepoCard;
