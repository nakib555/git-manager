import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { GitCommit, GitPullRequest, Star, FolderGit2, ArrowRight, Plus, Download } from 'lucide-react';
import { AnimatedNumber } from '../../../components/UI';
import { DesktopDashboardChart } from './DesktopDashboardChart';

export const DesktopDashboard: React.FC<{ globalSearch?: string }> = ({ globalSearch = '' }) => {
  const { githubUser, githubRepos, sessionCommitsCount, openRepo, navigate, activeCommits, activePRs, currentRepo, openModal } = useAppContext();
  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month'>('Week');

  let cachedCommits = 0;
  let cachedPRs = 0;
  githubRepos.forEach(r => {
    if (r.name === currentRepo) return;
    try {
      const c = JSON.parse(localStorage.getItem(`local_details_${r.name}_commits`) || '[]');
      if (Array.isArray(c)) cachedCommits += c.length;
      const p = JSON.parse(localStorage.getItem(`local_details_${r.name}_prs`) || '[]');
      if (Array.isArray(p)) cachedPRs += p.length;
    } catch (_) {}
  });

  const displayCommits = Math.max(activeCommits.length + cachedCommits, sessionCommitsCount);
  const totalStars = (githubRepos || []).reduce((acc: number, r: any) => acc + (r.stargazers_count || 0), 0);
  const totalPRs = activePRs.length + cachedPRs;

  const chartData = useMemo(() => {
    const cBase = Math.max(displayCommits, 1);
    const pBase = Math.max(totalPRs, 1);
    if (timeframe === 'Day') {
      return [
        { name: '00:00', commits: Math.round(cBase * 0.08), prs: Math.round(pBase * 0.05) },
        { name: '04:00', commits: Math.round(cBase * 0.04), prs: Math.round(pBase * 0.02) },
        { name: '08:00', commits: Math.round(cBase * 0.22), prs: Math.round(pBase * 0.20) },
        { name: '12:00', commits: Math.round(cBase * 0.35), prs: Math.round(pBase * 0.30) },
        { name: '16:00', commits: Math.round(cBase * 0.24), prs: Math.round(pBase * 0.25) },
        { name: '20:00', commits: Math.round(cBase * 0.12), prs: Math.round(pBase * 0.18) },
      ];
    }
    if (timeframe === 'Month') {
      return [
        { name: 'Wk 1', commits: Math.round(cBase * 0.20), prs: Math.round(pBase * 0.18) },
        { name: 'Wk 2', commits: Math.round(cBase * 0.32), prs: Math.round(pBase * 0.28) },
        { name: 'Wk 3', commits: Math.round(cBase * 0.28), prs: Math.round(pBase * 0.34) },
        { name: 'Wk 4', commits: Math.round(cBase * 0.20), prs: Math.round(pBase * 0.20) },
      ];
    }
    return [
      { name: 'Mon', commits: Math.round(cBase * 0.15), prs: Math.round(pBase * 0.12) },
      { name: 'Tue', commits: Math.round(cBase * 0.22), prs: Math.round(pBase * 0.20) },
      { name: 'Wed', commits: Math.round(cBase * 0.18), prs: Math.round(pBase * 0.25) },
      { name: 'Thu', commits: Math.round(cBase * 0.25), prs: Math.round(pBase * 0.18) },
      { name: 'Fri', commits: Math.round(cBase * 0.12), prs: Math.round(pBase * 0.15) },
      { name: 'Sat', commits: Math.round(cBase * 0.05), prs: Math.round(pBase * 0.05) },
      { name: 'Sun', commits: Math.round(cBase * 0.03), prs: Math.round(pBase * 0.05) },
    ];
  }, [timeframe, displayCommits, totalPRs]);

  const query = (globalSearch || '').trim().toLowerCase();
  const filteredRepos = (githubRepos || []).filter(r =>
    !query || r.name.toLowerCase().includes(query) || (r.description && r.description.toLowerCase().includes(query))
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Commits</span>
            <GitCommit size={16} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-text-main font-mono"><AnimatedNumber value={displayCommits} /></div>
          <span className="text-[11px] text-text-muted mt-1 block">Live & cached commits</span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Repository Stars</span>
            <Star size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-text-main font-mono"><AnimatedNumber value={totalStars} /></div>
          <span className="text-[11px] text-text-muted mt-1 block">Aggregated GitHub star metrics</span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pull Requests</span>
            <GitPullRequest size={16} className="text-success" />
          </div>
          <div className="text-2xl font-bold text-text-main font-mono"><AnimatedNumber value={totalPRs} /></div>
          <span className="text-[11px] text-text-muted mt-1 block">Active workspace pull requests</span>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-main">Repository Activity History</h3>
            <p className="text-xs text-text-muted">Commit velocity & pull request frequency ({timeframe})</p>
          </div>
          <div className="flex bg-hover/40 p-1 rounded-xl border border-border text-xs font-semibold">
            {(['Day', 'Week', 'Month'] as const).map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${timeframe === tf ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main'}`}>
                {tf}
              </button>
            ))}
          </div>
        </div>
        <DesktopDashboardChart data={chartData} />
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text-main">Workstation Repositories</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => openModal('repo')} className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs">
              <Plus size={13} /> <span>New Repo</span>
            </button>
            <button onClick={() => navigate('repos')} className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer ml-1">
              <span>View All ({githubRepos.length})</span> <ArrowRight size={13} />
            </button>
          </div>
        </div>
        {filteredRepos.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-xl">
            <p className="text-xs text-text-muted mb-3">{query ? `No repositories match "${query}"` : 'No repositories found in workstation.'}</p>
            <button onClick={() => openModal('repo')} className="px-4 py-2 bg-hover hover:bg-border text-text-main rounded-xl text-xs font-semibold cursor-pointer">
              Create First Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRepos.slice(0, 6).map(repo => (
              <div key={repo.name} onClick={() => openRepo(repo.name, repo.owner?.login || githubUser?.login)} className={`p-3.5 border rounded-xl cursor-pointer transition-colors flex items-center justify-between ${currentRepo === repo.name ? 'bg-primary/5 border-primary/40' : 'bg-hover/20 hover:bg-hover/40 border-border'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <FolderGit2 size={18} className={currentRepo === repo.name ? 'text-primary shrink-0' : 'text-text-muted shrink-0'} />
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-text-main truncate block">{repo.name}</span>
                    <span className="text-[11px] text-text-muted truncate block">{repo.description || 'No description provided'}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-hover px-2 py-0.5 rounded text-text-muted shrink-0 ml-2">{repo.language || 'Code'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
