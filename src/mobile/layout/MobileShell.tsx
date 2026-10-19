import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { MobileHeader } from './MobileHeader';
import { RepoTabs } from './RepoTabs';
import { BottomNav } from './BottomNav';
import { PullToRefresh } from '../components/PullToRefresh';
import { ActionSheet } from '../components/ActionSheet';
import { MobileDrawer } from '../components/MobileDrawer';
import { Toast } from '../components/Toast';

// Canonical Mobile Screens
import { Dashboard } from '../screens/Dashboard';
import { Repositories } from '../screens/Repositories';
import { Clone } from '../screens/Clone';
import { Activity } from '../screens/Activity';
import { Settings } from '../screens/Settings';

// Canonical Repo Sub-screens
import { FilesScreen } from '../screens/repo/FilesScreen';
import { CommitsScreen } from '../screens/repo/CommitsScreen';
import { BranchesScreen } from '../screens/repo/BranchesScreen';
import { PRsScreen } from '../screens/repo/PRsScreen';
import { InsightsScreen } from '../screens/repo/InsightsScreen';

export const MobileShell: React.FC = () => {
  const { currentScreen } = useAppContext();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  return (
    <div className="flex flex-col w-full h-full bg-background text-text-primary relative overflow-hidden select-none">
      <div className="w-full flex flex-col h-full relative">
        {/* 1. Sticky 56px Top Header with Safe Area */}
        <MobileHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenActionSheet={() => setIsActionSheetOpen(true)}
        />

        {/* 2. Optional Contextual 44px Repo Sub-tabs */}
        <RepoTabs />

        {/* 3. Main Scrollport with Damped Pull-to-Refresh & Safe Bottom Padding */}
        <PullToRefresh>
          {currentScreen === 'dash' && <Dashboard />}
          {currentScreen === 'repos' && <Repositories />}
          {currentScreen === 'clone' && <Clone />}
          {currentScreen === 'activity' && <Activity />}
          {currentScreen === 'settings' && <Settings />}
          {currentScreen === 'files' && <FilesScreen />}
          {currentScreen === 'commits' && <CommitsScreen />}
          {currentScreen === 'branches' && <BranchesScreen />}
          {currentScreen === 'prs' && <PRsScreen />}
          {currentScreen === 'insights' && <InsightsScreen />}
        </PullToRefresh>

        {/* 4. Fixed 56px Bottom Navigation */}
        <BottomNav />
      </div>

      {/* 5. Interactive Overlays & Drawers */}
      <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
      />
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* 6. Floating Top Toast */}
      <Toast />
    </div>
  );
};

export const AppMobileShell = MobileShell;
