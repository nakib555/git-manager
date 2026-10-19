import React from 'react';
import { Star, GitFork, Lock, Globe, Clock } from 'lucide-react';
import { GitHubRepo } from '../../types';

interface MobileRepoCardProps {
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

const formatTimeAgo = (dateStr?: string | null): string => {
  if (!dateStr) return 'recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

export const MobileRepoCard: React.FC<MobileRepoCardProps> = ({
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
      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none active:scale-[0.99] ${
        isActive
          ? 'bg-[#121214] border-[#3B82F6]/50 shadow-sm shadow-[#3B82F6]/10'
          : 'bg-[#121214] border-[#2A2A2E] hover:border-[#3B82F6]/30 hover:bg-[#1A1A1D]'
      }`}
    >
      {/* Top row: Name + Visibility */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h3 className="text-[15px] font-semibold text-[#F4F4F5] truncate tracking-tight">
          {displayName}
        </h3>
        <span
          className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
            repo.private
              ? 'bg-[#1A1A1D] border-[#2A2A2E] text-[#A1A1AA]'
              : 'bg-[#3B82F6]/10 border-[#3B82F6]/25 text-[#3B82F6]'
          }`}
        >
          {repo.private ? <Lock size={10} /> : <Globe size={10} />}
          <span>{repo.private ? 'Private' : 'Public'}</span>
        </span>
      </div>

      {/* Description: max 2 lines, ellipsis */}
      <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed mb-3">
        {repo.description || 'No description provided.'}
      </p>

      {/* Bottom meta row: stars, forks, language, updated time */}
      <div className="flex items-center justify-between text-xs text-[#71717A] pt-2 border-t border-[#2A2A2E]/60">
        <div className="flex items-center gap-3">
          {/* Language indicator */}
          {repo.language && (
            <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA] font-medium">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: getLanguageColor(repo.language) }}
              />
              <span className="truncate max-w-[80px]">{repo.language}</span>
            </div>
          )}

          {/* Stars */}
          <div className="flex items-center gap-1 font-mono tabular-nums text-xs">
            <Star size={12} className="text-[#A1A1AA]" />
            <span>{repo.stargazers_count ?? 0}</span>
          </div>

          {/* Forks */}
          <div className="flex items-center gap-1 font-mono tabular-nums text-xs">
            <GitFork size={12} className="text-[#A1A1AA]" />
            <span>{repo.forks_count ?? 0}</span>
          </div>
        </div>

        {/* Updated time */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-[#71717A]">
          <Clock size={11} />
          <span>{formatTimeAgo(repo.updated_at)}</span>
        </div>
      </div>
    </div>
  );
};
