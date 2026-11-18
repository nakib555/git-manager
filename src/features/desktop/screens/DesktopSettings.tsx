import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Github, KeySquare, ChevronRight, Moon, Sun, Sliders, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../../../AppContext';

export const DesktopSettings: React.FC = () => {
  const { theme, setTheme, githubUser, githubToken, connectGitHub, disconnectGitHub, setManualToken, showToast, adminModeOverride, toggleAdminMode, refreshData } = useAppContext();
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempToken.trim()) {
      setManualToken(tempToken.trim());
      setTempToken('');
      setShowTokenForm(false);
      showToast('Personal access token initialized.');
    }
  };

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Settings Panel</h1>
        <p className="text-xs text-text-muted mt-0.5 font-medium">Configure profile preferences, link security tokens, and select appearance systems.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl border border-border p-5 flex flex-col items-center justify-center text-center space-y-4 h-fit">
          {githubUser?.avatar_url && !avatarFailed ? (
            <img
              src={githubUser.avatar_url}
              alt={githubUser.login || 'Profile'}
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="w-20 h-20 rounded-full border-2 border-primary shadow-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-hover text-text-muted border border-border flex items-center justify-center text-3xl font-extrabold">
              <User size={36} />
            </div>
          )}
          <div>
            <h3 className="font-bold text-sm text-text-main">{githubUser ? (githubUser.name || githubUser.login) : 'Guest Account'}</h3>
            <span className="block text-[10px] text-text-muted font-semibold tracking-wider uppercase mt-1">
              {githubUser ? `@${githubUser.login}` : 'Demo Mode'}
            </span>
          </div>
          {githubUser ? (
            <div className="text-[11px] text-text-muted border-t border-border/50 pt-4 w-full space-y-2">
              {githubUser.bio && <p className="italic">"{githubUser.bio}"</p>}
              <div className="flex justify-around font-bold tabular-nums">
                <span>{githubUser.followers} Followers</span>
                <span>{githubUser.following} Following</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-muted leading-relaxed">No cloud accounts linked. Connect using a GitHub PAT or OAuth flow.</p>
          )}
        </div>

        <div className="md:col-span-2 bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
          <div className="p-5 flex items-center justify-between gap-4 hover:bg-hover/10 transition-colors">
            <div className="flex gap-4 items-center min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${githubToken ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                <Github size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-text-main">{githubToken ? 'Disconnect GitHub Account' : 'Connect GitHub Account'}</span>
                <span className="block text-[10px] text-text-muted mt-0.5">Sync repositories, branches, and pull requests with GitHub</span>
              </div>
            </div>
            <button
              type="button"
              onClick={githubToken ? disconnectGitHub : connectGitHub}
              className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-all border cursor-pointer shrink-0 whitespace-nowrap ${githubToken ? 'bg-danger/5 border-danger/25 text-danger hover:bg-danger/15' : 'bg-primary text-white hover:bg-primary-hover border-transparent shadow-sm'}`}
            >
              {githubToken ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {!githubToken && (
            <div className="p-5 space-y-4">
              <button
                type="button"
                aria-expanded={showTokenForm}
                onClick={() => setShowTokenForm(!showTokenForm)}
                className="w-full flex items-center justify-between cursor-pointer text-left"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <KeySquare size={20} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-text-main">Developer Personal Access Token</span>
                    <span className="block text-[10px] text-text-muted mt-0.5">Enter a GitHub token (PAT) for authenticated access</span>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-text-muted transition-transform shrink-0 ${showTokenForm ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {showTokenForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <form onSubmit={handleSaveToken} className="space-y-3.5 pt-3 border-t border-border/50">
                      <p className="text-[11px] text-text-muted">Generate a token with <code className="bg-hover px-1 rounded font-mono">repo</code> & <code className="bg-hover px-1 rounded font-mono">user</code> scopes on GitHub settings.</p>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
                          aria-label="Personal access token"
                          className="flex-1 bg-main border border-border rounded-xl px-3.5 py-2 text-xs text-text-main outline-none focus:border-primary font-mono"
                          value={tempToken}
                          onChange={(e) => setTempToken(e.target.value)}
                          required
                        />
                        <button type="submit" className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer whitespace-nowrap">
                          Save Token
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="p-5 flex items-center justify-between gap-4 transition-colors">
            <div className="flex gap-4 items-center min-w-0">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-text-primary">Appearance Mode</span>
                <span className="block text-[10px] text-text-secondary mt-0.5 truncate">
                  {theme === 'light'
                    ? 'Clean Light · High-contrast daylight studio'
                    : 'Cloudflare Dark · Deep graphite engineering console'}
                </span>
              </div>
            </div>
            <div
              className="flex items-center p-1 rounded-xl bg-surface-2 border border-border shrink-0"
              role="group"
              aria-label="Select theme mode"
            >
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer btn-tactile ${
                  theme !== 'light'
                    ? 'bg-surface-1 text-text-primary border border-border shadow-xs'
                    : 'text-text-secondary hover:text-text-primary border border-transparent'
                }`}
              >
                <Moon size={13} className={theme !== 'light' ? 'text-accent' : ''} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer btn-tactile ${
                  theme === 'light'
                    ? 'bg-surface-1 text-text-primary border border-border shadow-xs'
                    : 'text-text-secondary hover:text-text-primary border border-transparent'
                }`}
              >
                <Sun size={13} className={theme === 'light' ? 'text-accent' : ''} />
                <span>Light</span>
              </button>
            </div>
          </div>

          <div className="p-5 flex items-center justify-between gap-4 hover:bg-hover/10 transition-colors">
            <div className="flex gap-4 items-center min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${adminModeOverride ? 'bg-emerald-500/15 text-emerald-400' : 'bg-hover text-text-muted'}`}>
                <ShieldCheck size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="block text-xs font-bold text-text-main">Admin Level Authority Mode</span>
                  <span className={`text-[10px] font-mono font-semibold ${adminModeOverride ? 'text-emerald-500' : 'text-text-muted'}`}>
                    {adminModeOverride ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <span className="block text-[10px] text-text-muted mt-0.5">
                  Elevate all Git operations, folder and file deletion, and branch controls to admin authority
                </span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={adminModeOverride}
              aria-label="Toggle Admin Level Authority Mode"
              onClick={toggleAdminMode}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 cursor-pointer shrink-0 ${adminModeOverride ? 'bg-emerald-500' : 'bg-border'}`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${adminModeOverride ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="p-5 flex items-center justify-between gap-4 hover:bg-hover/10 transition-colors">
            <div className="flex gap-4 items-center min-w-0">
              <div className="w-10 h-10 rounded-xl bg-hover text-rose-400 flex items-center justify-center shrink-0">
                <Sliders size={18} />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-text-main">Purge Local Repository Cache</span>
                <span className="block text-[10px] text-text-muted mt-0.5">Wipe all cached repository trees, local commits, and session snapshots</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  const keys = Object.keys(localStorage);
                  keys.forEach(k => {
                    if (k.startsWith('local_') || k === 'gm_custom_commits' || k === 'git_manager_repos_cache') {
                      localStorage.removeItem(k);
                    }
                  });
                  sessionStorage.clear();
                } catch (_) {}
                refreshData();
                showToast('Local repository cache purged and synced', 'success');
              }}
              className="text-xs font-bold py-1.5 px-3 rounded-lg border border-border bg-card hover:bg-rose-500/10 hover:border-rose-500/30 text-text-muted hover:text-rose-400 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              Purge Cache
            </button>
          </div>

          <div className="p-5 flex items-center justify-between gap-4 hover:bg-hover/10 transition-colors">
            <div className="flex gap-4 items-center min-w-0">
              <div className="w-10 h-10 rounded-xl bg-hover text-text-muted flex items-center justify-center shrink-0">
                <Sliders size={18} />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-text-main">Git Manager Desktop</span>
                <span className="block text-[10px] text-text-muted mt-0.5">Desktop Workstation Client</span>
              </div>
            </div>
            <span className="text-xs font-medium text-text-muted font-mono tabular-nums">Workstation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
