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

  useEffect(() => {
    if (!commit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commit, onClose]);

  const sha = commit?.fullHash || commit?.hash || '';

  return (
    <AnimatePresence>
      {commit && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop with tap-to-close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Bottom Sheet on Mobile (< 640px) / Centered Dialog on Desktop (>= 640px) */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            className="relative bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] z-10 pb-[env(safe-area-inset-bottom,0px)]"
          >
            {/* Mobile Sheet Drag Handle */}
            <div className="pt-2.5 pb-1 flex justify-center shrink-0 sm:hidden">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            <CommitDetailHeader commit={commit} onClose={onClose} />

            {/* Tab Navigation */}
            <div className="flex border-b border-border bg-surface-2/40 px-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'overview' ? 'border-accent text-accent' : 'border-transparent text-text-tertiary hover:text-text-primary'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('diffs')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'diffs' ? 'border-accent text-accent' : 'border-transparent text-text-tertiary hover:text-text-primary'
                }`}
              >
                <span>Diffs</span>
                {detail?.files && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-surface-3 text-text-secondary border border-border">
                    {detail.files.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cicd')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'cicd' ? 'border-accent text-accent' : 'border-transparent text-text-tertiary hover:text-text-primary'
                }`}
              >
                CI/CD Checks
              </button>
            </div>

            {/* Scrollable Content View */}
            <div className="p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] overflow-y-auto flex-1 space-y-4">
              {isLoading ? (
                <div className="py-12 flex justify-center text-xs text-text-tertiary font-medium">Loading commit details...</div>
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
      )}
    </AnimatePresence>
  );
};
