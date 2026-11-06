import React, { useState } from 'react';
import { Check, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export const OAuthSetupForm: React.FC = () => {
  const { setManualToken, closeModal } = useAppContext();
  const [token, setToken] = useState('');
  const [tab, setTab] = useState<'pat' | 'oauth'>('pat');
  const [isValidating, setIsValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = token.trim();
    if (!cleanToken) return;
    setIsValidating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${cleanToken}`, Accept: 'application/vnd.github.v3+json' },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid GitHub token. Please verify scopes.');
      }
      setManualToken(cleanToken);
      closeModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate with GitHub.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex border-b border-border text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTab('pat')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            tab === 'pat' ? 'border-primary text-primary font-bold' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          1-Click Access Token (Recommended)
        </button>
        <button
          type="button"
          onClick={() => setTab('oauth')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            tab === 'oauth' ? 'border-primary text-primary font-bold' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          OAuth Setup Guide
        </button>
      </div>

      {tab === 'pat' ? (
        <form onSubmit={handlePatSubmit} className="space-y-3.5">
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs text-text-main leading-relaxed">
            <p className="font-semibold text-primary mb-1">Fastest Way to Connect</p>
            You can connect your GitHub account in 10 seconds using a Personal Access Token (PAT).
          </div>

          <div>
            <a 
              href="https://github.com/settings/tokens/new?scopes=repo,user,read:org&description=Git%20Manager%20App"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-hover border border-border hover:border-primary/50 text-text-main font-semibold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Generate New Token on GitHub</span>
              <ExternalLink size={14} className="text-primary" />
            </a>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
              Paste GitHub Token
            </label>
            <input 
              type="password" 
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-500 font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
              {errorMsg}
            </p>
          )}

          <button 
            type="submit" 
            disabled={!token.trim() || isValidating}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isValidating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying with GitHub...</span>
              </span>
            ) : (
              <>
                <Check size={16} strokeWidth={3} />
                <span>Connect GitHub Account</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-3 text-xs text-text-main">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 flex gap-2">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">OAuth Secrets Missing</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                GitHub OAuth requires <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">GITHUB_CLIENT_ID</code> and <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">GITHUB_CLIENT_SECRET</code> on your server/worker.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="font-semibold text-text-main">Configure OAuth Secrets:</p>
            <p className="text-text-muted">
              Add <code className="text-text-main font-mono bg-hover px-1 rounded">GITHUB_CLIENT_ID</code> and <code className="text-text-main font-mono bg-hover px-1 rounded">GITHUB_CLIENT_SECRET</code> to your <code className="text-text-main font-mono bg-hover px-1 rounded">.env</code> file or host environment.
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => setTab('pat')}
            className="w-full bg-hover hover:bg-border text-text-main font-semibold text-xs py-2.5 rounded-xl transition-all mt-2 cursor-pointer"
          >
            Use Personal Access Token Instead
          </button>
        </div>
      )}
    </div>
  );
};
