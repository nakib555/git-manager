import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Automatically activate new service worker and refresh the application
    console.info('[PWA] New version detected, auto-upgrading application...');
    updateSW(true);
  },
  onOfflineReady() {
    console.info('[PWA] Application cached and ready for offline use.');
  },
  onRegistered(registration) {
    if (registration) {
      // Check for new releases periodically (every 30 minutes)
      setInterval(() => {
        registration.update().catch((err) => {
          console.debug('[PWA] Periodic update check completed:', err);
        });
      }, 30 * 60 * 1000);

      // Check for updates when window gains focus
      window.addEventListener('focus', () => {
        registration.update().catch(() => {});
      });

      // Check when app tab becomes visible again
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
    }
  },
  onRegisterError(error) {
    console.warn('[PWA] Service worker registration error:', error);
  },
});

// Provide a global updater trigger for UI buttons (e.g. Settings "Check for Updates")
(window as any).__pwaUpdateCheck = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        return true;
      }
    } catch (_) {}
  }
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
