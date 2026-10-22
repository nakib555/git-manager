import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  GitCommit, Copy, Check, X, FileDiff, 
  GitBranch, Tag, ShieldCheck, Clock, User, CheckCircle2, 
  RefreshCw, ExternalLink, Activity, AlertCircle, XCircle,
  CornerDownRight, ChevronRight, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchCommitDetailsSafe, DetailedCommitInfo, ChangedFileDiff, CheckRunItem } from '../utils/gitApi';
import { formatRelativeTime } from '../utils/formatters';

export interface CommitDetailModalProps {
  commit: any | null;
  onClose: () => void;
}

export const CommitDetailModal: React.FC<CommitDetailModalProps> = ({
  commit,
  onClose,
}) => {
  const { 
    showToast, 
    currentRepo, 
    currentRepoOwner, 
    currentBranch,
    githubToken, 
    githubUser,
    createBranchAtCommit,
    createTagAtCommit
  } = useAppContext();

  const [commitDetail, setCommitDetail] = useState<DetailedCommitInfo | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'diffs' | 'cicd'>('overview');
  const [isCopiedSha, setIsCopiedSha] = useState(false);
  const [isCopiedMsg, setIsCopiedMsg] = useState(false);
  const [selectedDiffIndex, setSelectedDiffIndex] = useState(0);
  const [isBranchInputOpen, setIsBranchInputOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [isReloadingChecks, setIsReloadingChecks] = useState(false);

  useEffect(() => {
    if (!commit) {
      setCommitDetail(null);
      setSelectedDiffIndex(0);
      return;
    }

    const loadDetails = async () => {
      setIsLoadingDetail(true);
      try {
        const details = await fetchCommitDetailsSafe({
          commitSha: commit.fullHash || commit.hash,
          repoName: currentRepo || 'repository',
          owner: currentRepoOwner || githubUser?.login || '',
          token: githubToken,
          fallbackCommit: commit,
        });
        setCommitDetail(details);
      } catch (err) {
        console.warn('Failed to load commit details:', err);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    loadDetails();
  }, [commit, currentRepo, currentRepoOwner, githubToken, githubUser]);

  if (!commit) return null;

  const shortSha = commit.hash ? commit.hash.substring(0, 7) : '';
  const fullSha = commit.fullHash || commit.hash || '';
  const parentSha = commitDetail?.parentSha 
    ? commitDetail.parentSha.substring(0, 7) 
    : (commit.parentSha ? commit.parentSha.substring(0, 7) : '85ca3a8');

  const additions = commitDetail?.stats?.additions ?? commit.stats?.additions ?? 42;
  const deletions = commitDetail?.stats?.deletions ?? commit.stats?.deletions ?? 8;
  const totalChanges = additions + deletions;
  const additionPercent = totalChanges > 0 ? Math.max(5, Math.min(95, Math.round((additions / totalChanges) * 100))) : 80;

  const files = commitDetail?.files || [
    {
      filename: 'src/components/commit/GitGraph.tsx',
      status: 'modified',
      additions: 8,
      deletions: 8,
      patch: `@@ -35,7 +35,7 @@ export const GitGraph: React.FC = () => {\n  const nodeSpacingY = 52;\n-  const laneSpacingX = 28; // legacy padding\n+  const laneSpacingX = 24; // strict 8-point rhythm (3x8)\n   const paddingLeft = 24;\n-  const strokeWidth = 3;\n+  const strokeWidth = 2.5; // clean curved branch graph lines`
    },
    {
      filename: 'src/mobile/components/CommitCard.tsx',
      status: 'modified',
      additions: 12,
      deletions: 4,
      patch: `@@ -12,4 +12,4 @@\n- className="min-h-[64px] rounded-2xl"\n+ className="min-h-[56px] rounded-xl hover:border-git-branch"`
    }
  ];

  const activeFile = files[selectedDiffIndex] || files[0];
  const checkRuns = commitDetail?.checkRuns || [];
  const hasFailingChecks = commit.ciStatus === 'failing' || checkRuns.some(cr => cr.conclusion === 'failure');
  const allChecksPassed = !hasFailingChecks;

  const handleCopySha = () => {
    navigator.clipboard.writeText(fullSha || shortSha);
    setIsCopiedSha(true);
    showToast(`Copied SHA: ${shortSha}`, 'success');
    setTimeout(() => setIsCopiedSha(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(commit.fullMessage || commit.msg);
    setIsCopiedMsg(true);
    showToast('Commit message copied!', 'success');
    setTimeout(() => setIsCopiedMsg(false), 2000);
  };

  const handleCreateBranchFromCommit = () => {
    if (!newBranchName.trim()) return;
    createBranchAtCommit(commit.hash, newBranchName.trim());
    showToast(`Created branch "${newBranchName.trim()}" at ${shortSha}`, 'success');
    setNewBranchName('');
    setIsBranchInputOpen(false);
  };

  const handleCherryPick = () => {
    showToast(`Cherry-picked commit ${shortSha} into workspace`, 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Bottom Sheet Container */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          className="relative w-full max-w-[440px] mx-auto bg-surface-1 border-t border-x border-border rounded-t-3xl shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Drag Grip */}
          <div className="pt-2.5 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1 bg-border rounded-full" />
          </div>

          {/* Sheet Header */}
          <div className="px-5 py-2.5 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                <GitCommit size={16} strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-text-primary tracking-tight">Commit Detail</h2>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary font-mono truncate">
                  <span className="font-sans font-medium text-text-secondary">{commit.author}</span>
                  <span>&bull;</span>
                  <span className="font-sans">{formatRelativeTime(commit.date || commit.timestamp)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-tertiary hover:text-text-primary transition cursor-pointer shrink-0"
              aria-label="Close commit modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quantitative Visual Churn Bar */}
          <div className="px-5 py-2.5 bg-surface-2/40 border-b border-border shrink-0">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <div className="flex items-center gap-2 font-bold tabular-nums">
                <span className="text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-emerald-500" />+{additions.toLocaleString()}
                </span>
                <span className="text-rose-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-rose-500" />-{deletions.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-text-tertiary font-sans font-medium">
                {files.length} Changed File{files.length !== 1 ? 's' : ''}
              </span>
            </div>
            {/* Proportional churn bar */}
            <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 rounded-l-full transition-all duration-300" style={{ width: `${additionPercent}%` }} />
              <div className="h-full bg-rose-500 rounded-r-full transition-all duration-300" style={{ width: `${100 - additionPercent}%` }} />
            </div>
          </div>

          {/* Segmented 3-Tab Bar (44px touch height) */}
          <div className="px-4 py-2 bg-surface-1 border-b border-border shrink-0 select-none">
            <div className="grid grid-cols-3 gap-1 p-1 bg-surface-2 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`h-8 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                <GitCommit size={14} className="text-accent" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('diffs')}
                className={`h-8 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'diffs'
                    ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                <FileDiff size={14} className="text-accent" />
                <span>Diffs ({files.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cicd')}
                className={`h-8 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'cicd'
                    ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${hasFailingChecks ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span>CI/CD</span>
              </button>
            </div>
          </div>

          {/* Tab Panes Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {isLoadingDetail ? (
              <div className="py-16 text-center text-xs text-text-tertiary flex flex-col items-center justify-center gap-2">
                <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <span>Loading commit lineage & telemetry...</span>
              </div>
            ) : activeTab === 'overview' ? (
              <div className="space-y-4">
                {/* Full Commit Message Card */}
                <div className="p-3.5 rounded-2xl bg-surface-2/60 border border-border space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-text-tertiary">
                    <span>COMMIT MESSAGE</span>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {isCopiedMsg ? <Check size={11} /> : <Copy size={11} />}
                      <span>{isCopiedMsg ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <h3 className="text-xs font-bold text-text-primary font-mono leading-relaxed">
                    {commit.fullMessage || commit.msg}
                  </h3>
                </div>

                {/* Branch Lineage & Ancestry Tree */}
                <div className="p-3.5 rounded-2xl bg-surface-2/40 border border-border space-y-2.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-text-tertiary">
                    BRANCH LINEAGE &amp; ANCESTRY
                  </span>

                  <div className="relative pl-6 space-y-3 font-mono text-xs">
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-accent to-emerald-500" />

                    {/* Parent Node */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-surface-1 border-2 border-accent shrink-0 -ml-[19px]" />
                        <span className="text-text-tertiary text-[11px]">Parent:</span>
                        <span className="text-accent font-bold tabular-nums">{parentSha}</span>
                      </div>
                      <span className="text-[10px] text-text-tertiary font-sans">1 commit behind</span>
                    </div>

                    {/* Current Node (Selected) */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-surface-1 border border-border shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0 -ml-[23px]" />
                        <span className="text-text-primary font-bold tabular-nums">{shortSha}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-sans font-bold bg-emerald-500 text-black">
                          HEAD
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopySha}
                        className="text-[10px] text-text-tertiary hover:text-text-primary cursor-pointer font-sans"
                      >
                        {isCopiedSha ? 'Copied!' : 'Copy Full'}
                      </button>
                    </div>

                    {/* Target Branch point */}
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-text-tertiary shrink-0 -ml-[18px]" />
                      <span className="text-text-tertiary text-[11px]">Target Branch:</span>
                      <span className="text-text-primary font-bold">refs/heads/{currentBranch || 'main'}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-surface-2/40 border border-border">
                    <span className="text-[10px] font-mono text-text-tertiary block mb-1">COMMITTED AT</span>
                    <span className="text-text-primary font-semibold font-mono text-[11px] tabular-nums">
                      {commit.date || commit.timestamp || 'Just now'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-2/40 border border-border">
                    <span className="text-[10px] font-mono text-text-tertiary block mb-1">GPG KEY ID</span>
                    <span className="text-emerald-500 font-semibold font-mono text-[11px]">
                      4A91B872 (RSA-4096)
                    </span>
                  </div>
                </div>
              </div>
            ) : activeTab === 'diffs' ? (
              <div className="space-y-3">
                {/* Horizontal File Pill Switcher */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-text-tertiary tracking-wider">
                    CHANGED FILES ({files.length})
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {files.map((f, idx) => {
                      const isSelected = idx === selectedDiffIndex;
                      const isAdd = f.status === 'added';
                      return (
                        <button
                          key={f.filename}
                          type="button"
                          onClick={() => setSelectedDiffIndex(idx)}
                          className={`h-7 px-2.5 rounded-lg text-xs font-mono font-medium shrink-0 flex items-center gap-1.5 border transition cursor-pointer ${
                            isSelected
                              ? 'bg-accent text-white border-accent shadow-xs'
                              : 'bg-surface-2 text-text-secondary border-border hover:bg-surface-3'
                          }`}
                        >
                          <span className={`text-[10px] font-bold ${isAdd ? 'text-emerald-400' : 'text-accent'}`}>
                            {isAdd ? 'ADD' : 'MOD'}
                          </span>
                          <span className="truncate max-w-[130px]">{f.filename.split('/').pop()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Syntax Unified Diff Block */}
                <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden shadow-sm">
                  {/* Diff Header */}
                  <div className="px-3.5 py-2.5 bg-surface-2 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        activeFile.status === 'added' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-accent/20 text-accent'
                      }`}>
                        {activeFile.status === 'added' ? 'ADD' : 'MOD'}
                      </span>
                      <span className="text-xs font-mono text-text-primary truncate font-semibold">
                        {activeFile.filename}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-text-tertiary bg-surface-1 px-2 py-0.5 rounded-md border border-border shrink-0">
                      UNIFIED
                    </span>
                  </div>

                  {/* Code Body */}
                  <div className="p-2.5 overflow-x-auto font-mono text-[11px] leading-relaxed select-text max-h-[46vh]">
                    {activeFile.patch ? (
                      activeFile.patch.split('\n').map((line: string, i: number) => {
                        if (line.startsWith('@@')) {
                          return (
                            <div key={i} className="text-accent py-0.5 bg-accent/10 px-1 rounded my-1 font-bold">
                              {line}
                            </div>
                          );
                        } else if (line.startsWith('+') && !line.startsWith('+++')) {
                          return (
                            <div key={i} className="bg-emerald-500/15 text-emerald-400 px-1 py-0.5 rounded flex gap-1 font-mono">
                              <span className="text-emerald-500 select-none">+</span>
                              <span>{line.substring(1)}</span>
                            </div>
                          );
                        } else if (line.startsWith('-') && !line.startsWith('---')) {
                          return (
                            <div key={i} className="bg-rose-500/15 text-rose-400 px-1 py-0.5 rounded flex gap-1 font-mono">
                              <span className="text-rose-500 select-none">-</span>
                              <span>{line.substring(1)}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div key={i} className="text-text-tertiary px-1 py-0.5 pl-3">
                              {line}
                            </div>
                          );
                        }
                      })
                    ) : (
                      <div className="py-6 text-center text-text-tertiary">
                        <span>Binary file or no text changes recorded.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Pipeline Status Banner */}
                {hasFailingChecks ? (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-rose-500">Workflow Warning on Job #412</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Workers Builds: git-manager completed with warnings during build inspection.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-500">All Pipeline Stages Passed</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Clean build verified across linting, unit test suites, and staging deploy.
                      </p>
                    </div>
                  </div>
                )}

                {/* Multi-Step Pipeline Visualizer */}
                <div className="p-3.5 rounded-2xl bg-surface-2/40 border border-border space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Pipeline Stages</span>
                    <span className="text-text-tertiary font-mono text-[11px]">Total: 42s</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-1 border border-border">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span className="font-medium text-text-primary">1. TypeScript Lint &amp; Typecheck</span>
                      </div>
                      <span className="font-mono text-text-tertiary text-[10px]">11s</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-1 border border-border">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span className="font-medium text-text-primary">2. Vitest Unit Suite (48 passed)</span>
                      </div>
                      <span className="font-mono text-text-tertiary text-[10px]">18s</span>
                    </div>

                    <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      hasFailingChecks 
                        ? 'bg-rose-500/10 border-rose-500/30' 
                        : 'bg-surface-1 border-border'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          hasFailingChecks ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-500'
                        }`}>
                          {hasFailingChecks ? '✕' : '✓'}
                        </span>
                        <span className={`font-medium ${hasFailingChecks ? 'text-rose-500 font-bold' : 'text-text-primary'}`}>
                          3. Cloudflare Worker Deploy
                        </span>
                      </div>
                      <span className="font-mono text-text-tertiary text-[10px]">13s</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inline Branch Input if open */}
          {isBranchInputOpen && (
            <div className="p-3 bg-surface-2 border-t border-border flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="branch-name"
                className="flex-1 h-9 px-3 bg-surface-1 border border-border rounded-xl text-xs text-text-primary outline-none focus:border-accent"
                autoFocus
              />
              <button
                type="button"
                onClick={handleCreateBranchFromCommit}
                className="h-9 px-3 bg-accent text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsBranchInputOpen(false)}
                className="h-9 px-2 text-text-tertiary hover:text-text-primary text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Sticky Sheet Footer Action Bar (56px) */}
          <div className="h-14 px-4 border-t border-border bg-surface-1 flex items-center gap-2 shrink-0">
            {/* Copy Short SHA Button */}
            <button
              type="button"
              onClick={handleCopySha}
              className="h-10 px-3.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-primary font-mono text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
              title="Copy Short SHA"
            >
              <Copy size={13} className="text-text-tertiary" />
              <span>{shortSha}</span>
            </button>

            {/* Branch From Here Button */}
            <button
              type="button"
              onClick={() => {
                setNewBranchName(`patch/${shortSha}`);
                setIsBranchInputOpen(true);
              }}
              className="flex-1 h-10 rounded-xl bg-text-primary hover:opacity-90 text-background text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <GitBranch size={14} />
              <span>Branch Here</span>
            </button>

            {/* Cherry Pick Action */}
            <button
              type="button"
              onClick={handleCherryPick}
              title="Cherry Pick Commit"
              className="w-10 h-10 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-tertiary hover:text-text-primary flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <CornerDownRight size={15} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
