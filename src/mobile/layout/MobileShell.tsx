import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { MobileHeader } from './MobileHeader';
import { MobileRepoTabs } from './MobileRepoTabs';
import { MobileBottomNav } from './MobileBottomNav';
import { MobilePullToRefresh } from '../components/MobilePullToRefresh';
import { MobileActionSheet } from '../components/MobileActionSheet';
import { MobileDrawer } from '../components/MobileDrawer';
import { MobileToast } from '../components/MobileToast';

// Screens
import { MobileDashboard } from '../screens/MobileDashboard';
import { MobileRepositories } from '../screens/MobileRepositories';
import { MobileClone } from '../screens/MobileClone';
import { MobileActivity } from '../screens/MobileActivity';
import { MobileSettings } from '../screens/MobileSettings';

// Repo Sub-screens
import { MobileFiles } from '../screens/repo/MobileFiles';
import { MobileCommits } from '../screens/repo/MobileCommits';
import { MobileBranches } from '../screens/repo/MobileBranches';
import { MobilePRs } from '../screens/repo/MobilePRs';
import { MobileInsights } from '../screens/repo/MobileInsights';

// Unauthenticated component
import { UnauthenticatedState } from '../../components/UnauthenticatedState';

export const MobileShell: React.FC = () => {
  const { currentScreen, githubToken } = useAppContext();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0A0B] text-[#F4F4F5] relative overflow-hidden select-none">
      {/* 1. Sticky 56px Top Header with Safe Area */}
      <MobileHeader
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenActionSheet={() => setIsActionSheetOpen(true)}
      />

      {/* 2. Optional Contextual 44px Repo Sub-tabs */}
      <MobileRepoTabs />

      {/* 3. Main Scrollport with Damped Pull-to-Refresh & Safe Bottom Padding */}
      {!githubToken && currentScreen !== 'settings' && currentScreen !== 'repos' ? (
        <MobilePullToRefresh>
          <UnauthenticatedState />
        </MobilePullToRefresh>
      ) : (
        <MobilePullToRefresh>
          {currentScreen === 'dash' && <MobileDashboard />}
          {currentScreen === 'repos' && <MobileRepositories />}
          {currentScreen === 'clone' && <MobileClone />}
          {currentScreen === 'activity' && <MobileActivity />}
          {currentScreen === 'settings' && <MobileSettings />}
          {currentScreen === 'files' && <MobileFiles />}
          {currentScreen === 'commits' && <MobileCommits />}
          {currentScreen === 'branches' && <MobileBranches />}
          {currentScreen === 'prs' && <MobilePRs />}
          {currentScreen === 'insights' && <MobileInsights />}
        </MobilePullToRefresh>
      )}

      {/* 4. Fixed 56px Bottom Navigation */}
      <MobileBottomNav />

      {/* 5. Interactive Overlays & Drawers */}
      <MobileActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
      />
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* 6. Floating Top Toast */}
      <MobileToast />
    </div>
  );
};
