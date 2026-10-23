import React from 'react';
import { Home, FolderGit2, Download, GitCommit, Settings } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigate } = useAppContext();

  // Active mapping: If in a repository sub-screen (files/commits/branches/prs/insights), keep Repos active
  const isRepoActive = ['repos', 'files', 'commits', 'branches', 'prs', 'insights'].includes(currentScreen);

  const tabs = [
    { id: 'dash', label: 'Home', icon: Home, isActive: currentScreen === 'dash' },
    { id: 'repos', label: 'Repos', icon: FolderGit2, isActive: isRepoActive },
    { id: 'clone', label: 'Clone', icon: Download, isActive: currentScreen === 'clone' },
    { id: 'activity', label: 'Activity', icon: GitCommit, isActive: currentScreen === 'activity' },
    { id: 'settings', label: 'Settings', icon: Settings, isActive: currentScreen === 'settings' },
  ] as const;

  return (
    <nav 
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-surface-1/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom,0px)] select-none"
    >
      <div className="h-14 w-full flex items-center justify-around px-2 sm:px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] h-full ${
                active 
                  ? 'text-text-primary' 
                  : 'text-text-tertiary hover:text-text-secondary active:scale-95'
              }`}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <div
                className={`w-10 h-7 flex items-center justify-center rounded-lg transition-colors duration-150 ${
                  active ? 'text-accent' : 'text-text-tertiary'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.9} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${active ? 'font-bold text-text-primary' : 'font-medium text-text-tertiary'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Backwards compatibility alias
export const MobileBottomNav = BottomNav;
