import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { Files, GitCommit, GitBranch, GitPullRequest, BarChart2, Sparkles } from 'lucide-react';

export const RepoTabs: React.FC = () => {
  const { currentScreen, navigate, currentRepo, openZipSync } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const isRepoScreen = ['files', 'commits', 'branches', 'prs', 'insights'].includes(currentScreen);

  const tabs = [
    { id: 'files', label: 'Files', icon: Files },
    { id: 'commits', label: 'Commits', icon: GitCommit },
    { id: 'branches', label: 'Branches', icon: GitBranch },
    { id: 'prs', label: 'PRs', icon: GitPullRequest },
    { id: 'insights', label: 'Insights', icon: BarChart2 },
  ] as const;

  // Auto-center the active sub-tab with smooth physics
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeTab = activeTabRef.current;
      const containerWidth = container.offsetWidth;
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;
      const targetScroll = tabLeft - (containerWidth / 2) + (tabWidth / 2);

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  }, [currentScreen]);

  if (!isRepoScreen || !currentRepo) return null;

  return (
    <nav
      ref={containerRef}
      aria-label="Repository Sub-navigation"
      className="shrink-0 h-11 px-4 flex items-center gap-2 overflow-x-auto bg-surface-1/60 backdrop-blur-xs border-b border-border no-scrollbar select-none z-20"
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={isActive ? activeTabRef : null}
            onClick={() => navigate(tab.id as any)}
            className={`h-8 px-3 rounded-xl text-xs whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 ${
              isActive
                ? 'bg-text-primary text-background font-bold shadow-xs'
                : 'bg-surface-2/60 text-text-secondary hover:text-text-primary border border-border/80 hover:bg-surface-2 font-medium active:scale-95'
            }`}
          >
            <Icon size={14} strokeWidth={isActive ? 2.4 : 1.9} className="shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={openZipSync}
        className="h-8 px-3 rounded-xl text-xs whitespace-nowrap bg-accent/15 border border-accent/30 text-accent font-bold cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition-all ml-1"
        title="Sync changes from AI Studio ZIP package"
      >
        <Sparkles size={13} />
        <span>Sync ZIP</span>
      </button>
    </nav>
  );
};

// Backwards compatibility alias
export const MobileRepoTabs = RepoTabs;
