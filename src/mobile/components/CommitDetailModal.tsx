import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../AppContext';
import { fetchCommitDetailsSafe, DetailedCommitInfo } from '../utils/gitApi';
import { CommitDetailHeader } from './commitDetail/CommitDetailHeader';
import { CommitDetailOverview } from './commitDetail/CommitDetailOverview';
import { CommitDetailDiffs } from './commitDetail/CommitDetailDiffs';
import { CommitDetailCiCd } from './commitDetail/CommitDetailCiCd';
import { CommitDetailActions } from './commitDetail/CommitDetailActions';

export const CommitDetailModal: React.FC<{ commit: any | null; onClose: () => void }> = ({
  commit,
  onClose,
}) => {
  const { currentRepo, currentRepoOwner, githubToken, githubUser, theme } = useAppContext();
  const [detail, setDetail] = useState<DetailedCommitInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'diffs' | 'cicd'>('overview');

  useEffect(() => {
    if (!commit) { setDetail(null); return; }
    setIsLoading(true);
    fetchCommitDetailsSafe({
      commitSha: commit.fullHash || commit.hash,
      repoName: currentRepo || 'repository',
      owner: currentRepoOwner || githubUser?.login || '',
      token: githubToken,
      fallbackCommit: commit,
    }).then(res => setDetail(res)).finally(() => setIsLoading(false));
  }, [commit, currentRepo, currentRepoOwner, githubToken, githubUser]);

  if (!commit) return null;
  const sha = commit.fullHash || commit.hash || '';

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <CommitDetailHeader commit={commit} onClose={onClose} />

        <div className="flex border-b border-border bg-main/50 px-4 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('diffs')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'diffs' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            <span>Diffs</span>
            {detail?.files && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-hover text-text-muted">
                {detail.files.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cicd')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'cicd' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            CI/CD Checks
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-12 flex justify-center text-xs text-text-muted">Loading commit details...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <CommitDetailOverview commit={commit} detail={detail} htmlUrl={(detail as any)?.htmlUrl || (commit as any)?.htmlUrl} />
              )}
              {activeTab === 'diffs' && (
                <CommitDetailDiffs files={detail?.files || []} isDark={theme === 'dark'} />
              )}
              {activeTab === 'cicd' && (
                <CommitDetailCiCd commitSha={sha} />
              )}
            </>
          )}

          <CommitDetailActions commit={commit} onClose={onClose} />
        </div>
      </motion.div>
    </div>
  );
};
