import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../AppContext';
import { Search, Lock, Globe, Square, FolderGit2 } from 'lucide-react';
import { GitHubRepo } from '../types';
import { useVirtualizer } from '@tanstack/react-virtual';

const getLanguageColor = (lang: string | null) => {
  if (!lang) return '#8F8F9D';
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Rust: '#DEA584',
    Swift: '#F05138',
    Go: '#00ADD8',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
  };
  return colors[lang] || '#8F8F9D';
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const Repositories: React.FC = () => {
  const { openRepo, showToast, isSearchFocused, githubRepos } = useAppContext();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchFocused && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchFocused]);

  const displayRepos = githubRepos.map((repo: GitHubRepo) => {
    const lang = repo.language || 'Unknown';
    return {
      id: repo.name,
      name: repo.name,
      owner: (repo as any).owner?.login || null,
      isPrivate: repo.private,
      desc: repo.description || 'No description provided.',
      lang,
      langColor: getLanguageColor(lang),
      updated: formatTime(repo.pushed_at),
      icon: FolderGit2,
      iconColor: 'text-[#38BDF8]',
      bg: 'bg-[#38BDF8]/10'
    };
  });

  const filteredRepos = displayRepos.filter(repo => {
    if (searchQuery && !repo.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filter === 'Private' && !repo.isPrivate) return false;
    if (filter === 'Public' && repo.isPrivate) return false;
    return true;
  });

  const rowVirtualizer = useVirtualizer({
    count: filteredRepos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 142,
    overscan: 5,
  });

  return (
    <div className="animate-fade-up">
      <div className="bg-card rounded-xl p-3 flex items-center gap-3 mb-4 border border-border">
        <Search size={20} className="text-text-muted" />
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="Search repositories..." 
          className="bg-transparent border-none text-text-main w-full outline-none text-sm placeholder:text-text-muted"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {['All', 'Private', 'Public'].map(f => (
          <div 
            key={f}
            onClick={() => { setFilter(f); showToast(`Filtered by: ${f}`); }}
            className={`border px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors duration-200 ${filter === f ? 'bg-primary/15 text-primary border-primary/40' : 'border-border text-text-muted'}`}
          >
            {f}
          </div>
        ))}
      </div>

      <div>
        {filteredRepos.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 border border-border text-center flex flex-col items-center justify-center my-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <FolderGit2 size={24} />
            </div>
            <p className="font-semibold text-sm mb-1 text-text-main">No repositories found</p>
            <p className="text-xs text-text-muted max-w-[260px] leading-relaxed">
              Create a new repository using the <strong>+</strong> button or connect your GitHub account to load your repositories.
            </p>
          </div>
        ) : (
          <div 
            ref={parentRef} 
            className="overflow-y-auto no-scrollbar"
            style={{ height: 'calc(100vh - 250px)', width: '100%' }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const repo = filteredRepos[virtualItem.index];
                if (!repo) return null;
                const Icon = repo.icon;
                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                      paddingBottom: '12px',
                    }}
                  >
                    <div 
                      className="bg-card p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95 border border-border h-full flex flex-col justify-between"
                      onClick={() => openRepo(repo.id, repo.owner)}
                    >
                      <div className="flex justify-between mb-2">
                        <div className="text-[15px] font-semibold flex items-center gap-2.5 truncate">
                          <div className={`w-8 h-8 rounded-lg ${repo.bg} ${repo.iconColor} flex items-center justify-center shrink-0`}>
                            <Icon size={18} />
                          </div>
                          <span className="truncate">{repo.name}</span>
                        </div>
                        <div className="text-[10px] px-2 py-0.5 rounded-full border border-border text-text-muted flex items-center gap-1 h-fit shrink-0">
                          {repo.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                          {repo.isPrivate ? 'Private' : 'Public'}
                        </div>
                      </div>
                      <div className="text-[13px] text-text-muted mb-3 line-clamp-1 truncate">{repo.desc}</div>
                      <div className="flex justify-between text-xs text-text-muted mt-auto">
                        <span className="flex items-center gap-1.5">
                          <Square size={12} fill={repo.langColor} color={repo.langColor} /> {repo.lang}
                        </span>
                        <span>Updated {repo.updated}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
