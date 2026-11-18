import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../../../AppContext';
import { CommitList } from '../../../components/commit/CommitList';
import { DiffViewer } from '../../../components/commit/DiffViewer';
import { CiCdPipelineFlow } from '../../../components/commit/CiCdStatus';
import { RotateCcw, Trash2, Copy, Check, GitBranch, FileDiff, Plus } from 'lucide-react';
import { CommitRestoreSheet } from '../../../mobile/components/CommitRestoreSheet';
import { CommitsDeleteHeadDialog } from '../../../mobile/screens/repo/commits/CommitsDeleteHeadDialog';
import { formatRelativeTime } from '../../../mobile/utils/formatters';

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

  const [paneWidth, setPaneWidth] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('gm_commits_pane_width'));
      if (saved >= 320 && saved <= 540) return saved;
    } catch (_) {}
    return 400;
  });
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const isResizingRef = useRef(false);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const maxAllowedPaneWidth = viewportWidth < 1180 ? 316 : viewportWidth < 1340 ? 372 : 540;
  const effectivePaneWidth = Math.min(paneWidth, maxAllowedPaneWidth);

  // Reset selected commit when repository or branch changes
  useEffect(() => {
    setSelectedCommit(null);
    setCommitDetailData(null);
  }, [currentRepo, currentBranch]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const containerLeft = document.querySelector('[data-commits-workspace]')?.getBoundingClientRect().left ?? 0;
      const next = Math.min(maxAllowedPaneWidth, Math.max(300, e.clientX - containerLeft));
      setPaneWidth(next);
    };
    const onUp = () => {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try { localStorage.setItem('gm_commits_pane_width', String(paneWidth)); } catch (_) {}
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [paneWidth, maxAllowedPaneWidth]);

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
    if (githubToken && currentRepoOwner && sha && currentRepo && !(currentRepoOwner === 'octodev' && currentRepo === 'nexus-web-engine') && currentRepoOwner !== 'local-developer') {
      const clean = githubToken.trim();
      const authHeader = clean.startsWith('Bearer ') || clean.startsWith('token ')
        ? clean
        : (clean.startsWith('ghp_') || clean.startsWith('github_pat_') ? `token ${clean}` : `Bearer ${clean}`);
      fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/commits/${sha}`, {
        headers: { Authorization: authHeader, Accept: 'application/vnd.github.v3+json' },
        cache: 'no-store',
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
  const addNum = String(commitToInspect?.add ?? 0).replace(/^\+/, '');
  const delNum = String(commitToInspect?.del ?? 0).replace(/^-/, '');

  return (
    <div data-commits-workspace className="flex w-full h-full gap-0 min-h-0 overflow-hidden relative">
      {/* Commits Timeline List Pane */}
      <div
        style={{ width: `${effectivePaneWidth}px` }}
        className="flex flex-col shrink-0 min-h-0 bg-card border border-border rounded-2xl p-3.5 shadow-xs"
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-border mb-2.5 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <span>Commits</span>
            <span className="text-border" aria-hidden="true">·</span>
            <span className="text-[11px] font-mono text-text-secondary tabular-nums">
              {activeCommits.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openModal('commit')}
            className="h-7 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/25 text-xs font-semibold text-primary flex items-center gap-1 btn-tactile cursor-pointer whitespace-nowrap"
          >
            <Plus size={12} />
            <span>New Commit</span>
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

      {/* Drag Resize Handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize commits timeline pane"
        tabIndex={0}
        onMouseDown={(e) => {
          e.preventDefault();
          isResizingRef.current = true;
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPaneWidth((w) => Math.max(300, w - 16));
          if (e.key === 'ArrowRight') setPaneWidth((w) => Math.min(maxAllowedPaneWidth, w + 16));
        }}
        className="w-3 shrink-0 cursor-col-resize flex items-center justify-center group outline-none"
        title="Drag to resize commits pane"
      >
        <div className="w-[2px] h-10 rounded-full bg-border/60 group-hover:bg-primary group-focus-visible:bg-primary transition-colors" />
      </div>

      {/* Commit Detail / Diff / Actions Pane */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-3 overflow-y-auto pr-1 no-scrollbar">
        {commitToInspect ? (
          <>
            {/* Unified Single-Elevation Commit Summary & Actions Card */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-xs shrink-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-text-secondary truncate">
                    commit <span className="text-text-primary font-semibold">{commitToInspect.fullHash || commitToInspect.hash}</span>
                  </span>
                  {isHead && (
                    <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-micro shrink-0">
                      HEAD
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 min-w-0 max-w-full">
                  <button
                    type="button"
                    onClick={handleCopySha}
                    aria-label="Copy commit SHA"
                    className="h-7 px-2.5 rounded-lg border border-border bg-surface-1 hover:bg-hover text-xs font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 btn-tactile cursor-pointer whitespace-nowrap"
                  >
                    {copiedSha ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedSha ? 'Copied' : 'Copy SHA'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBranchFromCommit}
                    title="Create a branch pointing at this commit"
                    className="h-7 px-2.5 rounded-lg border border-border bg-surface-1 hover:bg-hover text-xs font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 btn-tactile cursor-pointer whitespace-nowrap"
                  >
                    <GitBranch size={12} />
                    <span>Branch Here</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRestoreModal(true)}
                    className="h-7 px-2.5 rounded-lg border border-border bg-surface-1 hover:bg-hover text-xs font-medium text-text-primary flex items-center gap-1.5 btn-tactile cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw size={12} className="text-primary" />
                    <span>Restore / Revert</span>
                  </button>
                  {isHead && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="h-7 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 text-xs font-semibold flex items-center gap-1.5 btn-tactile cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 size={12} />
                      <span>Delete HEAD</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-text-primary leading-snug headline-balance">
                  {commitToInspect.msg}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  {commitToInspect.avatar && (
                    <img
                      src={commitToInspect.avatar}
                      alt={commitToInspect.author}
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 rounded-full border border-border object-cover shrink-0"
                    />
                  )}
                  <span className="font-medium text-text-primary">{commitToInspect.author}</span>
                  <span className="text-border" aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] text-text-muted tabular-nums">
                    {formatRelativeTime(commitToInspect.timestamp || commitToInspect.date, commitToInspect.time)}
                  </span>
                  <span className="text-border" aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] tabular-nums text-addition-oklch font-semibold">
                    +{addNum} additions
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-deletion-oklch font-semibold">
                    -{delNum} deletions
                  </span>
                  {inspectedFiles.length > 0 && (
                    <>
                      <span className="text-border" aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] tabular-nums text-text-secondary">
                        {inspectedFiles.length} {inspectedFiles.length === 1 ? 'file' : 'files'} changed
                      </span>
                    </>
                  )}
                </div>
              </div>

              <CiCdPipelineFlow hash={commitToInspect?.hash || ''} inline={true} />
            </div>

            {/* Changed Files & Unified Diffs */}
            {inspectedFiles.length > 0 ? (
              <div className="space-y-3 pb-2">
                {inspectedFiles.map((file: any, fIdx: number) => (
                  file.patch ? (
                    <DiffViewer key={file.filename || fIdx} patch={file.patch} filename={file.filename} isDark={theme !== 'light'} />
                  ) : (
                    <div key={file.filename || fIdx} className="px-4 py-3 rounded-2xl border border-border bg-card flex items-center justify-between text-xs font-mono shadow-xs">
                      <span className="text-text-primary font-semibold truncate">{file.filename}</span>
                      <span className="text-text-muted shrink-0 tabular-nums">
                        {file.status || 'modified'} (+{file.additions ?? 0} / -{file.deletions ?? 0})
                      </span>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="flex-1 min-h-[200px] bg-card border border-border rounded-2xl flex flex-col items-center justify-center gap-2 p-6 text-center shadow-xs">
                <FileDiff size={20} className="text-text-tertiary" />
                <p className="text-xs font-medium text-text-secondary">No file patch diff recorded for this revision</p>
                <p className="text-[11px] text-text-muted max-w-sm">
                  Summary stats (+{addNum} / -{delNum}) are preserved. Connect GitHub for live remote commit diffs or inspect recent workspace commits.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 bg-card border border-border rounded-2xl flex items-center justify-center text-xs text-text-secondary">
            Select a commit to inspect its changes
          </div>
        )}
      </div>

      <CommitRestoreSheet isOpen={showRestoreModal} commit={commitToInspect} onClose={() => setShowRestoreModal(false)} />
      <CommitsDeleteHeadDialog
        commit={commitToInspect} parentCommit={parentCommit} branchName={currentBranch || 'main'}
        isOpen={showDeleteModal} isDeleting={isDeletingHead} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
