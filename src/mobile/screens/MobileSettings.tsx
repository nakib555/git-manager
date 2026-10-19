import React from 'react';
import { useAppContext } from '../../AppContext';
import { 
  Github, Moon, Sun, Sparkles, 
  Trash2, CheckCircle2, Check
} from 'lucide-react';

export const MobileSettings: React.FC = () => {
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
      desc: 'Modern developer workstation with cool charcoal surfaces',
      icon: Moon,
    },
    {
      id: 'light',
      name: 'Light',
      badge: 'Linear Style',
      bgHex: '#F8F7F4',
      surfaceHex: '#FFFFFF',
      accentHex: '#3B6FE0',
      desc: 'Warm off-white with high-readability muted contrast',
      icon: Sun,
    },
    {
      id: 'fantasy',
      name: 'Fantasy',
      badge: 'Night Sky',
      bgHex: '#0F0E17',
      surfaceHex: '#16152A',
      accentHex: '#9B7EED',
      desc: 'Deep indigo-black atmosphere with soft violet accents',
      icon: Sparkles,
    },
  ] as const;

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary tracking-tight">Settings</h2>
        <p className="text-xs text-text-tertiary mt-0.5">
          Configure authentication, appearance themes, and workspace cache.
        </p>
      </div>

      {/* Group 1: Appearance & Theme Selector (All 3 Modes) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2 px-1">
          Theme & Atmosphere
        </div>
        
        <div className="space-y-2.5">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setTheme(t.id as any);
                  showToast(`Activated ${t.name} theme`, 'info');
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] flex items-center justify-between ${
                  isSelected
                    ? 'bg-surface-1 border-accent shadow-sm shadow-accent/15'
                    : 'bg-surface-1 border-border hover:border-border/80 hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Swatch Circle */}
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border"
                    style={{ backgroundColor: t.surfaceHex }}
                  >
                    <Icon size={18} style={{ color: t.accentHex }} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {t.name}
                      </span>
                      <span 
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded border"
                        style={{ 
                          borderColor: `${t.accentHex}40`, 
                          color: t.accentHex,
                          backgroundColor: `${t.accentHex}15`
                        }}
                      >
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-0.5 leading-snug">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-accent text-white shadow-xs'
                        : 'border border-border bg-surface-2 text-transparent'
                    }`}
                  >
                    {isSelected && <Check size={14} strokeWidth={2.5} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group 2: Account & Authentication */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2 px-1">
          Account & Authentication
        </div>
        <div className="bg-surface-1 border border-border rounded-xl overflow-hidden divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {githubUser?.avatar_url ? (
                <img
                  src={githubUser.avatar_url}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border border-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-tertiary">
                  <Github size={18} />
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  {githubUser?.name || githubUser?.login || 'GitHub Offline'}
                </div>
                <div className="text-xs text-text-tertiary">
                  {githubToken ? 'Connected via OAuth / PAT' : 'Read-only public mode'}
                </div>
              </div>
            </div>

            {githubToken ? (
              <button
                onClick={disconnectGitHub}
                className="h-8 px-3 rounded-lg bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger text-xs font-semibold cursor-pointer transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectGitHub}
                className="h-8 px-3 rounded-lg bg-accent hover:opacity-90 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm shadow-accent/20"
              >
                Connect
              </button>
            )}
          </div>

          <div className="p-3.5 flex items-center justify-between text-xs">
            <span className="text-text-secondary">API Rate Limit Status</span>
            <span className="font-mono text-success flex items-center gap-1 font-medium">
              <CheckCircle2 size={13} />
              {githubToken ? '5,000 req/hr' : '60 req/hr (Public)'}
            </span>
          </div>
        </div>
      </div>

      {/* Group 3: Storage & Data */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2 px-1">
          Storage & Reset
        </div>
        <div className="bg-surface-1 border border-border rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-primary block">Clear Workspace Cache</span>
            <span className="text-[11px] text-text-tertiary">Reset cached repos and simulated commits</span>
          </div>
          <button
            onClick={handleClearCache}
            className="h-8 px-3 rounded-lg bg-surface-2 hover:bg-danger/10 border border-border hover:border-danger/30 text-text-secondary hover:text-danger text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2">
        <span className="text-xs text-text-tertiary font-mono block">
          Git Manager Mobile • v2.0
        </span>
        <span className="text-[11px] text-text-tertiary/70 font-mono block mt-0.5">
          Strict 8-Point Spatial Grid Architecture
        </span>
      </div>
    </div>
  );
};
