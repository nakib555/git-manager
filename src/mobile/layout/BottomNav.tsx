import React from 'react';
import { Home, FolderGit2, Download, GitCommit, Settings } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigate } = useAppContext();

  // Active mapping: If in a repository sub-screen (files/commits/branches/prs/insights), keep Repos active
  const isRepoActive = ['repos', 'files', 'commits', 'branches', 'prs', 'insights'].includes(currentScreen);

  const tabs = [
    { 
      id: 'dash', 
      label: 'Home', 
      icon: Home, 
      isActive: currentScreen === 'dash',
      color: '#388BFD',
      bgTint: 'rgba(56, 139, 253, 0.14)',
    },
    { 
      id: 'repos', 
      label: 'Repos', 
      icon: FolderGit2, 
      isActive: isRepoActive,
      color: '#58A6FF',
      bgTint: 'rgba(88, 166, 255, 0.14)',
    },
    { 
      id: 'clone', 
      label: 'Clone', 
      icon: Download, 
      isActive: currentScreen === 'clone',
      color: '#D29922',
      bgTint: 'rgba(210, 153, 34, 0.14)',
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: GitCommit, 
      isActive: currentScreen === 'activity',
      color: '#3FB950',
      bgTint: 'rgba(63, 185, 80, 0.14)',
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      isActive: currentScreen === 'settings',
      color: '#8B949E',
      bgTint: 'rgba(139, 148, 158, 0.16)',
    },
  ] as const;

  return (
    <nav 
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-surface-1 border-t border-border pb-[env(safe-area-inset-bottom,0px)] select-none"
    >
      <div className="h-14 w-full flex items-center justify-around px-3 sm:px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] h-full ${
                active 
                  ? 'font-bold' 
                  : 'text-text-tertiary hover:text-text-secondary active:scale-95'
              }`}
              style={{ color: active ? tab.color : undefined }}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <div
                className="w-10 h-7 flex items-center justify-center rounded-md transition-all duration-200"
                style={{
                  backgroundColor: active ? tab.bgTint : 'transparent',
                  color: active ? tab.color : undefined,
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.9} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${active ? 'font-bold text-text-primary' : 'font-medium'}`}>
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
