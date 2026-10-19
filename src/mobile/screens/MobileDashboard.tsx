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
    <div className="px-5 py-4 space-y-6">
      {/* 1. Header greeting & profile status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {githubUser?.avatar_url ? (
            <img 
              src={githubUser.avatar_url} 
              alt={githubUser.login} 
              className="w-11 h-11 rounded-full border border-[#2A2A2E] object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#121214] border border-[#2A2A2E] flex items-center justify-center text-[#71717A]">
              <Github size={20} />
            </div>
          )}
          <div>
            <span className="text-xs text-[#71717A] block font-medium">Welcome back,</span>
            <h2 className="text-lg font-semibold text-[#F4F4F5] tracking-tight">
              {githubUser?.name || githubUser?.login || 'Developer'}
            </h2>
          </div>
        </div>

        {!githubUser && (
          <button
            onClick={connectGitHub}
            className="h-9 px-3.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-[#3B82F6]/25 active:scale-95 transition-all cursor-pointer"
          >
            <Github size={14} />
            <span>Connect</span>
          </button>
        )}
      </div>

      {/* 2. Compact Stats Row (3 Columns with Tabular Numbers) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717A] mb-1">
            <span className="text-[11px] font-medium">Repos</span>
            <FolderGit2 size={13} className="text-[#3B82F6]" />
          </div>
          <span className="text-xl font-bold text-[#F4F4F5] font-mono tabular-nums">
            {githubRepos.length}
          </span>
          <span className="text-[10px] text-[#22C55E] flex items-center gap-0.5 mt-1 font-medium">
            <ArrowUpRight size={11} /> Synced
          </span>
        </div>

        <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717A] mb-1">
            <span className="text-[11px] font-medium">Stars</span>
            <Star size={13} className="text-[#F59E0B]" />
          </div>
          <span className="text-xl font-bold text-[#F4F4F5] font-mono tabular-nums">
            {totalStars}
          </span>
          <span className="text-[10px] text-[#71717A] block mt-1 font-mono">
            {totalForks} forks
          </span>
        </div>

        <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717A] mb-1">
            <span className="text-[11px] font-medium">Commits</span>
            <GitCommit size={13} className="text-[#3B82F6]" />
          </div>
          <span className="text-xl font-bold text-[#F4F4F5] font-mono tabular-nums">
            {activeCommits.length}
          </span>
          <span className="text-[10px] text-[#3B82F6] block mt-1 font-mono truncate">
            Active session
          </span>
        </div>
      </div>

      {/* 3. Quick Action Buttons */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-2.5 px-0.5">
          Quick Actions
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => openModal('repo')}
            className="h-11 px-3.5 bg-[#121214] hover:bg-[#1A1A1D] border border-[#2A2A2E] hover:border-[#3B82F6]/40 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-[#F4F4F5] active:scale-98 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
              <Plus size={15} />
            </div>
            <span>New Repository</span>
          </button>

          <button
            onClick={() => navigate('clone')}
            className="h-11 px-3.5 bg-[#121214] hover:bg-[#1A1A1D] border border-[#2A2A2E] hover:border-[#3B82F6]/40 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-[#F4F4F5] active:scale-98 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
              <Download size={15} />
            </div>
            <span>Clone Repository</span>
          </button>
        </div>
      </div>

      {/* 4. Recent Repositories Activity */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
            Recent Repositories
          </span>
          <button
            onClick={() => navigate('repos')}
            className="text-xs text-[#3B82F6] hover:text-[#2563EB] font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {githubRepos.length === 0 ? (
          <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-6 text-center flex flex-col items-center justify-center">
            <FolderGit2 size={28} className="text-[#71717A] mb-2 opacity-50" />
            <span className="text-sm font-semibold text-[#F4F4F5] mb-1">No repositories found</span>
            <span className="text-xs text-[#71717A]">Create or clone a repo to get started.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {githubRepos.slice(0, 5).map((repo) => (
              <div
                key={repo.id}
                onClick={() => openRepo(repo.name, (repo as any).owner?.login || null)}
                className="p-3.5 bg-[#121214] hover:bg-[#1A1A1D] border border-[#2A2A2E] hover:border-[#3B82F6]/30 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] flex items-center justify-center text-[#3B82F6] shrink-0">
                    <FolderGit2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#F4F4F5] truncate group-hover:text-[#3B82F6] transition-colors">
                      {repo.name}
                    </div>
                    <div className="text-xs text-[#71717A] truncate">
                      {repo.description || 'No description provided.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {repo.language && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1D] border border-[#2A2A2E] text-[#A1A1AA]">
                      {repo.language}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-[#71717A] group-hover:text-[#F4F4F5]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
