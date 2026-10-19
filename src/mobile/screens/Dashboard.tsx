import React from 'react';
import { useAppContext } from '../../AppContext';
import { 
  FolderGit2, Star, GitPullRequest, GitCommit, 
  Plus, Download, ArrowUpRight, Github, Clock, ChevronRight
} from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const { 
    githubUser, 
    githubRepos, 
    activeCommits, 
    openRepo, 
    openModal, 
    navigate,
    connectGitHub 
  } = useAppContext();

  const totalStars = githubRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = githubRepos.reduce((acc, r) => acc + (r.forks_count || 0), 0);

  return (
    <div className="px-4 py-4 space-y-6">
      {/* 1. Header greeting & profile status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {githubUser?.avatar_url ? (
            <img 
              src={githubUser.avatar_url} 
              alt={githubUser.login} 
              className="w-11 h-11 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-surface-1 border border-border flex items-center justify-center text-text-tertiary">
              <Github size={20} />
            </div>
          )}
          <div>
            <span className="text-xs text-text-tertiary block font-medium">Welcome back,</span>
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">
              {githubUser?.name || githubUser?.login || 'Developer'}
            </h2>
          </div>
        </div>

        {!githubUser && (
          <button
            onClick={connectGitHub}
            className="h-9 px-3.5 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-accent/25 active:scale-95 transition-all cursor-pointer"
          >
            <Github size={14} />
            <span>Connect</span>
          </button>
        )}
      </div>

      {/* 2. Compact Stats Row (3 Columns with Tabular Numbers) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-surface-1 border border-border rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-tertiary mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Repos</span>
            <FolderGit2 size={13} className="text-accent" />
          </div>
          <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
            {githubRepos.length}
          </span>
          <span className="text-[10px] text-text-tertiary font-medium mt-1">Active sync</span>
        </div>

        <div className="bg-surface-1 border border-border rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-tertiary mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Stars</span>
            <Star size={13} className="text-warning" />
          </div>
          <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
            {totalStars}
          </span>
          <span className="text-[10px] text-text-tertiary font-medium mt-1">{totalForks} forks</span>
        </div>

        <div className="bg-surface-1 border border-border rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-tertiary mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Commits</span>
            <GitCommit size={13} className="text-success" />
          </div>
          <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
            {activeCommits.length}
          </span>
          <span className="text-[10px] text-text-tertiary font-medium mt-1">Local & sync</span>
        </div>
      </div>

      {/* 3. Quick Action Buttons Row */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => openModal('repo')}
          className="h-12 px-4 rounded-xl bg-accent text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-accent/25 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>New Repository</span>
        </button>

        <button
          onClick={() => navigate('clone')}
          className="h-12 px-4 rounded-xl bg-surface-1 border border-border text-text-primary hover:bg-surface-2 font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Download size={16} strokeWidth={2.4} className="text-text-secondary" />
          <span>Clone Repo</span>
        </button>
      </div>

      {/* 4. Active Repository Banner (if any) */}
      {githubRepos.length > 0 && (
        <div className="bg-surface-1 border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              Latest Pushed Repository
            </span>
            <span className="w-2 h-2 rounded-full bg-success" />
          </div>

          <div 
            onClick={() => openRepo(githubRepos[0].name)}
            className="group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors flex items-center gap-1.5">
                <span>{githubRepos[0].name}</span>
                <ArrowUpRight size={14} className="text-text-tertiary group-hover:text-accent transition-colors" />
              </h3>
              <span className="text-[11px] text-text-tertiary font-mono">
                {githubRepos[0].language || 'Markdown'}
              </span>
            </div>
            {githubRepos[0].description && (
              <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                {githubRepos[0].description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 5. Recent Activity Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Recent Commits
          </h3>
          <button 
            onClick={() => navigate('activity')}
            className="text-xs text-accent font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {activeCommits.length === 0 ? (
          <div className="bg-surface-1 border border-border rounded-xl p-6 text-center">
            <GitCommit size={24} className="mx-auto text-text-tertiary mb-2 opacity-60" />
            <p className="text-xs text-text-tertiary">No recent commits recorded yet</p>
          </div>
        ) : (
          <div className="bg-surface-1 border border-border rounded-xl divide-y divide-border overflow-hidden">
            {activeCommits.slice(0, 4).map((commit, idx) => (
              <div 
                key={`${commit.hash}-${idx}`} 
                className="p-3 hover:bg-surface-2 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center text-text-secondary shrink-0 mt-0.5">
                    <GitCommit size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {commit.msg}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-tertiary font-mono">
                      <span>{commit.hash.substring(0, 7)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(commit.date)}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-text-tertiary font-mono shrink-0">
                  {commit.author.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Aliases
export const MobileDashboard = Dashboard;
