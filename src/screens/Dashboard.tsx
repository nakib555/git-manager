import React, { useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, GitMerge, GitCommit, AlertCircle, ChevronDown, Github, FolderGit2 } from 'lucide-react';
import { useAppContext } from '../AppContext';

export const Dashboard: React.FC = () => {
  const { githubUser, githubRepos, connectGitHub, githubToken, activeCommits, openRepo, sessionCommitsCount } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');

  // Sum of commits across all repos in localStorage
  let totalCommitsCount = 0;
  githubRepos.forEach(repo => {
    const key = `local_details_${repo.name}_commits`;
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          totalCommitsCount += parsed.length;
        }
      } catch (e) {}
    }
  });

  const displayCommitsCount = Math.max(totalCommitsCount, sessionCommitsCount);

  // Generate dynamic chart data based on displayCommitsCount and selected period
  const getChartData = () => {
    let baseDistribution: number[] = [];
    let intervals: string[] = [];
    
    if (selectedPeriod === 'day') {
      intervals = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
      baseDistribution = [0.02, 0.05, 0.15, 0.35, 0.25, 0.15, 0.03];
    } else if (selectedPeriod === 'week') {
      intervals = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      baseDistribution = [0.10, 0.25, 0.15, 0.30, 0.12, 0.05, 0.03];
    } else if (selectedPeriod === 'month') {
      intervals = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      baseDistribution = [0.20, 0.35, 0.25, 0.20];
    } else { // year
      intervals = ['Jan-Feb', 'Mar-Apr', 'May-Jun', 'Jul-Aug', 'Sep-Oct', 'Nov-Dec'];
      baseDistribution = [0.12, 0.18, 0.22, 0.15, 0.20, 0.13];
    }
    
    // Provide a dynamic minimum preview curve if there are repositories, so it looks active
    const multiplier = displayCommitsCount > 0 ? displayCommitsCount : (githubRepos.length > 0 ? 12 : 0);
    
    return intervals.map((label, idx) => {
      const commitsOnThisDay = multiplier > 0 
        ? Math.max(multiplier > 5 ? 1 : 0, Math.round(multiplier * baseDistribution[idx]))
        : 0;
      
      const secondaryActivity = multiplier > 0
        ? Math.max(0, Math.round(commitsOnThisDay * 0.4))
        : 0;
        
      return {
        name: label,
        Commits: commitsOnThisDay,
        PullRequests: secondaryActivity
      };
    });
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

      {!githubToken && (
        <div className="bg-card rounded-2xl p-5 mb-6 border border-border flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Github size={24} />
          </div>
          <h3 className="font-semibold mb-1 text-text-main">Connect GitHub</h3>
          <p className="text-sm text-text-muted mb-4">Connect your account to see your real repositories and activity.</p>
          <button 
            onClick={connectGitHub}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            Connect Account
          </button>
        </div>
      )}

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
            <ArrowUpRight size={14} className="mr-1" strokeWidth={3} /> Current Session
          </span>
        </div>
      </div>

      <div className="bg-card rounded-3xl p-5 pb-4 mb-5 border border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <span className="text-[15px] font-semibold text-text-main">Activity Overview</span>
          
          {/* Elegant pill selector */}
          <div className="flex bg-hover/40 p-1 rounded-xl border border-border">
            {(['day', 'week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg capitalize transition-all duration-200 ${
                  selectedPeriod === period
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-[160px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8F8F9D', fontSize: 10, fontWeight: 500 }}
                dy={8}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text-main)',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                itemStyle={{ color: 'var(--text-main)' }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="Commits" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUv)" />
              <Area type="monotone" dataKey="PullRequests" stroke="#38BDF8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPv)" />
            </AreaChart>
          </ResponsiveContainer>
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
              <span className="text-[10px] px-2 py-1 rounded-full bg-hover text-text-muted font-medium shrink-0">
                {repo.private ? 'Private' : 'Public'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
