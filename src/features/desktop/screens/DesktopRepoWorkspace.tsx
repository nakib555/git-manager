import React from 'react';
import { useAppContext } from '../../../AppContext';
import { DesktopFilesView } from './DesktopFilesView';
import { DesktopCommitsView } from './DesktopCommitsView';
import { DesktopBranchesView } from './DesktopBranchesView';
import { DesktopInsightsView } from './DesktopInsightsView';
import { DesktopPRsView } from './DesktopPRsView';
import { DesktopCloneScreen } from './DesktopCloneScreen';

export const DesktopRepoWorkspace: React.FC = () => {
  const { currentScreen, isLoadingRepoDetails, activeCommits, activeBranches, activeFiles, isAutoSyncing } = useAppContext();
  const hasWorkspaceData = (activeCommits && activeCommits.length > 0) || (activeBranches && activeBranches.length > 0) || (activeFiles && activeFiles.length > 0);

  return (
    <div className="w-full space-y-6 flex-1 flex flex-col min-h-0 relative">
      {isLoadingRepoDetails && !hasWorkspaceData && currentScreen !== 'files' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-text-muted font-bold tracking-widest uppercase">Loading repository details...</span>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col relative">
          {isAutoSyncing && (
            <div className="absolute top-2 right-4 z-30 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/90 backdrop-blur-xs border border-emerald-500/30 text-[10px] font-medium text-emerald-400 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Syncing workspace...</span>
            </div>
          )}
          {currentScreen === 'files' && <DesktopFilesView />}
          {currentScreen === 'commits' && <DesktopCommitsView />}
          {currentScreen === 'prs' && (
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
              <DesktopPRsView />
            </div>
          )}
          {currentScreen === 'branches' && <DesktopBranchesView />}
          {currentScreen === 'insights' && <DesktopInsightsView />}
          {currentScreen === 'clone' && <DesktopCloneScreen />}
        </div>
      )}
    </div>
  );
};
