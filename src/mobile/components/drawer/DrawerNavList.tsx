import React from 'react';
import { FolderGit2, Star, FolderPlus, Settings } from 'lucide-react';

interface DrawerNavListProps {
  currentScreen: string;
  repoCount: number;
  onNavigate: (screen: any) => void;
  onClose: () => void;
}

export const DrawerNavList: React.FC<DrawerNavListProps> = ({
  currentScreen,
  repoCount,
  onNavigate,
  onClose,
}) => {
  const handleGo = (screen: any) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
      <div className="px-2 pt-1 pb-1 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
        Navigation
      </div>

      <button
        onClick={() => handleGo('repos')}
        className="w-full flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2.5">
          <FolderGit2 size={16} className="text-accent" />
          Repositories
        </span>
        <span className="text-[11px] font-mono text-text-tertiary tabular-nums">
          {repoCount}
        </span>
      </button>

      <button
        onClick={() => handleGo('activity')}
        className="w-full flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2.5">
          <Star size={16} className="text-text-tertiary" />
          Activity Feed
        </span>
      </button>

      <button
        onClick={() => handleGo('clone')}
        className={`w-full flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
          currentScreen === 'clone'
            ? 'bg-accent/10 text-accent font-bold'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
        }`}
      >
        <span className="flex items-center gap-2.5">
          <FolderPlus size={16} className={currentScreen === 'clone' ? 'text-accent' : 'text-text-tertiary'} />
          Clone Repository
        </span>
      </button>

      <div className="pt-3">
        <div className="px-2 pt-1 pb-1.5 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
          Preferences
        </div>

        <button
          type="button"
          onClick={() => handleGo('settings')}
          className={`w-full flex items-center justify-between px-3.5 py-3 min-h-[48px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            currentScreen === 'settings'
              ? 'bg-accent/15 text-accent border border-accent/30 font-bold shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-border/40'
          }`}
          aria-label="Settings and Preferences"
          aria-current={currentScreen === 'settings' ? 'page' : undefined}
        >
          <span className="flex items-center gap-2.5">
            <Settings size={16} className={currentScreen === 'settings' ? 'text-accent' : 'text-text-tertiary'} />
            <span>Settings & Preferences</span>
          </span>
          <span className="text-[10px] font-sans px-2 py-0.5 rounded-md bg-surface-2 text-text-tertiary border border-border/70">
            Theme & Cache
          </span>
        </button>
      </div>
    </div>
  );
};
