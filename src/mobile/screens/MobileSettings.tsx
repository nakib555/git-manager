import React from 'react';
import { useAppContext } from '../../AppContext';
import { 
  Github, Moon, Shield, RefreshCw, 
  Trash2, ExternalLink, CheckCircle2, ChevronRight, Info
} from 'lucide-react';

export const MobileSettings: React.FC = () => {
  const { 
    githubUser, 
    githubToken, 
    connectGitHub, 
    disconnectGitHub, 
    theme, 
    toggleTheme, 
    showToast 
  } = useAppContext();

  const handleClearCache = () => {
    localStorage.removeItem('gm_custom_commits');
    localStorage.removeItem('git_manager_repos_cache');
    showToast('Local cache cleared successfully', 'success');
  };

  return (
    <div className="px-5 py-4 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-[#F4F4F5] tracking-tight">Settings</h2>
        <p className="text-xs text-[#71717A] mt-0.5">
          Configure authentication, appearance, and cache.
        </p>
      </div>

      {/* Group 1: Account & Authentication */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-2 px-1">
          Account & Authentication
        </div>
        <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl overflow-hidden divide-y divide-[#2A2A2E]">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {githubUser?.avatar_url ? (
                <img
                  src={githubUser.avatar_url}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border border-[#2A2A2E]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#1A1A1D] border border-[#2A2A2E] flex items-center justify-center text-[#71717A]">
                  <Github size={18} />
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-[#F4F4F5]">
                  {githubUser?.name || githubUser?.login || 'GitHub Offline'}
                </div>
                <div className="text-xs text-[#71717A]">
                  {githubToken ? 'Connected via OAuth / PAT' : 'Read-only public mode'}
                </div>
              </div>
            </div>

            {githubToken ? (
              <button
                onClick={disconnectGitHub}
                className="h-8 px-3 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/15 border border-[#EF4444]/25 text-[#EF4444] text-xs font-semibold cursor-pointer transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectGitHub}
                className="h-8 px-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm shadow-[#3B82F6]/20"
              >
                Connect
              </button>
            )}
          </div>

          <div className="p-3.5 flex items-center justify-between text-xs">
            <span className="text-[#A1A1AA]">API Rate Limit Status</span>
            <span className="font-mono text-[#22C55E] flex items-center gap-1 font-medium">
              <CheckCircle2 size={13} />
              {githubToken ? '5,000 req/hr' : '60 req/hr (Public)'}
            </span>
          </div>
        </div>
      </div>

      {/* Group 2: Appearance & Theme */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-2 px-1">
          Appearance & Ergonomics
        </div>
        <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl overflow-hidden divide-y divide-[#2A2A2E]">
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Moon size={16} className="text-[#3B82F6]" />
              <div>
                <span className="text-xs font-semibold text-[#F4F4F5] block">Charcoal Dark Theme</span>
                <span className="text-[11px] text-[#71717A]">Near-black cool charcoal surfaces</span>
              </div>
            </div>
            <span className="text-xs font-mono text-[#3B82F6] font-semibold bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/25">
              Active
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#3B82F6]" />
              <div>
                <span className="text-xs font-semibold text-[#F4F4F5] block">Accent Color</span>
                <span className="text-[11px] text-[#71717A]">Desaturated Developer Blue (#3B82F6)</span>
              </div>
            </div>
            <span className="text-xs font-mono text-[#71717A]">#3B82F6</span>
          </div>
        </div>
      </div>

      {/* Group 3: Storage & Data */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-2 px-1">
          Storage & Reset
        </div>
        <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#F4F4F5] block">Clear Workspace Cache</span>
            <span className="text-[11px] text-[#71717A]">Reset cached repos and simulated commits</span>
          </div>
          <button
            onClick={handleClearCache}
            className="h-8 px-3 rounded-lg bg-[#1A1A1D] hover:bg-[#EF4444]/10 border border-[#2A2A2E] hover:border-[#EF4444]/30 text-[#A1A1AA] hover:text-[#EF4444] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Group 4: About */}
      <div className="text-center pt-2">
        <span className="text-xs text-[#71717A] font-mono block">
          Git Manager Mobile • v2.0
        </span>
        <span className="text-[11px] text-[#71717A]/70 font-mono block mt-0.5">
          Strict 8-Point Spatial Grid Architecture
        </span>
      </div>
    </div>
  );
};
