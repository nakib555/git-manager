import React, { useState } from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { Header, BottomNav, RepoTabs } from './components/Layout';
import { ActionSheet, NotificationDrawer, Toast } from './components/UI';
import { Splash } from './components/Splash';
import { CreateModals } from './components/CreateModals';

import { Dashboard } from './screens/Dashboard';
import { Repositories } from './screens/Repositories';
import { RepoDetails } from './screens/RepoDetails';
import { Settings } from './screens/Settings';

const MainApp = () => {
  const { currentScreen } = useAppContext();

  return (
    <div className="flex flex-col w-full h-full bg-main opacity-0 animate-[fadeUp_0.3s_ease_forwards] relative">
      <Header />
      <RepoTabs />
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-5 no-scrollbar relative">
        {currentScreen === 'dash' && <Dashboard />}
        {currentScreen === 'repos' && <Repositories />}
        {['commits', 'prs', 'branches', 'files', 'insights'].includes(currentScreen) && <RepoDetails />}
        {currentScreen === 'settings' && <Settings />}
      </main>
      <BottomNav />
      <ActionSheet />
      <NotificationDrawer />
      <CreateModals />
      <Toast />
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AppProvider>
      <div className="w-full h-full relative bg-main">
        {showSplash ? (
          <Splash onComplete={() => setShowSplash(false)} />
        ) : (
          <MainApp />
        )}
      </div>
    </AppProvider>
  );
}
