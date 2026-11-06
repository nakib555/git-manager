import React from 'react';
import { FolderGit2, GitBranch, ArrowRight } from 'lucide-react';
import { GitHubRepo } from '../../types';

interface CommandPaletteResultsProps {
  items: Array<{ type: 'repo' | 'branch' | 'action'; id: string; data: any; run: () => void }>;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  query: string;
  setQuery: (q: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  matchedRepos: GitHubRepo[];
  matchedBranches: any[];
  actions: any[];
  currentRepo: string | null;
  onClose: () => void;
  openRepo: (name: string) => void;
  switchBranch: (name: string) => void;
}

export const CommandPaletteResults: React.FC<CommandPaletteResultsProps> = ({
  items, selectedIndex, setSelectedIndex, query, setQuery, inputRef,
  matchedRepos, matchedBranches, actions, currentRepo, onClose, openRepo, switchBranch,
}) => {
  if (items.length === 0) {
    return (
      <div className="py-10 px-4 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-hover border border-border flex items-center justify-center text-text-muted">
          <FolderGit2 size={20} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-text-main">No matches found for "{query}"</p>
          <p className="text-[11px] text-text-muted max-w-xs">Check for typos or clear your search to explore all repositories.</p>
        </div>
        <button
          type="button"
          onClick={() => { setQuery(''); inputRef.current?.focus(); }}
          className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          Clear Search Query
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {matchedRepos.length > 0 && (
        <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Repositories</div>
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
                <span className="text-[10px] text-text-muted font-mono bg-hover px-1.5 py-0.5 rounded">{repo.language}</span>
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

      {matchedBranches.length > 0 && (
        <div className="px-2 pt-3 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Branches in {currentRepo}</div>
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

      {actions.length > 0 && (
        <div className="px-2 pt-3 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Quick Actions</div>
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
  );
};
