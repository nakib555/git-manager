import React from 'react';
import { Star, GitFork, Lock, Globe, Clock, ChevronRight, FolderGit2 } from 'lucide-react';
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
    case 'c++':
    case 'cpp':
      return '#F34B7D';
    case 'c':
      return '#555555';
    case 'c#':
    case 'csharp':
      return '#178600';
    case 'java':
      return '#B07219';
    case 'kotlin':
      return '#A97BFF';
    case 'swift':
      return '#F05138';
    case 'ruby':
      return '#701516';
    case 'php':
      return '#4F5D95';
    case 'shell':
    case 'bash':
      return '#89E051';
    case 'dart':
      return '#00B4AB';
    case 'vue':
      return '#41B883';
    case 'svelte':
      return '#FF3E00';
    case 'markdown':
      return '#083FA1';
    default:
      return '#8B949E';
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
      className={`group relative w-full p-4 rounded-2xl bg-surface-1 border transition-all duration-150 cursor-pointer select-none active:scale-[0.99] shadow-xs flex flex-col justify-between gap-3 ${
        isActive
          ? 'border-accent/70 ring-2 ring-accent/30 bg-surface-1 shadow-sm'
          : 'border-border/80 hover:border-accent/50 hover:bg-surface-2/40'
      }`}
    >
      {/* Top row: Folder Glyph, Name/Desc & Privacy Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border-accent flex items-center justify-center text-accent shrink-0 mt-0.5 group-hover:border-accent/40 transition-colors">
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

        {/* Right: Privacy Badge & Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {repo.private ? (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-text-tertiary px-2 py-0.5 rounded-full bg-surface-2 border border-border">
              <Lock size={10} /> Private
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Globe size={10} /> Public
            </span>
          )}
          <ChevronRight size={15} className="text-text-tertiary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>

      {/* Bottom metadata row: 8-point spatial rhythm with tabular-nums */}
      <div className="flex items-center justify-between text-xs text-text-tertiary font-mono pt-2.5 border-t border-border/50">
        {/* Language Pill */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
            style={{ backgroundColor: getLanguageColor(repo.language) }}
          />
          <span className="truncate max-w-[120px] text-text-secondary text-[11px] font-medium font-sans">
            {repo.language || 'Markdown'}
          </span>
        </div>

        {/* Stars, Forks & Updated */}
        <div className="flex items-center gap-3 shrink-0 tabular-nums text-[11px]">
          <span className="flex items-center gap-1 text-text-secondary">
            <Star size={11} className="text-[#D29922] fill-[#D29922]/20 shrink-0" />
            <span className="font-bold">{repo.stargazers_count || 0}</span>
          </span>

          <span className="flex items-center gap-1 text-text-tertiary">
            <GitFork size={11} className="shrink-0" />
            <span>{repo.forks_count || 0}</span>
          </span>

          <span className="flex items-center gap-1 text-text-tertiary">
            <Clock size={11} className="shrink-0" />
            <span className="font-sans">{formatRelativeTime(repo.pushed_at || repo.updated_at || '')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const MobileRepoCard = RepoCard;
