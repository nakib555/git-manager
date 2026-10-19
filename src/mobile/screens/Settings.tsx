import React from 'react';
import { useAppContext } from '../../AppContext';
import { 
  Github, Moon, Sun, Sparkles, 
  Trash2, CheckCircle2, Check
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { 
    githubUser, 
    githubToken, 
    connectGitHub, 
    disconnectGitHub, 
    theme, 
    setTheme, 
    showToast 
  } = useAppContext();

  const handleClearCache = () => {
    localStorage.removeItem('gm_custom_commits');
    localStorage.removeItem('git_manager_repos_cache');
    showToast('Local cache cleared successfully', 'success');
  };

  const themes = [
    {
      id: 'dark',
      name: 'Dark Charcoal',
      badge: 'Default',
      bgHex: '#0A0A0B',
      surfaceHex: '#121214',
      accentHex: '#3B82F6',
      desc: 'Calibrated charcoal workstation with desaturated steel blue accent',
      icon: Moon,
    },
    {
      id: 'light',
      name: 'Warm Off-White',
      badge: 'Daylight',
      bgHex: '#F8F7F4',
      surfaceHex: '#FFFFFF',
      accentHex: '#3B6FE0',
      desc: 'Warm off-white engineering surface with slate borders and typography',
      icon: Sun,
    },
    {
      id: 'fantasy',
      name: 'Deep Indigo',
      badge: 'Midnight',
      bgHex: '#0F0E17',
      surfaceHex: '#16152A',
      accentHex: '#9B7EED',
      desc: 'Deep indigo midnight atmosphere with soft violet accent',
      icon: Sparkles,
    },
  ] as const;

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary tracking-tight">Settings</h2>
        <p className="text-xs text-text-tertiary mt-0.5">
          Manage your GitHub connection, visual preferences, and local data storage.
        </p>
      </div>

      {/* 1. GitHub Connection & Profile Status */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            GitHub Connection
          </span>
          <span className={`text-[11px] font-mono font-semibold ${
            githubUser 
              ? 'text-success' 
              : 'text-text-tertiary'
          }`}>
            {githubUser ? 'Connected' : 'Offline / Guest'}
          </span>
        </div>

        {githubUser ? (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <img 
                src={githubUser.avatar_url} 
                alt={githubUser.login} 
                className="w-12 h-12 rounded-full border border-border object-cover"
              />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {githubUser.name || githubUser.login}
                </h3>
                <span className="text-xs text-text-tertiary block font-mono">
                  @{githubUser.login}
                </span>
              </div>
            </div>

            <button
              onClick={disconnectGitHub}
              className="h-8 px-3 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-text-secondary leading-relaxed">
              Connect your GitHub account or use a Personal Access Token (PAT) to commit code, manage pull requests, and synchronize workspaces.
            </p>
            <button
              onClick={connectGitHub}
              className="w-full h-11 rounded-xl bg-accent hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-accent/25 active:scale-98 transition-all cursor-pointer"
            >
              <Github size={16} />
              <span>Connect with GitHub</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Appearance & Theme Selection */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary block px-1">
          Appearance Theme
        </span>

        <div className="space-y-2.5">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected 
                    ? 'bg-surface-2 border-accent shadow-sm' 
                    : 'bg-surface-1 border-border hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-10 h-10 rounded-xl border border-border flex items-center justify-center shrink-0"
                    style={{ backgroundColor: t.surfaceHex }}
                  >
                    <Icon size={18} style={{ color: t.accentHex }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${isSelected ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>
                        {t.name}
                      </span>
                      <span className="text-[10px] text-text-tertiary font-mono">
                        · {t.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-tertiary truncate mt-0.5">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-accent bg-accent text-white' : 'border-border'
                }`}>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Cache & Storage Management */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary block">
          Cache & Storage
        </span>
        <p className="text-xs text-text-secondary leading-relaxed">
          Clear cached repository data and locally simulated commit records stored in browser storage.
        </p>

        <button
          onClick={handleClearCache}
          className="h-10 px-4 rounded-xl bg-surface-2 border border-border hover:bg-hover text-text-primary text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Trash2 size={14} className="text-text-tertiary" />
          <span>Purge Local Storage Cache</span>
        </button>
      </div>

      {/* 4. App Info & Version */}
      <div className="text-center text-[11px] text-text-tertiary font-mono pt-2 space-y-1">
        <span>Git Manager PWA · v2.5.0</span>
        <p>Built for mobile-first version management.</p>
      </div>
    </div>
  );
};

export const MobileSettings = Settings;
