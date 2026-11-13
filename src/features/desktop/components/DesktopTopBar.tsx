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
    <header className="h-14 px-6 border-b border-border flex items-center justify-between gap-4 shrink-0 bg-card z-10">
      <div className="min-w-0 flex items-center">
        {isRepoScreen && currentRepo ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted select-none">
            <span onClick={() => navigate('repos')} className="hover:text-text-main cursor-pointer transition-colors">
              Repositories
            </span>
            <span className="text-border">/</span>
            <span className="font-semibold text-text-main truncate max-w-[130px]">{currentRepo}</span>
            {currentBranch && (
              <>
                <span className="text-border">/</span>
                <span className="font-mono text-[11px] text-accent truncate max-w-[90px]">{currentBranch}</span>
              </>
            )}
            <span className="text-border">/</span>
            <span className="capitalize text-text-muted">{currentScreen}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted select-none">
            <span>Git Manager</span>
            <span className="text-border">/</span>
            <span className="font-semibold text-text-main capitalize">
              {currentScreen === 'dash' ? 'Overview' : currentScreen === 'repos' ? 'Repositories' : currentScreen}
            </span>
          </div>
        )}
      </div>

      <div 
        onClick={openCommandPalette}
        className="w-64 lg:w-80 bg-card hover:bg-hover/30 border border-border hover:border-primary/40 rounded-xl px-3.5 h-9 flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs group select-none shrink-0"
        title="Press Cmd+K or Ctrl+K to open palette"
      >
        <div className="flex items-center gap-2 text-xs text-text-muted truncate">
          <Search size={14} className="group-hover:text-primary transition-colors shrink-0" />
          <span className="truncate">Search or type a command...</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] text-text-muted bg-hover/80 px-1.5 py-0.5 rounded border border-border/70 font-semibold shrink-0">
          <Command size={10} />
          <span>K</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button 
          type="button"
          onClick={() => refreshData()}
          className={`hidden md:flex items-center gap-2 h-9 px-3 rounded-xl border text-xs btn-tactile cursor-pointer shadow-xs ${
            isAutoSyncing 
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
              : 'border-border bg-card hover:bg-hover/40 text-text-muted hover:text-text-main'
          }`}
          title="Live background sync. Click to refresh now."
        >
          <RefreshCw size={12} className={`transition-transform duration-500 ${isAutoSyncing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : 'text-text-muted'}`} />
          <span className="font-mono text-[11px] tabular-nums">
            {isAutoSyncing ? 'Syncing...' : 'Live Sync'}
          </span>
        </button>

        {isRepoScreen && currentRepo && (
          <button 
            onClick={openZipSync}
            className="bg-accent/10 border border-accent/30 hover:border-accent text-accent hover:bg-accent/20 text-xs font-semibold h-9 px-3.5 rounded-xl btn-tactile shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Sync changes from AI Studio ZIP package"
          >
            <Sparkles size={13} className="text-accent" />
            <span>Sync ZIP</span>
          </button>
        )}

        <button 
          onClick={() => navigate('clone')}
          className="bg-card border border-border hover:border-primary/50 text-text-main hover:text-primary text-xs font-semibold h-9 px-3.5 rounded-xl btn-tactile shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <HardDrive size={13} className="text-primary" />
          <span className="hidden sm:inline">Clone Repo</span>
        </button>

        <button 
          onClick={() => openModal('repo')}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-9 px-3.5 rounded-xl btn-tactile shadow-sm shadow-primary/15 flex items-center gap-1.5 cursor-pointer"
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
