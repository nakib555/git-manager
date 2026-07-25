import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, GitMerge, GitCommit, AlertCircle, ChevronDown, Github, FolderGit2, Settings, Sliders, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { AnimatedGlobe, AnimatedLock } from '../components/Layout';

interface AnimateIconProps {
  children: React.ReactNode;
  animateOnHover?: boolean;
}

const AnimateIcon: React.FC<AnimateIconProps> = ({ children, animateOnHover = true }) => {
  return (
    <motion.div
      whileHover={animateOnHover ? { rotate: 360 } : {}}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
};

export const Dashboard: React.FC = () => {
  const { githubUser, githubRepos, connectGitHub, githubToken, activeCommits, openRepo, sessionCommitsCount } = useAppContext();
  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Graph custom adjustments states
  const [showCommitsLine, setShowCommitsLine] = useState(true);
  const [showPRsLine, setShowPRsLine] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [isAdjustmentPanelOpen, setIsAdjustmentPanelOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gather real commits and PRs across all repositories
  let allCommits: any[] = [];
  let allPRs: any[] = [];

  githubRepos.forEach(repo => {
    const commitsKey = `local_details_${repo.name}_commits`;
    const commitsLocal = localStorage.getItem(commitsKey);
    if (commitsLocal) {
      try {
        const parsed = JSON.parse(commitsLocal);
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

  const displayCommitsCount = Math.max(allCommits.length, sessionCommitsCount);

  // Map timestamp to buckets
  const getDayName = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getMonthName = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  };

  const getDayHourBucket = (date: Date) => {
    const hour = date.getHours();
    if (hour >= 0 && hour < 4) return '12am';
    if (hour >= 4 && hour < 8) return '4am';
    if (hour >= 8 && hour < 12) return '8am';
    if (hour >= 12 && hour < 16) return '12pm';
    if (hour >= 16 && hour < 20) return '4pm';
    return '8pm';
  };

  const getWeekOfMonthBucket = (date: Date) => {
    const day = date.getDate();
    if (day <= 7) return 'Week 1';
    if (day <= 14) return 'Week 2';
    if (day <= 21) return 'Week 3';
    return 'Week 4';
  };

  // Generate dynamic chart data based on real aggregated data
  const getChartData = () => {
    let labels: string[] = [];
    switch (timeframe) {
      case 'Day':
        labels = ['12am', '4am', '8am', '12pm', '4pm', '8pm'];
        break;
      case 'Week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      case 'Month':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        break;
      case 'Year':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        break;
    }

    const commitsCount: Record<string, number> = {};
    const prsCount: Record<string, number> = {};
    labels.forEach(l => {
      commitsCount[l] = 0;
      prsCount[l] = 0;
    });

    const now = new Date();

    allCommits.forEach(c => {
      const dateStr = c.timestamp;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      if (timeframe === 'Day') {
        if (now.getTime() - date.getTime() <= 24 * 60 * 60 * 1000) {
          const bucket = getDayHourBucket(date);
          if (commitsCount[bucket] !== undefined) commitsCount[bucket]++;
        }
      } else if (timeframe === 'Week') {
        if (now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000) {
          const bucket = getDayName(date);
          if (commitsCount[bucket] !== undefined) commitsCount[bucket]++;
        }
      } else if (timeframe === 'Month') {
        if (now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000) {
          const bucket = getWeekOfMonthBucket(date);
          if (commitsCount[bucket] !== undefined) commitsCount[bucket]++;
        }
      } else if (timeframe === 'Year') {
        if (now.getTime() - date.getTime() <= 365 * 24 * 60 * 60 * 1000) {
          const bucket = getMonthName(date);
          if (commitsCount[bucket] !== undefined) commitsCount[bucket]++;
        }
      }
    });

    allPRs.forEach(p => {
      const dateStr = p.created_at || p.timestamp;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      if (timeframe === 'Day') {
        if (now.getTime() - date.getTime() <= 24 * 60 * 60 * 1000) {
          const bucket = getDayHourBucket(date);
          if (prsCount[bucket] !== undefined) prsCount[bucket]++;
        }
      } else if (timeframe === 'Week') {
        if (now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000) {
          const bucket = getDayName(date);
          if (prsCount[bucket] !== undefined) prsCount[bucket]++;
        }
      } else if (timeframe === 'Month') {
        if (now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000) {
          const bucket = getWeekOfMonthBucket(date);
          if (prsCount[bucket] !== undefined) prsCount[bucket]++;
        }
      } else if (timeframe === 'Year') {
        if (now.getTime() - date.getTime() <= 365 * 24 * 60 * 60 * 1000) {
          const bucket = getMonthName(date);
          if (prsCount[bucket] !== undefined) prsCount[bucket]++;
        }
      }
    });

    return labels.map(label => ({
      name: label,
      uv: commitsCount[label],
      pv: prsCount[label]
    }));
  };

  const chartData = getChartData();

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-semibold mb-1">
            {githubUser ? `👋 Hi, ${githubUser.name || githubUser.login}` : '👋 Welcome'}
          </h2>
          <p className="text-[13px] text-text-muted">Here's what's happening with your repositories.</p>
        </div>
        {githubUser && (
          <img src={githubUser.avatar_url} alt="Profile" className="w-12 h-12 rounded-full border border-border" />
        )}
      </div>



      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl p-4 flex flex-col gap-2 bg-purple-500/10 border border-purple-500/20">
          <span className="text-xs text-text-muted">Repositories</span>
          <span className="text-[28px] font-bold text-text-main">{githubRepos.length}</span>
          <span className="text-[11px] text-purple-500 flex items-center font-medium">
            <ArrowUpRight size={14} className="mr-1" strokeWidth={3} /> {githubUser ? 'GitHub Connected' : 'Local Repositories'}
          </span>
        </div>
        <div className="rounded-2xl p-4 flex flex-col gap-2 bg-blue-500/10 border border-blue-500/20">
          <span className="text-xs text-text-muted">Commits</span>
          <span className="text-[28px] font-bold text-text-main">{displayCommitsCount}</span>
          <span className="text-[11px] text-info flex items-center font-medium">
            <ArrowUpRight size={14} className="mr-1" strokeWidth={3} /> {allCommits.length > sessionCommitsCount ? 'Total Synced Commits' : 'Current Session'}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-3xl p-5 pb-4 mb-5 border border-border">
        <div className="flex justify-between mb-4 relative" ref={dropdownRef}>
          <span className="text-[15px] font-semibold text-text-main">Activity Overview</span>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-xs text-text-muted flex items-center hover:text-text-main transition-colors"
          >
            {timeframe === 'Day' ? 'Today' : `This ${timeframe}`} <ChevronDown size={14} className="ml-1" />
          </button>
          
          <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-6 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10 w-32 py-1"
            >
            
              {(['Day', 'Week', 'Month', 'Year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTimeframe(t); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-hover transition-colors ${timeframe === t ? 'text-primary font-semibold' : 'text-text-main'}`}
                >
                  {t === 'Day' ? 'Today' : `This ${t}`}
                </button>
              ))}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />}
              <XAxis 
                dataKey="name" 
                stroke="var(--text-muted)" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                dy={8}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={9} 
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
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              {showCommitsLine && (
                <Area type="monotone" dataKey="uv" name="Commits" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUv)" />
              )}
              {showPRsLine && (
                <Area type="monotone" dataKey="pv" name="PRs/PR Activity" stroke="#38BDF8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPv)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Adjustment Controls Section */}
        <div className="mt-4 pt-4 border-t border-border/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsAdjustmentPanelOpen(!isAdjustmentPanelOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              <Sliders size={13} />
              <span>{isAdjustmentPanelOpen ? 'Hide Controls' : 'Adjust Chart & Data'}</span>
            </button>
            <div className="flex items-center gap-2 text-[11px] text-text-muted font-medium">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" /> Commits
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" /> PRs
              </span>
            </div>
          </div>

          <AnimatePresence>
          {isAdjustmentPanelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
            <div className="bg-hover/10 p-4 rounded-2xl border border-border text-xs mt-3 flex flex-col gap-2">
              <span className="font-semibold text-text-main mb-1">Series Visibility & Layout</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowCommitsLine(!showCommitsLine)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-colors cursor-pointer ${
                    showCommitsLine 
                      ? 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/30' 
                      : 'border-border text-text-muted bg-card'
                  }`}
                >
                  {showCommitsLine ? <Eye size={12} /> : <EyeOff size={12} />}
                  Commits
                </button>
                <button
                  onClick={() => setShowPRsLine(!showPRsLine)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-colors cursor-pointer ${
                    showPRsLine 
                      ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30' 
                      : 'border-border text-text-muted bg-card'
                  }`}
                >
                  {showPRsLine ? <Eye size={12} /> : <EyeOff size={12} />}
                  PRs/Activity
                </button>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-colors cursor-pointer ${
                    showGrid 
                      ? 'bg-primary/10 text-primary border-primary/30' 
                      : 'border-border text-text-muted bg-card'
                  }`}
                >
                  Grid Lines
                </button>
              </div>
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      <div className="text-base font-semibold mb-4 text-text-main">Recent Activity</div>
      
      {githubRepos.length === 0 ? (
        <div className="bg-card p-6 rounded-2xl border border-border text-center flex flex-col items-center justify-center">
          <FolderGit2 size={32} className="text-text-muted mb-2" />
          <div className="text-sm font-semibold text-text-main mb-1">No activity to show</div>
          <div className="text-xs text-text-muted">Create a repository or connect GitHub to get started.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {githubRepos.slice(0, 3).map(repo => (
            <div 
              key={repo.id} 
              onClick={() => openRepo(repo.name, (repo as any).owner?.login || null)}
              className="flex gap-3 p-3 bg-card rounded-2xl border border-border cursor-pointer hover:border-primary/40 transition-all items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                  <FolderGit2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-main">{repo.name}</div>
                  <div className="text-xs text-text-muted">{repo.description || 'No description provided.'}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-text-muted flex items-center gap-1 h-fit shrink-0 font-semibold bg-hover/40">
                {repo.private ? <AnimatedLock size={11} className="text-text-muted" /> : <AnimatedGlobe size={11} className="text-text-muted" />}
                <span>{repo.private ? 'Private' : 'Public'}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
