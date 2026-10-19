import React, { useState } from 'react';
import { useAppContext } from '../../../AppContext';
import { CommitCard } from '../../components/CommitCard';
import { CommitDetailModal } from '../../components/CommitDetailModal';
import { GitCommit, Copy, Check, Plus } from 'lucide-react';

export const CommitsScreen: React.FC = () => {
  const { activeCommits, showToast, currentRepo, openModal } = useAppContext();
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast(`Copied SHA: ${hash.substring(0, 7)}`, 'success');
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* 1. Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">Commits</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            History of {currentRepo} on current branch
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-accent font-semibold bg-accent-soft px-2.5 py-1 rounded-lg border border-accent/25">
            {activeCommits.length}
          </span>
          <button
            onClick={() => openModal('commit')}
            className="h-8 px-3 rounded-lg bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-accent/20 cursor-pointer active:scale-95"
            title="Create New Commit"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>New Commit</span>
          </button>
        </div>
      </div>

      {/* 2. Commit Feed List */}
      {activeCommits.length === 0 ? (
        <div className="bg-surface-1 border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <GitCommit size={32} className="text-text-tertiary mb-2 opacity-50" />
          <span className="text-sm font-semibold text-text-primary mb-1">No commits on branch</span>
          <span className="text-xs text-text-tertiary">
            Create a commit to start building project history.
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeCommits.map((commit, idx) => (
            <CommitCard
              key={`${commit.hash}-${idx}`}
              commit={{
                hash: commit.hash,
                msg: commit.msg,
                author: commit.author,
                date: commit.date || commit.timestamp,
                avatarUrl: commit.avatarUrl,
                stats: commit.stats,
              }}
              onClick={() => setSelectedCommit(commit)}
              onCopyHash={() => handleCopyHash(commit.hash)}
              isLatest={idx === 0}
            />
          ))}
        </div>
      )}

      {/* 3. Comprehensive Bitbucket/Git Commit View with Tab Features */}
      <CommitDetailModal
        commit={selectedCommit}
        onClose={() => setSelectedCommit(null)}
      />
    </div>
  );
};

// Aliases
export const MobileCommits = CommitsScreen;
