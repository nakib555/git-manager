import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { User, Key, CreditCard, Palette, Plug, Info, Moon, Sun, ChevronRight, Github, Cloud, KeySquare, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const { showToast, theme, toggleTheme, githubUser, githubToken, connectGitHub, disconnectGitHub, setManualToken } = useAppContext();
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const handleSaveToken = () => {
    if (tempToken.trim()) {
      setManualToken(tempToken.trim());
      setTempToken('');
      setShowTokenInput(false);
    }
  };

  return (
    <div className="animate-fade-up pb-8">
      <div className="flex items-center gap-4 p-4 bg-card rounded-2xl mb-6 border border-border">
        {githubUser ? (
          <img src={githubUser.avatar_url} alt="Profile" className="w-14 h-14 rounded-full border border-border" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-info border-2 border-white flex items-center justify-center text-2xl font-bold">
            T
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-base font-semibold">{githubUser ? (githubUser.name || githubUser.login) : 'Tanvir Ahmed'}</h3>
          {githubUser ? (
            <div className="text-xs text-text-muted mt-1 space-y-1">
              {githubUser.bio && <div>{githubUser.bio}</div>}
              <div className="flex gap-3">
                <span><strong className="text-text-main">{githubUser.followers}</strong> followers</span>
                <span><strong className="text-text-main">{githubUser.following}</strong> following</span>
              </div>
            </div>
          ) : (
            <div className="bg-primary/15 text-primary text-[10px] font-semibold px-2 py-1 rounded-full inline-block mt-1">
              Pro Plan
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl px-4 mb-4 border border-border">
        <div className="flex justify-between items-center py-4 border-b border-border cursor-pointer active:opacity-70" onClick={githubToken ? disconnectGitHub : connectGitHub}>
          <div className="flex gap-4 items-center">
            <div className={`w-10 h-10 rounded-xl ${githubToken ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'} flex items-center justify-center`}>
              <Github size={20} />
            </div>
            <div>
              <div className="text-sm font-medium">{githubToken ? 'Disconnect GitHub' : 'Connect GitHub'}</div>
              <div className="text-[11px] text-text-muted">{githubToken ? 'Unlink your GitHub account' : 'Link your GitHub account'}</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </div>
        
        {!githubToken && (
          <div className="flex flex-col py-4 border-b border-border">
            <div className="flex justify-between items-center cursor-pointer active:opacity-70" onClick={() => setShowTokenInput(!showTokenInput)}>
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <KeySquare size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium">Use Personal Access Token</div>
                  <div className="text-[11px] text-text-muted">Alternative to OAuth connection</div>
                </div>
              </div>
              <ChevronRight size={16} className={`text-text-muted transition-transform ${showTokenInput ? 'rotate-90' : ''}`} />
            </div>
            
            {showTokenInput && (
              <div className="mt-4 flex gap-2 animate-fade-in">
                <input 
                  type="password" 
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  className="flex-1 bg-main border border-border rounded-lg px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                />
                <button 
                  onClick={handleSaveToken}
                  className="bg-primary text-white rounded-lg px-3 flex items-center justify-center active:bg-primary-hover"
                >
                  <Check size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center py-4 border-b border-border cursor-pointer active:opacity-70" onClick={() => showToast('Account Settings opened')}>
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <div className="text-sm font-medium">Account</div>
              <div className="text-[11px] text-text-muted">Manage your account settings</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </div>
        <div className="flex justify-between items-center py-4 border-b border-border cursor-pointer active:opacity-70" onClick={() => showToast('SSH & GPG Keys')}>
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Key size={20} />
            </div>
            <div>
              <div className="text-sm font-medium">SSH & GPG Keys</div>
              <div className="text-[11px] text-text-muted">Manage cryptographic keys</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </div>
        <div className="flex justify-between items-center py-4 border-b border-border cursor-pointer active:opacity-70" onClick={() => showToast('Billing')}>
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <div className="text-sm font-medium">Billing & Plans</div>
              <div className="text-[11px] text-text-muted">Manage subscription</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </div>
        <div className="flex justify-between items-center py-4 cursor-pointer active:opacity-70" onClick={toggleTheme}>
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <div className="text-sm font-medium">Appearance</div>
              <div className="text-[11px] text-text-muted">{theme === 'dark' ? 'Dark theme' : 'Whisper White theme'}</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </div>
      </div>

      <div className="bg-card rounded-2xl px-4 border border-border">
        <div className="flex justify-between items-center py-4 border-b border-border cursor-pointer active:opacity-70" onClick={() => showToast('Cloudflare Publish settings')}>
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-xl bg-[#F6821F]/10 text-[#F6821F] flex items-center justify-center">
              <Cloud size={20} />
            </div>
            <div>
              <div className="text-sm font-medium">Cloudflare Publish</div>
              <div className="text-[11px] text-text-muted">Deploy Application</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </div>
        <div className="flex justify-between items-center py-4 border-b border-border cursor-pointer active:opacity-70" onClick={() => showToast('Git Integrations')}>
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Plug size={20} />
            </div>
            <div>
              <div className="text-sm font-medium">Git Integrations</div>
              <div className="text-[11px] text-text-muted">GitHub, GitLab, Bitbucket</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </div>
        <div className="flex justify-between items-center py-4 cursor-pointer active:opacity-70" onClick={() => showToast('Git Manager v2.4.1 is up to date')}>
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-xl bg-gray-400/10 text-gray-400 flex items-center justify-center">
              <Info size={20} />
            </div>
            <div>
              <div className="text-sm font-medium">About</div>
              <div className="text-[11px] text-text-muted">Git Manager v2.4.1</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </div>
      </div>

      <button 
        className="w-full p-4 bg-transparent border border-danger text-danger rounded-xl mt-6 font-semibold text-sm cursor-pointer active:bg-danger/10 transition-colors"
        onClick={() => {
          showToast('Logging out...');
          disconnectGitHub();
        }}
      >
        Log Out
      </button>
    </div>
  );
};
