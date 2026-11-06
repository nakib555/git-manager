import React from 'react';
import { Star, GitFork, Clock } from 'lucide-react';
import { GitHubRepo } from '../../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { getLanguageColor } from './repoLanguageUtils';

interface RepoCardFooterProps {
  repo: GitHubRepo;
}

export const RepoCardFooter: React.FC<RepoCardFooterProps> = ({ repo }) => {
  return (
    <div className="flex items-center justify-between text-xs text-text-tertiary font-mono pt-2.5 border-t border-border/50">
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
          style={{ backgroundColor: getLanguageColor(repo.language) }}
        />
        <span className="truncate max-w-[120px] text-text-secondary text-[11px] font-medium font-sans">
          {repo.language || 'Markdown'}
        </span>
      </div>

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
  );
};
