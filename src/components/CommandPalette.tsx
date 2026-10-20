import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { 
  Search, FolderGit2, GitBranch, GitCommit, GitPullRequest, 
  HardDrive, Moon, Sun, Plus, ArrowRight, CornerDownLeft, Sparkles, X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { 
    githubRepos, currentRepo, openRepo, navigate, 
    activeBranches, switchBranch, openModal, theme, toggleTheme 
  } = useAppContext();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter repos
  const matchedRepos = githubRepos
    .filter(r => r.name.toLowerCase().includes(query.toLowerCase()) || (r.description && r.description.toLowerCase().includes(query.toLowerCase())))
    .slice(0, 5);

  // Filter branches if repo is active
  const matchedBranches = currentRepo 
    ? activeBranches.filter(b => b.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : [];

  // Actions list
  const actions = [
    {
      id: 'action-repos',
      title: 'Go to Repositories Explorer',
      category: 'Navigation',
      icon: FolderGit2,
      run: () => { navigate('repos'); onClose(); }
    },
    {
      id: 'action-new-repo',
      title: 'Create New Repository',
      category: 'Actions',
      icon: Plus,
      run: () => { openModal('repo'); onClose(); }
    },
    {
      id: 'action-clone',
      title: 'Clone Repository from URL',
      category: 'Actions',
      icon: HardDrive,
      run: () => { navigate('clone'); onClose(); }
    },
    ...(currentRepo ? [
      {
        id: 'action-commit',
        title: `Commit Changes in "${currentRepo}"`,
        category: 'Git',
        icon: GitCommit,
        run: () => { openModal('commit'); onClose(); }
      },
      {
        id: 'action-prs',
        title: `View Pull Requests for "${currentRepo}"`,
        category: 'Git',
        icon: GitPullRequest,
        run: () => { navigate('prs'); onClose(); }
      }
    ] : []),
    {
      id: 'action-theme',
      title: `Toggle Theme (${theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      run: () => { toggleTheme(); onClose(); }
    }
  ].filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

  // Flattened items for keyboard navigation
  const items: Array<{ type: 'repo' | 'branch' | 'action'; id: string; data: any; run: () => void }> = [
    ...matchedRepos.map(r => ({
      type: 'repo' as const,
      id: `repo-${r.name}`,
      data: r,
      run: () => { openRepo(r.name); onClose(); }
    })),
    ...matchedBranches.map(b => ({
      type: 'branch' as const,
      id: `branch-${b.name}`,
      data: b,
      run: () => { switchBranch(b.name); onClose(); }
    })),
    ...actions.map(a => ({
      type: 'action' as const,
      id: a.id,
      data: a,
      run: a.run
    }))
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].run();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity" 
        onClick={onClose} 
      />

      {/* Palette Container */}
      <div 
        className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-10 animate-[fadeUp_0.15s_ease-out]"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 h-14 border-b border-border bg-card">
          <Search size={18} className="text-primary shrink-0 mr-4" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, repository name, or branch..."
            className="w-full bg-transparent border-none text-sm text-text-main placeholder:text-text-muted outline-none font-medium"
          />
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[384px] overflow-y-auto p-2 no-scrollbar">
          {items.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-xs">
              <FolderGit2 size={24} className="mx-auto mb-2 opacity-50" />
              <span>No matching repositories or commands found for "{query}"</span>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Repositories Section */}
              {matchedRepos.length > 0 && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Repositories
                </div>
              )}
              {matchedRepos.map(repo => {
                const itemIndex = items.findIndex(i => i.id === `repo-${repo.name}`);
                const isSelected = itemIndex === selectedIndex;
                return (
                  <div 
                    key={repo.name}
                    onClick={() => { openRepo(repo.name); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={`flex items-center justify-between px-3 h-10 rounded-lg cursor-pointer text-xs transition-colors ${
                      isSelected ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-main hover:bg-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderGit2 size={16} className={isSelected ? 'text-primary' : 'text-text-muted'} />
                      <span className="font-semibold truncate">{repo.name}</span>
                      {repo.language && (
                        <span className="text-[10px] text-text-muted font-mono bg-hover px-1.5 py-0.5 rounded">
                          {repo.language}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-text-muted text-[11px]">
                      {currentRepo === repo.name ? (
                        <span className="text-primary text-[10px] font-semibold bg-primary/10 px-2 py-0.5 rounded">Active</span>
                      ) : (
                        <span className="text-[10px] font-mono">Jump to repo</span>
                      )}
                      <ArrowRight size={13} />
                    </div>
                  </div>
                );
              })}

              {/* Branches Section */}
              {matchedBranches.length > 0 && (
                <div className="px-2 pt-3 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Branches in {currentRepo}
                </div>
              )}
              {matchedBranches.map(branch => {
                const itemIndex = items.findIndex(i => i.id === `branch-${branch.name}`);
                const isSelected = itemIndex === selectedIndex;
                return (
                  <div 
                    key={branch.name}
                    onClick={() => { switchBranch(branch.name); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                      isSelected ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-main hover:bg-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GitBranch size={16} className={isSelected ? 'text-primary' : 'text-text-muted'} />
                      <span className="font-mono text-xs">{branch.name}</span>
                    </div>
                    <span className="text-[10px] text-text-muted">Switch branch</span>
                  </div>
                );
              })}

              {/* Actions Section */}
              {actions.length > 0 && (
                <div className="px-2 pt-3 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Quick Actions
                </div>
              )}
              {actions.map(action => {
                const itemIndex = items.findIndex(i => i.id === action.id);
                const isSelected = itemIndex === selectedIndex;
                const ActionIcon = action.icon;
                return (
                  <div 
                    key={action.id}
                    onClick={action.run}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                      isSelected ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-main hover:bg-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ActionIcon size={16} className={isSelected ? 'text-primary' : 'text-text-muted'} />
                      <span className="font-medium">{action.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted">{action.category}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2 border-t border-border bg-hover/20 flex items-center justify-between text-[11px] text-text-muted font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">esc</kbd>
            <span>close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
