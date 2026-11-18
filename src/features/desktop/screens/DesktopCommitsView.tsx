import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { CommitList } from '../../../components/commit/CommitList';
import { DiffViewer } from '../../../components/commit/DiffViewer';
import { CiCdPipelineFlow } from '../../../components/commit/CiCdStatus';
import { RotateCcw, Trash2, Copy, Check, GitBranch } from 'lucide-react';
import { CommitRestoreSheet } from '../../../mobile/components/CommitRestoreSheet';
import { CommitsDeleteHeadDialog } from '../../../mobile/screens/repo/commits/CommitsDeleteHeadDialog';

export const DesktopCommitsView: React.FC = () => {
  const {
    githubToken, currentRepoOwner, currentRepo, activeCommits,
    openModal, deleteCommit, createBranchAtCommit, showToast, currentBranch, theme,
  } = useAppContext();

  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [commitDetailData, setCommitDetailData] = useState<any>(null);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeletingHead, setIsDeletingHead] = useState<boolean>(false);
  const [copiedSha, setCopiedSha] = useState(false);

  // Reset selected commit when repository or branch changes
  useEffect(() => {
    setSelectedCommit(null);
    setCommitDetailData(null);
  }, [currentRepo, currentBranch]);

  // Dynamically determine true HEAD commit (most recent timestamp)
  const actualHeadCommit = useMemo(() => {
    if (!activeCommits || activeCommits.length === 0) return null;
    return [...activeCommits].sort((a, b) => {
      const tA = new Date(a.timestamp || a.date || 0).getTime();
      const tB = new Date(b.timestamp || b.date || 0).getTime();
      return tB - tA;
    })[0];
  }, [activeCommits]);

  useEffect(() => {
    if (activeCommits.length > 0 && !selectedCommit) setSelectedCommit(actualHeadCommit || activeCommits[0]);
  }, [activeCommits, selectedCommit, actualHeadCommit]);

  useEffect(() => {
    if (!selectedCommit) return setCommitDetailData(null);
    const sha = selectedCommit.fullHash || selectedCommit.hash;
    if (githubToken && currentRepoOwner && sha && currentRepo && !(currentRepoOwner === 'octodev' && currentRepo === 'nexus-web-engine')) {
      const clean = githubToken.trim();
      const authHeader = clean.startsWith('Bearer ') || clean.startsWith('token ')
        ? clean
        : (clean.startsWith('ghp_') || clean.startsWith('github_pat_') ? `token ${clean}` : `Bearer ${clean}`);
      fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/commits/${sha}`, {
        headers: { Authorization: authHeader, Accept: 'application/vnd.github.v3+json' }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setCommitDetailData(data); })
        .catch(() => setCommitDetailData(null));
    } else setCommitDetailData(null);
  }, [selectedCommit?.hash, selectedCommit?.fullHash, githubToken, currentRepoOwner, currentRepo]);

  const commitToInspect = activeCommits.find(c => c.hash === selectedCommit?.hash) || actualHeadCommit || activeCommits[0];
  const isHead = !!actualHeadCommit && (commitToInspect?.hash === actualHeadCommit.hash || commitToInspect?.fullHash === actualHeadCommit.fullHash);

  const parentCommit = useMemo(() => {
    if (!commitToInspect) return undefined;
    if (commitToInspect.parents && commitToInspect.parents.length > 0) {
      const pRaw: any = commitToInspect.parents[0];
      const pSha = typeof pRaw === 'string' ? pRaw : (pRaw?.sha || '');
      const match = activeCommits.find(c => c.hash === pSha || c.fullHash === pSha);
      if (match) return match;
    }
    const cTime = new Date(commitToInspect.timestamp || commitToInspect.date || 0).getTime();
    const earlier = activeCommits
      .filter(c => (c.hash !== commitToInspect.hash && c.fullHash !== commitToInspect.fullHash))
      .filter(c => new Date(c.timestamp || c.date || 0).getTime() <= cTime)
      .sort((a, b) => new Date(b.timestamp || b.date || 0).getTime() - new Date(a.timestamp || a.date || 0).getTime());
    return earlier[0];
  }, [commitToInspect, activeCommits]);

  const handleDeleteConfirm = async () => {
    if (!commitToInspect) return;
    setIsDeletingHead(true);
    try {
      await deleteCommit(commitToInspect.fullHash || commitToInspect.hash);
      setShowDeleteModal(false);
      if (parentCommit) setSelectedCommit(parentCommit);
    } catch (e: any) {
      showToast(e.message || 'Delete failed', 'error');
    } finally {
      setIsDeletingHead(false);
    }
  };

  const handleCopySha = () => {
    if (!commitToInspect) return;
    const sha = commitToInspect.fullHash || commitToInspect.hash || '';
    navigator.clipboard?.writeText(sha);
    setCopiedSha(true);
    showToast(`Copied SHA ${sha.slice(0, 7)}`, 'success');
    setTimeout(() => setCopiedSha(false), 1800);
  };

  const handleBranchFromCommit = async () => {
    if (!commitToInspect) return;
    const sha = commitToInspect.fullHash || commitToInspect.hash;
    const branchName = `branch-${sha.slice(0, 7)}`;
    await createBranchAtCommit(branchName, sha);
  };

  const inspectedFiles = commitDetailData?.files || commitToInspect?.files || [];

  return (
    <div className="flex w-full h-full gap-4 min-h-0 overflow-hidden">
      {/* Commits Timeline List Pane */}
      <div className="w-[340px] lg:w-[400px] xl:w-[440px] flex flex-col shrink-0 min-h-0 bg-surface-1 border border-border rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <span>Commits Timeline</span>
            <span className="text-border">·</span>
            <span className="text-[11px] font-mono text-text-secondary tabular-nums">
              {activeCommits.length}
            </span>
          </div>
          <button type="button" onClick={() => openModal('commit')} className="text-xs font-semibold text-accent hover:underline btn-tactile cursor-pointer">
            + New Commit
          </button>
        </div>
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          <CommitList
            isDesktop={true}
            onSelectCommit={setSelectedCommit}
            onActionClick={(commit: any) => {
              setSelectedCommit(commit);
              setShowRestoreModal(true);
            }}
            selectedCommitHash={selectedCommit?.hash}
          />
        </div>
      </div>

      {/* Commit Detail / Diff / Actions Pane */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-4 overflow-y-auto pr-1 no-scrollbar">
        <div className="bg-surface-1 border border-border rounded-2xl p-3.5 shadow-xs shrink-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-text-secondary min-w-0">
              <span className="font-semibold text-text-primary">Selected Commit</span>
              {commitToInspect && (
                <>
                  <span className="text-border" aria-hidden="true">·</span>
                  <span className="font-mono text-primary font-semibold">{commitToInspect.hash?.slice(0, 7)}</span>
                </>
              )}
            </div>
            {commitToInspect && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopySha}
                  aria-label="Copy commit SHA"
                  className="px-2.5 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 btn-tactile cursor-pointer whitespace-nowrap"
                >
                  {copiedSha ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span className="font-mono">Copy SHA</span>
                </button>
                <button
                  type="button"
                  onClick={handleBranchFromCommit}
                  title="Create a branch pointing at this commit"
                  className="px-2.5 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 btn-tactile cursor-pointer whitespace-nowrap"
                >
                  <GitBranch size={13} />
                  <span>Branch Here</span>
                </button>
                <button
                  type="button" onClick={() => setShowRestoreModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-text-primary flex items-center gap-1.5 btn-tactile cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  <RotateCcw size={13} className="text-accent" />
                  <span>Restore / Revert</span>
                </button>
                {isHead && (
                  <button
                    type="button" onClick={() => setShowDeleteModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 text-xs font-semibold flex items-center gap-1.5 btn-tactile cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <Trash2 size={13} />
                    <span>Delete HEAD</span>
                  </button>
                )}
              </div>
            )}
          </div>
          <CiCdPipelineFlow hash={commitToInspect?.hash || ''} />
        </div>

        <div className="bg-surface-1 border border-border rounded-2xl p-5 shadow-xs flex-1 min-h-[320px] flex flex-col gap-4 overflow-y-auto">
          {commitToInspect ? (
            <>
              <div className="space-y-2 font-mono text-xs p-3.5 bg-surface-2/60 rounded-xl border border-border shrink-0">
                <div className="text-text-secondary pb-1.5 border-b border-border flex justify-between items-center gap-2">
                  <span>commit {commitToInspect.fullHash || commitToInspect.hash}</span>
                  {isHead && <span className="text-[10px] text-accent font-sans font-bold">CURRENT HEAD</span>}
                </div>
                <div className="text-text-primary font-bold font-sans text-sm">"{commitToInspect.msg}"</div>
                <div className="text-text-secondary text-[11px] tabular-nums">
                  Author: {commitToInspect.author} &bull; {commitToInspect.add || 0} additions, {commitToInspect.del || 0} deletions
                </div>
              </div>

              {inspectedFiles.length > 0 ? (
                <div className="space-y-4">
                  {inspectedFiles.map((file: any, fIdx: number) => (
                    file.patch ? (
                      <DiffViewer key={fIdx} patch={file.patch} filename={file.filename} isDark={theme !== 'light'} />
                    ) : (
                      <div key={fIdx} className="px-4 py-3 rounded-xl border border-border bg-surface-2/40 flex items-center justify-between text-xs font-mono">
                        <span className="text-text-primary font-semibold truncate">{file.filename}</span>
                        <span className="text-text-muted shrink-0 tabular-nums">
                          {file.status || 'modified'} (+{file.additions ?? 0} / -{file.deletions ?? 0})
                        </span>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-text-muted border border-dashed border-border rounded-xl p-6">
                  Patch diff not available for this synthetic/summary commit entry.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-text-secondary">
              Select a commit to inspect its changes
            </div>
          )}
        </div>
      </div>

      <CommitRestoreSheet isOpen={showRestoreModal} commit={commitToInspect} onClose={() => setShowRestoreModal(false)} />
      <CommitsDeleteHeadDialog
        commit={commitToInspect} parentCommit={parentCommit} branchName={currentBranch || 'main'}
        isOpen={showDeleteModal} isDeleting={isDeletingHead} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
