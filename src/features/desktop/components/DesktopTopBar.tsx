import React from 'react';
import { useAppContext } from '../../../AppContext';
import { Search, RefreshCw, Sparkles, HardDrive, Sun, Moon, Command } from 'lucide-react';

interface DesktopTopBarProps {
  isRepoScreen: boolean;
}

export const DesktopTopBar: React.FC<DesktopTopBarProps> = ({ isRepoScreen }) => {
  const {
    currentScreen, currentRepo, currentBranch, navigate,
    refreshData, isAutoSyncing, openZipSync, openModal,
    toggleTheme, theme, openCommandPalette,
  } = useAppContext();

  return (
    <header className="h-14 px-4 lg:px-6 border-b border-border flex items-center justify-between gap-3 shrink-0 bg-card z-10">
      <nav aria-label="Breadcrumb" className="min-w-0 flex items-center">
        {isRepoScreen && currentRepo ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted min-w-0">
            <button
              type="button"
              onClick={() => navigate('repos')}
              className="hover:text-text-main cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              Repositories
            </button>
            <span className="text-border" aria-hidden="true">/</span>
            <button
              type="button"
              onClick={() => navigate('files')}
              className="font-semibold text-text-main truncate max-w-[130px] lg:max-w-[180px] hover:text-primary transition-colors cursor-pointer"
              title={currentRepo}
            >
              {currentRepo}
            </button>
            {currentBranch && (
              <>
                <span className="text-border hidden sm:inline" aria-hidden="true">/</span>
                <button
                  type="button"
                  onClick={() => navigate('branches')}
                  className="hidden sm:inline font-mono text-[11px] text-accent truncate max-w-[90px] lg:max-w-[130px] hover:underline cursor-pointer"
                  title={`Current branch: ${currentBranch}`}
                >
                  {currentBranch}
                </button>
              </>
            )}
            <span className="text-border hidden md:inline" aria-hidden="true">/</span>
            <span className="hidden md:inline capitalize text-text-muted whitespace-nowrap">{currentScreen}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <button
              type="button"
              onClick={() => navigate('dash')}
              className="hover:text-text-main cursor-pointer transition-colors whitespace-nowrap"
            >
              Git Manager
            </button>
            <span className="text-border" aria-hidden="true">/</span>
            <span className="font-semibold text-text-main capitalize whitespace-nowrap">
              {currentScreen === 'dash' ? 'Overview' : currentScreen === 'repos' ? 'Repositories' : currentScreen}
            </span>
          </div>
        )}
      </nav>

      <button
        type="button"
        onClick={openCommandPalette}
        className="w-52 lg:w-72 xl:w-80 bg-card hover:bg-hover/30 border border-border hover:border-primary/40 rounded-xl px-3 h-9 flex items-center justify-between transition-all duration-150 cursor-pointer shadow-xs group shrink-0"
        title="Press Cmd+K or Ctrl+K to open palette"
        aria-label="Open command palette"
      >
        <div className="flex items-center gap-2 text-xs text-text-muted truncate">
          <Search size={14} className="group-hover:text-primary transition-colors shrink-0" />
          <span className="truncate">Search or type a command...</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] text-text-muted bg-hover/80 px-1.5 py-0.5 rounded border border-border/70 font-semibold shrink-0 ml-2">
          <Command size={10} />
          <span>K</span>
        </div>
      </button>

      <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
        <button 
          type="button"
          onClick={() => refreshData()}
          className={`hidden md:flex items-center gap-1.5 h-9 px-2.5 lg:px-3 rounded-xl border text-xs btn-tactile cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
            isAutoSyncing 
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
              : 'border-border bg-card hover:bg-hover/40 text-text-muted hover:text-text-main'
          }`}
          title="Refresh workspace data"
          aria-label="Sync workspace data"
        >
          <RefreshCw size={12} className={`transition-transform duration-500 ${isAutoSyncing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : 'text-text-muted'}`} />
          <span className="hidden xl:inline font-mono text-[11px] tabular-nums">
            {isAutoSyncing ? 'Syncing...' : 'Sync'}
          </span>
        </button>

        {isRepoScreen && currentRepo && (
          <button 
            type="button"
            onClick={openZipSync}
            className="bg-accent/10 border border-accent/30 hover:border-accent text-accent hover:bg-accent/20 text-xs font-semibold h-9 px-2.5 lg:px-3 rounded-xl btn-tactile shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            title="Sync changes from ZIP package"
          >
            <Sparkles size={13} className="text-accent shrink-0" />
            <span className="hidden lg:inline">Sync ZIP</span>
          </button>
        )}

        <button 
          type="button"
          onClick={() => navigate('clone')}
          className="bg-card border border-border hover:border-primary/50 text-text-main hover:text-primary text-xs font-semibold h-9 px-2.5 lg:px-3 rounded-xl btn-tactile shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          title="Clone repository"
        >
          <HardDrive size={13} className="text-primary shrink-0" />
          <span className="hidden xl:inline">Clone Repo</span>
        </button>

        <button 
          type="button"
          onClick={() => openModal('repo')}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-9 px-3 lg:px-3.5 rounded-xl btn-tactile shadow-sm shadow-primary/15 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>+ New Repo</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 border border-border bg-surface-1 hover:bg-surface-2 hover:border-accent/40 rounded-xl flex items-center justify-center text-accent shrink-0 shadow-2xs btn-tactile cursor-pointer transition-colors"
          title={theme === 'light' ? 'Switch to Cloudflare Dark Mode' : 'Switch to Clean Light Mode'}
          aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
};
