import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { Search, X } from 'lucide-react';
import { CommandPaletteResults } from './palette/CommandPaletteResults';
import { CommandPaletteFooter } from './palette/CommandPaletteFooter';
import { useCommandPaletteItems } from './palette/useCommandPaletteItems';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { 
    githubRepos, currentRepo, openRepo, navigate, 
    activeBranches, switchBranch, openModal, theme, toggleTheme, openZipSync,
    adminModeOverride, toggleAdminMode, showToast, refreshData,
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

  const { matchedRepos, matchedBranches, actions, items } = useCommandPaletteItems({
    githubRepos, currentRepo, activeBranches, query, theme,
    adminModeOverride, toggleAdminMode, showToast, refreshData,
    navigate, openModal, openRepo, switchBranch, toggleTheme, openZipSync, onClose,
  });

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) items[selectedIndex].run();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-150 cursor-pointer" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 popover-enter affordance-card" onKeyDown={handleKeyDown}>
        <div className="flex items-center px-4 h-14 border-b border-border bg-card">
          <Search size={18} className="text-primary shrink-0 mr-4" />
          <input 
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-label="Command palette and repository search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command, repository name, or branch..."
            className="w-full bg-transparent border-none text-sm text-text-main placeholder:text-text-muted outline-none font-medium"
          />
          <button 
            type="button" 
            onClick={onClose} 
            aria-label="Close command palette"
            className="touch-target-44 w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover rounded-xl transition-colors btn-tactile cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[384px] overflow-y-auto p-2 no-scrollbar">
          <CommandPaletteResults
            items={items}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            query={query}
            setQuery={setQuery}
            inputRef={inputRef}
            matchedRepos={matchedRepos}
            matchedBranches={matchedBranches}
            actions={actions}
            currentRepo={currentRepo}
            onClose={onClose}
            openRepo={openRepo}
            switchBranch={switchBranch}
          />
        </div>

        <CommandPaletteFooter />
      </div>
    </div>
  );
};
