import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitCommitHorizontal, FileText } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { fetchCommitDetailsSafe, DetailedCommitInfo } from '../utils/gitApi';
import { useCiCdStatus } from '../../features/cicd/hooks/useCiCdStatus';
import { CommitDetailHeader } from './commitDetail/CommitDetailHeader';
import { CommitDetailOverview } from './commitDetail/CommitDetailOverview';
import { CommitDetailDiffs } from './commitDetail/CommitDetailDiffs';
import { CommitDetailCiCd } from './commitDetail/CommitDetailCiCd';
import { CommitDetailActions } from './commitDetail/CommitDetailActions';

export const CommitDetailModal: React.FC<{ commit: any | null; onClose: () => void }> = ({
  commit,
  onClose,
}) => {
  const { currentRepo, currentRepoOwner, githubToken, githubUser, theme, activeCommits } = useAppContext();
  const [activeCommit, setActiveCommit] = useState<any | null>(commit);
  const [detail, setDetail] = useState<DetailedCommitInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'diffs' | 'cicd'>('overview');

  // Keep activeCommit in sync when external prop changes
  useEffect(() => {
    setActiveCommit(commit);
    setActiveTab('overview');
  }, [commit]);

  const sha = activeCommit?.fullHash || activeCommit?.hash || '';
  const { cicd } = useCiCdStatus(sha);

  useEffect(() => {
    if (!activeCommit) {
      setDetail(null);
      return;
    }
    setIsLoading(true);
    fetchCommitDetailsSafe({
      commitSha: sha,
      repoName: currentRepo || 'repository',
      owner: currentRepoOwner || githubUser?.login || '',
      token: githubToken,
      fallbackCommit: activeCommit,
    })
      .then(res => setDetail(res))
      .finally(() => setIsLoading(false));
  }, [activeCommit, sha, currentRepo, currentRepoOwner, githubToken, githubUser]);

  useEffect(() => {
    if (!activeCommit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCommit, onClose]);

  const handleSelectParent = (parentSha: string) => {
    if (!parentSha) return;
    const found = activeCommits.find(
      c => c.hash === parentSha || c.fullHash === parentSha || (c.hash && parentSha.startsWith(c.hash))
    );
    if (found) {
      setActiveCommit(found);
    } else {
      setActiveCommit({
        hash: parentSha.slice(0, 7),
        fullHash: parentSha,
        msg: `Commit ${parentSha.slice(0, 7)}`,
        author: activeCommit?.author || 'Unknown',
        timestamp: activeCommit?.timestamp || Date.now(),
      });
    }
  };

  const diffsCount = detail?.files?.length ?? 10;
  const cicdCount = cicd?.steps?.length || 3;
  const isCiPassing = cicd?.status === 'success';

  return (
    <AnimatePresence>
      {activeCommit && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop with tap-to-close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
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
            className="relative bg-[#070d18] border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10 pb-[env(safe-area-inset-bottom,0px)]"
          >
            {/* Mobile Sheet Drag Handle */}
            <div className="pt-2.5 pb-0.5 flex justify-center shrink-0 sm:hidden">
              <div className="w-10 h-1 bg-border/80 rounded-full" />
            </div>

            {/* Header matching screenshot */}
            <CommitDetailHeader commit={activeCommit} onClose={onClose} />

            {/* Segmented Pill Tabs matching screenshot */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border/40 shrink-0 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/35 shadow-inner'
                    : 'bg-surface-2/60 hover:bg-surface-3 text-text-secondary border border-border/60 hover:text-text-primary'
                }`}
              >
                <GitCommitHorizontal size={14} className={activeTab === 'overview' ? 'text-blue-400' : 'text-text-tertiary'} />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('diffs')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'diffs'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/35 shadow-inner'
                    : 'bg-surface-2/60 hover:bg-surface-3 text-text-secondary border border-border/60 hover:text-text-primary'
                }`}
              >
                <FileText size={13} className={activeTab === 'diffs' ? 'text-blue-400' : 'text-text-tertiary'} />
                <span>Diffs ({diffsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cicd')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'cicd'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/35 shadow-inner'
                    : 'bg-surface-2/60 hover:bg-surface-3 text-text-secondary border border-border/60 hover:text-text-primary'
                }`}
              >
                <span className={`w-2 h-2 rounded-full inline-block ${isCiPassing ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                <span>CI/CD ({cicdCount})</span>
              </button>
            </div>

            {/* Scrollable Content View */}
            <div className="p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] overflow-y-auto flex-1 space-y-4">
              {isLoading ? (
                <div className="py-12 flex justify-center text-xs text-text-tertiary font-medium">
                  Loading commit details...
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && (
                    <CommitDetailOverview
                      commit={activeCommit}
                      detail={detail}
                      htmlUrl={(detail as any)?.htmlUrl || (activeCommit as any)?.htmlUrl}
                      onSelectParentCommit={handleSelectParent}
                    />
                  )}
                  {activeTab === 'diffs' && (
                    <CommitDetailDiffs files={detail?.files || []} isDark={theme === 'dark'} />
                  )}
                  {activeTab === 'cicd' && (
                    <CommitDetailCiCd commitSha={sha} />
                  )}
                </>
              )}

              {/* Bottom 2x2 Action Buttons + Delete HEAD Action */}
              <CommitDetailActions commit={activeCommit} onClose={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
