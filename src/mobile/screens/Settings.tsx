import React from 'react';
import { useAppContext } from '../../AppContext';
import { Trash2 } from 'lucide-react';
import { SettingsAuthCard } from './settings/SettingsAuthCard';
import { SettingsThemeList } from './settings/SettingsThemeList';

export const Settings: React.FC = () => {
  const { 
    githubUser, 
    connectGitHub, 
    disconnectGitHub, 
    theme, 
    setTheme, 
    showToast
  } = useAppContext();

  const handleClearCache = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith('local_') || k === 'gm_custom_commits' || k === 'git_manager_repos_cache') {
          localStorage.removeItem(k);
        }
      });
      sessionStorage.clear();
    } catch (_) {}
    showToast('Local repository cache purged successfully', 'success');
  };

  return (
    <div className="px-4 py-4 space-y-6 pb-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary tracking-tight">Settings</h2>
        <p className="text-xs text-text-tertiary mt-0.5">
          Manage your GitHub connection, visual preferences, and local data storage.
        </p>
      </div>

      <SettingsAuthCard
        githubUser={githubUser}
        onConnect={connectGitHub}
        onDisconnect={disconnectGitHub}
      />

      <SettingsThemeList
        theme={theme}
        onThemeSelect={setTheme}
      />

      <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3 shadow-2xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
          Cache & Storage
        </span>
        <p className="text-xs text-text-secondary leading-relaxed">
          Clear cached repository data and locally simulated commit records stored in browser storage.
        </p>

        <button
          type="button"
          onClick={handleClearCache}
          className="h-11 px-4 rounded-xl bg-surface-2 border border-border hover:bg-surface-3 text-text-primary text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Trash2 size={15} className="text-text-tertiary" />
          <span>Purge Local Storage Cache</span>
        </button>
      </div>

      <div className="text-center text-[11px] text-text-tertiary font-mono pt-2 space-y-1">
        <span>Git Manager PWA · v2.5.0</span>
        <p>Built for mobile-first version management.</p>
      </div>
    </div>
  );
};

export const MobileSettings = Settings;
