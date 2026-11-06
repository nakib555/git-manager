import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { DesktopSidebar } from '../features/desktop/components/DesktopSidebar';
import { DesktopTopBar } from '../features/desktop/components/DesktopTopBar';
import { DesktopDashboard } from '../features/desktop/screens/DesktopDashboard';
import { DesktopRepositories } from '../features/desktop/screens/DesktopRepositories';
import { DesktopRepoWorkspace } from '../features/desktop/screens/DesktopRepoWorkspace';
import { DesktopSettings } from '../features/desktop/screens/DesktopSettings';

export const DesktopLayout: React.FC = () => {
  const { currentScreen, setRepoSearchQuery, githubToken, connectGitHub, openModal } = useAppContext();
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setRepoSearchQuery(globalSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [globalSearch, setRepoSearchQuery]);

  const isRepoScreen = ['files', 'commits', 'branches', 'insights', 'prs', 'clone'].includes(currentScreen);

  return (
    <div className="flex w-full h-full bg-main overflow-hidden text-text-main animate-fade-up">
      <DesktopSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-main relative">
        <DesktopTopBar isRepoScreen={isRepoScreen} />

        <div className="flex-1 overflow-hidden p-4 lg:p-6 relative min-h-0 flex flex-col">
          {!githubToken && (
            <div className="mb-4 px-4 py-2.5 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-between text-xs shrink-0 select-none">
              <div className="flex items-center gap-2.5 text-text-main">
                <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold">★</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-primary">Demo Mode:</span>
                  <span className="text-text-muted">Exploring sample repositories & commit graphs. Live GitHub sync is enabled once authenticated.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openModal('oauth_setup')}
                  className="px-3 py-1.5 bg-card hover:bg-hover border border-border text-text-main rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                >
                  Enter Token (PAT)
                </button>
                <button
                  onClick={connectGitHub}
                  className="px-3.5 py-1.5 bg-primary hover:opacity-90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Connect GitHub</span>
                </button>
              </div>
            </div>
          )}

          {currentScreen === 'dash' && (
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
              <DesktopDashboard globalSearch={globalSearch} />
            </div>
          )}
          {currentScreen === 'repos' && <DesktopRepositories globalSearch={globalSearch} />}
          {isRepoScreen && <DesktopRepoWorkspace />}
          {currentScreen === 'settings' && (
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
              <DesktopSettings />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
