import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../AppContext';
import { FolderGit2, X } from 'lucide-react';
import { DrawerAccountCard } from './drawer/DrawerAccountCard';
import { DrawerNavList } from './drawer/DrawerNavList';

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
    currentScreen,
    navigate
  } = useAppContext();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/60"
          onClick={onClose}
        />

        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-4/5 max-w-xs h-full bg-surface-1 border-r border-border flex flex-col z-10 shadow-2xl pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] overflow-hidden"
        >
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

          <DrawerAccountCard
            githubUser={githubUser}
            githubToken={githubToken}
            onConnect={() => { connectGitHub(); onClose(); }}
            onDisconnect={() => { disconnectGitHub(); onClose(); }}
            repoCount={githubRepos.length}
            commitCount={activeCommits.length}
          />

          <DrawerNavList
            currentScreen={currentScreen}
            repoCount={githubRepos.length}
            onNavigate={navigate}
            onClose={onClose}
          />

          <div className="p-3 border-t border-border text-center">
            <span className="text-[10px] text-text-tertiary font-mono">
              Git Manager Mobile
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
