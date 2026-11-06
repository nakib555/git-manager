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
          className={`hidden md:flex items-center gap-2 h-9 px-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            isAutoSyncing 
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' 
              : 'border-border/80 bg-card hover:bg-hover/20 text-xs text-text-muted hover:border-primary/40 hover:text-text-main'
          }`}
          title="Auto-syncs live every 15 seconds. Click to refresh now."
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAutoSyncing ? 'bg-emerald-300 opacity-90' : 'bg-emerald-400 opacity-60'}`}></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] font-medium tracking-tight">
            {isAutoSyncing ? 'Syncing...' : '15s Live Sync'}
          </span>
          <RefreshCw size={12} className={`transition-transform duration-500 ${isAutoSyncing ? 'animate-spin text-emerald-400' : 'text-text-muted'}`} />
        </button>

        {isRepoScreen && currentRepo && (
          <button 
            onClick={openZipSync}
            className="bg-accent/15 border border-accent/35 hover:border-accent text-accent hover:bg-accent/25 text-xs font-bold h-9 px-3.5 rounded-xl active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Sync changes from AI Studio ZIP package"
          >
            <Sparkles size={13} className="text-accent" />
            <span>Sync ZIP</span>
          </button>
        )}

        <button 
          onClick={() => navigate('clone')}
          className="bg-card border border-border hover:border-primary/50 text-text-main hover:text-primary text-xs font-bold h-9 px-3.5 rounded-xl active:scale-95 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <HardDrive size={13} className="text-primary" />
          <span className="hidden sm:inline">Clone Repo</span>
        </button>

        <button 
          onClick={() => openModal('repo')}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold h-9 px-3.5 rounded-xl active:scale-95 transition-all shadow-sm shadow-primary/15 flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ New Repo</span>
        </button>

        <button 
          onClick={toggleTheme}
          className="w-9 h-9 border border-border bg-card rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary/30 transition-all cursor-pointer shrink-0"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
};
