import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, GitMerge, GitCommit, AlertCircle, ChevronDown, Github } from 'lucide-react';
import { useAppContext } from '../AppContext';

const data = [
  { name: 'Mon', uv: 20, pv: 10 },
  { name: 'Tue', uv: 45, pv: 20 },
  { name: 'Wed', uv: 30, pv: 15 },
  { name: 'Thu', uv: 80, pv: 30 },
  { name: 'Fri', uv: 50, pv: 25 },
  { name: 'Sat', uv: 60, pv: 40 },
  { name: 'Sun', uv: 40, pv: 20 },
];

export const Dashboard: React.FC = () => {
  const { githubUser, githubRepos, connectGitHub, githubToken } = useAppContext();

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-semibold mb-1">
            {githubUser ? `👋 Hi, ${githubUser.name || githubUser.login}` : '👋 Hi there'}
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
          <h3 className="font-semibold mb-1">Connect GitHub</h3>
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
        <div className="rounded-2xl p-4 flex flex-col gap-2 bg-purple-500/10">
          <span className="text-xs text-text-muted">Repositories</span>
          <span className="text-[28px] font-bold">{githubUser ? githubRepos.length : '24'}</span>
          <span className="text-[11px] text-purple-500 flex items-center font-medium">
            <ArrowUpRight size={14} className="mr-1" strokeWidth={3} /> {githubUser ? 'Live data' : '12% from last week'}
          </span>
        </div>
        <div className="rounded-2xl p-4 flex flex-col gap-2 bg-blue-500/10">
          <span className="text-xs text-text-muted">Commits</span>
          <span className="text-[28px] font-bold">142</span>
          <span className="text-[11px] text-info flex items-center font-medium">
            <ArrowUpRight size={14} className="mr-1" strokeWidth={3} /> 8% from last week
          </span>
        </div>
      </div>

      <div className="bg-card rounded-3xl p-5 pb-4 mb-5">
        <div className="flex justify-between mb-4">
          <span className="text-[15px] font-semibold">Activity Overview</span>
          <span className="text-xs text-text-muted flex items-center">
            This Week <ChevronDown size={14} className="ml-1" />
          </span>
        </div>
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
              <Area type="monotone" dataKey="uv" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
              <Area type="monotone" dataKey="pv" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#colorPv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-base font-semibold mb-4">Recent Activity</div>
      
      <div className="flex gap-3 mb-5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-success/10 text-success">
          <GitMerge size={16} strokeWidth={3} />
        </div>
        <div>
          <div className="text-sm">Merged <span className="font-semibold">PR #42</span> in rocket-launcher</div>
          <div className="text-xs text-text-muted mt-1">Tanvir Ahmed • 2h ago</div>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary">
          <GitCommit size={16} strokeWidth={3} />
        </div>
        <div>
          <div className="text-sm">Pushed 3 commits to <span className="font-semibold text-info">main</span></div>
          <div className="text-xs text-text-muted mt-1">backend-api • 5h ago</div>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-danger/10 text-danger">
          <AlertCircle size={16} strokeWidth={3} />
        </div>
        <div>
          <div className="text-sm">Deployment failed on production</div>
          <div className="text-xs text-text-muted mt-1">e-commerce-web • Yesterday</div>
        </div>
      </div>
    </div>
  );
};
