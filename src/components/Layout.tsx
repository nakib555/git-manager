import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { Menu, Bell, Plus, ArrowLeft, ChevronDown, MoreVertical, Folder, Activity, Search, Grid, Home, GitBranch, ChevronLeft, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';

export const Header: React.FC = () => {
  const { currentScreen, currentRepo, currentRepoOwner, currentBranch, activeBranches, switchBranch, navigate, openDrawer, openActionSheet } = useAppContext();
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const getHeaderContent = () => {
    switch (currentScreen) {
      case 'dash':
        return {
          title: 'Dashboard',
          sub: '',
          left: <Menu size={24} />,
          right: (
            <div className="flex gap-3">
              <button className="relative text-text-main" onClick={openDrawer}>
                <Bell size={24} />
                <div className="absolute top-0 right-0.5 w-2 h-2 bg-danger rounded-full border-2 border-main"></div>
              </button>
              <button className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-text-main header-action-btn" onClick={openActionSheet}>
                <Plus size={18} />
              </button>
            </div>
          )
        };
      case 'repos':
        return {
          title: 'Repositories',
          sub: '',
          left: <Menu size={24} />,
          right: (
            <div className="flex gap-3">
              <button className="text-text-main" onClick={openDrawer}><Bell size={24} /></button>
              <button className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-text-main header-action-btn" onClick={openActionSheet}>
                <Plus size={18} />
              </button>
            </div>
          )
        };
      case 'settings':
        return {
          title: 'Settings',
          sub: '',
          left: <AnimatedChevronLeft onClick={() => navigate('dash')} />,
          right: <MoreVertical size={24} />
        };
      case 'insights':
        return {
          title: 'Insights',
          sub: currentRepo,
          left: <AnimatedChevronLeft onClick={() => navigate('repos')} />,
          right: <span className="text-xs text-text-muted flex items-center">This Month <ChevronDown size={14} className="ml-1 font-bold" /></span>
        };
      case 'files':
      case 'commits':
        return {
          title: currentScreen === 'files' ? 'Files' : 'Commits',
          sub: currentRepo,
          left: <AnimatedChevronLeft onClick={() => navigate('repos')} />,
          right: (
            <div className="relative">
              <button 
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="bg-card border border-border rounded-lg px-3 py-1.5 text-[13px] font-semibold flex items-center text-text-main hover:bg-hover active:scale-95 transition-all cursor-pointer"
              >
                <GitBranch size={14} className="mr-1 text-primary animate-pulse" />
                <span className="max-w-[80px] truncate">{currentBranch || 'main'}</span>
                <ChevronDown size={14} className="ml-1" />
              </button>
              {isBranchDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsBranchDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-lg py-1.5 z-50 max-h-64 overflow-y-auto">
                    <div className="px-3 py-1 border-b border-border text-[9px] uppercase tracking-wider font-bold text-text-muted">Branches</div>
                    {activeBranches.map((b) => (
                      <button
                        key={b.name}
                        onClick={() => {
                          switchBranch(b.name);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-hover ${
                          b.name === (currentBranch || 'main') ? 'text-primary font-bold bg-primary/5' : 'text-text-main font-medium'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        {b.name === (currentBranch || 'main') && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                      </button>
                    ))}
                    {activeBranches.length === 0 && (
                      <div className="px-3 py-2 text-xs text-text-muted text-center">No branches found</div>
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
          left: <AnimatedChevronLeft onClick={() => navigate('repos')} />,
          right: (
            <button className="bg-primary rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white" onClick={openActionSheet}>
              + New {currentScreen === 'branches' ? 'Branch' : 'PR'}
            </button>
          )
        };
      case 'clone':
        return {
          title: 'Clone Repository',
          sub: '',
          left: <Menu size={24} onClick={openDrawer} className="cursor-pointer" />,
          right: (
            <div className="flex gap-3">
              <button className="text-text-main" onClick={openDrawer}><Bell size={24}/></button>
              <button className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-text-main header-action-btn" onClick={openActionSheet}>
                <Plus size={18} />
              </button>
            </div>
          )
        };
      default:
        return { title: 'App', left: null, right: null, sub: '' };
    }
  };

  const content = getHeaderContent();

  const isRepoScreen = ['files', 'commits', 'branches', 'insights', 'prs'].includes(currentScreen);

  return (
    <header className="flex-shrink-0 flex items-center px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] bg-main z-10 gap-3">
      <div className="text-text-main flex items-center justify-center shrink-0">
        {content.left}
      </div>
      
      <div className="text-[17px] font-bold flex flex-col items-start text-left min-w-0 flex-1 ml-0">
        {isRepoScreen && currentRepo ? (
          <>
            <div className="flex items-center gap-1.5 text-[15px] font-semibold text-text-muted leading-none truncate w-full">
              <span className="truncate max-w-[100px] text-text-muted">{currentRepoOwner || 'workspace'}</span>
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text-muted/60 shrink-0 mx-0.5"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </motion.svg>
              <span className="font-bold text-text-main truncate">{currentRepo}</span>
            </div>
            <span className="text-[11px] text-text-muted font-normal mt-1 flex items-center gap-1 leading-none">
              <Folder size={10} className="text-primary" fill="currentColor" /> {content.title}
            </span>
          </>
        ) : (
          <>
            <span className="text-text-main font-bold truncate leading-none">{content.title}</span>
            {content.sub && (
              <span className="text-[11px] text-text-muted font-normal mt-1 flex items-center gap-1 leading-none">
                <Folder size={10} className="text-primary" fill="currentColor" /> {content.sub}
              </span>
            )}
          </>
        )}
      </div>

      <div className="text-text-main flex items-center justify-center shrink-0">
        {content.right}
      </div>
    </header>
  );
};

export const RepoTabs: React.FC = () => {
  const { currentScreen, navigate, currentRepo, openModal } = useAppContext();
  const isRepoScreen = ['files', 'commits', 'branches', 'insights', 'prs'].includes(currentScreen);

  if (!isRepoScreen || !currentRepo) return null;

  const tabs = [
    { id: 'commits', label: 'Commits' },
    { id: 'prs', label: 'Pull Requests' },
    { id: 'branches', label: 'Branches' },
    { id: 'files', label: 'Files' },
    { id: 'insights', label: 'Insights' },
  ] as const;

  return (
    <div className="flex-shrink-0 flex gap-4 overflow-x-auto px-5 pb-3 border-b border-border mb-4 no-scrollbar">
      {tabs.map(tab => (
        <div 
          key={tab.id}
          className={`text-[13px] font-medium whitespace-nowrap pb-2 relative cursor-pointer transition-colors duration-200 ${currentScreen === tab.id ? 'text-primary' : 'text-text-muted'}`}
          onClick={() => navigate(tab.id as any)}
        >
          {tab.label}
          {currentScreen === tab.id && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-sm"></div>
          )}
        </div>
      ))}
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
  const { currentScreen, navigate, setSearchFocus } = useAppContext();
  
  const isActivity = ['files', 'branches', 'insights', 'commits', 'prs'].includes(currentScreen);

  const getIconClass = (isActive: boolean) => 
    `transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`;

  return (
    <nav className="flex-shrink-0 bg-main/95 backdrop-blur-md border-t border-border flex justify-around px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 z-50">
      {/* Home tab */}
      <div 
        className={`group flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer transition-all duration-200 w-16 ${
          currentScreen === 'dash' ? 'text-blue-500' : 'text-text-muted hover:text-text-main'
        }`}
        onClick={() => navigate('dash')}
      >
        <div className={`w-12 h-8 flex items-center justify-center rounded-2xl transition-all duration-300 ${
          currentScreen === 'dash' 
            ? 'bg-blue-500/10 text-blue-500' 
            : 'hover:bg-hover'
        }`}>
          <Home size={20} className={getIconClass(currentScreen === 'dash')} />
        </div>
        <span className="text-[10px]">Home</span>
      </div>

      {/* Repos tab */}
      <div 
        className={`group flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer transition-all duration-200 w-16 ${
          currentScreen === 'repos' && !isActivity ? 'text-purple-500' : 'text-text-muted hover:text-text-main'
        }`}
        onClick={() => navigate('repos')}
      >
        <div className={`w-12 h-8 flex items-center justify-center rounded-2xl transition-all duration-300 ${
          currentScreen === 'repos' && !isActivity 
            ? 'bg-purple-500/10 text-purple-500' 
            : 'hover:bg-hover'
        }`}>
          <Folder size={20} className={getIconClass(currentScreen === 'repos' && !isActivity)} />
        </div>
        <span className="text-[10px]">Repos</span>
      </div>

      {/* Clone tab */}
      <div 
        className={`group flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer transition-all duration-200 w-16 ${
          currentScreen === 'clone' ? 'text-teal-500' : 'text-text-muted hover:text-text-main'
        }`}
        onClick={() => navigate('clone')}
      >
        <div className={`w-12 h-8 flex items-center justify-center rounded-2xl transition-all duration-300 ${
          currentScreen === 'clone' 
            ? 'bg-teal-500/10 text-teal-500' 
            : 'hover:bg-hover'
        }`}>
          <HardDrive size={20} className={getIconClass(currentScreen === 'clone')} />
        </div>
        <span className="text-[10px]">Clone</span>
      </div>

      {/* Activity tab */}
      <div 
        className={`group flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer transition-all duration-200 w-16 ${
          isActivity ? 'text-pink-500' : 'text-text-muted hover:text-text-main'
        }`}
        onClick={() => navigate('commits')}
      >
        <div className={`w-12 h-8 flex items-center justify-center rounded-2xl transition-all duration-300 ${
          isActivity 
            ? 'bg-pink-500/10 text-pink-500' 
            : 'hover:bg-hover'
        }`}>
          <Activity size={20} className={getIconClass(isActivity)} />
        </div>
        <span className="text-[10px]">Activity</span>
      </div>

      {/* Settings / More tab */}
      <div 
        className={`group flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer transition-all duration-200 w-16 ${
          currentScreen === 'settings' ? 'text-green-500' : 'text-text-muted hover:text-text-main'
        }`}
        onClick={() => navigate('settings')}
      >
        <div className={`w-12 h-8 flex items-center justify-center rounded-2xl transition-all duration-300 ${
          currentScreen === 'settings' 
            ? 'bg-green-500/10 text-green-500' 
            : 'hover:bg-hover'
        }`}>
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={getIconClass(currentScreen === 'settings')}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
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
        <span className="text-[10px]">More</span>
      </div>
    </nav>
  );
};
