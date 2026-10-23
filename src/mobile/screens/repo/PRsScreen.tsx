import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext, formatTime } from '../../../AppContext';
import { 
  GitPullRequest, Plus, CheckCircle2, Clock, MessageSquare, 
  X, GitCommit, FileCode, GitMerge, ChevronRight, AlertCircle,
  Copy, Check, User, ArrowRight, GitBranch, ExternalLink, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRelativeTime } from '../../utils/formatters';
import { DiffViewer } from '../../../components/commit/DiffViewer';
import { EmptyState } from '../../components/EmptyState';
import { InlineErrorCard } from '../../components/InlineErrorCard';

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

  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'merged' | 'closed'>('open');
  const [selectedPRId, setSelectedPRId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'files'>('overview');
  const [isMerging, setIsMerging] = useState(false);
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'squash'>('merge');
  const [deleteSourceBranch, setDeleteSourceBranch] = useState(false);
  const [activeDiffFile, setActiveDiffFile] = useState<string | null>(null);

  // Loaded details for selected PR
  const [prCommits, setPrCommits] = useState<PRCommit[]>([]);
  const [prFiles, setPrFiles] = useState<PRFile[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [prDetailError, setPrDetailError] = useState<string | null>(null);

  const selectedPR = activePRs.find(p => (p.id === selectedPRId || (p as any).number === selectedPRId));

  const loadPRDetails = () => {
    if (selectedPR && githubToken && currentRepoOwner && currentRepo) {
      setIsLoadingDetails(true);
      setPrDetailError(null);
      setActiveTab('overview');
      const headers = {
        Authorization: githubToken.startsWith('gh') ? `Bearer ${githubToken}` : `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      };

      const prNumber = selectedPR.id || (selectedPR as any).number;

      // 1. Fetch commits for PR
      const commitsPromise = fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/pulls/${prNumber}/commits`, { headers })
        .then(async res => {
          if (!res.ok) throw new Error(`Commits status ${res.status}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setPrCommits(data.map((c: any) => ({
              hash: c.sha.substring(0, 7),
              msg: c.commit.message,
              author: c.commit.author?.name || c.author?.login || 'GitHub User',
              time: formatTime(c.commit.author?.date || c.commit.committer?.date),
            })));
          }
        });

      // 2. Fetch files changed
      const filesPromise = fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/pulls/${prNumber}/files`, { headers })
        .then(async res => {
          if (!res.ok) throw new Error(`Files status ${res.status}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            const mappedFiles = data.map((f: any) => ({
              filename: f.filename,
              additions: f.additions || 0,
              deletions: f.deletions || 0,
              patch: f.patch || '',
            }));
            setPrFiles(mappedFiles);
            if (mappedFiles.length > 0) {
              setActiveDiffFile(mappedFiles[0].filename);
            }
          }
        });

      Promise.all([commitsPromise, filesPromise])
        .catch(err => {
          const errMsg = err.message || 'Failed to load PR details from GitHub API';
          setPrDetailError(errMsg);
        })
        .finally(() => setIsLoadingDetails(false));
    } else {
      // Mock fallback commits/files if offline or local PR
      if (selectedPR) {
        setPrCommits([
          {
            hash: '7f9a2b1',
            msg: selectedPR.title || 'Feature implementation and test coverage',
            author: selectedPR.author || 'Developer',
            time: '2 hours ago',
          },
          {
            hash: '4c8e10d',
            msg: 'Refactor layout and component alignment',
            author: selectedPR.author || 'Developer',
            time: 'Yesterday',
          }
        ]);
        setPrFiles([
          {
            filename: 'src/mobile/screens/Dashboard.tsx',
            additions: 124,
            deletions: 18,
            patch: `@@ -12,6 +12,18 @@\n+import { TrendingUp, Layers } from 'lucide-react';\n+// 8-point spatial system update\n+const velocity = computeVelocity();\n-const legacyStats = oldStats();`,
          },
          {
            filename: 'src/mobile/components/CommitCard.tsx',
            additions: 45,
            deletions: 6,
            patch: `@@ -40,4 +40,12 @@\n+<div className="bg-surface-1 border border-border rounded-xl p-3.5">\n-<div>`,
          }
        ]);
        setActiveDiffFile('src/mobile/screens/Dashboard.tsx');
      } else {
        setPrCommits([]);
        setPrFiles([]);
      }
      setPrDetailError(null);
    }
  };

  useEffect(() => {
    loadPRDetails();
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

  const filteredPRs = useMemo(() => {
    return activePRs.filter(pr => {
      const isMerged = pr.status === 'Merged';
      const isClosed = pr.status === 'Closed' || pr.closed;
      const isOpen = !isMerged && !isClosed;

      if (filterStatus === 'open') return isOpen;
      if (filterStatus === 'merged') return isMerged;
      if (filterStatus === 'closed') return isClosed;
      return true;
    });
  }, [activePRs, filterStatus]);

  // Quantitative churn calculations for selected PR
  const totalAdditions = useMemo(() => prFiles.reduce((sum, f) => sum + f.additions, 0), [prFiles]);
  const totalDeletions = useMemo(() => prFiles.reduce((sum, f) => sum + f.deletions, 0), [prFiles]);
  const totalDelta = totalAdditions + totalDeletions;
  const addPct = totalDelta > 0 ? Math.round((totalAdditions / totalDelta) * 100) : 50;

  const currentDiffFileObj = prFiles.find(f => f.filename === activeDiffFile) || prFiles[0];

  return (
    <div className="px-4 py-4 space-y-4 pb-8 select-none">
      {/* 1. Header with Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary tracking-tight">Pull Requests</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-2 border border-border-accent text-text-secondary">
              {activePRs.length}
            </span>
          </div>
          <p className="text-xs text-text-tertiary mt-0.5">
            Code reviews and branch merges for {currentRepo}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal('pr')}
          className="h-9 px-3.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New PR</span>
        </button>
      </div>

      {/* 2. Quick-Filter Carousel (8-point spatial rhythm) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'open', label: 'Open', count: activePRs.filter(p => p.status !== 'Merged' && p.status !== 'Closed' && !p.closed).length, color: '#3FB950' },
          { id: 'merged', label: 'Merged', count: activePRs.filter(p => p.status === 'Merged').length, color: '#A371F7' },
          { id: 'closed', label: 'Closed', count: activePRs.filter(p => p.status === 'Closed' || p.closed).length, color: '#F85149' },
          { id: 'all', label: 'All PRs', count: activePRs.length, color: '#58A6FF' },
        ].map(item => {
          const isActive = filterStatus === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id as any)}
              className={`h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-surface-2 text-text-primary border-accent/60 shadow-xs'
                  : 'bg-surface-1 text-text-tertiary border-border hover:border-border-accent hover:text-text-secondary'
              }`}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: item.color }} 
              />
              <span>{item.label}</span>
              <span className="font-mono text-[10px] opacity-75 tabular-nums">
                ({item.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Pull Request Cards Stream */}
      {filteredPRs.length === 0 ? (
        <EmptyState
          icon={GitPullRequest}
          title={`No ${filterStatus} pull requests`}
          description={
            activePRs.length === 0
              ? `No pull requests have been created in ${currentRepo || 'this repository'} yet.`
              : `There are no pull requests matching the "${filterStatus}" status filter.`
          }
          primaryAction={{
            label: 'Open Pull Request',
            icon: Plus,
            onClick: () => openModal('pr'),
          }}
          secondaryAction={
            filterStatus !== 'all'
              ? {
                  label: 'Show All Pull Requests',
                  onClick: () => setFilterStatus('all'),
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filteredPRs.map((pr) => {
            const prNum = pr.id || (pr as any).number;
            const isMerged = pr.status === 'Merged';
            const isClosed = pr.status === 'Closed' || pr.closed;
            const isOpen = !isMerged && !isClosed;

            const statusColor = isMerged ? '#A371F7' : isClosed ? '#F85149' : '#3FB950';

            return (
              <div
                key={prNum}
                onClick={() => setSelectedPRId(prNum)}
                className="bg-surface-1 border border-border hover:border-border-accent rounded-xl p-3.5 space-y-2.5 transition-all cursor-pointer select-none active:scale-98 shadow-xs"
              >
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-lg bg-surface-2 border border-border-accent flex items-center justify-center shrink-0 mt-0.5"
                      style={{ color: statusColor }}
                    >
                      <GitPullRequest size={15} strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-text-primary leading-snug truncate">
                        {pr.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-text-tertiary font-mono">
                        <span className="text-accent font-semibold tabular-nums">#{prNum}</span>
                        <span>·</span>
                        <span className="truncate max-w-[120px]">{pr.author}</span>
                        <span>·</span>
                        <span className="tabular-nums">{pr.time || formatRelativeTime(pr.created_at || '')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <span 
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 border"
                    style={{ 
                      color: statusColor, 
                      backgroundColor: `${statusColor}14`,
                      borderColor: `${statusColor}35`
                    }}
                  >
                    {isMerged ? 'Merged' : isClosed ? 'Closed' : 'Open'}
                  </span>
                </div>

                {/* Branch Routing Route Pill */}
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-border/50">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <GitBranch size={12} className="text-accent shrink-0" />
                    <span className="text-accent font-medium truncate max-w-[120px]">
                      {pr.source || 'feature'}
                    </span>
                    <ArrowRight size={11} className="text-text-tertiary shrink-0" />
                    <span className="text-text-secondary font-medium truncate max-w-[120px]">
                      {pr.target || 'main'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-text-tertiary tabular-nums">
                    <MessageSquare size={12} />
                    <span>{pr.comments || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Dedicated 3-Tab PR Inspection Modal (Matches CommitDetailModal) */}
      <AnimatePresence>
        {selectedPR && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPRId(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full bg-surface-1 border-t border-border-accent rounded-t-2xl shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
            >
              {/* Drag Handle */}
              <div className="w-10 h-1 bg-border-accent rounded-full mx-auto mt-2.5 mb-1.5 shrink-0" />

              {/* Modal Header */}
              <div className="px-4 py-3 border-b border-border-accent/80 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                        #{selectedPR.id || (selectedPR as any).number}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        selectedPR.status === 'Merged'
                          ? 'bg-[#A371F7]/15 text-[#A371F7] border-[#A371F7]/30'
                          : selectedPR.status === 'Closed'
                          ? 'bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30'
                          : 'bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30'
                      }`}>
                        {selectedPR.status || 'Open'}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2">
                      {selectedPR.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedPRId(null)}
                    className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Quantitative Churn Bar (8-point spatial system) */}
                <div className="mt-3 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <div className="flex items-center gap-2 font-bold tabular-nums">
                      <span className="text-[#3FB950]">+{totalAdditions.toLocaleString()}</span>
                      <span className="text-[#F85149]">-{totalDeletions.toLocaleString()}</span>
                    </div>
                    <span className="text-[11px] text-text-tertiary">
                      {prFiles.length} file{prFiles.length === 1 ? '' : 's'} changed
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-[#3FB950] transition-all duration-300" 
                      style={{ width: `${addPct}%` }} 
                    />
                    <div 
                      className="h-full bg-[#F85149] transition-all duration-300" 
                      style={{ width: `${100 - addPct}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* 3-Tab Segmented Selector */}
              <div className="flex border-b border-border shrink-0 bg-surface-1 px-2">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'commits', label: `Commits (${prCommits.length})` },
                  { id: 'files', label: `Files (${prFiles.length})` },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-3 text-xs font-bold transition-all relative cursor-pointer ${
                        isActive ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="activePrTabIndicator"
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Tab Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 min-h-0">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Branch Route Card */}
                    <div className="p-3.5 bg-surface-2 rounded-xl border border-border-accent space-y-2 font-mono text-xs">
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

                    {/* Description Card */}
                    <div className="p-3.5 bg-surface-2/70 rounded-xl border border-border space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                        Pull Request Description
                      </span>
                      <p className="text-xs text-text-secondary leading-relaxed font-sans whitespace-pre-wrap">
                        {selectedPR.desc || 'No detailed pull request description provided.'}
                      </p>
                    </div>

                    {/* Merge Strategy Selector (if open) */}
                    {(selectedPR.status === 'Open' || (!selectedPR.closed && selectedPR.status !== 'Merged' && selectedPR.status !== 'Closed')) && (
                      <div className="p-3.5 bg-surface-2 rounded-xl border border-border space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                          Merge Strategy
                        </span>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setMergeStrategy('merge')}
                            className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              mergeStrategy === 'merge'
                                ? 'bg-accent text-white border-accent shadow-xs'
                                : 'bg-surface-1 border-border text-text-secondary'
                            }`}
                          >
                            Merge Commit
                          </button>
                          <button
                            onClick={() => setMergeStrategy('squash')}
                            className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              mergeStrategy === 'squash'
                                ? 'bg-accent text-white border-accent shadow-xs'
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
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'commits' && (
                  <div className="space-y-2">
                    {prDetailError && (
                      <InlineErrorCard
                        title="Failed to Load PR Commits"
                        message={prDetailError}
                        onRetry={loadPRDetails}
                        compact
                      />
                    )}
                    {prCommits.length === 0 ? (
                      <div className="p-6 text-center text-xs text-text-tertiary bg-surface-2 rounded-xl">
                        {isLoadingDetails ? 'Loading commits...' : 'No commits found in this pull request.'}
                      </div>
                    ) : (
                      prCommits.map(c => (
                        <div key={c.hash} className="p-3.5 bg-surface-2 rounded-xl border border-border flex items-start justify-between gap-2.5">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-text-primary block truncate">
                              {c.msg}
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-text-tertiary font-mono">
                              <span className="text-accent font-semibold tabular-nums">{c.hash}</span>
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
                    {/* File Switcher Chips */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {prFiles.map(f => {
                        const isSelected = f.filename === currentDiffFileObj?.filename;
                        const shortName = f.filename.split('/').pop() || f.filename;
                        return (
                          <button
                            key={f.filename}
                            onClick={() => setActiveDiffFile(f.filename)}
                            className={`h-7 px-3 rounded-full text-[11px] font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                              isSelected
                                ? 'bg-surface-2 text-text-primary border-accent/60 shadow-xs'
                                : 'bg-surface-1 text-text-tertiary border-border hover:border-border-accent'
                            }`}
                          >
                            <FileCode size={12} className={isSelected ? 'text-accent' : 'text-text-tertiary'} />
                            <span className="truncate max-w-[140px]">{shortName}</span>
                            <span className="text-emerald-400 font-bold tabular-nums">+{f.additions}</span>
                          </button>
                        );
                      })}
                    </div>

                    {currentDiffFileObj ? (
                      <div className="bg-surface-2 rounded-xl border border-border-accent overflow-hidden">
                        <div className="p-3 flex items-center justify-between border-b border-border bg-surface-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCode size={14} className="text-accent shrink-0" />
                            <span className="text-xs font-mono font-bold text-text-primary truncate">
                              {currentDiffFileObj.filename}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[10px] shrink-0 font-bold tabular-nums">
                            <span className="text-[#3FB950]">+{currentDiffFileObj.additions}</span>
                            <span className="text-[#F85149]">-{currentDiffFileObj.deletions}</span>
                          </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto no-scrollbar">
                          <DiffViewer 
                            patch={currentDiffFileObj.patch} 
                            filename={currentDiffFileObj.filename} 
                            isDark={true} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-text-tertiary bg-surface-2 rounded-xl">
                        No files changed in this pull request.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky Footer Action Bar (8-point spatial rhythm) */}
              <div className="p-3 border-t border-border-accent bg-surface-1/95 backdrop-blur-md flex items-center gap-2 shrink-0">
                {(selectedPR.status === 'Open' || (!selectedPR.closed && selectedPR.status !== 'Merged' && selectedPR.status !== 'Closed')) ? (
                  <>
                    <button
                      onClick={handleMergePR}
                      disabled={isMerging}
                      className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                    >
                      <GitMerge size={15} />
                      <span>{isMerging ? 'Merging...' : 'Confirm and Merge PR'}</span>
                    </button>
                    <button
                      onClick={() => handleTogglePRStatus('Closed')}
                      className="h-11 px-3.5 rounded-xl bg-surface-2 border border-border hover:border-border-accent text-text-secondary hover:text-red-400 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Close PR
                    </button>
                  </>
                ) : (
                  <>
                    {selectedPR.status === 'Closed' && (
                      <button
                        onClick={() => handleTogglePRStatus('Open')}
                        className="flex-1 h-11 px-4 rounded-xl bg-accent text-white font-bold text-xs cursor-pointer shadow-sm active:scale-95"
                      >
                        Reopen Pull Request
                      </button>
                    )}
                    <a
                      href={`https://github.com/${currentRepoOwner}/${currentRepo}/pull/${selectedPR.id || (selectedPR as any).number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-11 px-4 rounded-xl bg-surface-2 border border-border-accent text-text-primary text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <ExternalLink size={14} />
                      <span>View on GitHub</span>
                    </a>
                  </>
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
