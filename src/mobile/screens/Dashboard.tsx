import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import { Plus, Download } from 'lucide-react';
import { CommitDetailModal } from '../components/CommitDetailModal';
import { DashboardProfileHeader } from './dashboard/DashboardProfileHeader';
import { DashboardMetricCards } from './dashboard/DashboardMetricCards';
import { DashboardVelocityCard } from './dashboard/DashboardVelocityCard';
import { DashboardRecentLists } from './dashboard/DashboardRecentLists';

export const Dashboard: React.FC = () => {
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const { 
    githubUser, 
    githubRepos, 
    activeCommits, 
    currentRepo,
    openRepo, 
    openModal, 
    navigate,
    connectGitHub,
  } = useAppContext();

  const totalStars = githubRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = githubRepos.reduce((acc, r) => acc + (r.forks_count || 0), 0);

  const velocityData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseCounts = [3, 8, 14, 9, 22, 6, 12];
    if (activeCommits.length > 0) {
      const factor = Math.max(1, Math.min(3, activeCommits.length / 10));
      return days.map((day, i) => ({
        day,
        count: Math.round(baseCounts[i] * factor),
      }));
    }
    return days.map((day, i) => ({ day, count: baseCounts[i] }));
  }, [activeCommits.length]);

  const maxVelocity = Math.max(...velocityData.map(v => v.count), 1);

  return (
    <div className="px-4 py-4 space-y-5 pb-8 select-none">
      <DashboardProfileHeader githubUser={githubUser} onConnectGitHub={connectGitHub} />

      <DashboardMetricCards
        reposCount={githubRepos.length}
        totalStars={totalStars}
        totalForks={totalForks}
        commitsCount={activeCommits.length}
      />

      <DashboardVelocityCard velocityData={velocityData} maxVelocity={maxVelocity} />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => openModal('repo')}
          className="h-12 px-4 rounded-xl bg-text-primary hover:opacity-90 text-background font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>New Repository</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('clone')}
          className="h-12 px-4 rounded-xl bg-surface-2 border border-border hover:bg-surface-3 text-text-primary font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <Download size={16} strokeWidth={2.4} className="text-text-secondary" />
          <span>Clone Repo</span>
        </button>
      </div>

      <DashboardRecentLists
        githubRepos={githubRepos}
        currentRepo={currentRepo}
        activeCommits={activeCommits}
        onOpenRepo={openRepo}
        onNavigate={navigate}
        onOpenModal={openModal}
        onSelectCommit={setSelectedCommit}
      />

      <CommitDetailModal
        commit={selectedCommit}
        onClose={() => setSelectedCommit(null)}
      />
    </div>
  );
};

export const MobileDashboard = Dashboard;
