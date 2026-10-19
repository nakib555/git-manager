import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { Files, GitCommit, GitBranch, GitPullRequest, BarChart2 } from 'lucide-react';

export const RepoTabs: React.FC = () => {
  const { currentScreen, navigate, currentRepo } = useAppContext();
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
      className="shrink-0 h-11 px-4 flex items-center gap-2 overflow-x-auto bg-background border-b border-border no-scrollbar select-none z-20"
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={isActive ? activeTabRef : null}
            onClick={() => navigate(tab.id as any)}
            className={`h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              isActive
                ? 'bg-accent text-white shadow-sm shadow-accent/25 font-bold'
                : 'bg-surface-2 text-text-secondary hover:text-text-primary border border-border active:scale-96'
            }`}
          >
            <Icon size={13} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

// Backwards compatibility alias
export const MobileRepoTabs = RepoTabs;
