import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../AppContext';
import { DesktopSidebar } from '../features/desktop/components/DesktopSidebar';
import { DesktopTopBar } from '../features/desktop/components/DesktopTopBar';
import { DesktopStatusBar } from '../features/desktop/components/DesktopStatusBar';
import { DesktopTerminalPanel } from '../features/desktop/components/DesktopTerminalPanel';
import { DesktopDashboard } from '../features/desktop/screens/DesktopDashboard';
import { DesktopRepositories } from '../features/desktop/screens/DesktopRepositories';
import { DesktopRepoWorkspace } from '../features/desktop/screens/DesktopRepoWorkspace';
import { DesktopSettings } from '../features/desktop/screens/DesktopSettings';

const DEFAULT_SIDEBAR_WIDTH = 248;

export const DesktopLayout: React.FC = () => {
  const { currentScreen, setRepoSearchQuery, githubToken, connectGitHub, openModal } = useAppContext();
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = parseInt(localStorage.getItem('gm_sidebar_width') || '', 10);
      if (Number.isFinite(saved) && saved >= 200 && saved <= 360) return saved;
      if (typeof window !== 'undefined' && window.innerWidth < 1200) return 216;
    } catch (_) {}
    return DEFAULT_SIDEBAR_WIDTH;
  });

  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gm_terminal_open') === 'true';
    } catch (_) {
      return false;
    }
  });

  const [terminalHeight, setTerminalHeight] = useState<number>(() => {
    try {
      const saved = parseInt(localStorage.getItem('gm_terminal_height') || '', 10);
      if (Number.isFinite(saved) && saved >= 160 && saved <= 520) return saved;
    } catch (_) {}
    return 240;
  });

  const handleSidebarWidthChange = useCallback((next: number) => {
    const clamped = Math.max(200, Math.min(360, Math.round(next)));
    setSidebarWidth(clamped);
    try {
      localStorage.setItem('gm_sidebar_width', String(clamped));
    } catch (_) {}
  }, []);

  const handleResetSidebarWidth = useCallback(() => {
    handleSidebarWidthChange(DEFAULT_SIDEBAR_WIDTH);
  }, [handleSidebarWidthChange]);

  const toggleTerminal = useCallback(() => {
    setIsTerminalOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('gm_terminal_open', String(next));
      } catch (_) {}
      return next;
    });
  }, []);

  const handleTerminalHeightChange = useCallback((next: number) => {
    const clamped = Math.max(160, Math.min(520, Math.round(next)));
    setTerminalHeight(clamped);
    try {
      localStorage.setItem('gm_terminal_height', String(clamped));
    } catch (_) {}
  }, []);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [toggleTerminal]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setRepoSearchQuery(globalSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [globalSearch, setRepoSearchQuery]);

  const isRepoScreen = ['files', 'commits', 'branches', 'insights', 'prs', 'clone'].includes(currentScreen);

  return (
    <div className="flex flex-col w-full h-full bg-main overflow-hidden text-text-main animate-fade-up">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <DesktopSidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          sidebarWidth={sidebarWidth}
          onSidebarWidthChange={handleSidebarWidthChange}
          onResetSidebarWidth={handleResetSidebarWidth}
        />

        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-main relative">
          <DesktopTopBar isRepoScreen={isRepoScreen} />

          <div className="flex-1 overflow-hidden p-4 lg:p-6 relative min-h-0 flex flex-col">
            {!githubToken && (
              <div className="mb-4 px-4 py-2.5 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-between gap-3 text-xs shrink-0 max-w-[1600px] mx-auto w-full">
                <div className="flex items-center gap-2 text-text-main min-w-0">
                  <span className="font-bold text-primary shrink-0">Demo Mode</span>
                  <span className="text-border shrink-0" aria-hidden="true">·</span>
                  <span className="text-text-muted truncate">
                    Exploring sample repositories and commit graphs. Connect GitHub for live remote sync.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openModal('oauth_setup')}
                    className="px-3 py-1.5 bg-card hover:bg-hover border border-border text-text-main rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    Enter Token
                  </button>
                  <button
                    type="button"
                    onClick={connectGitHub}
                    className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <span>Connect GitHub</span>
                  </button>
                </div>
              </div>
            )}

            {currentScreen === 'dash' && (
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar min-h-0">
                <DesktopDashboard globalSearch={globalSearch} />
              </div>
            )}
            {currentScreen === 'repos' && <DesktopRepositories globalSearch={globalSearch} />}
            {isRepoScreen && <DesktopRepoWorkspace />}
            {currentScreen === 'settings' && (
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar min-h-0">
                <DesktopSettings />
              </div>
            )}
          </div>

          {isTerminalOpen && (
            <DesktopTerminalPanel
              height={terminalHeight}
              onHeightChange={handleTerminalHeightChange}
              onClose={() => {
                setIsTerminalOpen(false);
                try {
                  localStorage.setItem('gm_terminal_open', 'false');
                } catch (_) {}
              }}
            />
          )}
        </main>
      </div>

      <DesktopStatusBar
        isTerminalOpen={isTerminalOpen}
        onToggleTerminal={toggleTerminal}
      />
    </div>
  );
};
