import React, { useState, useEffect } from 'react';
import { useAppContext, formatTime } from '../../../AppContext';
import { 
  GitPullRequest, Plus, CheckCircle2, Clock, MessageSquare, 
  X, GitCommit, FileCode, GitMerge, ChevronRight, AlertCircle,
  Copy, Check, User, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRelativeTime } from '../../utils/formatters';
import { DiffViewer } from '../../../components/commit/DiffViewer';

interface PRCommit {
  hash: string;
  msg: string;
  author: string;
  time: string;
}

interface PRFile {
  filename: string;
  additions: number;
  deletions: number;
  patch: string;
}

export const PRsScreen: React.FC = () => {
  const { 
    activePRs, 
    openModal, 
    currentRepo, 
    currentRepoOwner,
    githubToken,
    showToast,
    updateLocalPRStatus,
    deleteBranch: deleteBranchOnGitHub
  } = useAppContext();

  const [filterStatus, setFilterStatus] = useState<'open' | 'closed' | 'all'>('open');
  const [selectedPRId, setSelectedPRId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'files'>('overview');
  const [isMerging, setIsMerging] = useState(false);
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'squash'>('merge');
  const [deleteSourceBranch, setDeleteSourceBranch] = useState(false);

  // Loaded details for selected PR
  const [prCommits, setPrCommits] = useState<PRCommit[]>([]);
  const [prFiles, setPrFiles] = useState<PRFile[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const selectedPR = activePRs.find(p => (p.id === selectedPRId || (p as any).number === selectedPRId));

  useEffect(() => {
    if (selectedPR && githubToken && currentRepoOwner && currentRepo) {
      setIsLoadingDetails(true);
      setActiveTab('overview');
      const headers = {
        Authorization: githubToken.startsWith('gh') ? `Bearer ${githubToken}` : `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      };

      const prNumber = selectedPR.id || (selectedPR as any).number;

      // 1. Fetch commits for PR
      fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/pulls/${prNumber}/commits`, { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPrCommits(data.map((c: any) => ({
              hash: c.sha.substring(0, 7),
              msg: c.commit.message,
              author: c.commit.author?.name || c.author?.login || 'GitHub User',
              time: formatTime(c.commit.author?.date || c.commit.committer?.date),
            })));
          }
        })
        .catch(console.error);

      // 2. Fetch files changed
      fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/pulls/${prNumber}/files`, { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPrFiles(data.map((f: any) => ({
              filename: f.filename,
              additions: f.additions || 0,
              deletions: f.deletions || 0,
              patch: f.patch || '',
            })));
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingDetails(false));
    } else {
      setPrCommits([]);
      setPrFiles([]);
    }
  }, [selectedPRId, selectedPR, githubToken, currentRepoOwner, currentRepo]);

  const handleMergePR = async () => {
    if (!selectedPR) return;
    setIsMerging(true);
    const prNumber = selectedPR.id || (selectedPR as any).number;
    try {
      await updateLocalPRStatus(prNumber, 'Merged', mergeStrategy);
      if (deleteSourceBranch && selectedPR.source) {
        await deleteBranchOnGitHub(selectedPR.source);
      }
      setSelectedPRId(null);
      showToast(`PR #${prNumber} merged successfully!`, 'success');
    } catch (err: any) {
      showToast(`Merge failed: ${err.message || err}`, 'error');
    } finally {
      setIsMerging(false);
    }
  };

  const handleTogglePRStatus = async (newStatus: 'Open' | 'Closed') => {
    if (!selectedPR) return;
    const prNumber = selectedPR.id || (selectedPR as any).number;
    try {
      await updateLocalPRStatus(prNumber, newStatus);
      showToast(`PR #${prNumber} marked as ${newStatus}`, 'info');
      setSelectedPRId(null);
    } catch (err: any) {
      showToast(`Update error: ${err.message || err}`, 'error');
    }
  };

  const filteredPRs = activePRs.filter(pr => {
    const isOpen = pr.status === 'Open' || (!pr.closed && pr.status !== 'Merged' && pr.status !== 'Closed');
    if (filterStatus === 'open') return isOpen;
    if (filterStatus === 'closed') return !isOpen;
    return true;
  });

  return (
    <div className="px-4 py-4 space-y-4">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">Pull Requests</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            Active review threads for {currentRepo}
          </p>
        </div>
        <button
          onClick={() => openModal('pr')}
          className="h-8 px-3 rounded-lg bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-accent/20 cursor-pointer active:scale-95"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>New PR</span>
        </button>
      </div>

      {/* 2. Segmented Filter */}
      <div className="h-9 p-1 bg-surface-1 border border-border rounded-xl flex items-center gap-1 select-none">
        <button
          onClick={() => setFilterStatus('open')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterStatus === 'open'
              ? 'bg-accent text-white shadow-xs font-bold'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Open ({activePRs.filter(p => p.status === 'Open' || (!p.closed && p.status !== 'Merged' && p.status !== 'Closed')).length})
        </button>
        <button
          onClick={() => setFilterStatus('closed')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterStatus === 'closed'
              ? 'bg-accent text-white shadow-xs font-bold'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Closed / Merged ({activePRs.filter(p => p.status !== 'Open' && (p.closed || p.status === 'Merged' || p.status === 'Closed')).length})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-accent text-white shadow-xs font-bold'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          All ({activePRs.length})
        </button>
      </div>

      {/* 3. PR List */}
      {filteredPRs.length === 0 ? (
        <div className="bg-surface-1 border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <GitPullRequest size={32} className="text-text-tertiary mb-2 opacity-50" />
          <span className="text-sm font-semibold text-text-primary mb-1">
            No {filterStatus} pull requests
          </span>
          <span className="text-xs text-text-tertiary">
            Open a pull request to initiate branch review and merging.
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPRs.map((pr) => {
            const prNum = pr.id || (pr as any).number;
            const isMerged = pr.status === 'Merged';
            const isClosed = pr.status === 'Closed' || pr.closed;
            return (
              <div
                key={prNum}
                onClick={() => setSelectedPRId(prNum)}
                className="bg-surface-1 border border-border hover:border-accent/40 rounded-xl p-3.5 space-y-2 transition-all cursor-pointer active:scale-99 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <GitPullRequest 
                      size={16} 
                      className={`shrink-0 mt-0.5 ${
                        isMerged ? 'text-pr-merged' : isClosed ? 'text-text-tertiary' : 'text-success'
                      }`} 
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-text-primary truncate">
                        {pr.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-text-tertiary font-mono">
                        <span className="text-accent font-semibold tabular-nums">#{prNum}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[130px]">by {pr.author}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{pr.time || formatRelativeTime(pr.created_at || '')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status tag */}
                  <span className={`text-[11px] font-semibold font-mono shrink-0 ${
                    isMerged ? 'text-pr-merged' : isClosed ? 'text-text-tertiary' : 'text-success'
                  }`}>
                    {pr.status || (isClosed ? 'Closed' : 'Open')}
                  </span>
                </div>

                {/* Branch route indicator */}
                <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span className="text-accent font-medium truncate max-w-[110px]">{pr.source || 'feature'}</span>
                    <ArrowRight size={11} className="shrink-0 opacity-60" />
                    <span className="text-text-secondary font-medium truncate max-w-[110px]">{pr.target || 'main'}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 tabular-nums text-text-tertiary">
                    <MessageSquare size={12} />
                    <span>{pr.comments || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Interactive Mobile PR Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedPR && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPRId(null)}
              className="absolute inset-0 bg-black/70"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-surface-1 border-t border-x border-border rounded-t-xl pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-4 shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Grab handle */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3 shrink-0" />

              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-border shrink-0">
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded">
                      #{selectedPR.id || (selectedPR as any).number}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      selectedPR.status === 'Merged' ? 'text-pr-merged' : selectedPR.status === 'Closed' ? 'text-text-tertiary' : 'text-success'
                    }`}>
                      {selectedPR.status || 'Open'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2">
                    {selectedPR.title}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedPRId(null)}
                  className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-md hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sub-tabs: Overview, Commits, Files Changed */}
              <div className="flex border-b border-border shrink-0 bg-surface-1">
                {(['overview', 'commits', 'files'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab
                        ? 'border-accent text-accent'
                        : 'border-transparent text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {tab === 'files' ? `Files (${prFiles.length})` : tab === 'commits' ? `Commits (${prCommits.length})` : 'Overview'}
                  </button>
                ))}
              </div>

              {/* Tab Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3 min-h-0">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Branch route box */}
                    <div className="p-3 bg-surface-2 rounded-xl border border-border space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-text-tertiary text-[10px] uppercase font-bold tracking-wider">
                        <span>Source Branch</span>
                        <span>Target Branch</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-accent truncate max-w-[130px]">{selectedPR.source || 'feature'}</span>
                        <ArrowRight size={14} className="text-text-tertiary shrink-0 mx-2" />
                        <span className="text-text-primary truncate max-w-[130px]">{selectedPR.target || 'main'}</span>
                      </div>
                    </div>

                    {/* PR description */}
                    <div className="p-3.5 bg-surface-2/60 rounded-xl border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                        Description
                      </span>
                      <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-sans">
                        {selectedPR.desc || 'No detailed pull request description provided.'}
                      </p>
                    </div>

                    {/* Merge Controls (if Open) */}
                    {selectedPR.status === 'Open' || (!selectedPR.closed && selectedPR.status !== 'Merged' && selectedPR.status !== 'Closed') ? (
                      <div className="p-3.5 bg-surface-2 rounded-xl border border-border space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                          Merge & Review Actions
                        </span>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setMergeStrategy('merge')}
                            className={`h-9 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              mergeStrategy === 'merge'
                                ? 'bg-accent text-white border-accent'
                                : 'bg-surface-1 border-border text-text-secondary'
                            }`}
                          >
                            Merge Commit
                          </button>
                          <button
                            onClick={() => setMergeStrategy('squash')}
                            className={`h-9 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              mergeStrategy === 'squash'
                                ? 'bg-accent text-white border-accent'
                                : 'bg-surface-1 border-border text-text-secondary'
                            }`}
                          >
                            Squash & Merge
                          </button>
                        </div>

                        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={deleteSourceBranch}
                            onChange={(e) => setDeleteSourceBranch(e.target.checked)}
                            className="rounded border-border text-accent focus:ring-0"
                          />
                          <span>Delete branch {selectedPR.source} after merge</span>
                        </label>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleMergePR}
                            disabled={isMerging}
                            className="flex-1 min-h-[44px] rounded-xl bg-success hover:opacity-90 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                          >
                            <GitMerge size={15} />
                            <span>{isMerging ? 'Merging Pull Request...' : 'Confirm and Merge'}</span>
                          </button>
                          <button
                            onClick={() => handleTogglePRStatus('Closed')}
                            className="h-11 px-3.5 rounded-xl bg-surface-1 border border-border text-text-secondary hover:text-danger text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Close PR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-surface-2 rounded-xl border border-border flex items-center justify-between">
                        <span className="text-xs text-text-tertiary">
                          PR is currently {selectedPR.status || 'Closed'}.
                        </span>
                        {selectedPR.status === 'Closed' && (
                          <button
                            onClick={() => handleTogglePRStatus('Open')}
                            className="h-8 px-3 rounded-lg bg-accent text-white text-xs font-semibold cursor-pointer"
                          >
                            Reopen PR
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'commits' && (
                  <div className="space-y-2">
                    {prCommits.length === 0 ? (
                      <div className="p-6 text-center text-xs text-text-tertiary bg-surface-2 rounded-xl">
                        {isLoadingDetails ? 'Loading pull request commits...' : 'No commits listed for this pull request.'}
                      </div>
                    ) : (
                      prCommits.map(c => (
                        <div key={c.hash} className="p-3 bg-surface-2 rounded-xl border border-border flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-text-primary block truncate">
                              {c.msg}
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-text-tertiary font-mono">
                              <span className="text-accent">{c.hash}</span>
                              <span>·</span>
                              <span>{c.author}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-text-tertiary shrink-0">
                            {c.time}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="space-y-3">
                    {prFiles.length === 0 ? (
                      <div className="p-6 text-center text-xs text-text-tertiary bg-surface-2 rounded-xl">
                        {isLoadingDetails ? 'Loading changed files...' : 'No file changes detected in this pull request.'}
                      </div>
                    ) : (
                      prFiles.map(file => (
                        <div key={file.filename} className="bg-surface-2 rounded-xl border border-border overflow-hidden">
                          <div className="p-3 flex items-center justify-between border-b border-border bg-surface-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCode size={14} className="text-accent shrink-0" />
                              <span className="text-xs font-mono font-semibold text-text-primary truncate">
                                {file.filename}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                              <span className="text-success font-bold">+{file.additions}</span>
                              <span className="text-danger font-bold">-{file.deletions}</span>
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto no-scrollbar">
                            <DiffViewer patch={file.patch} filename={file.filename} isDark={true} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MobilePRs = PRsScreen;
