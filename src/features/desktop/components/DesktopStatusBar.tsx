import React from 'react';
import { GitBranch, FolderGit2, Terminal, ShieldCheck, Command, GitCommit, GitPullRequest } from 'lucide-react';
import { useAppContext } from '../../../AppContext';

interface DesktopStatusBarProps {
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
}

export const DesktopStatusBar: React.FC<DesktopStatusBarProps> = ({
  isTerminalOpen,
  onToggleTerminal,
}) => {
  const {
    currentRepo,
    currentRepoOwner,
    currentBranch,
    activeCommits,
    activePRs,
    githubToken,
    demoMode,
    adminModeOverride,
    toggleAdminMode,
    navigate,
    openCommandPalette,
  } = useAppContext();

  const openPrCount = (activePRs || []).filter(
    (p: any) => p.status === 'Open' || p.status === 'Draft'
  ).length;

  return (
    <footer
      className="h-7 px-3 border-t border-border bg-card text-[11px] text-text-secondary flex items-center justify-between gap-3 shrink-0 select-none z-20"
      aria-label="Workspace status bar"
    >
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        <button
          type="button"
          onClick={() => navigate(currentRepo ? 'files' : 'repos')}
          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-hover hover:text-text-primary transition-colors cursor-pointer min-w-0 whitespace-nowrap"
          title={currentRepo ? `Open ${currentRepo} files` : 'Browse repositories'}
        >
          <FolderGit2 size={12} className="text-primary shrink-0" />
          <span className="font-mono font-medium truncate max-w-[180px]">
            {currentRepo ? `${currentRepoOwner ? `${currentRepoOwner}/` : ''}${currentRepo}` : 'No repository open'}
          </span>
        </button>

        {currentRepo && (
          <>
            <span className="text-border" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigate('branches')}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-hover hover:text-text-primary transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Manage branches"
            >
              <GitBranch size={12} className="text-accent shrink-0" />
              <span className="font-mono">{currentBranch || 'main'}</span>
            </button>

            <span className="hidden sm:inline text-border" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigate('commits')}
              className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-hover hover:text-text-primary transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
              title="View commit history"
            >
              <GitCommit size={12} />
              <span>{activeCommits.length} commits</span>
            </button>

            <span className="hidden md:inline text-border" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigate('prs')}
              className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-hover hover:text-text-primary transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
              title="View pull requests"
            >
              <GitPullRequest size={12} />
              <span>{openPrCount} open PRs</span>
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden lg:inline text-[10px] text-text-tertiary whitespace-nowrap">
          {githubToken ? 'GitHub Synced' : demoMode ? 'Demo Workspace' : 'Local Workspace'}
        </span>

        <span className="hidden lg:inline text-border" aria-hidden="true">·</span>

        <button
          type="button"
          onClick={toggleAdminMode}
          className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-hover hover:text-text-primary transition-colors cursor-pointer whitespace-nowrap"
          title="Toggle repository authority mode"
        >
          <ShieldCheck size={12} className={adminModeOverride ? 'text-emerald-500' : 'text-text-tertiary'} />
          <span>{adminModeOverride ? 'Admin Authority' : 'Standard'}</span>
        </button>

        <button
          type="button"
          onClick={openCommandPalette}
          className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-hover hover:text-text-primary transition-colors cursor-pointer whitespace-nowrap font-mono text-[10px]"
          title="Open Command Palette (Cmd/Ctrl+K)"
        >
          <Command size={11} />
          <span>K</span>
        </button>

        <button
          type="button"
          onClick={onToggleTerminal}
          aria-expanded={isTerminalOpen}
          aria-controls="desktop-terminal-panel"
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors cursor-pointer whitespace-nowrap font-medium ${
            isTerminalOpen
              ? 'bg-primary/15 text-primary'
              : 'hover:bg-hover text-text-secondary hover:text-text-primary'
          }`}
          title="Toggle Workspace Terminal (Ctrl+`)"
        >
          <Terminal size={12} />
          <span>Terminal</span>
          <kbd className="hidden sm:inline font-mono text-[9px] text-text-tertiary border border-border rounded px-1">
            Ctrl+`
          </kbd>
        </button>
      </div>
    </footer>
  );
};
