import React from 'react';
import { Search, FolderGit2, History, Compass } from 'lucide-react';
import { UnifiedRepoItem } from '../types';
import { CloneRecentRepos } from './CloneRecentRepos';

interface CloneBrowseSectionProps {
  repoSearch: string;
  setRepoSearch: (val: string) => void;
  browseCategory: 'user' | 'recent' | 'starters';
  setBrowseCategory: (cat: 'user' | 'recent' | 'starters') => void;
  recentList: UnifiedRepoItem[];
  myReposCount?: number;
  recentCount?: number;
  onSelectRepo: (repo: UnifiedRepoItem) => void;
}

export const CloneBrowseSection: React.FC<CloneBrowseSectionProps> = ({
  repoSearch,
  setRepoSearch,
  browseCategory,
  setBrowseCategory,
  recentList,
  myReposCount = 0,
  recentCount = 0,
  onSelectRepo,
}) => {
  return (
    <div className="space-y-3">
      {/* Category Sub-Tabs */}
      <div className="flex bg-main p-1 rounded-xl border border-border gap-1">
        <button
          type="button"
          onClick={() => setBrowseCategory('user')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            browseCategory === 'user' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <FolderGit2 size={12} className={browseCategory === 'user' ? 'text-primary' : 'text-text-muted'} />
          <span>My Repos</span>
          {myReposCount > 0 && (
            <span className="text-[9px] px-1 py-0.2 rounded-full bg-primary/10 text-primary">
              {myReposCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setBrowseCategory('recent')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            browseCategory === 'recent' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <History size={12} className={browseCategory === 'recent' ? 'text-primary' : 'text-text-muted'} />
          <span>Recent</span>
          {recentCount > 0 && (
            <span className="text-[9px] px-1 py-0.2 rounded-full bg-primary/10 text-primary">
              {recentCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setBrowseCategory('starters')}
          className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            browseCategory === 'starters' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Compass size={12} className={browseCategory === 'starters' ? 'text-primary' : 'text-text-muted'} />
          <span>Explore</span>
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={repoSearch}
          onChange={(e) => setRepoSearch(e.target.value)}
          placeholder="Filter repositories by name or owner..."
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
