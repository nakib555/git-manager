import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../AppContext';
import { CommitList } from '../../../components/commit/CommitList';
import { DiffViewer } from '../../../components/commit/DiffViewer';
import { CiCdPipelineFlow } from '../../../components/commit/CiCdStatus';

export const DesktopCommitsView: React.FC = () => {
  const { 
    githubToken, currentRepoOwner, currentRepo, activeCommits,
    openModal, deleteCommit, undoLatestCommit, theme,
  } = useAppContext();

  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [commitDetailData, setCommitDetailData] = useState<any>(null);
  const [isLoadingCommitDetail, setIsLoadingCommitDetail] = useState<boolean>(false);

  useEffect(() => {
    if (activeCommits.length > 0 && !selectedCommit) {
      setSelectedCommit(activeCommits[0]);
    }
  }, [activeCommits, selectedCommit]);

  useEffect(() => {
    if (!selectedCommit) {
      setCommitDetailData(null);
      return;
    }
    const sha = selectedCommit.fullHash || selectedCommit.hash;
    if (githubToken && currentRepoOwner && sha && currentRepo) {
      setIsLoadingCommitDetail(true);
      fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/commits/${sha}`, {
        headers: { Authorization: `Bearer ${githubToken}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setCommitDetailData(data); })
        .catch(console.error)
        .finally(() => setIsLoadingCommitDetail(false));
    } else {
      setCommitDetailData(null);
    }
  }, [selectedCommit?.hash, selectedCommit?.fullHash, githubToken, currentRepoOwner, currentRepo]);

  const commitToInspect = activeCommits.find(c => c.hash === selectedCommit?.hash) || activeCommits[0];

  return (
    <div className="flex w-full h-full gap-4 min-h-0 overflow-hidden">
      {/* Commits Timeline List Pane */}
      <div className="w-[380px] lg:w-[440px] flex flex-col shrink-0 min-h-0 bg-card border border-border rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-main">Commits Timeline</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-hover text-text-muted">
              {activeCommits.length}
            </span>
          </div>
          <button
            onClick={() => openModal('commit')}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            + New Commit
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar min-h-0">
          <CommitList
            onSelectCommit={setSelectedCommit}
            selectedCommitHash={selectedCommit?.hash}
          />
        </div>
      </div>

      {/* Commit Detail / Diff / CI-CD Pane */}
      <div className="flex-1 flex flex-col min-h-0 gap-4 overflow-y-auto pr-1 no-scrollbar">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs shrink-0">
          <CiCdPipelineFlow hash={commitToInspect?.hash || ''} />
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex-1 min-h-[360px] flex flex-col">
          {commitToInspect ? (
            commitDetailData?.files && commitDetailData.files.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[500px]">
                {commitDetailData.files.map((file: any, fIdx: number) => (
                  <DiffViewer key={fIdx} patch={file.patch} filename={file.filename} isDark={theme === 'dark'} />
                ))}
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs p-3 bg-main rounded-xl border border-border">
                <div className="text-text-muted pb-1 border-b border-border">commit {commitToInspect.hash}</div>
                <div className="text-text-main font-bold">"{commitToInspect.msg}"</div>
                <div className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                  Author: {commitToInspect.author} • {commitToInspect.add || 0} additions, {commitToInspect.del || 0} deletions
                </div>
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-text-muted">
              Select a commit to inspect its changes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
