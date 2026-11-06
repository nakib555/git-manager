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
    activeBranches, switchBranch, openModal, theme, toggleTheme, openZipSync
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-10 animate-[fadeUp_0.15s_ease-out]" onKeyDown={handleKeyDown}>
        <div className="flex items-center px-4 h-14 border-b border-border bg-card">
          <Search size={18} className="text-primary shrink-0 mr-4" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command, repository name, or branch..."
            className="w-full bg-transparent border-none text-sm text-text-main placeholder:text-text-muted outline-none font-medium"
          />
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover rounded-lg transition-colors cursor-pointer">
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
