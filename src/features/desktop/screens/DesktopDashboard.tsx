import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../AppContext';
import { GitCommit, GitPullRequest, Star, Clock, FolderGit2, ArrowRight } from 'lucide-react';
import { AnimatedNumber } from '../../../components/UI';
import { DesktopDashboardChart } from './DesktopDashboardChart';

export const DesktopDashboard: React.FC<{ globalSearch?: string }> = () => {
  const { githubUser, githubRepos, sessionCommitsCount, openRepo, navigate } = useAppContext();
  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month'>('Week');

  let allCommits: any[] = [];
  let allPRs: any[] = [];
  githubRepos.forEach(repo => {
    const key = `local_details_${repo.name}_commits`;
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) allCommits = allCommits.concat(parsed);
      } catch (_) {}
    }
    const prsKey = `local_details_${repo.name}_prs`;
    const prsLocal = localStorage.getItem(prsKey);
    if (prsLocal) {
      try {
        const parsed = JSON.parse(prsLocal);
        if (Array.isArray(parsed)) allPRs = allPRs.concat(parsed);
      } catch (_) {}
    }
  });

  const displayCommits = Math.max(allCommits.length, sessionCommitsCount);
  const totalStars = (githubRepos || []).reduce((acc: number, r: any) => acc + (r.stargazers_count || 0), 0);
  const totalPRs = allPRs.length;

  const chartData = [
    { name: 'Mon', commits: Math.round(displayCommits * 0.15), prs: Math.round(totalPRs * 0.1) },
    { name: 'Tue', commits: Math.round(displayCommits * 0.22), prs: Math.round(totalPRs * 0.2) },
    { name: 'Wed', commits: Math.round(displayCommits * 0.18), prs: Math.round(totalPRs * 0.25) },
    { name: 'Thu', commits: Math.round(displayCommits * 0.25), prs: Math.round(totalPRs * 0.15) },
    { name: 'Fri', commits: Math.round(displayCommits * 0.12), prs: Math.round(totalPRs * 0.2) },
    { name: 'Sat', commits: Math.round(displayCommits * 0.05), prs: Math.round(totalPRs * 0.05) },
    { name: 'Sun', commits: Math.round(displayCommits * 0.03), prs: Math.round(totalPRs * 0.05) },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Commits</span>
            <GitCommit size={16} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-text-main font-mono">
            <AnimatedNumber value={displayCommits} />
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">Indexed across active local repos</span>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Repository Stars</span>
            <Star size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-text-main font-mono">
            <AnimatedNumber value={totalStars} />
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">Aggregated GitHub star metrics</span>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pull Requests</span>
            <GitPullRequest size={16} className="text-success" />
          </div>
          <div className="text-2xl font-bold text-text-main font-mono">
            <AnimatedNumber value={totalPRs} />
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">Open, merged, and draft changes</span>
        </div>
      </div>

      {/* Activity Chart Section */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-main">Repository Activity History</h3>
            <p className="text-xs text-text-muted">Commit velocity and pull request pipeline frequency</p>
          </div>
          <div className="flex bg-hover/40 p-1 rounded-xl border border-border text-xs font-semibold">
            {(['Day', 'Week', 'Month'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeframe === tf ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <DesktopDashboardChart data={chartData} />
      </div>

      {/* Recent Repositories */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text-main">Workstation Repositories</h3>
          <button onClick={() => navigate('repos')} className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer">
            <span>View All ({githubRepos.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {githubRepos.slice(0, 4).map(repo => (
            <div
              key={repo.name}
              onClick={() => openRepo(repo.name)}
              className="p-3.5 bg-hover/20 hover:bg-hover/40 border border-border rounded-xl cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FolderGit2 size={18} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-text-main truncate block">{repo.name}</span>
                  <span className="text-[11px] text-text-muted truncate block">{repo.description || 'No description provided'}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-hover px-2 py-0.5 rounded text-text-muted shrink-0 ml-2">
                {repo.language || 'Code'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
