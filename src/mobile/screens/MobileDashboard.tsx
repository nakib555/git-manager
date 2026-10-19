import React from 'react';
import { useAppContext } from '../../AppContext';
import { 
  FolderGit2, Star, GitPullRequest, GitCommit, 
  Plus, Download, ArrowUpRight, Github, Clock, ChevronRight
} from 'lucide-react';

export const MobileDashboard: React.FC = () => {
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
            <span className="text-[11px] font-medium">Repos</span>
            <FolderGit2 size={13} className="text-accent" />
          </div>
          <span className="text-xl font-bold text-text-primary font-mono tabular-nums">
            {githubRepos.length}
          </span>
          <span className="text-[10px] text-success flex items-center gap-0.5 mt-1 font-medium">
            <ArrowUpRight size={11} /> Synced
          </span>
        </div>

        <div className="bg-surface-1 border border-border rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-tertiary mb-1">
            <span className="text-[11px] font-medium">Stars</span>
            <Star size={13} className="text-warning" />
          </div>
          <span className="text-xl font-bold text-text-primary font-mono tabular-nums">
            {totalStars}
          </span>
          <span className="text-[10px] text-text-tertiary block mt-1 font-mono">
            {totalForks} forks
          </span>
        </div>

        <div className="bg-surface-1 border border-border rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-tertiary mb-1">
            <span className="text-[11px] font-medium">Commits</span>
            <GitCommit size={13} className="text-accent" />
          </div>
          <span className="text-xl font-bold text-text-primary font-mono tabular-nums">
            {activeCommits.length}
          </span>
          <span className="text-[10px] text-accent block mt-1 font-mono truncate">
            Active session
          </span>
        </div>
      </div>

      {/* 3. Quick Action Buttons */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2.5 px-0.5">
          Quick Actions
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => openModal('repo')}
            className="h-11 px-3.5 bg-surface-1 hover:bg-surface-2 border border-border hover:border-accent/40 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-text-primary active:scale-98 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <Plus size={15} />
            </div>
            <span>New Repository</span>
          </button>

          <button
            onClick={() => navigate('clone')}
            className="h-11 px-3.5 bg-surface-1 hover:bg-surface-2 border border-border hover:border-accent/40 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-text-primary active:scale-98 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <Download size={15} />
            </div>
            <span>Clone Repository</span>
          </button>
        </div>
      </div>

      {/* 4. Recent Repositories Activity */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Recent Repositories
          </span>
          <button
            onClick={() => navigate('repos')}
            className="text-xs text-accent hover:opacity-80 font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {githubRepos.length === 0 ? (
          <div className="bg-surface-1 border border-border rounded-xl p-6 text-center flex flex-col items-center justify-center">
            <FolderGit2 size={28} className="text-text-tertiary mb-2 opacity-50" />
            <span className="text-sm font-semibold text-text-primary mb-1">No repositories found</span>
            <span className="text-xs text-text-tertiary">Create or clone a repo to get started.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {githubRepos.slice(0, 5).map((repo) => (
              <div
                key={repo.id}
                onClick={() => openRepo(repo.name, (repo as any).owner?.login || null)}
                className="p-3.5 bg-surface-1 hover:bg-surface-2 border border-border hover:border-accent/30 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-accent shrink-0">
                    <FolderGit2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                      {repo.name}
                    </div>
                    <div className="text-xs text-text-tertiary truncate">
                      {repo.description || 'No description provided.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {repo.language && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-text-secondary">
                      {repo.language}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-text-tertiary group-hover:text-text-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
