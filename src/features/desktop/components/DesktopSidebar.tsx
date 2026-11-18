import React from 'react';
import { useAppContext } from '../../../AppContext';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { DesktopSidebarUserCard } from './sidebar/DesktopSidebarUserCard';
import { DesktopSidebarNav } from './sidebar/DesktopSidebarNav';

interface DesktopSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  sidebarWidth: number;
  onSidebarWidthChange: (width: number) => void;
  onResetSidebarWidth: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  sidebarWidth,
  onSidebarWidthChange,
  onResetSidebarWidth,
}) => {
  const { currentScreen, currentRepo, navigate, githubUser, disconnectGitHub, connectGitHub, githubToken, openCommandPalette } = useAppContext();
  const [isDragging, setIsDragging] = React.useState(false);

  const handleStartResize = (e: React.MouseEvent) => {
    if (isSidebarCollapsed) return;
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startW = sidebarWidth;

    const onMove = (moveEvt: MouseEvent) => {
      const next = Math.max(200, Math.min(360, startW + (moveEvt.clientX - startX)));
      onSidebarWidthChange(next);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <aside
      style={{ width: isSidebarCollapsed ? '72px' : `${sidebarWidth}px` }}
      className={`bg-card border-r border-border flex flex-col justify-between shrink-0 h-full relative z-20 ${
        isDragging ? '' : 'transition-[width] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]'
      }`}
    >
      <div className={`flex flex-col overflow-y-auto no-scrollbar flex-1 ${isSidebarCollapsed ? 'p-2 items-center' : 'p-4 lg:p-5'}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'} mb-5 px-1`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path d="M50 15L85 35V65L50 85L15 65V35L50 15Z" fill="rgba(255,255,255,0.2)" stroke="#FFF" strokeWidth="6"/>
                <path d="M50 15L85 35L50 55L15 35L50 15Z" fill="#FFF"/>
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-base tracking-tight whitespace-nowrap block">Git <span className="text-primary">Manager</span></span>
                <span className="block text-[9px] text-text-muted font-bold tracking-widest uppercase truncate">Studio Workbench</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-hover/60 transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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

      <button
        type="button"
        onClick={openCommandPalette}
        className={`w-full p-3 border-t border-border bg-hover/10 hover:bg-hover/30 transition-colors flex items-center cursor-pointer ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} text-[11px] text-text-muted font-medium`}
        title="Open Command Palette (Cmd/Ctrl+K)"
        aria-label="Open Command Palette"
      >
        {!isSidebarCollapsed ? (
          <>
            <span className="text-[11px] text-text-muted">Command Palette</span>
            <kbd className="font-mono text-[10px] bg-hover px-1.5 py-0.5 rounded border border-border text-text-main font-semibold">
              ⌘K
            </kbd>
          </>
        ) : (
          <kbd className="font-mono text-[10px] text-text-muted font-semibold">⌘K</kbd>
        )}
      </button>

      {!isSidebarCollapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          aria-valuemin={200}
          aria-valuemax={360}
          aria-valuenow={sidebarWidth}
          tabIndex={0}
          onMouseDown={handleStartResize}
          onDoubleClick={onResetSidebarWidth}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              onSidebarWidthChange(Math.max(200, sidebarWidth - 12));
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              onSidebarWidthChange(Math.min(360, sidebarWidth + 12));
            }
          }}
          title="Drag to resize sidebar (double-click to reset)"
          className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 focus-visible:bg-primary/60 transition-colors outline-none"
        />
      )}
    </aside>
  );
};
