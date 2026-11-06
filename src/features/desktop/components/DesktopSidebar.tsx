import React from 'react';
import { useAppContext } from '../../../AppContext';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { DesktopSidebarUserCard } from './sidebar/DesktopSidebarUserCard';
import { DesktopSidebarNav } from './sidebar/DesktopSidebarNav';

interface DesktopSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}) => {
  const { currentScreen, currentRepo, navigate, githubUser, disconnectGitHub, connectGitHub, githubToken } = useAppContext();

  return (
    <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-card border-r border-border flex flex-col justify-between shrink-0 h-full transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] relative z-20`}>
      <div className={`flex flex-col overflow-y-auto no-scrollbar flex-1 ${isSidebarCollapsed ? 'p-2 items-center' : 'p-6'}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'} mb-6 px-1`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none">
                <path d="M50 15L85 35V65L50 85L15 65V35L50 15Z" fill="rgba(255,255,255,0.2)" stroke="#FFF" strokeWidth="6"/>
                <path d="M50 15L85 35L50 55L15 35L50 15Z" fill="#FFF"/>
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <div>
                <span className="font-bold text-lg tracking-tight">Git <span className="text-primary">Manager</span></span>
                <span className="block text-[9px] text-text-muted font-bold tracking-widest uppercase">Studio Workbench</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-hover/60 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <DesktopSidebarUserCard
          isSidebarCollapsed={isSidebarCollapsed}
          githubUser={githubUser}
          githubToken={githubToken}
          connectGitHub={connectGitHub}
          disconnectGitHub={disconnectGitHub}
        />

        <DesktopSidebarNav
          isSidebarCollapsed={isSidebarCollapsed}
          currentScreen={currentScreen}
          currentRepo={currentRepo}
          navigate={navigate}
        />
      </div>

      <div className={`p-3.5 border-t border-border bg-hover/10 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} text-[11px] text-text-muted font-medium`}>
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] text-text-muted">Command Palette</span>
            <kbd className="font-mono text-[10px] bg-hover px-1.5 py-0.5 rounded border border-border text-text-main font-semibold">
              ⌘K
            </kbd>
          </div>
        ) : (
          <span className="font-mono text-[10px] text-text-muted font-semibold">⌘K</span>
        )}
      </div>
    </aside>
  );
};
