import React from 'react';
import { useAppContext } from '../../AppContext';
import { MobileCommitCard } from '../components/MobileCommitCard';
import { GitCommit, Activity as ActivityIcon } from 'lucide-react';

export const Activity: React.FC = () => {
  const { activeCommits, showToast, currentRepo } = useAppContext();

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast(`Copied SHA: ${hash.substring(0, 7)}`, 'success');
  };

  return (
    <div className="px-4 py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary tracking-tight">Global Activity</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            Timeline of recent commits across your repositories.
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
          <ActivityIcon size={16} />
        </div>
      </div>

      {activeCommits.length === 0 ? (
        <div className="bg-surface-1 border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <GitCommit size={32} className="text-text-tertiary mb-2 opacity-50" />
          <span className="text-sm font-semibold text-text-primary mb-1">No commits recorded</span>
          <span className="text-xs text-text-tertiary">
            Commit changes in any repository to track activity here.
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeCommits.map((commit, idx) => (
            <MobileCommitCard
              key={`${commit.hash}-${idx}`}
              commit={{
                hash: commit.hash,
                msg: commit.msg,
                author: commit.author,
                date: commit.date,
                avatarUrl: commit.avatarUrl,
                stats: commit.stats,
              }}
              onClick={() => {
                showToast(`Viewing commit ${commit.hash.substring(0, 7)}`, 'info');
              }}
              onCopyHash={() => handleCopyHash(commit.hash)}
              isLatest={idx === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Aliases
export const MobileActivity = Activity;
