import React, { useState } from 'react';
import { Menu, Search, Plus, GitBranch, ChevronDown, Check } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface MobileHeaderProps {
  onOpenDrawer: () => void;
  onOpenActionSheet: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenDrawer,
  onOpenActionSheet,
}) => {
  const { 
    currentScreen, 
    currentRepo, 
    currentBranch, 
    activeBranches, 
    switchBranch, 
    openCommandPalette,
    isAutoSyncing
  } = useAppContext();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const isRepoScreen = ['files', 'commits', 'branches', 'prs', 'insights'].includes(currentScreen);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dash':
        return 'Dashboard';
      case 'repos':
        return 'Repositories';
      case 'clone':
        return 'Clone Repository';
      case 'activity':
        return 'Global Activity';
      case 'settings':
        return 'Settings';
      default:
        return currentRepo || 'Git Manager';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-surface-1/90 backdrop-blur-md border-b border-border pt-[env(safe-area-inset-top,0px)] shrink-0 select-none">
      <div className="h-14 px-3 flex items-center justify-between">
        {/* Left: Hamburger menu icon (Account / Notifications Drawer) */}
        <button
          onClick={onOpenDrawer}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-2 active:scale-95 transition-all cursor-pointer"
          aria-label="Open Navigation Drawer"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        {/* Center: Contextual title or branch switcher */}
        <div className="flex-1 min-w-0 px-2 flex justify-center items-center">
          {isRepoScreen && currentRepo ? (
            <div className="relative">
              <button
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="h-8 px-3 max-w-[200px] sm:max-w-xs bg-surface-2 border border-border hover:border-text-primary/40 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-text-primary transition-all cursor-pointer shadow-2xs active:scale-95"
                aria-expanded={isBranchDropdownOpen}
                aria-label="Select branch"
              >
                <GitBranch size={13} className="text-accent shrink-0" />
                <span className="truncate">{currentBranch}</span>
                <ChevronDown size={13} className={`text-text-tertiary shrink-0 transition-transform ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Branch Selector Dropdown */}
              <AnimatePresence>
                {isBranchDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" 
                      onClick={() => setIsBranchDropdownOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 -translate-x-1/2 top-10 z-50 w-64 bg-surface-1 border border-border rounded-xl shadow-2xl p-1.5 max-h-60 overflow-y-auto no-scrollbar"
                    >
                      <div className="px-2.5 py-1.5 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                        Branches ({activeBranches.length})
                      </div>
                      {activeBranches.map(branch => (
                        <button
                          key={branch.name}
                          onClick={() => {
                            switchBranch(branch.name);
                            setIsBranchDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                            branch.name === currentBranch
                              ? 'bg-accent/15 text-accent font-semibold'
                              : 'text-text-primary hover:bg-surface-2'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <GitBranch size={13} className="shrink-0" />
                            <span className="truncate">{branch.name}</span>
                          </div>
                          {branch.name === currentBranch && <Check size={14} className="text-accent shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center justify-center min-w-0">
              <h1 className="text-sm font-bold text-text-primary tracking-tight truncate text-center">
                {getScreenTitle()}
              </h1>
            </div>
          )}
        </div>

        {/* Right: Search icon + Plus (+) Action Sheet trigger */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={openCommandPalette}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-2 active:scale-95 transition-all cursor-pointer"
            aria-label="Search Workspace (Cmd+K)"
          >
            <Search size={18} strokeWidth={2.2} />
          </button>
          <button
            onClick={onOpenActionSheet}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-background bg-text-primary hover:opacity-90 shadow-xs active:scale-95 transition-all cursor-pointer"
            aria-label="Create New Action"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  );
};
