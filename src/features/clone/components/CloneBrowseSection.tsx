import React from 'react';
import { Search } from 'lucide-react';
import { UnifiedRepoItem } from '../types';
import { CloneRecentRepos } from './CloneRecentRepos';

interface CloneBrowseSectionProps {
  repoSearch: string;
  setRepoSearch: (val: string) => void;
  recentList: UnifiedRepoItem[];
  onSelectRepo: (repo: UnifiedRepoItem) => void;
}

export const CloneBrowseSection: React.FC<CloneBrowseSectionProps> = ({
  repoSearch,
  setRepoSearch,
  recentList,
  onSelectRepo,
}) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={repoSearch}
          onChange={(e) => setRepoSearch(e.target.value)}
          placeholder="Search recent repositories..."
          className="w-full bg-main border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-text-main outline-none focus:border-primary"
        />
      </div>
      <CloneRecentRepos
        repos={recentList}
        onSelectRepo={onSelectRepo}
      />
    </div>
  );
};
