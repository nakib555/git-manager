import React from 'react';
import { Star, ArrowDownToLine, FolderGit2 } from 'lucide-react';
import { UnifiedRepoItem } from '../types';

interface CloneRecentReposProps {
  repos: UnifiedRepoItem[];
  onSelectRepo: (repo: UnifiedRepoItem) => void;
  isLoading?: boolean;
}

export const CloneRecentRepos: React.FC<CloneRecentReposProps> = ({
  repos,
  onSelectRepo,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-xs text-text-muted space-y-2">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading repositories...</span>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-text-muted bg-main rounded-xl border border-dashed border-border p-6 space-y-2">
        <FolderGit2 size={24} className="mx-auto text-text-muted opacity-60" />
        <p className="font-semibold text-text-main">No repositories found</p>
        <p className="text-[11px] text-text-muted">No repositories match your current filter criteria or history.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto max-h-[340px] pr-1 no-scrollbar">
      {repos.map((repo) => (
        <div
          key={`${repo.owner}/${repo.name}`}
          onClick={() => onSelectRepo(repo)}
          className="bg-card border border-border hover:border-primary/50 p-3.5 rounded-xl cursor-pointer transition-all duration-150 flex flex-col justify-between group shadow-xs hover:shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-xs text-text-main group-hover:text-primary transition-colors truncate">
                {repo.owner}/{repo.name}
              </span>
              {repo.isOnDevice && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                  Synced
                </span>
              )}
            </div>

            {repo.description && (
              <p className="text-[11px] text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                {repo.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/60 text-[10px] text-text-muted">
            <div className="flex items-center gap-3">
              {repo.language && (
                <span className="flex items-center gap-1 font-semibold text-text-main">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {repo.language}
                </span>
              )}
              {repo.stars !== undefined && repo.stars > 0 && (
                <span className="flex items-center gap-0.5">
                  <Star size={11} className="text-amber-500 fill-amber-500" />
                  {repo.stars.toLocaleString()}
                </span>
              )}
            </div>

            <span className="text-primary font-bold text-[11px] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <ArrowDownToLine size={12} />
              <span>Select</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
