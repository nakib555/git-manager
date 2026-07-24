import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { Menu, Bell, Plus, ArrowLeft, ChevronDown, MoreVertical, Folder, Activity, Search, Grid, Home, GitBranch } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentScreen, currentRepo, navigate, openDrawer, openActionSheet } = useAppContext();

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
              <button className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-text-main" onClick={openActionSheet}>
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
              <button className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-text-main" onClick={openActionSheet}>
                <Plus size={18} />
              </button>
            </div>
          )
        };
      case 'settings':
        return {
          title: 'Settings',
          sub: '',
          left: <ArrowLeft size={24} onClick={() => navigate('dash')} className="cursor-pointer" />,
          right: <MoreVertical size={24} />
        };
      case 'insights':
        return {
          title: 'Insights',
          sub: currentRepo,
          left: <ArrowLeft size={24} onClick={() => navigate('repos')} className="cursor-pointer" />,
          right: <span className="text-xs text-text-muted flex items-center">This Month <ChevronDown size={14} className="ml-1 font-bold" /></span>
        };
      case 'files':
      case 'commits':
        return {
          title: currentScreen === 'files' ? 'Files' : 'Commits',
          sub: currentRepo,
          left: <ArrowLeft size={24} onClick={() => navigate('repos')} className="cursor-pointer" />,
          right: (
            <button className="bg-card border border-border rounded-lg px-3 py-1.5 text-[13px] font-semibold flex items-center text-text-main">
              <GitBranch size={14} className="mr-1" /> main {currentScreen === 'files' && <ChevronDown size={14} className="ml-1" />}
            </button>
          )
        };
      case 'branches':
      case 'prs':
        return {
          title: currentScreen === 'branches' ? 'Branches' : 'Pull Requests',
          sub: currentRepo,
          left: <ArrowLeft size={24} onClick={() => navigate('repos')} className="cursor-pointer" />,
          right: (
            <button className="bg-primary rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white" onClick={openActionSheet}>
              + New {currentScreen === 'branches' ? 'Branch' : 'PR'}
            </button>
          )
        };
      default:
        return { title: 'App', left: null, right: null, sub: '' };
    }
  };

  const content = getHeaderContent();

  return (
    <header className="flex-shrink-0 flex justify-between items-center px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] bg-main z-10">
      <div className="text-text-main flex items-center justify-center">{content.left}</div>
      <div className="text-[17px] font-semibold flex flex-col items-center">
        {content.title}
        {content.sub && (
          <span className="text-[11px] text-text-muted font-normal mt-0.5 flex items-center gap-1">
            <Folder size={10} className="text-primary" fill="currentColor" /> {content.sub}
          </span>
        )}
      </div>
      <div className="text-text-main flex items-center justify-center">{content.right}</div>
    </header>
  );
};

export const RepoTabs: React.FC = () => {
  const { currentScreen, navigate, currentRepo } = useAppContext();
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

export const BottomNav: React.FC = () => {
  const { currentScreen, navigate, setSearchFocus } = useAppContext();
  
  const isActivity = ['files', 'branches', 'insights', 'commits', 'prs'].includes(currentScreen);

  const getNavClass = (isActive: boolean, activeColorClass: string) => 
    `flex flex-col items-center gap-1.5 text-[11px] font-medium cursor-pointer transition-colors duration-200 ${isActive ? activeColorClass : 'text-text-muted'}`;

  const getIconClass = (isActive: boolean) => 
    `transition-transform duration-200 ${isActive ? '-translate-y-0.5' : ''}`;

  return (
    <nav className="flex-shrink-0 bg-main/95 backdrop-blur-md border-t border-border flex justify-around px-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 z-50">
      <div className={getNavClass(currentScreen === 'dash', 'text-blue-500')} onClick={() => navigate('dash')}>
        <Home size={24} className={getIconClass(currentScreen === 'dash')} fill={currentScreen === 'dash' ? 'currentColor' : 'none'} />
        <span>Home</span>
      </div>
      <div className={getNavClass(currentScreen === 'repos' && !isActivity, 'text-purple-500')} onClick={() => navigate('repos')}>
        <Folder size={24} className={getIconClass(currentScreen === 'repos' && !isActivity)} fill={currentScreen === 'repos' && !isActivity ? 'currentColor' : 'none'} />
        <span>Repos</span>
      </div>
      <div className={getNavClass(isActivity, 'text-pink-500')} onClick={() => navigate('commits')}>
        <Activity size={24} className={getIconClass(isActivity)} />
        <span>Activity</span>
      </div>
      <div className={getNavClass(false, 'text-orange-500')} onClick={() => { navigate('repos'); setSearchFocus(true); }}>
        <Search size={24} className={getIconClass(false)} />
        <span>Search</span>
      </div>
      <div className={getNavClass(currentScreen === 'settings', 'text-green-500')} onClick={() => navigate('settings')}>
        <Grid size={24} className={getIconClass(currentScreen === 'settings')} fill={currentScreen === 'settings' ? 'currentColor' : 'none'} />
        <span>More</span>
      </div>
    </nav>
  );
};
