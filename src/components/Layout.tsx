import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { Menu, Bell, Plus, ArrowLeft, ChevronDown, MoreVertical, Folder, Activity, Search, Grid, Home, GitBranch, ChevronLeft, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';

export const Header: React.FC = () => {
  const { currentScreen, currentRepo, currentRepoOwner, currentBranch, activeBranches, switchBranch, navigate, openDrawer, openActionSheet, openCommandPalette } = useAppContext();
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const getHeaderContent = () => {
    switch (currentScreen) {
      case 'dash':
        return {
          title: 'Dashboard',
          sub: '',
          left: (
            <button 
              onClick={openDrawer} 
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[#F4F4F5] hover:bg-[#1A1A1D] active:scale-95 transition-all cursor-pointer"
              title="Open Menu & Notifications"
            >
              <Menu size={20} />
            </button>
          ),
          right: (
            <div className="flex gap-1.5 items-center">
              <button 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#1A1A1D] active:scale-95 transition-all cursor-pointer" 
                onClick={openCommandPalette}
                title="Search & Actions"
              >
                <Search size={18} />
              </button>
              <button 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-95 transition-all shadow-sm shadow-[#3B82F6]/20 cursor-pointer" 
                onClick={openActionSheet}
                title="Create New Action"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          )
        };
      case 'repos':
        return {
          title: 'Repositories',
          sub: '',
          left: (
            <button 
              onClick={openDrawer} 
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[#F4F4F5] hover:bg-[#1A1A1D] active:scale-95 transition-all cursor-pointer"
              title="Open Menu & Notifications"
            >
              <Menu size={20} />
            </button>
          ),
          right: (
            <div className="flex gap-1.5 items-center">
              <button 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#1A1A1D] active:scale-95 transition-all cursor-pointer" 
                onClick={openCommandPalette}
                title="Search & Actions"
              >
                <Search size={18} />
              </button>
              <button 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-95 transition-all shadow-sm shadow-[#3B82F6]/20 cursor-pointer" 
                onClick={openActionSheet}
                title="Create New Action"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          )
        };
      case 'settings':
        return {
          title: 'Settings',
          sub: '',
          left: (
            <button 
              onClick={() => navigate('dash')} 
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[#F4F4F5] hover:bg-[#1A1A1D] active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
          ),
          right: (
            <div className="w-11 h-11 flex items-center justify-center text-[#A1A1AA]">
              <MoreVertical size={20} />
            </div>
          )
        };
      case 'insights':
        return {
          title: 'Insights',
          sub: currentRepo,
          left: (
            <button 
              onClick={() => navigate('repos')} 
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[#F4F4F5] hover:bg-[#1A1A1D] active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
          ),
          right: (
            <span className="text-xs text-[#A1A1AA] font-medium flex items-center bg-[#1A1A1D] border border-[#2A2A2E] px-3 py-1.5 rounded-lg">
              This Month <ChevronDown size={14} className="ml-1" />
            </span>
          )
        };
      case 'files':
      case 'commits':
        return {
          title: currentScreen === 'files' ? 'Files' : 'Commits',
          sub: currentRepo,
          left: (
            <button 
              onClick={() => navigate('repos')} 
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[#F4F4F5] hover:bg-[#1A1A1D] active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
          ),
          right: (
            <div className="relative">
              <button 
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg h-9 px-3 text-xs font-semibold flex items-center text-[#F4F4F5] hover:bg-[#242428] active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <GitBranch size={14} className="mr-1.5 text-[#3B82F6] shrink-0" />
                <span className="max-w-[80px] truncate">{currentBranch || 'main'}</span>
                <ChevronDown size={14} className="ml-1 shrink-0 text-[#A1A1AA]" />
              </button>
              {isBranchDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsBranchDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-52 bg-[#121214] border border-[#2A2A2E] rounded-xl shadow-2xl py-2 z-50 max-h-64 overflow-y-auto">
                    <div className="px-3 py-1 border-b border-[#2A2A2E] text-[10px] uppercase tracking-wider font-bold text-[#71717A]">Active Branches</div>
                    {activeBranches.map((b) => (
                      <button
                        key={b.name}
                        onClick={() => {
                          switchBranch(b.name);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#1A1A1D] transition-colors cursor-pointer ${
                          b.name === (currentBranch || 'main') ? 'text-[#3B82F6] font-bold bg-[#3B82F6]/10' : 'text-[#F4F4F5] font-medium'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        {b.name === (currentBranch || 'main') && <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />}
                      </button>
                    ))}
                    {activeBranches.length === 0 && (
                      <div className="px-3 py-2 text-xs text-[#71717A] text-center">No branches found</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        };
      case 'branches':
      case 'prs':
        return {
          title: currentScreen === 'branches' ? 'Branches' : 'Pull Requests',
          sub: currentRepo,
          left: (
            <button 
              onClick={() => navigate('repos')} 
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[#F4F4F5] hover:bg-[#1A1A1D] active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
          ),
          right: (
            <button 
              className="bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg h-9 px-3.5 text-xs font-semibold text-white cursor-pointer active:scale-95 transition-all shadow-xs" 
              onClick={openActionSheet}
            >
              + New {currentScreen === 'branches' ? 'Branch' : 'PR'}
            </button>
          )
        };
      case 'clone':
        return {
          title: 'Clone Repository',
          sub: '',
          left: (
            <button 
              onClick={openDrawer} 
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[#F4F4F5] hover:bg-[#1A1A1D] active:scale-95 transition-all cursor-pointer"
            >
              <Menu size={20} />
            </button>
          ),
          right: (
            <div className="flex gap-1.5 items-center">
              <button 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-95 transition-all cursor-pointer" 
                onClick={openActionSheet}
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          )
        };
      default:
        return { title: 'Git Manager', left: null, right: null, sub: '' };
    }
  };

  const content = getHeaderContent();
  const isRepoScreen = ['files', 'commits', 'branches', 'insights', 'prs'].includes(currentScreen);

  return (
    <header className="sticky top-0 shrink-0 h-14 flex items-center px-4 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-[#2A2A2E] z-40 gap-3 pt-[env(safe-area-inset-top)]">
      <div className="text-[#F4F4F5] flex items-center justify-center shrink-0">
        {content.left}
      </div>
      
      <div className="flex flex-col items-start text-left min-w-0 flex-1">
        {isRepoScreen && currentRepo ? (
          <>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#A1A1AA] leading-tight truncate w-full">
              <span className="truncate max-w-[90px] text-[#A1A1AA]">{currentRepoOwner || 'workspace'}</span>
              <span className="text-[#71717A]">/</span>
              <span className="font-bold text-[#F4F4F5] truncate text-[15px]">{currentRepo}</span>
            </div>
            <span className="text-[11px] text-[#71717A] font-medium leading-tight flex items-center gap-1 mt-0.5">
              <Folder size={10} className="text-[#3B82F6]" fill="currentColor" /> {content.title}
            </span>
          </>
        ) : (
          <>
            <span className="text-[#F4F4F5] font-semibold text-lg tracking-tight truncate leading-tight">{content.title}</span>
            {content.sub && (
              <span className="text-[11px] text-[#71717A] font-medium truncate leading-tight mt-0.5">{content.sub}</span>
            )}
          </>
        )}
      </div>

      <div className="text-[#F4F4F5] flex items-center justify-center shrink-0">
        {content.right}
      </div>
    </header>
  );
};

export const RepoTabs: React.FC = () => {
  const { currentScreen, navigate, currentRepo } = useAppContext();
  const isRepoScreen = ['files', 'commits', 'branches', 'insights', 'prs'].includes(currentScreen);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isRepoScreen && containerRef.current && activeTabRef.current) {
      const container = containerRef.current;
      const activeTab = activeTabRef.current;
      
      const containerWidth = container.offsetWidth;
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;
      
      const targetScrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentScreen, isRepoScreen]);

  if (!isRepoScreen || !currentRepo) return null;

  const tabs = [
    { id: 'files', label: 'Files' },
    { id: 'commits', label: 'Commits' },
    { id: 'branches', label: 'Branches' },
    { id: 'prs', label: 'PRs' },
    { id: 'insights', label: 'Insights' },
  ] as const;

  return (
    <div 
      ref={containerRef}
      className="shrink-0 flex gap-2 overflow-x-auto px-4 py-2 bg-[#0A0A0B] border-b border-[#2A2A2E] no-scrollbar scroll-smooth"
    >
      {tabs.map(tab => {
        const isActive = currentScreen === tab.id;
        return (
          <button 
            key={tab.id}
            ref={isActive ? activeTabRef : null}
            onClick={() => navigate(tab.id as any)}
            className={`h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center justify-center select-none ${
              isActive 
                ? 'bg-[#3B82F6] text-white shadow-sm shadow-[#3B82F6]/25 font-bold' 
                : 'bg-[#1A1A1D] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#2A2A2E]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export const AnimatedGlobe: React.FC<{ size?: number; className?: string }> = ({ size = 12, className }) => {
  const [rotation, setRotation] = useState(0);

  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
    setRotation(prev => prev + 360);
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className || ''} cursor-pointer select-none`}
      onClick={handleTouch}
      onTouchStart={handleTouch}
      animate={{ rotate: rotation }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      transition={{ 
        rotate: { type: "spring", stiffness: 220, damping: 16 },
        scale: { duration: 0.15 }
      }}
      style={{ transformOrigin: 'center center' }}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </motion.svg>
  );
};

export const AnimatedLock: React.FC<{ size?: number; className?: string }> = ({ size = 12, className }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleTouch = () => {
    setIsHovered(prev => !prev);
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className || ''} cursor-pointer select-none`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTouch}
      onTouchStart={handleTouch}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      transition={{ duration: 0.15 }}
    >
      <motion.path 
        d="M7 11V7a5 5 0 0 1 10 0v4" 
        animate={{ 
          y: isHovered ? -1.5 : 0 
        }}
        transition={{ type: "spring", stiffness: 350, damping: 12 }}
      />
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M12 16v3" />
    </motion.svg>
  );
};

export const AnimatedSearchIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => {
  const [rotation, setRotation] = useState(0);

  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to avoid double-trigger on some devices if needed, but standard onClick is fine.
    setRotation(prev => prev + 360);
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onClick={handleTouch}
      onTouchStart={handleTouch}
      animate={{ rotate: rotation }}
      whileHover={{ rotate: rotation - 10, scale: 1.05 }}
      transition={{ 
        rotate: { type: "spring", stiffness: 180, damping: 15 },
        scale: { duration: 0.2 }
      }}
      style={{ transformOrigin: 'right bottom' }}
    >
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </motion.svg>
  );
};

const MotionChevronLeft = motion.create(ChevronLeft);

export const AnimatedChevronLeft: React.FC<{ size?: number; className?: string; onClick?: () => void }> = ({ size = 24, className, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className={`w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover active:bg-hover/80 transition-all duration-200 cursor-pointer select-none focus:outline-none ${className || ''}`}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 450, damping: 18 }}
    >
      <MotionChevronLeft
        size={size}
        className="pointer-events-none"
        animate={{ x: isHovered ? -3 : 0 }}
        transition={{ type: "spring", stiffness: 450, damping: 18 }}
      />
    </motion.button>
  );
};

export const BottomNav: React.FC = () => {
  const { currentScreen, navigate } = useAppContext();
  
  const isActivity = ['files', 'branches', 'insights', 'commits', 'prs'].includes(currentScreen);

  return (
    <nav className="shrink-0 bg-[#121214]/95 backdrop-blur-md border-t border-[#2A2A2E] flex justify-around px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1.5 z-40">
      {/* Home tab */}
      <button 
        type="button"
        className={`group flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-200 w-14 ${
          currentScreen === 'dash' ? 'text-[#3B82F6]' : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
        }`}
        onClick={() => navigate('dash')}
      >
        <div className={`w-12 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
          currentScreen === 'dash' 
            ? 'bg-[#3B82F6]/15 text-[#3B82F6]' 
            : 'hover:bg-[#1A1A1D]'
        }`}>
          <Home size={18} strokeWidth={currentScreen === 'dash' ? 2.5 : 2} />
        </div>
        <span className="text-[11px] font-medium leading-tight">Home</span>
      </button>

      {/* Repos tab */}
      <button 
        type="button"
        className={`group flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-200 w-14 ${
          currentScreen === 'repos' && !isActivity ? 'text-[#3B82F6]' : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
        }`}
        onClick={() => navigate('repos')}
      >
        <div className={`w-12 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
          currentScreen === 'repos' && !isActivity 
            ? 'bg-[#3B82F6]/15 text-[#3B82F6]' 
            : 'hover:bg-[#1A1A1D]'
        }`}>
          <Folder size={18} strokeWidth={currentScreen === 'repos' && !isActivity ? 2.5 : 2} />
        </div>
        <span className="text-[11px] font-medium leading-tight">Repos</span>
      </button>

      {/* Clone tab */}
      <button 
        type="button"
        className={`group flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-200 w-14 ${
          currentScreen === 'clone' ? 'text-[#3B82F6]' : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
        }`}
        onClick={() => navigate('clone')}
      >
        <div className={`w-12 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
          currentScreen === 'clone' 
            ? 'bg-[#3B82F6]/15 text-[#3B82F6]' 
            : 'hover:bg-[#1A1A1D]'
        }`}>
          <HardDrive size={18} strokeWidth={currentScreen === 'clone' ? 2.5 : 2} />
        </div>
        <span className="text-[11px] font-medium leading-tight">Clone</span>
      </button>

      {/* Activity tab */}
      <button 
        type="button"
        className={`group flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-200 w-14 ${
          isActivity ? 'text-[#3B82F6]' : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
        }`}
        onClick={() => navigate('commits')}
      >
        <div className={`w-12 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
          isActivity 
            ? 'bg-[#3B82F6]/15 text-[#3B82F6]' 
            : 'hover:bg-[#1A1A1D]'
        }`}>
          <Activity size={18} strokeWidth={isActivity ? 2.5 : 2} />
        </div>
        <span className="text-[11px] font-medium leading-tight">Activity</span>
      </button>

      {/* Settings / More tab */}
      <button 
        type="button"
        className={`group flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-200 w-14 ${
          currentScreen === 'settings' ? 'text-[#3B82F6]' : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
        }`}
        onClick={() => navigate('settings')}
      >
        <div className={`w-12 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
          currentScreen === 'settings' 
            ? 'bg-[#3B82F6]/15 text-[#3B82F6]' 
            : 'hover:bg-[#1A1A1D]'
        }`}>
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={currentScreen === 'settings' ? 2.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.g 
              style={{ transformOrigin: '50% 50%', transformBox: 'fill-box' }}
              animate={currentScreen === 'settings' ? { rotate: 180 } : { rotate: 0 }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" fill="none"></path>
              <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="none"></path>
              <path d="M12 2v2"></path>
              <path d="M12 22v-2"></path>
              <path d="m17 20.66-1-1.73"></path>
              <path d="M11 10.27 7 3.34"></path>
              <path d="m20.66 17-1.73-1"></path>
              <path d="m3.34 7 1.73 1"></path>
              <path d="M14 12h8"></path>
              <path d="M2 12h2"></path>
              <path d="m20.66 7-1.73 1"></path>
              <path d="m3.34 17 1.73-1"></path>
              <path d="m17 3.34-1 1.73"></path>
              <path d="m11 13.73-4 6.93"></path>
            </motion.g>
          </motion.svg>
        </div>
        <span className="text-[11px] font-medium leading-tight">Settings</span>
      </button>
    </nav>
  );
};
