import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, useAppContext } from './AppContext';
import { Header, BottomNav, RepoTabs } from './components/Layout';
import { ActionSheet, NotificationDrawer, Toast } from './components/UI';
import { Splash } from './components/Splash';
import { CreateModals } from './components/CreateModals';
import { PullToRefresh } from './components/PullToRefresh';
import { useIsDesktop } from './hooks/useIsDesktop';
import { DesktopLayout } from './components/DesktopLayout';
import { Dashboard } from './screens/Dashboard';
import { Repositories } from './screens/Repositories';
import { RepoDetails } from './screens/RepoDetails';
import { CloneScreen } from './screens/CloneScreen';
import { Settings } from './screens/Settings';

const queryClient = new QueryClient();

const MainApp = () => {
  const { currentScreen } = useAppContext();
  const isDesktop = useIsDesktop();

  return (
    <div className="flex flex-col w-full h-full bg-main opacity-0 animate-[fadeUp_0.3s_ease_forwards] relative">
      {isDesktop ? (
        <DesktopLayout />
      ) : (
        <>
          <Header />
          <RepoTabs />
          <PullToRefresh>
            {currentScreen === 'dash' && <Dashboard />}
            {currentScreen === 'repos' && <Repositories />}
            {['commits', 'prs', 'branches', 'files', 'insights'].includes(currentScreen) && <RepoDetails />}
            {currentScreen === 'clone' && <CloneScreen />}
            {currentScreen === 'settings' && <Settings />}
          </PullToRefresh>
          <BottomNav />
          <ActionSheet />
          <NotificationDrawer />
        </>
      )}
      <CreateModals />
      <Toast />
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <div className="w-full h-full relative bg-main">
          {showSplash ? (
            <Splash onComplete={() => setShowSplash(false)} />
          ) : (
            <MainApp />
          )}
        </div>
      </AppProvider>
    </QueryClientProvider>
  );
}
