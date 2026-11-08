import React from 'react';
import { Home, FolderGit2, Sliders, GitCommit, GitPullRequest, GitBranch, FileCode, Activity, HardDrive } from 'lucide-react';

interface DesktopSidebarNavProps {
  isSidebarCollapsed: boolean;
  currentScreen: string;
  currentRepo: string | null;
  navigate: (screen: any) => void;
}

export const DesktopSidebarNav: React.FC<DesktopSidebarNavProps> = ({
  isSidebarCollapsed,
  currentScreen,
  currentRepo,
  navigate,
}) => {
  const repoItems = [
    { id: 'commits', label: 'Commits', icon: GitCommit },
    { id: 'prs', label: 'Pull Requests', icon: GitPullRequest },
    { id: 'branches', label: 'Branches', icon: GitBranch },
    { id: 'files', label: 'Files', icon: FileCode },
    { id: 'insights', label: 'Insights', icon: Activity },
    { id: 'clone', label: 'Clone', icon: HardDrive },
  ];

  return (
    <>
      <div className={`space-y-1 w-full ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!isSidebarCollapsed && (
          <span className="block text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2 px-1">Workspace</span>
        )}
        
        <button 
          onClick={() => navigate('dash')}
          title="Dashboard"
          className={`flex items-center gap-3 rounded-xl text-xs font-medium btn-tactile cursor-pointer ${
            isSidebarCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full px-3 py-2.5'
          } ${currentScreen === 'dash' ? 'bg-primary/10 text-primary border border-primary/25 font-semibold' : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'}`}
        >
          <Home size={16} />
          {!isSidebarCollapsed && <span>Dashboard</span>}
        </button>

        <button 
          onClick={() => navigate('repos')}
          title="Repositories"
          className={`flex items-center gap-3 rounded-xl text-xs font-medium btn-tactile cursor-pointer ${
            isSidebarCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full px-3 py-2.5'
          } ${currentScreen === 'repos' ? 'bg-primary/10 text-primary border border-primary/25 font-semibold' : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'}`}
        >
          <FolderGit2 size={16} />
          {!isSidebarCollapsed && <span>Repositories</span>}
        </button>

        <button 
          onClick={() => navigate('settings')}
          title="Settings"
          className={`flex items-center gap-3 rounded-xl text-xs font-medium btn-tactile cursor-pointer ${
            isSidebarCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full px-3 py-2.5'
          } ${currentScreen === 'settings' ? 'bg-primary/10 text-primary border border-primary/25 font-semibold' : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'}`}
        >
          <Sliders size={16} />
          {!isSidebarCollapsed && <span>Settings</span>}
        </button>
      </div>

      {currentRepo && (
        <div className={`mt-8 space-y-1 w-full ${isSidebarCollapsed ? 'flex flex-col items-center border-t border-border pt-4' : ''}`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Repository</span>
              <span className="text-[11px] font-semibold text-primary font-mono truncate max-w-[120px]" title={currentRepo}>
                {currentRepo}
              </span>
            </div>
          )}

          {repoItems.map(item => {
            const isActive = currentScreen === item.id;
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => navigate(item.id as any)}
                title={item.label}
                className={`flex items-center gap-3 rounded-xl text-xs font-medium btn-tactile cursor-pointer ${
                  isSidebarCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full px-3 py-2.5'
                } ${isActive ? 'bg-primary/10 text-primary border border-primary/25 font-semibold' : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'}`}
              >
                <Icon size={16} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};
