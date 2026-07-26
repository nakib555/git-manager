import React, { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CommitList } from './commit/CommitList';
import { DiffViewer } from './commit/DiffViewer';
import { CiCdPipelineFlow } from './commit/CiCdStatus';
import { PRsScreen } from '../screens/repodetails/PRsScreen';
import { CloneScreen } from '../screens/CloneScreen';
import { 
  Search, Lock, Globe, Square, FolderGit2, Folder, GitBranch, 
  GitPullRequest, GitCommit, Check, Key, ExternalLink, ShieldAlert, 
  User, Moon, Sun, ChevronRight, Github, Cloud, KeySquare, Bell, 
  Sliders, ArrowLeft, MoreVertical, Activity, Grid, Home, Eye, 
  EyeOff, RefreshCw, ChevronDown, BookOpen, Clock, FileText, 
  FileCode, Terminal, HelpCircle, Edit2, Trash2, Undo, Tag, RotateCcw,
  AlertCircle, HardDrive, X, Star, GitFork
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const getLanguageColor = (lang: string | null) => {
  if (!lang) return '#8F8F9D';
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Rust: '#DEA584',
    Swift: '#F05138',
    Go: '#00ADD8',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
  };
  return colors[lang] || '#8F8F9D';
};

export const DesktopLayout: React.FC = () => {
  const { 
    currentScreen, currentRepo, navigate, githubUser, githubRepos, 
    disconnectGitHub, theme, toggleTheme, connectGitHub, openModal,
    toastMessage, githubToken
  } = useAppContext();

  const [searchFocused, setSearchFocused] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Handle active sub-tab for Repository details screen
  const isRepoScreen = ['files', 'commits', 'branches', 'insights', 'prs', 'clone'].includes(currentScreen);

  return (
    <div className="flex w-full h-full bg-main overflow-hidden text-text-main animate-fade-up">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-72 bg-card border-r border-border flex flex-col justify-between shrink-0 h-full">
        <div className="flex flex-col overflow-y-auto no-scrollbar flex-1 p-5">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 mb-8 px-1">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none">
                <path d="M50 15L85 35V65L50 85L15 65V35L50 15Z" fill="rgba(255,255,255,0.2)" stroke="#FFF" strokeWidth="6"/>
                <path d="M50 15L85 35L50 55L15 35L50 15Z" fill="#FFF"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">Git <span className="text-primary">Manager</span></span>
              <span className="block text-[10px] text-text-muted font-bold tracking-widest uppercase">Desktop Workstation</span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="bg-hover/20 border border-border/60 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              {githubUser ? (
                <img src={githubUser.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border border-border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-hover border border-border flex items-center justify-center text-text-muted">
                  <User size={18} />
                </div>
              )}
              <div className="overflow-hidden">
                <span className="block font-semibold text-xs text-text-main truncate">
                  {githubUser ? (githubUser.name || githubUser.login) : 'Guest Developer'}
                </span>
                <span className="block text-[10px] text-text-muted truncate mt-0.5">
                  {githubUser ? `@${githubUser.login}` : 'Offline Mode'}
                </span>
              </div>
            </div>
            
            {githubUser && githubUser.bio && (
              <p className="text-[10px] text-text-muted mt-2.5 line-clamp-2 leading-relaxed italic border-t border-border/40 pt-2">
                "{githubUser.bio}"
              </p>
            )}

            <div className="mt-3.5 flex gap-2">
              {githubToken ? (
                <button 
                  onClick={disconnectGitHub}
                  className="flex-1 bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger py-1.5 px-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                >
                  Disconnect
                </button>
              ) : (
                <button 
                  onClick={connectGitHub}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white py-1.5 px-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-primary/15"
                >
                  <Github size={11} /> Connect GitHub
                </button>
              )}
            </div>
          </div>

          {/* Global Navigation links */}
          <div className="space-y-1">
            <span className="block text-[9px] font-bold text-text-muted uppercase tracking-widest mb-2 px-1">Main Workspace</span>
            
            <button 
              onClick={() => navigate('dash')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentScreen === 'dash' ? 'bg-primary/10 text-primary border border-primary/25' : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'}`}
            >
              <Home size={15} />
              <span>Dashboard Overview</span>
            </button>

            <button 
              onClick={() => navigate('repos')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentScreen === 'repos' ? 'bg-primary/10 text-primary border border-primary/25' : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'}`}
            >
              <FolderGit2 size={15} />
              <span>Repositories Explorer</span>
            </button>

            <button 
              onClick={() => navigate('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentScreen === 'settings' ? 'bg-primary/10 text-primary border border-primary/25' : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'}`}
            >
              <Sliders size={15} />
              <span>Settings Panel</span>
            </button>
          </div>

          {/* Repository Sub-navigation */}
          {currentRepo && (
            <div className="mt-8 space-y-1">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Active Repository</span>
                <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/15 truncate max-w-[120px]" title={currentRepo}>
                  {currentRepo}
                </span>
              </div>

              {[
                { id: 'commits', label: 'Commits History', icon: GitCommit },
                { id: 'prs', label: 'Pull Requests', icon: GitPullRequest },
                { id: 'branches', label: 'Branch Manager', icon: GitBranch },
                { id: 'files', label: 'Code Explorer', icon: FileCode },
                { id: 'insights', label: 'Repository Insights', icon: Activity }, { id: 'clone', label: 'Clone Repository', icon: HardDrive },
              ].map(item => {
                const isActive = currentScreen === item.id;
                const Icon = item.icon;
                return (
                  <button 
                    key={item.id}
                    onClick={() => navigate(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive ? 'bg-primary/10 text-primary border border-primary/25 font-bold' : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'}`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Footer Status Bar */}
        <div className="p-4 border-t border-border bg-hover/10 flex items-center justify-between text-[10px] text-text-muted font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span>Developer Station OK</span>
          </span>
          <span>v2.4.1</span>
        </div>
      </aside>

      {/* 2. WORKSPACE CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-main">
        {/* Header bar */}
        <header className="h-16 px-8 border-b border-border flex items-center justify-between shrink-0 bg-card/40 backdrop-blur-md">
          {/* Top Search bar */}
          <div className={`w-80 bg-card border rounded-xl px-3 py-2 flex items-center gap-2.5 transition-all duration-200 ${searchFocused ? 'border-primary ring-4 ring-primary/10' : 'border-border'}`}>
            <Search size={16} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search workspaces, repos..." 
              className="bg-transparent border-none text-xs text-text-main w-full outline-none placeholder:text-text-muted"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-3">
            {/* Quick Clone repo button */}
            <button 
              onClick={() => navigate('clone')}
              className="bg-card border border-border hover:border-primary/50 text-text-main hover:text-primary text-xs font-bold py-2 px-4 rounded-xl active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Clone Repository</span>
            </button>
            {/* Quick Create repo button */}
            <button 
              onClick={() => openModal('repo')}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-4 rounded-xl active:scale-95 transition-all shadow-sm shadow-primary/15 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Create Repository</span>
            </button>

            {/* Theme selector */}
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 border border-border bg-card rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary/30 transition-all cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notification triggers */}
            <div className="relative">
              <button 
                className="w-9 h-9 border border-border bg-card rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary/30 transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-card" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-hidden p-8 relative min-h-0 flex flex-col">
          {currentScreen === 'dash' && (
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
              <DesktopDashboard globalSearch={globalSearch} />
            </div>
          )}
          {currentScreen === 'repos' && <DesktopRepositories globalSearch={globalSearch} />}
          {isRepoScreen && <DesktopRepoWorkspace />}
          {currentScreen === 'settings' && (
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
              <DesktopSettings />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

/* ==========================================
   DESKTOP SCREEN COMPONENTS
   ========================================== */

/**
 * 1. DESKTOP DASHBOARD VIEW
 */
const DesktopDashboard: React.FC<{ globalSearch: string }> = ({ globalSearch }) => {
  const { githubUser, githubRepos, connectGitHub, githubToken, sessionCommitsCount, openRepo } = useAppContext();
  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Week');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Chart visibility parameters
  const [showCommitsLine, setShowCommitsLine] = useState(true);
  const [showPRsLine, setShowPRsLine] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isSlidersOpen, setIsSlidersOpen] = useState(false);

  const [actualEvents, setActualEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    if (githubUser && githubToken && typeof githubToken === 'string') {
      setIsLoadingEvents(true);
      const headers = {
        Authorization: githubToken.startsWith('gh') ? `Bearer ${githubToken}` : `token ${githubToken}`
      };
      fetch(`https://api.github.com/users/${githubUser.login}/events?per_page=100`, { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setActualEvents(data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingEvents(false));
    }
  }, [githubUser, githubToken]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  let allCommits: any[] = [];
  let allPRs: any[] = [];
  githubRepos.forEach(repo => {
    const key = `local_details_${repo.name}_commits`;
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          allCommits = allCommits.concat(parsed);
        }
      } catch (e) {}
    }
    const prsKey = `local_details_${repo.name}_prs`;
    const prsLocal = localStorage.getItem(prsKey);
    if (prsLocal) {
      try {
        const parsed = JSON.parse(prsLocal);
        if (Array.isArray(parsed)) {
          allPRs = allPRs.concat(parsed);
        }
      } catch (e) {}
    }
  });

  const displayCommits = Math.max(allCommits.length, sessionCommitsCount);

  // Generate dynamic chart data based on real aggregated data
  const getChartData = () => {
    const now = new Date();
    let labels: string[] = [];
    let commitsData: number[] = [];
    let prsData: number[] = [];

    switch (timeframe) {
      case 'Day': {
        labels = ['12am', '4am', '8am', '12pm', '4pm', '8pm'];
        commitsData = [0, 0, 0, 0, 0, 0];
        prsData = [0, 0, 0, 0, 0, 0];
        
        actualEvents.forEach(ev => {
          const d = new Date(ev.created_at);
          if (now.getTime() - d.getTime() <= 24 * 60 * 60 * 1000) {
             const hour = d.getHours();
             let bucket = Math.min(5, Math.floor(hour / 4));
             if (ev.type === 'PushEvent') commitsData[bucket] += (ev.payload?.commits?.length || 1);
             if (ev.type === 'PullRequestEvent') prsData[bucket]++;
          }
        });

        allCommits.forEach(c => {
          const d = new Date(c.timestamp || c.created_at || c.time);
          if (!isNaN(d.getTime()) && now.getTime() - d.getTime() <= 24 * 60 * 60 * 1000) {
             const hour = d.getHours();
             let bucket = Math.min(5, Math.floor(hour / 4));
             commitsData[bucket]++;
          }
        });

        allPRs.forEach(p => {
          const d = new Date(p.created_at || p.timestamp || p.time);
          if (!isNaN(d.getTime()) && now.getTime() - d.getTime() <= 24 * 60 * 60 * 1000) {
             const hour = d.getHours();
             let bucket = Math.min(5, Math.floor(hour / 4));
             prsData[bucket]++;
          }
        });
        break;
      }
      case 'Week': {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels = [];
        commitsData = [0, 0, 0, 0, 0, 0, 0];
        prsData = [0, 0, 0, 0, 0, 0, 0];
        
        for(let i=6; i>=0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(dayNames[d.getDay()]);
        }
        
        actualEvents.forEach(ev => {
          const d = new Date(ev.created_at);
          const daysAgo = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
          if (daysAgo < 7 && daysAgo >= 0) {
            const bucket = 6 - daysAgo;
            if (ev.type === 'PushEvent') commitsData[bucket] += (ev.payload?.commits?.length || 1);
            if (ev.type === 'PullRequestEvent') prsData[bucket]++;
          }
        });

        allCommits.forEach(c => {
          const d = new Date(c.timestamp || c.created_at || c.time);
          if (!isNaN(d.getTime())) {
            const daysAgo = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
            if (daysAgo < 7 && daysAgo >= 0) {
              const bucket = 6 - daysAgo;
              commitsData[bucket]++;
            }
          }
        });

        allPRs.forEach(p => {
          const d = new Date(p.created_at || p.timestamp || p.time);
          if (!isNaN(d.getTime())) {
            const daysAgo = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
            if (daysAgo < 7 && daysAgo >= 0) {
              const bucket = 6 - daysAgo;
              prsData[bucket]++;
            }
          }
        });
        break;
      }
      case 'Month': {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        commitsData = [0, 0, 0, 0];
        prsData = [0, 0, 0, 0];

        actualEvents.forEach(ev => {
          const d = new Date(ev.created_at);
          const daysAgo = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
          if (daysAgo < 28 && daysAgo >= 0) {
            const bucket = Math.min(3, 3 - Math.floor(daysAgo / 7));
            if (ev.type === 'PushEvent') commitsData[bucket] += (ev.payload?.commits?.length || 1);
            if (ev.type === 'PullRequestEvent') prsData[bucket]++;
          }
        });

        allCommits.forEach(c => {
          const d = new Date(c.timestamp || c.created_at || c.time);
          if (!isNaN(d.getTime())) {
            const daysAgo = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
            if (daysAgo < 28 && daysAgo >= 0) {
              const bucket = Math.min(3, 3 - Math.floor(daysAgo / 7));
              commitsData[bucket]++;
            }
          }
        });

        allPRs.forEach(p => {
          const d = new Date(p.created_at || p.timestamp || p.time);
          if (!isNaN(d.getTime())) {
            const daysAgo = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
            if (daysAgo < 28 && daysAgo >= 0) {
              const bucket = Math.min(3, 3 - Math.floor(daysAgo / 7));
              prsData[bucket]++;
            }
          }
        });
        break;
      }
      case 'Year': {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        labels = [];
        commitsData = new Array(12).fill(0);
        prsData = new Array(12).fill(0);
        
        for(let i=11; i>=0; i--) {
           const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
           labels.push(monthNames[d.getMonth()]);
        }
        
        actualEvents.forEach(ev => {
          const d = new Date(ev.created_at);
          const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
          if (monthsAgo < 12 && monthsAgo >= 0) {
             const bucket = 11 - monthsAgo;
             if (ev.type === 'PushEvent') commitsData[bucket] += (ev.payload?.commits?.length || 1);
             if (ev.type === 'PullRequestEvent') prsData[bucket]++;
          }
        });

        allCommits.forEach(c => {
          const d = new Date(c.timestamp || c.created_at || c.time);
          if (!isNaN(d.getTime())) {
            const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
            if (monthsAgo < 12 && monthsAgo >= 0) {
              const bucket = 11 - monthsAgo;
              commitsData[bucket]++;
            }
          }
        });

        allPRs.forEach(p => {
          const d = new Date(p.created_at || p.timestamp || p.time);
          if (!isNaN(d.getTime())) {
            const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
            if (monthsAgo < 12 && monthsAgo >= 0) {
              const bucket = 11 - monthsAgo;
              prsData[bucket]++;
            }
          }
        });
        break;
      }
    }
    
    return labels.map((label, idx) => ({
      name: label,
      commits: commitsData[idx],
      prs: showPRsLine ? prsData[idx] : 0
    }));
  };

  const chartData = getChartData();

  // Filter repositories based on search query
  const filteredRepos = githubRepos.filter(r => 
    r.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(globalSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Intro section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {githubUser ? `👋 Welcome back, ${githubUser.name || githubUser.login}` : '👋 Welcome, Guest Developer'}
          </h1>
          <p className="text-xs text-text-muted font-medium">Monitor version telemetry, active repository states, and commit distributions.</p>
        </div>
      </div>

      {/* GitHub warning card */}
      {!githubToken && (
        <div className="bg-card/45 border border-border p-5 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Github size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Synchronize with Real GitHub Profiles</h3>
              <p className="text-xs text-text-muted mt-0.5 max-w-xl">
                Unconnected to cloud servers. Link your actual GitHub profile to synchronize version timelines, real branches, pull request activities, and code visualizers.
              </p>
            </div>
          </div>
          <button 
            onClick={connectGitHub}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm shadow-primary/15 shrink-0"
          >
            Connect Profile
          </button>
        </div>
      )}

      {/* Bento Metric Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card p-5 rounded-2xl border border-border flex flex-col justify-between">
          <div>
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Total Repositories</span>
            <span className="text-3xl font-extrabold text-text-main">{githubRepos.length}</span>
          </div>
          <span className="block text-[10px] text-primary font-semibold mt-4">
            {githubToken ? '✓ Active Cloud Sync' : '✓ Offline State Store'}
          </span>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border flex flex-col justify-between">
          <div>
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Workspace Commits</span>
            <span className="text-3xl font-extrabold text-text-main">{displayCommits}</span>
          </div>
          <span className="block text-[10px] text-info font-semibold mt-4">
            {allCommits.length > sessionCommitsCount ? '✓ All Sync Records Found' : '✓ Active Session Commits'}
          </span>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border flex flex-col justify-between">
          <div>
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">GitHub Status</span>
            <span className="text-xl font-extrabold text-text-main flex items-center gap-2 truncate">
              {githubUser ? (
                <>
                  <img src={githubUser.avatar_url} className="w-6 h-6 rounded-full border border-border shrink-0" alt="" />
                  <span className="truncate">{githubUser.login}</span>
                </>
              ) : (
                'Disconnected'
              )}
            </span>
          </div>
          <span className="block text-[10px] text-text-muted font-semibold mt-4">
            {githubUser ? '✓ Verified Account Session' : '✗ Offline Mode'}
          </span>
        </div>
      </div>

      {/* Analytical Layout: Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main: Chart Panel */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold">Activity Telemetry Overview</h2>
              <span className="text-[11px] text-text-muted">Interactive telemetry curves of code integrations</span>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-hover/30 hover:bg-hover/60 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-text-main transition-colors"
              >
                <span>{timeframe === 'Day' ? 'Today' : `This ${timeframe}`}</span>
                <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-9 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20 w-36 py-1"
                  >
                    {(['Day', 'Week', 'Month', 'Year'] as const).map(t => (
                      <button 
                        key={t}
                        onClick={() => { setTimeframe(t); setShowDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-hover/40 ${timeframe === t ? 'text-primary font-bold bg-primary/5' : 'text-text-main'}`}
                      >
                        {t === 'Day' ? 'Today' : `This ${t}`}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="infoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />}
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={8}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-8}
                />
                <Tooltip cursor={false} 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontSize: '11px',
                    color: 'var(--text-main)',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                {showCommitsLine && (
                  <Area type="monotone" dataKey="commits" name="Commits Volume" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#primaryGrad)" />
                )}
                {showPRsLine && (
                  <Area type="monotone" dataKey="prs" name="Pull Request Activity" stroke="#38BDF8" strokeWidth={2.5} fillOpacity={1} fill="url(#infoGrad)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-border pt-3.5 mt-4 flex items-center justify-between shrink-0">
            <button 
              onClick={() => setIsSlidersOpen(!isSlidersOpen)}
              className="text-xs font-bold text-primary flex items-center gap-1.5 cursor-pointer hover:text-primary-hover transition-colors"
            >
              <Sliders size={14} />
              <span>{isSlidersOpen ? 'Hide Display Options' : 'Adjust Chart Display'}</span>
            </button>
            <div className="flex gap-4 text-[10px] font-bold text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED]" /> Commits
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" /> PR Activity
              </span>
            </div>
          </div>

          <AnimatePresence>
            {isSlidersOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 rounded-xl bg-hover/15 border border-border flex flex-col gap-4 text-xs">
                  <div>
                    <span className="block font-bold text-text-main mb-2">Series Visibility & Layout</span>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setShowCommitsLine(!showCommitsLine)}
                        className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${showCommitsLine ? 'bg-[#7C3AED]/10 border-[#7C3AED]/35 text-[#7C3AED]' : 'border-border text-text-muted bg-card'}`}
                      >
                        {showCommitsLine ? '✓ Commits Visible' : '✗ Commits Hidden'}
                      </button>
                      <button 
                        onClick={() => setShowPRsLine(!showPRsLine)}
                        className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${showPRsLine ? 'bg-[#38BDF8]/10 border-[#38BDF8]/35 text-[#38BDF8]' : 'border-border text-text-muted bg-card'}`}
                      >
                        {showPRsLine ? '✓ PRs Visible' : '✗ PRs Hidden'}
                      </button>
                      <button 
                        onClick={() => setShowGrid(!showGrid)}
                        className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${showGrid ? 'bg-primary/10 border-primary/35 text-primary' : 'border-border text-text-muted bg-card'}`}
                      >
                        {showGrid ? '✓ Grid Lines On' : '✗ Grid Lines Off'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: Recent Activity list */}
        <div className="bg-card p-6 rounded-2xl border border-border flex flex-col h-[400px]">
          <h2 className="text-sm font-bold mb-1 shrink-0">Recent Repositories</h2>
          <span className="text-[11px] text-text-muted mb-4 block shrink-0">Active workspaces synced recently</span>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {filteredRepos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <FolderGit2 size={32} className="text-text-muted mb-2" />
                <span className="block font-semibold text-xs text-text-main">No workspaces found</span>
                <span className="block text-[10px] text-text-muted mt-1">Create a new local repository to begin.</span>
              </div>
            ) : (
              filteredRepos.slice(0, 5).map(repo => (
                <div 
                  key={repo.id} 
                  onClick={() => openRepo(repo.name, (repo as any).owner?.login || null)}
                  className="flex items-center justify-between p-3 border border-border bg-hover/10 rounded-xl hover:border-primary/35 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FolderGit2 size={15} />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-text-main group-hover:text-primary transition-colors truncate">{repo.name}</span>
                      <span className="block text-[10px] text-text-muted truncate mt-0.5">{repo.description || 'No description provided.'}</span>
                    </div>
                  </div>
                  
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${repo.private ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-success/10 border-success/20 text-success'}`}>
                    {repo.private ? 'Private' : 'Public'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 2. DESKTOP REPOSITORIES EXPLORER (THREE-PANE SPLIT WORKSPACE)
 */
const DesktopRepositories: React.FC<{ globalSearch: string }> = ({ globalSearch }) => {
  const { openRepo, githubRepos, openModal } = useAppContext();
  const [filter, setFilter] = useState<'All' | 'Private' | 'Public'>('All');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  const searchVal = globalSearch || localSearch;

  const displayRepos = githubRepos.map(repo => {
    const lang = repo.language || 'Unknown';
    return {
      id: repo.name,
      name: repo.name,
      owner: (repo as any).owner?.login || null,
      isPrivate: repo.private,
      desc: repo.description || 'No description provided.',
      lang,
      langColor: getLanguageColor(lang),
      updated: new Date(repo.pushed_at).toLocaleDateString(),
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      watching: repo.watchers_count || 0,
    };
  });

  const filteredRepos = displayRepos.filter(repo => {
    if (searchVal && !repo.name.toLowerCase().includes(searchVal.toLowerCase())) return false;
    if (filter === 'Private' && !repo.isPrivate) return false;
    if (filter === 'Public' && repo.isPrivate) return false;
    return true;
  });

  // Automatically select first repo if none selected
  useEffect(() => {
    if (filteredRepos.length > 0 && !selectedRepoId) {
      setSelectedRepoId(filteredRepos[0].id);
    }
  }, [filteredRepos, selectedRepoId]);

  const selectedRepo = filteredRepos.find(r => r.id === selectedRepoId);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Repositories Explorer</h1>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Browse, filter, and inspect detailed metadata of version workspaces.</p>
        </div>
      </div>

      {/* Main split viewport layout */}
      <div className="flex-1 min-h-0 flex gap-6 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Left column: Repository navigator list */}
        <div className="w-96 border-r border-border flex flex-col h-full bg-hover/5 shrink-0">
          <div className="p-4 border-b border-border space-y-3 shrink-0">
            {/* Inline search box */}
            <div className="bg-card border border-border rounded-xl px-3 py-2 flex items-center gap-2.5">
              <Search size={15} className="text-text-muted" />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="bg-transparent border-none text-xs text-text-main w-full outline-none placeholder:text-text-muted"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              {(['All', 'Private', 'Public'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 border rounded-xl text-[11px] font-bold transition-all cursor-pointer ${filter === f ? 'bg-primary/10 border-primary/45 text-primary' : 'border-border text-text-muted hover:border-border/85 hover:text-text-main bg-card'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Repo List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {filteredRepos.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <FolderGit2 size={24} className="text-text-muted mb-2" />
                <span className="font-semibold text-xs text-text-main">No repos found</span>
                <span className="text-[10px] text-text-muted mt-1">Try resetting filter categories.</span>
              </div>
            ) : (
              filteredRepos.map(repo => {
                const isSelected = selectedRepoId === repo.id;
                return (
                  <div 
                    key={repo.id}
                    onClick={() => setSelectedRepoId(repo.id)}
                    className={`p-3.5 border rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary/5 border-primary/45 text-primary' : 'border-border bg-card/65 hover:border-border/80 hover:-translate-y-0.5'}`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className={`font-bold text-xs truncate ${isSelected ? 'text-primary' : 'text-text-main'}`}>{repo.name}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${repo.isPrivate ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-success/10 border-success/20 text-success'}`}>
                        {repo.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-text-muted line-clamp-1 truncate">{repo.desc}</p>
                    
                    {/* Repo Stats Row */}
                    <div className="flex items-center gap-3 text-[10px] text-text-muted mt-2">
                      <span className="flex items-center gap-1" title="Stars">
                        <Star size={11} className="text-amber-500 fill-amber-500/10" />
                        <span className="font-semibold text-text-main">{repo.stars.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center gap-1" title="Forks">
                        <GitFork size={11} className="text-blue-500" />
                        <span className="font-semibold text-text-main">{repo.forks.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center gap-1" title="Watching">
                        <Eye size={11} className="text-emerald-500" />
                        <span className="font-semibold text-text-main">{repo.watching.toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-text-muted mt-3 pt-2.5 border-t border-border/30">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.langColor }} />
                        {repo.lang}
                      </span>
                      <span>{repo.updated}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Selected Repository Details Inspector */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
          {selectedRepo ? (
            <div className="space-y-6">
              {/* Header card with big action */}
              <div className="flex justify-between items-start border-b border-border/60 pb-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <FolderGit2 size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-text-main">{selectedRepo.name}</h2>
                      <div className="flex items-center flex-wrap gap-2.5 mt-0.5">
                        <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase block">Workspace Metadata</span>
                        <span className="text-border text-[10px] hidden sm:inline">•</span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1" title="Stars">
                            <Star size={12} className="text-amber-500 fill-amber-500/10" />
                            <span className="font-semibold text-text-main">{selectedRepo.stars.toLocaleString()}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Forks">
                            <GitFork size={12} className="text-blue-500" />
                            <span className="font-semibold text-text-main">{selectedRepo.forks.toLocaleString()}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Watching">
                            <Eye size={12} className="text-emerald-500" />
                            <span className="font-semibold text-text-main">{selectedRepo.watching.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => openRepo(selectedRepo.id, selectedRepo.owner)}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm shadow-primary/15"
                >
                  Open Repository Workspace
                </button>
              </div>

              {/* Grid block with detail stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border p-4 rounded-xl bg-hover/10 space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Visibility</span>
                  <span className="text-xs font-bold text-text-main flex items-center gap-2">
                    {selectedRepo.isPrivate ? (
                      <>
                        <Lock size={12} className="text-danger" /> Private Repository (Secure/Encrypted)
                      </>
                    ) : (
                      <>
                        <Globe size={12} className="text-success" /> Public Repository (Open Source)
                      </>
                    )}
                  </span>
                </div>

                <div className="border border-border p-4 rounded-xl bg-hover/10 space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Code Language Base</span>
                  <span className="text-xs font-bold text-text-main flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedRepo.langColor }} />
                    {selectedRepo.lang} Framework
                  </span>
                </div>

                <div className="border border-border p-4 rounded-xl bg-hover/10 space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Pushed Time Commit</span>
                  <span className="text-xs font-bold text-text-main flex items-center gap-2">
                    <Clock size={12} className="text-info" /> Pushed changes on {selectedRepo.updated}
                  </span>
                </div>

                <div className="border border-border p-4 rounded-xl bg-hover/10 space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Repository Directory Owner</span>
                  <span className="text-xs font-bold text-text-main flex items-center gap-2">
                    <User size={12} className="text-purple-500" /> {selectedRepo.owner || 'Offline Mode'}
                  </span>
                </div>
              </div>

              {/* Description box */}
              <div className="border border-border p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Project Description</span>
                <p className="text-xs text-text-main/90 leading-relaxed font-medium">
                  {selectedRepo.desc}
                </p>
              </div>

              {/* Guide section */}
              <div className="border border-primary/20 bg-primary/5 p-4 rounded-xl flex gap-3.5">
                <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-text-main">Developer Guide Instruction</h4>
                  <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                    To interact, commit code, merge pull requests, branch versions, or view code structures, click on the **"Open Repository Workspace"** action button. The Left navigation sidebar will expand to display dedicated Workspace folders.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <FolderGit2 size={40} className="text-text-muted mb-2" />
              <span className="font-semibold text-sm text-text-main">No Repository Selected</span>
              <span className="text-xs text-text-muted mt-1">Pick a repository from the left pane to analyze metadata.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 3. DESKTOP REPO DETAILS WORKSPACE (INTEGRATES FILES, COMMITS, PRs, BRANCHES, INSIGHTS)
 */
const DesktopRepoWorkspace: React.FC = () => {
  const { currentScreen, isLoadingRepoDetails } = useAppContext();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 flex-1 flex flex-col min-h-0">
      {isLoadingRepoDetails ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <span className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-text-muted font-bold tracking-widest uppercase">Loading workspace metadata...</span>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          {currentScreen === 'files' && <DesktopFilesView />}
          {currentScreen === 'commits' && <DesktopCommitsView />}
          {currentScreen === 'prs' && (
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
              <PRsScreen />
            </div>
          )}
          {currentScreen === 'branches' && <DesktopBranchesView />}
          {currentScreen === 'insights' && <DesktopInsightsView />}
          {currentScreen === 'clone' && <CloneScreen />}
        </div>
      )}
    </div>
  );
};

/**
 * 3.1 DESKTOP CODE FILES EXPLORER VIEW (IDE SIDEBAR + CODE PREVIEW PANEL)
 */

const buildTree = (files: any[]) => {
  const root: any[] = [];
  
  files.forEach(file => {
    const parts = file.name.split('/');
    let currentLevel = root;
    
    parts.forEach((part: string, index: number) => {
      const isLast = index === parts.length - 1;
      const path = parts.slice(0, index + 1).join('/');
      
      let existing = currentLevel.find(item => item.name === part);
      if (!existing) {
        existing = {
          name: part,
          path: path,
          type: isLast ? file.type : 'dir',
          children: isLast && file.type === 'file' ? undefined : []
        };
        currentLevel.push(existing);
      }
      if (existing.children) {
        currentLevel = existing.children;
      }
    });
  });
  
  const sortTree = (nodes: any[]) => {
    nodes.sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(node => {
      if (node.children) sortTree(node.children);
    });
  };
  
  sortTree(root);
  return root;
};

const FileTreeItem = ({ item, depth, activeFileName, onSelect }: any) => {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const isSelected = activeFileName === item.path;
  const isDir = item.type === 'dir';
  const Icon = isDir ? Folder : (item.name.endsWith('.md') ? FileText : FileCode);
  
  return (
    <div className="select-none">
      <div 
        onClick={() => {
          if (isDir) setIsOpen(!isOpen);
          else onSelect(item.path);
        }}
        className={`flex items-center gap-1.5 py-1.5 pr-2 rounded-lg cursor-pointer transition-all text-xs font-semibold ${isSelected ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-main hover:bg-hover/20'}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <div className="flex items-center justify-center w-4 h-4 shrink-0 text-text-muted/70">
          {isDir && (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </div>
        <Icon size={14} className={isDir ? 'text-info' : 'text-primary'} />
        <span className="truncate">{item.name}</span>
      </div>
      {isDir && isOpen && item.children && (
        <div>
          {item.children.map((child: any) => (
            <FileTreeItem key={child.path} item={child} depth={depth + 1} activeFileName={activeFileName} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const DesktopFilesView: React.FC = () => {
  const { activeFiles, currentRepo, githubToken, currentRepoOwner, showToast } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  const filesToDisplay = activeFiles;
  const activeFileName = selectedFile || filesToDisplay[0]?.name || '';

  useEffect(() => {
    const fileName = selectedFile || filesToDisplay[0]?.name;
    if (!fileName) return;

    if (githubToken && typeof githubToken === 'string' && currentRepoOwner) {
      const fetchFileContent = async () => {
        setIsLoadingFile(true);
        try {
          const headers = {
            Authorization: githubToken.startsWith('ghp_') || githubToken.startsWith('github_pat_') || githubToken.startsWith('gho_')
              ? `Bearer ${githubToken}`
              : `token ${githubToken}`
          };
          const res = await fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/contents/${fileName}`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.encoding === 'base64') {
              const decoded = decodeURIComponent(atob(data.content.replace(/\s/g, '')).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              setFileContent(decoded);
            } else {
              setFileContent(data.content || '');
            }
          } else {
            setFileContent(`// Error loading file from GitHub (status ${res.status})`);
          }
        } catch (err: any) {
          console.error(err);
          setFileContent(`// Error loading file: ${err.message || err}`);
        } finally {
          setIsLoadingFile(false);
        }
      };
      fetchFileContent();
    } else {
      setFileContent('// Please connect your GitHub account to fetch file content.');
    }
  }, [selectedFile, filesToDisplay, githubToken, currentRepo, currentRepoOwner]);

  if (filesToDisplay.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center flex-1 flex flex-col items-center justify-center">
        <Folder size={40} className="text-text-muted mb-3" />
        <h3 className="font-bold text-sm text-text-main mb-1">No Files Loaded</h3>
        <p className="text-xs text-text-muted max-w-sm">This repository has no registered files loaded. Link a token or commit files locally.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex gap-5">
      {/* File sidebar explorer */}
      <div className="w-80 bg-card border border-border rounded-2xl p-4 flex flex-col h-full shrink-0 min-h-0">
        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 px-1">WORKSPACE DIRECTORY</span>
        
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-0.5">
          {buildTree(filesToDisplay).map(item => (
            <FileTreeItem key={item.path} item={item} depth={0} activeFileName={activeFileName} onSelect={setSelectedFile} />
          ))}
        </div>
      </div>

      {/* Code Editor Preview Screen */}
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-full shadow-sm min-h-0">
        <div className="px-5 py-3 border-b border-border bg-hover/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
            <Home size={13} className="text-primary" />
            <span>/</span>
            <span className="font-bold text-text-main">{currentRepo}</span>
            <span>/</span>
            <span className="font-bold text-primary">{activeFileName}</span>
          </div>

          <button 
            onClick={() => {
              navigator.clipboard.writeText(fileContent);
              showToast('Code copied to clipboard!');
            }}
            className="text-[10px] bg-card hover:bg-hover/60 border border-border px-3 py-1.5 rounded-lg font-bold text-text-main transition-colors cursor-pointer"
          >
            Copy Code
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-main p-6 font-mono text-xs select-text">
          {isLoadingFile ? (
            <div className="h-full flex items-center justify-center text-text-muted gap-2.5">
              <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span>Fetching file content stream...</span>
            </div>
          ) : (
            fileContent.trim().split('\n').map((line, idx) => (
              <div key={idx} className="flex leading-6 group hover:bg-hover/5">
                <span className="text-[#4B4B5E] w-8 select-none shrink-0 font-bold text-right pr-3.5 border-r border-border/40 mr-4">{idx + 1}</span>
                <span className="text-text-main/90 whitespace-pre">{line}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 3.2 DESKTOP COMMITS VIEW (TIMELINE LIST + CODE GIT DIFF INSPECTOR)
 */
const DesktopCommitsView: React.FC = () => {
  const { 
    githubToken, currentRepoOwner, currentRepo, activeFiles,
    activeCommits, openModal, deleteCommit, undoLatestCommit, 
    amendLatestCommit, resetBranchToCommit, createBranchAtCommit, 
    createTagAtCommit, showToast, theme 
  } = useAppContext();

  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [commitDetailData, setCommitDetailData] = useState<any>(null);
  const [isLoadingCommitDetail, setIsLoadingCommitDetail] = useState<boolean>(false);
  const [showAmend, setShowAmend] = useState(false);
  const [amendMsg, setAmendMsg] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  // Auto-select latest commit if none is selected
  useEffect(() => {
    if (activeCommits.length > 0 && !selectedCommit) {
      setSelectedCommit(activeCommits[0]);
    }
  }, [activeCommits, selectedCommit]);

  useEffect(() => {
    if (!selectedCommit) {
      setCommitDetailData(null);
      return;
    }
    const sha = selectedCommit.fullHash || selectedCommit.hash;
    if (githubToken && currentRepoOwner && sha && currentRepo) {
      setIsLoadingCommitDetail(true);
      fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/commits/${sha}`, {
        headers: { Authorization: `Bearer ${githubToken}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setCommitDetailData(data);
          }
        })
        .catch(err => console.error("Error fetching commit details:", err))
        .finally(() => setIsLoadingCommitDetail(false));
    } else {
      setCommitDetailData(null);
    }
  }, [selectedCommit?.hash, selectedCommit?.fullHash, githubToken, currentRepoOwner, currentRepo]);

  const commitToInspect = activeCommits.find(c => c.hash === selectedCommit?.hash) || activeCommits[0];

  const handleAmendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendMsg.trim()) return;
    amendLatestCommit(amendMsg.trim(), false, true);
    setShowAmend(false);
    showToast('Commit message amended successfully.');
    // Refresh selected commit representation
    setSelectedCommit(null);
  };

  const handleCreateBranch = () => {
    if (!newBranchName.trim() || !commitToInspect) return;
    createBranchAtCommit(commitToInspect.hash, newBranchName.trim());
    setNewBranchName('');
    showToast(`Branch "${newBranchName.trim()}" created at ${commitToInspect.hash}`);
  };

  const handleCreateTag = () => {
    if (!newTagName.trim() || !commitToInspect) return;
    createTagAtCommit(commitToInspect.hash, newTagName.trim());
    setNewTagName('');
    showToast(`Tag "${newTagName.trim()}" created at ${commitToInspect.hash}`);
  };

  return (
    <div className="flex-1 min-h-0 flex gap-5">
      {/* Timeline panel */}
      <div className="w-96 bg-card border border-border rounded-2xl p-5 flex flex-col h-full shrink-0 min-h-0">
        <div className="flex justify-between items-center mb-5 shrink-0">
          <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">VERSION TIMELINE</span>
          <button 
            onClick={() => openModal('commit')}
            className="bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg active:scale-95 transition-all shadow-sm shadow-purple-500/15 cursor-pointer"
          >
            + Commit Changes
          </button>
        </div>

        <div className="flex-1 overflow-hidden min-h-0 flex flex-col pb-6">
          <CommitList 
            isDesktop={true}
            onSelectCommit={setSelectedCommit}
            onActionClick={setSelectedCommit}
            selectedCommitId={commitToInspect?.hash}
          />
        </div>
      </div>

      {/* Inspector details panel */}
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-y-auto p-6 space-y-6 flex flex-col h-full justify-between shadow-sm min-h-0">
        {commitToInspect ? (
          <div className="space-y-6 flex-1 overflow-y-auto pr-1 no-scrollbar">
            {/* Header info */}
            <div className="border-b border-border/60 pb-5 flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">Git Commit Inspector</span>
                <h2 className="text-base font-bold text-text-main leading-snug">"{commitToInspect.msg}"</h2>
                
                <div className="flex items-center gap-2 text-xs mt-3">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                    commit: {commitToInspect.hash}
                  </span>
                  <span className="text-text-muted">•</span>
                  <span className="font-semibold text-text-main">{commitToInspect.author}</span>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-muted">{commitToInspect.time}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 items-end">
                <span className="text-xs font-extrabold text-success flex items-center gap-1 bg-success/5 border border-success/15 px-2.5 py-1 rounded-lg">
                  {commitToInspect.add || '+124'} <span className="text-danger">{commitToInspect.del || '-12'}</span>
                </span>
              </div>
            </div>

            {/* Quick Commit Git Actions */}
            <div className="bg-hover/10 border border-border rounded-xl p-4 space-y-4">
              <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">VERSION CONTROL OPERATIONS</span>
              
              <div className="flex flex-wrap gap-2.5">
                {activeCommits[0]?.hash === commitToInspect.hash && (
                  <>
                    <button 
                      onClick={() => setShowAmend(!showAmend)}
                      className="bg-card hover:bg-hover/40 border border-border px-3.5 py-2 rounded-xl text-xs font-bold text-text-main flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} /> Amend Message
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Undo latest commit? Content will remain staged.')) {
                          undoLatestCommit();
                          setSelectedCommit(null);
                        }
                      }}
                      className="bg-card hover:bg-hover/40 border border-border px-3.5 py-2 rounded-xl text-xs font-bold text-text-main flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Undo size={13} /> Undo Latest Commit
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => {
                    if (confirm(`Reset branch to this commit? All subsequent commits will be deleted.`)) {
                      resetBranchToCommit(commitToInspect.hash);
                      showToast(`Branch reset to commit ${commitToInspect.hash}`);
                    }
                  }}
                  className="bg-card hover:bg-hover/40 border border-border px-3.5 py-2 rounded-xl text-xs font-bold text-danger flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} className="text-danger" /> Hard Reset Here
                </button>

                <button 
                  onClick={() => {
                    if (confirm('Delete this commit?')) {
                      deleteCommit(commitToInspect.hash);
                      setSelectedCommit(null);
                    }
                  }}
                  className="bg-card hover:bg-hover/40 border border-border px-3.5 py-2 rounded-xl text-xs font-bold text-danger flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} className="text-danger" /> Delete Commit
                </button>
              </div>

              <AnimatePresence>
                {showAmend && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleAmendSubmit} className="space-y-3 pt-3.5 border-t border-border/50">
                      <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type new commit message..." 
                      className="flex-1 bg-main border border-border rounded-xl px-3.5 py-2 text-xs text-text-main outline-none focus:border-primary"
                      value={amendMsg}
                      onChange={(e) => setAmendMsg(e.target.value)}
                      required
                    />
                    <button type="submit" className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer">
                      Save
                    </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CI/CD Pipeline Visualizer */}
            <CiCdPipelineFlow hash={commitToInspect.hash} />

            {/* Diff Visualizer Panel */}
            <div className="border border-border rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-hover/10 border-b border-border text-[10px] font-bold text-text-muted flex items-center justify-between">
                <span>DIFF PREVIEW</span>
              </div>
              <div className="p-4 bg-main/50 space-y-4 max-h-[400px] overflow-y-auto">
                {commitDetailData?.files && commitDetailData.files.length > 0 ? (
                  commitDetailData.files.map((file: any, fIdx: number) => (
                    <DiffViewer key={fIdx} patch={file.patch} filename={file.filename} isDark={theme === 'dark'} />
                  ))
                ) : (
                  <div className="space-y-1 font-mono text-[11px] p-2 bg-main rounded-xl border border-border">
                    <div className="text-text-muted border-b border-border pb-2 mb-3">diff --git a/commit-{commitToInspect.hash} b/commit-{commitToInspect.hash}</div>
                    <div className="text-text-main/80 font-bold mb-1">Commit Message: "{commitToInspect.msg}"</div>
                    <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                      + Author: {commitToInspect.author}
                    </div>
                    <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                      + Changes: {commitDetailData?.stats?.additions ?? commitToInspect.add} insertions, {commitDetailData?.stats?.deletions ?? commitToInspect.del} deletions
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inline dialogs for branch/tag at commit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border p-4 rounded-xl space-y-3">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">BRANCH AT COMMIT</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Branch name..." 
                    className="flex-1 bg-main border border-border rounded-xl px-3 py-1.5 text-xs text-text-main outline-none focus:border-primary"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                  />
                  <button 
                    onClick={handleCreateBranch}
                    disabled={!newBranchName.trim()}
                    className="bg-info text-white text-xs font-bold px-3 py-1.5 rounded-xl disabled:opacity-40 cursor-pointer hover:bg-info/80 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>

              <div className="border border-border p-4 rounded-xl space-y-3">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">TAG AT COMMIT</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="v1.0.0..." 
                    className="flex-1 bg-main border border-border rounded-xl px-3 py-1.5 text-xs text-text-main outline-none focus:border-primary"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                  />
                  <button 
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                    className="bg-warning text-white text-xs font-bold px-3 py-1.5 rounded-xl disabled:opacity-40 cursor-pointer hover:bg-warning/80 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <GitCommit size={40} className="text-text-muted mb-2" />
            <span className="font-semibold text-sm text-text-main">No Commit Selected</span>
            <span className="text-xs text-text-muted mt-1">Select a commit from the version timeline pane to inspect.</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 3.4 DESKTOP BRANCHES VIEW
 */
const DesktopBranchesView: React.FC = () => {
  const { activeBranches, openModal, deleteBranch, switchBranch, currentBranch } = useAppContext();
  const [search, setSearch] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const filtered = activeBranches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center shrink-0">
        <div className="bg-card border border-border rounded-xl px-3 py-2 flex items-center gap-2.5 w-80">
          <Search size={15} className="text-text-muted" />
          <input 
            type="text" 
            placeholder="Search branches..." 
            className="bg-transparent border-none text-xs text-text-main w-full outline-none placeholder:text-text-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button 
          onClick={() => openModal('branch')}
          className="bg-info hover:bg-info/80 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm shadow-info/15 flex items-center gap-1.5 cursor-pointer"
        >
          <GitBranch size={14} />
          <span>New Branch</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
        {filtered.map(branch => {
          const isActive = branch.name === (currentBranch || 'main');
          const isDefault = branch.isDefault;

          return (
            <div 
              key={branch.name}
              onClick={() => {
                if (confirmingDelete !== branch.name) {
                  switchBranch(branch.name);
                }
              }}
              className={`bg-card p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all relative group cursor-pointer ${
                isActive 
                  ? 'border-primary ring-2 ring-primary/10 shadow-sm' 
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="space-y-1.5 truncate flex-1">
                <span className="text-sm font-bold text-text-main flex items-center gap-2 truncate">
                  <GitBranch size={14} className={isActive ? "text-primary shrink-0 animate-pulse" : "text-text-muted shrink-0"} />
                  <span className="truncate">{branch.name}</span>
                </span>
                <p className="text-xs text-text-muted truncate">{branch.desc || 'Active branch'}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isDefault && (
                  <span className="text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-info/15 text-info border border-info/30 font-extrabold shrink-0">
                    Default
                  </span>
                )}
                
                {isActive && !isDefault && (
                  <span className="text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 font-extrabold shrink-0">
                    Active
                  </span>
                )}

                {/* Delete Button (only if not default and not active) */}
                {!isDefault && !isActive && (
                  <div className="relative shrink-0">
                    {confirmingDelete === branch.name ? (
                      <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 z-10" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] font-bold text-error px-1">Delete?</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmingDelete(null);
                          }}
                          className="p-1 text-text-muted hover:text-text-main hover:bg-hover rounded-lg transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBranch(branch.name);
                            setConfirmingDelete(null);
                          }}
                          className="p-1 bg-error text-white hover:bg-error/90 rounded-lg transition-colors cursor-pointer shadow-sm"
                          title="Confirm Delete"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmingDelete(branch.name);
                        }}
                        className="p-2 bg-error/10 text-error hover:bg-error/25 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete Branch"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted text-xs font-semibold uppercase tracking-wider">
            No branches found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 3.5 DESKTOP INSIGHTS VIEW
 */
const DesktopInsightsView: React.FC = () => {
  const { activeLanguages, activeCommits, activePRs } = useAppContext();

  const commitCount = activeCommits.length;
  const contributorsCount = new Set(activeCommits.map(c => c.author)).size;
  const mergedCount = activePRs.filter(p => p.status === 'Merged').length;

  const pieData = Object.entries(activeLanguages).map(([name, val]) => ({
    name,
    value: val as number,
    color: getLanguageColor(name)
  })).sort((a, b) => b.value - a.value);

  const displayPie = pieData.length > 4 
    ? [...pieData.slice(0, 3), { name: 'Others', value: pieData.slice(3).reduce((acc, curr) => acc + curr.value, 0), color: '#262636' }]
    : pieData;

  const finalTotal = displayPie.reduce((acc, curr) => acc + curr.value, 0) || 1;

  const chartData = commitCount > 0 ? [
    { name: 'Mon', uv: Math.max(1, Math.floor(commitCount * 0.1)) },
    { name: 'Tue', uv: Math.max(1, Math.floor(commitCount * 0.25)) },
    { name: 'Wed', uv: Math.max(1, Math.floor(commitCount * 0.15)) },
    { name: 'Thu', uv: Math.max(1, Math.floor(commitCount * 0.3)) },
    { name: 'Fri', uv: Math.max(0, Math.floor(commitCount * 0.12)) },
    { name: 'Sat', uv: Math.max(0, Math.floor(commitCount * 0.05)) },
    { name: 'Sun', uv: Math.max(0, Math.floor(commitCount * 0.03)) }
  ] : [
    { name: 'Mon', uv: 0 },
    { name: 'Tue', uv: 0 },
    { name: 'Wed', uv: 0 },
    { name: 'Thu', uv: 0 },
    { name: 'Fri', uv: 0 },
    { name: 'Sat', uv: 0 },
    { name: 'Sun', uv: 0 }
  ];

  return (
    <div className="space-y-6 flex-1 overflow-y-auto pr-1 no-scrollbar pb-8">
      {/* 3 Metric Card Grid */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">Total Commits Logged</span>
          <span className="text-2xl font-extrabold text-text-main">{commitCount}</span>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">Contributors</span>
          <span className="text-2xl font-extrabold text-warning">{contributorsCount}</span>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">PRs Closed/Merged</span>
          <span className="text-2xl font-extrabold text-primary">{mergedCount}</span>
        </div>
      </div>

      {/* Two block layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Languages block */}
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">LANGUAGE FRAMEWORK BREAKDOWN</span>
          
          {displayPie.length === 0 ? (
            <div className="text-xs text-text-muted text-center py-10">No language data compiled.</div>
          ) : (
            <div className="flex items-center justify-between gap-5">
              <div className="w-[140px] h-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={displayPie} innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                      {displayPie.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip cursor={false} contentStyle={{ backgroundColor: 'var(--card)', border: 'none', borderRadius: '12px', fontSize: '11px', color: 'var(--text-main)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-xs flex-1 space-y-2 max-w-[55%]">
                {displayPie.map(lang => (
                  <div key={lang.name} className="flex justify-between items-center text-text-main font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                      {lang.name}
                    </span>
                    <span className="text-text-muted">{Math.round((lang.value / finalTotal) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Commit Trend block */}
        <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-4">COMMIT FREQUENCY RATIO</span>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="insGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="uv" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#insGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. DESKTOP SETTINGS VIEW
 */
const DesktopSettings: React.FC = () => {
  const { theme, toggleTheme, githubUser, githubToken, connectGitHub, disconnectGitHub, setManualToken, showToast } = useAppContext();
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempToken.trim()) {
      setManualToken(tempToken.trim());
      setTempToken('');
      setShowTokenForm(false);
      showToast('Personal access token initialized.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Settings Panel</h1>
        <p className="text-xs text-text-muted mt-0.5 font-medium">Configure profile preferences, link security tokens, and select appearance systems.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile metadata block */}
        <div className="bg-card rounded-2xl border border-border p-5 flex flex-col items-center justify-center text-center space-y-4 h-fit">
          {githubUser ? (
            <img src={githubUser.avatar_url} alt="Profile" className="w-20 h-20 rounded-full border-2 border-primary shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-hover text-text-muted border border-border flex items-center justify-center text-3xl font-extrabold">
              <User size={36} />
            </div>
          )}

          <div>
            <h3 className="font-bold text-sm text-text-main">{githubUser ? (githubUser.name || githubUser.login) : 'Guest Account'}</h3>
            <span className="block text-[10px] text-text-muted font-semibold tracking-wider uppercase mt-1">
              {githubUser ? `@${githubUser.login}` : 'Offline Mode'}
            </span>
          </div>

          {githubUser ? (
            <div className="text-[11px] text-text-muted border-t border-border/50 pt-4 w-full space-y-2">
              {githubUser.bio && <p className="italic">"{githubUser.bio}"</p>}
              <div className="flex justify-around font-bold">
                <span>{githubUser.followers} Followers</span>
                <span>{githubUser.following} Following</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-muted leading-relaxed">
              No cloud accounts linked. Connect using a GitHub PAT or OAuth flow.
            </p>
          )}
        </div>

        {/* Configuration settings block */}
        <div className="md:col-span-2 bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {/* GitHub integrations row */}
          <div className="p-5 flex items-center justify-between hover:bg-hover/10 transition-colors">
            <div className="flex gap-4 items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${githubToken ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                <Github size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold text-text-main">{githubToken ? 'Disconnect GitHub Session' : 'Connect Cloud Account'}</span>
                <span className="block text-[10px] text-text-muted mt-0.5">Toggle remote GitHub API sync pipelines</span>
              </div>
            </div>

            <button 
              onClick={githubToken ? disconnectGitHub : connectGitHub}
              className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-all border cursor-pointer ${githubToken ? 'bg-danger/5 border-danger/25 text-danger hover:bg-danger/15' : 'bg-primary text-white hover:bg-primary-hover border-transparent shadow-sm'}`}
            >
              {githubToken ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* PAT entry row */}
          {!githubToken && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowTokenForm(!showTokenForm)}>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <KeySquare size={20} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-text-main">Developer Personal Access Token</span>
                    <span className="block text-[10px] text-text-muted mt-0.5">Enter direct GitHub token (PAT) for custom access</span>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-text-muted transition-transform ${showTokenForm ? 'rotate-90' : ''}`} />
              </div>

              <AnimatePresence>
                {showTokenForm && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleSaveToken} className="space-y-3.5 pt-3 border-t border-border/50">
                      <p className="text-[11px] text-text-muted leading-relaxed">
                    Generate a token with <code className="bg-hover px-1 rounded font-mono">repo</code> & <code className="bg-hover px-1 rounded font-mono">user</code> scopes on GitHub settings and paste below.
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
                      className="flex-1 bg-main border border-border rounded-xl px-3.5 py-2 text-xs text-text-main outline-none focus:border-primary font-mono"
                      value={tempToken}
                      onChange={(e) => setTempToken(e.target.value)}
                      required
                    />
                    <button type="submit" className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer">
                      Save Token
                    </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Appearance theme selector */}
          <div className="p-5 flex items-center justify-between hover:bg-hover/10 transition-colors cursor-pointer" onClick={toggleTheme}>
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <span className="block text-xs font-bold text-text-main">Interface Appearance Mode</span>
                <span className="block text-[10px] text-text-muted mt-0.5">{theme === 'dark' ? 'Modern Dark Slate' : 'Clean Whisper White'}</span>
              </div>
            </div>
            
            <div className="w-12 h-6 rounded-full bg-border relative transition-colors duration-200 cursor-pointer">
              <div className={`w-4 h-4 bg-primary rounded-full absolute top-1 transition-all duration-200 ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
            </div>
          </div>

          {/* Version details info */}
          <div className="p-5 flex items-center justify-between hover:bg-hover/10 transition-colors">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-gray-400/10 text-gray-400 flex items-center justify-center">
                <Sliders size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold text-text-main">Workspace Core Engine</span>
                <span className="block text-[10px] text-text-muted mt-0.5">Application version status telemetry</span>
              </div>
            </div>
            <span className="text-xs font-bold text-text-muted">v2.4.1 (Stable)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
