import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { Files, GitCommit, GitBranch, GitPullRequest, BarChart2 } from 'lucide-react';

export const MobileRepoTabs: React.FC = () => {
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
      className="shrink-0 h-11 px-4 flex items-center gap-2 overflow-x-auto bg-[#0A0A0B] border-b border-[#2A2A2E] no-scrollbar select-none z-20"
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
                ? 'bg-[#3B82F6] text-white shadow-sm shadow-[#3B82F6]/25 font-bold'
                : 'bg-[#1A1A1D] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#2A2A2E] active:scale-96'
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
