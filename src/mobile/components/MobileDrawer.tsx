import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../AppContext';
import { 
  User, Github, Bell, CheckCircle2, 
  ExternalLink, LogOut, X, Shield, Star, FolderGit2
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    githubUser, 
    githubToken, 
    connectGitHub, 
    disconnectGitHub, 
    githubRepos, 
    activeCommits,
    navigate
  } = useAppContext();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-4/5 max-w-xs h-full bg-[#121214] border-r border-[#2A2A2E] flex flex-col z-10 shadow-2xl pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#2A2A2E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center text-white shadow-sm shadow-[#3B82F6]/20">
                <FolderGit2 size={16} />
              </div>
              <span className="font-semibold text-sm text-[#F4F4F5]">Git Manager</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] flex items-center justify-center text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Account Card */}
          <div className="p-4 border-b border-[#2A2A2E] bg-[#1A1A1D]/40">
            <div className="flex items-center gap-3">
              {githubUser?.avatar_url ? (
                <img
                  src={githubUser.avatar_url}
                  alt={githubUser.login}
                  className="w-12 h-12 rounded-full border border-[#2A2A2E] object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#1A1A1D] border border-[#2A2A2E] flex items-center justify-center text-[#71717A]">
                  <User size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#F4F4F5] truncate">
                  {githubUser?.name || githubUser?.login || 'Guest Developer'}
                </div>
                <div className="text-xs text-[#71717A] truncate font-mono">
                  {githubUser?.login ? `@${githubUser.login}` : 'Offline Mode'}
                </div>
              </div>
            </div>

            <div className="mt-4">
              {githubToken ? (
                <button
                  onClick={() => {
                    disconnectGitHub();
                    onClose();
                  }}
                  className="w-full h-9 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/15 border border-[#EF4444]/25 text-[#EF4444] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Disconnect Account</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    connectGitHub();
                    onClose();
                  }}
                  className="w-full h-9 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-[#3B82F6]/20 cursor-pointer"
                >
                  <Github size={14} />
                  <span>Connect GitHub</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 p-4 border-b border-[#2A2A2E]">
            <div className="bg-[#1A1A1D] rounded-xl p-3 border border-[#2A2A2E]">
              <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider block">Repos</span>
              <span className="text-base font-bold text-[#F4F4F5] font-mono tabular-nums">{githubRepos.length}</span>
            </div>
            <div className="bg-[#1A1A1D] rounded-xl p-3 border border-[#2A2A2E]">
              <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider block">Commits</span>
              <span className="text-base font-bold text-[#F4F4F5] font-mono tabular-nums">{activeCommits.length}</span>
            </div>
          </div>

          {/* System Navigation & Status */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
              System Status
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#A1A1AA] bg-[#1A1A1D]/50 border border-[#2A2A2E]/60">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#22C55E]" />
                API Health
              </span>
              <span className="text-[11px] font-mono text-[#22C55E] font-semibold">Operational</span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#A1A1AA] bg-[#1A1A1D]/50 border border-[#2A2A2E]/60">
              <span className="flex items-center gap-2">
                <Shield size={13} className="text-[#3B82F6]" />
                Auth Engine
              </span>
              <span className="text-[11px] font-mono text-[#F4F4F5]">Client-side</span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#2A2A2E] text-center">
            <span className="text-[10px] text-[#71717A] font-mono">
              Git Manager Mobile v2.0 • 8pt Grid
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
