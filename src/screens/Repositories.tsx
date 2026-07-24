import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../AppContext';
import { Search, Lock, Globe, Square, Hexagon, ShoppingCart, Database, Settings, Wallet, FolderGit2 } from 'lucide-react';
import { GitHubRepo } from '../types';

const REPOS = [
  { id: 'rocket-launcher', name: 'rocket-launcher', isPrivate: true, desc: 'A rocket launcher simulation app built with React.', lang: 'TypeScript', langColor: '#3178c6', updated: '2h ago', icon: Hexagon, iconColor: 'text-[#a855f7]', bg: 'bg-[#a855f7]/10' },
  { id: 'e-commerce-web', name: 'e-commerce-web', isPrivate: false, desc: 'Full stack e-commerce platform for digital goods.', lang: 'JavaScript', langColor: '#f7df1e', updated: '5h ago', icon: ShoppingCart, iconColor: 'text-[#eab308]', bg: 'bg-[#eab308]/10' },
  { id: 'backend-api', name: 'backend-api', isPrivate: true, desc: 'RESTful Python API backend powered by FastAPI.', lang: 'Python', langColor: '#3572A5', updated: '1d ago', icon: Database, iconColor: 'text-[#3b82f6]', bg: 'bg-[#3b82f6]/10' },
  { id: 'rust-parser', name: 'rust-parser', isPrivate: false, desc: 'High performance JSON parser built with Rust.', lang: 'Rust', langColor: '#DEA584', updated: '3d ago', icon: Settings, iconColor: 'text-[#64748b]', bg: 'bg-[#64748b]/10' },
  { id: 'ios-wallet', name: 'ios-wallet', isPrivate: true, desc: 'Crypto wallet app for iOS.', lang: 'Swift', langColor: '#F05138', updated: '1w ago', icon: Wallet, iconColor: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10' },
];

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
        {filteredRepos.map(repo => {
          const Icon = repo.icon;
          return (
            <div 
              key={repo.id}
              className="bg-card p-4 rounded-2xl mb-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95 border border-border"
              onClick={() => openRepo(repo.id, repo.owner)}
            >
              <div className="flex justify-between mb-2">
                <div className="text-[15px] font-semibold flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${repo.bg} ${repo.iconColor} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  {repo.name}
                </div>
                <div className="text-[10px] px-2 py-0.5 rounded-full border border-border text-text-muted flex items-center gap-1 h-fit">
                  {repo.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                  {repo.isPrivate ? 'Private' : 'Public'}
                </div>
              </div>
              <div className="text-[13px] text-text-muted mb-3">{repo.desc}</div>
              <div className="flex justify-between text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Square size={12} fill={repo.langColor} color={repo.langColor} /> {repo.lang}
                </span>
                <span>Updated {repo.updated}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
