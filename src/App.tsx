import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, useAppContext } from './AppContext';
import { Splash } from './components/Splash';
import { CreateModals } from './components/CreateModals';
import { useIsDesktop } from './hooks/useIsDesktop';
import { DesktopLayout } from './components/DesktopLayout';
import { CommandPalette } from './components/CommandPalette';
import { MobileShell } from './mobile/layout/MobileShell';

import { ZipSyncModal } from './components/sync/ZipSyncModal';
import { UnauthenticatedState } from './components/UnauthenticatedState';

const queryClient = new QueryClient();

const MainApp = () => {
  const { githubToken, isCommandPaletteOpen, closeCommandPalette, isZipSyncOpen, closeZipSync } = useAppContext();
  const isDesktop = useIsDesktop();

  if (!githubToken) {
    return (
      <div className="flex flex-col w-full h-full bg-background text-text-primary relative overflow-y-auto justify-center items-center">
        <UnauthenticatedState />
        <CreateModals />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-background text-text-primary opacity-0 animate-[fadeUp_0.3s_ease_forwards] relative">
      {isDesktop ? (
        <DesktopLayout />
      ) : (
        <MobileShell />
      )}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
      <ZipSyncModal isOpen={isZipSyncOpen} onClose={closeZipSync} />
      <CreateModals />
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
