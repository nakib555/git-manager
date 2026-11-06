import React from 'react';
import { FolderGit2, Star, Layers, GitCommit } from 'lucide-react';

interface DashboardMetricCardsProps {
  reposCount: number;
  totalStars: number;
  totalForks: number;
  commitsCount: number;
}

export const DashboardMetricCards: React.FC<DashboardMetricCardsProps> = ({
  reposCount,
  totalStars,
  totalForks,
  commitsCount,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <div className="bg-surface-1 border border-border rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all">
        <div className="flex items-center justify-between text-text-tertiary">
          <span className="text-[10px] font-bold uppercase tracking-wider">Repositories</span>
          <FolderGit2 size={14} className="text-text-secondary" />
        </div>
        <span className="text-2xl font-bold font-mono tabular-nums text-text-primary my-0.5">
          {reposCount}
        </span>
        <span className="text-[10px] text-text-tertiary font-medium">Active sources</span>
      </div>

      <div className="bg-surface-1 border border-border rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all">
        <div className="flex items-center justify-between text-text-tertiary">
          <span className="text-[10px] font-bold uppercase tracking-wider">Stargazers</span>
          <Star size={14} className="text-text-secondary" />
        </div>
        <span className="text-2xl font-bold font-mono tabular-nums text-text-primary my-0.5">
          {totalStars}
        </span>
        <span className="text-[10px] text-text-tertiary font-medium">Across all repos</span>
      </div>

      <div className="bg-surface-1 border border-border rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all">
        <div className="flex items-center justify-between text-text-tertiary">
          <span className="text-[10px] font-bold uppercase tracking-wider">Forks</span>
          <Layers size={14} className="text-text-secondary" />
        </div>
        <span className="text-2xl font-bold font-mono tabular-nums text-text-primary my-0.5">
          {totalForks}
        </span>
        <span className="text-[10px] text-text-tertiary font-medium">Community copies</span>
      </div>

      <div className="bg-surface-1 border border-border rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all">
        <div className="flex items-center justify-between text-text-tertiary">
          <span className="text-[10px] font-bold uppercase tracking-wider">Commits</span>
          <GitCommit size={14} className="text-text-secondary" />
        </div>
        <span className="text-2xl font-bold font-mono tabular-nums text-text-primary my-0.5">
          {commitsCount}
        </span>
        <span className="text-[10px] text-text-tertiary font-medium">On current branch</span>
      </div>
    </div>
  );
};
