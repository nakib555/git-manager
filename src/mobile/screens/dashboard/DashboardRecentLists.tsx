import React from 'react';
import { FolderGit2, ChevronRight, GitCommit } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { formatRelativeTime } from '../../utils/formatters';

interface DashboardRecentListsProps {
  githubRepos: any[];
  currentRepo: string | null;
  activeCommits: any[];
  onOpenRepo: (name: string) => void;
  onNavigate: (tab: any) => void;
  onOpenModal: (type: any) => void;
  onSelectCommit: (commit: any) => void;
}

export const DashboardRecentLists: React.FC<DashboardRecentListsProps> = ({
  githubRepos,
  currentRepo,
  activeCommits,
  onOpenRepo,
  onNavigate,
  onOpenModal,
  onSelectCommit,
}) => {
  return (
    <>
      {githubRepos.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Repositories ({githubRepos.length})
            </h3>
            <button 
              type="button"
              onClick={() => onNavigate('repos')}
              className="text-xs text-accent font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              <span>Explore</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {githubRepos.slice(0, 5).map((repo) => (
              <button
                key={repo.name}
                type="button"
                onClick={() => onOpenRepo(repo.name)}
                className={`flex-shrink-0 w-52 p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs active:scale-95 ${
                  currentRepo === repo.name
                    ? 'bg-surface-2 border-accent/60 shadow-sm ring-1 ring-accent/30'
                    : 'bg-surface-1 border-border/80 hover:border-accent/50 hover:bg-surface-2/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FolderGit2 size={13} className={currentRepo === repo.name ? 'text-accent' : 'text-text-tertiary'} />
                    <span className="text-xs font-bold text-text-primary truncate">{repo.name}</span>
                  </div>
                  {currentRepo === repo.name && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs" title="Currently open" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-mono">
                  <span className="truncate">{repo.language || 'Markdown'}</span>
                  <span>·</span>
                  <span className="tabular-nums">★ {repo.stargazers_count || 0}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit size={15} className="text-[#3FB950]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Recent Commits</h3>
          </div>
          <button 
            type="button"
            onClick={() => onNavigate('activity')}
            className="text-xs text-accent font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {activeCommits.length === 0 ? (
          <EmptyState
            icon={GitCommit}
            title="No commit history on branch"
            description="Create a commit or stage changes to record project history on this branch."
            primaryAction={{ label: 'Commit Changes', icon: GitCommit, onClick: () => onOpenModal('commit') }}
            secondaryAction={{ label: 'Browse Repositories', icon: FolderGit2, onClick: () => onNavigate('repos') }}
            compact
          />
        ) : (
          <div className="space-y-2">
            {activeCommits.slice(0, 4).map((commit, idx) => (
              <div 
                key={`${commit.hash}-${idx}`} 
                onClick={() => onSelectCommit(commit)}
                className="bg-surface-1 border border-border hover:border-text-primary/30 rounded-xl p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-all active:scale-98 shadow-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-secondary shrink-0 mt-0.5">
                    <GitCommit size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary leading-snug truncate">{commit.msg}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-text-tertiary font-mono">
                      <span className="text-text-secondary font-semibold tabular-nums">{commit.hash.substring(0, 7)}</span>
                      <span aria-hidden="true">&bull;</span>
                      <span className="tabular-nums">{formatRelativeTime(commit.timestamp || commit.date, commit.time)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-text-tertiary">{commit.author.split(' ')[0]}</span>
                  <ChevronRight size={14} className="text-text-tertiary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
