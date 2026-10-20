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
          className="fixed inset-0 bg-black/60"
          onClick={onClose}
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-4/5 max-w-xs h-full bg-surface-1 border-r border-border flex flex-col z-10 shadow-2xl pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm shadow-accent/20">
                <FolderGit2 size={18} />
              </div>
              <span className="font-semibold text-sm text-text-primary">Git Manager</span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Account Card */}
          <div className="p-4 border-b border-border bg-surface-2/40">
            <div className="flex items-center gap-3">
              {githubUser?.avatar_url ? (
                <img
                  src={githubUser.avatar_url}
                  alt={githubUser.login}
                  className="w-12 h-12 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-tertiary">
                  <User size={22} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text-primary truncate">
                  {githubUser?.name || githubUser?.login || 'Guest Developer'}
                </div>
                <div className="text-xs text-text-tertiary truncate font-mono">
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
                  className="w-full min-h-[48px] h-12 rounded-xl bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Disconnect Account</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    connectGitHub();
                    onClose();
                  }}
                  className="w-full min-h-[48px] h-12 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-accent/20 cursor-pointer"
                >
                  <Github size={16} />
                  <span>Connect GitHub</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 p-4 border-b border-border">
            <div className="bg-surface-2 rounded-2xl p-4 border border-border">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block mb-1">Repos</span>
              <span className="text-lg font-bold text-text-primary font-mono tabular-nums">{githubRepos.length}</span>
            </div>
            <div className="bg-surface-2 rounded-2xl p-4 border border-border">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block mb-1">Commits</span>
              <span className="text-lg font-bold text-text-primary font-mono tabular-nums">{activeCommits.length}</span>
            </div>
          </div>

          {/* System Navigation & Status */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            <div className="px-2 pt-1 pb-1 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
              System Status
            </div>

            <div className="flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl text-xs text-text-secondary bg-surface-2/50 border border-border/60">
              <span className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="text-success" />
                API Health
              </span>
              <span className="text-xs font-mono text-success font-semibold">Operational</span>
            </div>

            <div className="flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl text-xs text-text-secondary bg-surface-2/50 border border-border/60">
              <span className="flex items-center gap-2.5">
                <Shield size={15} className="text-accent" />
                Auth Engine
              </span>
              <span className="text-xs font-mono text-text-primary font-semibold">Client-side</span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border text-center">
            <span className="text-[10px] text-text-tertiary font-mono">
              Git Manager Mobile v2.0 • 8pt Grid
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
