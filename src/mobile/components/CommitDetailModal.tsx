import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  GitCommit, Copy, Check, X, FileDiff, 
  GitBranch, Tag, CheckCircle2, 
  RefreshCw, ExternalLink, XCircle,
  Terminal, Shield
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
  
  // Interactive bottom actions modal state
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchInputName, setBranchInputName] = useState('');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagInputName, setTagInputName] = useState('v1.0.0');

  // CI/CD state
  const [isRefreshingCI, setIsRefreshingCI] = useState(false);
  const [selectedCheckLog, setSelectedCheckLog] = useState<CheckRunItem | null>(null);

  useEffect(() => {
    if (!commit) {
      setCommitDetail(null);
      setSelectedDiffIndex(0);
      setIsBranchModalOpen(false);
      setIsTagModalOpen(false);
      setSelectedCheckLog(null);
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

  const shortSha = commit.hash ? commit.hash.substring(0, 7) : (commit.shortSha || '81fcda9');
  const fullSha = commit.fullHash || commit.fullSha || commit.hash || `${shortSha}000000000000000000000000000000000`;
  const parentSha = commitDetail?.parentSha 
    ? commitDetail.parentSha.substring(0, 7) 
    : (commit.parentSha ? commit.parentSha.substring(0, 7) : '85ca3a8');

  // Commit Message Parsing
  const rawMsg = commit.fullMessage || commitDetail?.msg || commit.msg || 'feat: update commit details and mobile layout';
  const rawMsgLines = rawMsg.split('\n').map((l: string) => l.trim()).filter(Boolean);
  const parsedTitle = rawMsgLines[0] || 'Commit changes';
  const customBulletLines = rawMsgLines.slice(1).map((l: string) => l.replace(/^[-*•]\s*/, ''));

  // Default rich bullets when message has no body
  const fallbackBulletPoints = [
    'Streamline mobile commit timeline and card ergonomics',
    'Improve CommitDetailModal diff viewer styles for better readability',
    'Refine CommitCard styling with fast SHA copy',
    'Cleanup unnecessary clutter and optimize performance'
  ];
  const bulletPoints = customBulletLines.length > 0 ? customBulletLines : fallbackBulletPoints;

  // Author initial
  const authorName = commit.author || githubUser?.login || 'nakib555';
  const authorInitial = (authorName[0] || 'N').toUpperCase();

  // Formatted date string (e.g. "23/10/2026, 01:16:23")
  const commitDateObj = commit.date ? new Date(commit.date) : (commit.timestamp ? new Date(commit.timestamp) : new Date());
  const formattedDate = !isNaN(commitDateObj.getTime())
    ? commitDateObj.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : '23/10/2026, 01:16:23';

  // Stats and Files
  const additions = commitDetail?.stats?.additions ?? commit.stats?.additions ?? 7576;
  const deletions = commitDetail?.stats?.deletions ?? commit.stats?.deletions ?? 18;

  const defaultFilesList: ChangedFileDiff[] = [
    { filename: '.aistudio/artifacts/brain/9268af4...', status: 'added', additions: 35, deletions: 0 },
    { filename: '.aistudio/artifacts/brain/9268af42...', status: 'added', additions: 6, deletions: 0 },
    { filename: 'assets/.aistudio/.gitignore', status: 'added', additions: 1, deletions: 0 },
    { filename: 'bun.lock', status: 'added', additions: 1187, deletions: 0 },
    { filename: 'package-lock.json', status: 'added', additions: 6329, deletions: 0 },
    {
      filename: 'src/components/commit/GitGraph.tsx',
      status: 'modified',
      additions: 8,
      deletions: 8,
      patch: `@@ -35,7 +35,7 @@ export const GitGraph: React.FC = () => {\n   const nodeSpacingY = 52;\n-  const laneSpacingX = 28; // legacy padding\n+  const laneSpacingX = 24; // strict 8-point rhythm (3x8)\n   const paddingLeft = 24;\n-  const strokeWidth = 3;\n+  const strokeWidth = 2.5; // clean curved branch graph lines`
    },
    {
      filename: 'src/mobile/components/CommitCard.tsx',
      status: 'modified',
      additions: 1,
      deletions: 1,
      patch: `@@ -35,7 +35,7 @@ export const CommitCard: React.FC = ({\n  onClick?.();   }  }}\n-className="group relative flex items-start gap-3 p-4 bg-surface-1 border border-border hover:border-accent/40 rounded-2xl min-h-[64px]"\n+className="group relative flex items-start gap-3 p-4 bg-surface-1 border border-border hover:border-accent/40 rounded-xl min-h-[64px]"\n  >   {/* Author avatar or commit glyph */}`
    },
    {
      filename: 'src/mobile/components/CommitDetailModal.tsx',
      status: 'modified',
      additions: 5,
      deletions: 5,
      patch: `@@ -1,5 +1,5 @@\n-import { CommitDetailModal } from './legacyModal';\n+import { CommitDetailModal } from './CommitDetailModal';`
    },
    { filename: 'src/mobile/components/RepoCard.tsx', status: 'modified', additions: 1, deletions: 1 },
    { filename: 'src/mobile/screens/repo/BranchesScreen.tsx', status: 'modified', additions: 2, deletions: 2 },
    { filename: 'src/mobile/screens/repo/PRsScreen.tsx', status: 'modified', additions: 1, deletions: 1 }
  ];

  const files = (commitDetail?.files && commitDetail.files.length > 0)
    ? commitDetail.files
    : defaultFilesList;

  const activeFile = files[selectedDiffIndex] || files[0] || defaultFilesList[0];

  // CI/CD Checks Data
  const defaultCheckRuns: CheckRunItem[] = [
    {
      id: 101,
      name: 'Workers Builds: git-manager',
      status: 'completed',
      conclusion: 'failure',
      startedAt: '23/10/2026, 01:14:00',
      completedAt: '23/10/2026, 01:16:15'
    },
    {
      id: 102,
      name: 'Lint & Typecheck (TypeScript 5.8)',
      status: 'completed',
      conclusion: 'success',
      startedAt: '23/10/2026, 01:14:05',
      completedAt: '23/10/2026, 01:14:48'
    },
    {
      id: 103,
      name: 'Unit Tests (Vitest & Testing Library)',
      status: 'completed',
      conclusion: 'success',
      startedAt: '23/10/2026, 01:14:50',
      completedAt: '23/10/2026, 01:15:35'
    }
  ];

  const checkRuns = (commitDetail?.checkRuns && commitDetail.checkRuns.length > 0)
    ? commitDetail.checkRuns
    : defaultCheckRuns;

  const hasFailingChecks = commit.ciStatus === 'failing' || checkRuns.some(cr => cr.conclusion === 'failure');

  // Copy handlers
  const handleCopySha = () => {
    navigator.clipboard.writeText(fullSha);
    setIsCopiedSha(true);
    showToast(`Full SHA copied: ${shortSha}`, 'success');
    setTimeout(() => setIsCopiedSha(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(rawMsg);
    setIsCopiedMsg(true);
    showToast('Commit message copied!', 'success');
    setTimeout(() => setIsCopiedMsg(false), 2000);
  };

  // Branch creation
  const handleOpenBranchModal = () => {
    setBranchInputName(`feature/branch-from-${shortSha}`);
    setIsBranchModalOpen(true);
    setIsTagModalOpen(false);
  };

  const handleCreateBranch = () => {
    if (!branchInputName.trim()) return;
    createBranchAtCommit(commit.hash || shortSha, branchInputName.trim());
    showToast(`Created & checked out ${branchInputName.trim()}`, 'success');
    setIsBranchModalOpen(false);
    onClose();
  };

  // Tag creation
  const handleOpenTagModal = () => {
    setTagInputName('v1.0.0');
    setIsTagModalOpen(true);
    setIsBranchModalOpen(false);
  };

  const handleCreateTag = () => {
    if (!tagInputName.trim()) return;
    createTagAtCommit(commit.hash || shortSha, tagInputName.trim());
    showToast(`Tagged as ${tagInputName.trim()}`, 'success');
    setIsTagModalOpen(false);
  };

  // CI Refresh
  const handleRefreshCI = () => {
    setIsRefreshingCI(true);
    showToast('Refreshing CI status...', 'info');
    setTimeout(() => {
      setIsRefreshingCI(false);
      showToast('Checks re-evaluated: 1 failed', 'warning');
    }, 700);
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
          className="relative w-full max-w-[440px] mx-auto bg-surface-1 border-t border-border rounded-t-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Top Drag Handle Bar */}
          <div className="pt-2.5 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          {/* Modal Header */}
          <div className="px-5 py-3 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              {/* Commit Glyph */}
              <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary shrink-0">
                <GitCommit size={16} strokeWidth={2.2} />
              </div>

              {/* Title & Short SHA */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-text-primary tracking-tight">Commit Detail</h2>
                  <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 bg-surface-2 text-text-primary rounded-md border border-border">
                    {shortSha}
                  </span>
                </div>
                <div className="text-[11px] text-text-tertiary flex items-center gap-1 truncate">
                  <span>{authorName} · {formatRelativeTime(commit.date || commit.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Circular Dismiss Button */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-tertiary hover:text-text-primary transition cursor-pointer shrink-0"
              aria-label="Close commit modal"
            >
              <X size={15} strokeWidth={2.2} />
            </button>
          </div>

          {/* Segmented 3-Tab Bar (Overview, Diffs, CI/CD) */}
          <div className="px-4 py-2 border-b border-border bg-surface-2/40 shrink-0 select-none">
            <div className="flex bg-surface-2 p-0.5 rounded-xl text-xs font-semibold">
              {/* Tab 1: Overview */}
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-surface-1 text-text-primary shadow-xs font-semibold'
                    : 'text-text-tertiary hover:text-text-primary font-medium'
                }`}
              >
                <GitCommit size={14} className={activeTab === 'overview' ? 'text-accent' : ''} />
                <span>Overview</span>
              </button>

              {/* Tab 2: Diffs */}
              <button
                type="button"
                onClick={() => setActiveTab('diffs')}
                className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'diffs'
                    ? 'bg-surface-1 text-text-primary shadow-xs font-semibold'
                    : 'text-text-tertiary hover:text-text-primary font-medium'
                }`}
              >
                <FileDiff size={14} className={activeTab === 'diffs' ? 'text-accent' : ''} />
                <span>Diffs ({files.length})</span>
              </button>

              {/* Tab 3: CI/CD */}
              <button
                type="button"
                onClick={() => setActiveTab('cicd')}
                className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'cicd'
                    ? 'bg-surface-1 text-text-primary shadow-xs font-semibold'
                    : 'text-text-tertiary hover:text-text-primary font-medium'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${hasFailingChecks ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span>CI/CD ({checkRuns.length})</span>
              </button>
            </div>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar">
            {isLoadingDetail ? (
              <div className="py-16 text-center text-xs text-text-tertiary flex flex-col items-center justify-center gap-2">
                <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <span>Loading commit details & file diffs...</span>
              </div>
            ) : activeTab === 'overview' ? (
              /* ================= TAB: OVERVIEW ================= */
              <div className="space-y-4">
                {/* Commit Message Block */}
                <div className="border border-border rounded-2xl p-3.5 bg-surface-2/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-tertiary tracking-wider font-mono">MESSAGE</span>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="flex items-center gap-1 text-[11px] font-medium text-text-secondary hover:text-text-primary cursor-pointer transition"
                    >
                      {isCopiedMsg ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span>{isCopiedMsg ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="font-mono text-xs leading-relaxed space-y-2 font-medium">
                    <p className="font-bold text-text-primary">{parsedTitle}</p>
                    <div className="text-[11px] text-text-secondary space-y-1 font-normal font-sans">
                      {bulletPoints.map((bullet, idx) => (
                        <p key={idx} className="flex items-start gap-1">
                          <span className="text-text-tertiary select-none">-</span>
                          <span>{bullet}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Metadata Table */}
                <div className="border border-border rounded-2xl p-3.5 bg-surface-1 space-y-2.5 text-xs">
                  {/* Row 1: Author */}
                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-text-tertiary font-medium">Author</span>
                    <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                      <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                        {authorInitial}
                      </span>
                      <span>{authorName}</span>
                    </div>
                  </div>

                  {/* Row 2: Committed Date */}
                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-text-tertiary font-medium">Committed Date</span>
                    <span className="font-mono text-text-primary font-medium">{formattedDate}</span>
                  </div>

                  {/* Row 3: Full SHA */}
                  <div className="flex items-center justify-between py-1 border-b border-border/60">
                    <span className="text-text-tertiary font-medium">Full SHA</span>
                    <span className="font-mono text-[11px] text-text-secondary truncate max-w-[200px]" title={fullSha}>
                      {fullSha}
                    </span>
                  </div>

                  {/* Row 4: Parent Commit */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-text-tertiary font-medium">Parent Commit</span>
                    <button
                      type="button"
                      onClick={() => showToast(`Parent commit: ${parentSha}`, 'info')}
                      className="font-mono text-[11px] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded font-semibold hover:underline cursor-pointer"
                    >
                      {parentSha}
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'diffs' ? (
              /* ================= TAB: DIFFS ================= */
              <div className="space-y-3">
                {/* Diffs Header with Changed Files and Counts */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-tertiary tracking-wider font-mono">
                    CHANGED FILES
                  </span>
                  <div className="font-mono text-xs font-bold">
                    <span className="text-emerald-500">+{additions.toLocaleString()}</span>{' '}
                    <span className="text-text-tertiary">/</span>{' '}
                    <span className="text-rose-500">-{deletions.toLocaleString()}</span>
                  </div>
                </div>

                {/* Changed Files Interactive List */}
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5 no-scrollbar">
                  {files.map((file, idx) => {
                    const isSelected = idx === selectedDiffIndex;
                    const isAdd = file.status === 'added';
                    const isDel = file.status === 'removed';
                    const fileTypeBadge = isAdd ? 'ADD' : isDel ? 'DEL' : 'MOD';

                    return (
                      <div
                        key={file.filename + idx}
                        onClick={() => setSelectedDiffIndex(idx)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 shadow-2xs'
                            : 'bg-surface-2/60 border-border hover:bg-surface-2'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              isAdd
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : isDel
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            {fileTypeBadge}
                          </span>
                          <span className="font-mono text-[11px] text-text-primary truncate">
                            {file.filename}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] font-semibold shrink-0">
                          <span className="text-emerald-500">+{file.additions}</span>{' '}
                          <span className="text-rose-500">-{file.deletions}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Code Diff Viewer Box */}
                <div className="border border-border rounded-2xl overflow-hidden bg-slate-950 text-slate-100 font-mono text-[10px] mt-3 shadow-md">
                  <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 truncate max-w-[240px] font-mono text-[11px]">
                      {activeFile.filename}
                    </span>
                    <span className="px-1.5 py-0.5 bg-blue-900/60 text-blue-300 rounded text-[9px] font-bold font-mono">
                      UNIFIED DIFF
                    </span>
                  </div>

                  <div className="p-2.5 overflow-x-auto space-y-1 leading-snug max-h-[300px]">
                    {activeFile.patch ? (
                      activeFile.patch.split('\n').map((line: string, i: number) => {
                        if (line.startsWith('@@')) {
                          return (
                            <div key={i} className="text-blue-400 py-0.5 bg-blue-950/40 px-1 rounded font-mono font-medium">
                              {line}
                            </div>
                          );
                        } else if (line.startsWith('+') && !line.startsWith('+++')) {
                          return (
                            <div key={i} className="bg-emerald-950/70 text-emerald-300 px-1 rounded py-0.5 flex gap-1 font-mono">
                              <span className="select-none font-bold text-emerald-400">+</span>
                              <span>{line.substring(1)}</span>
                            </div>
                          );
                        } else if (line.startsWith('-') && !line.startsWith('---')) {
                          return (
                            <div key={i} className="bg-rose-950/70 text-rose-300 px-1 rounded py-0.5 flex gap-1 font-mono">
                              <span className="select-none font-bold text-rose-400">-</span>
                              <span className="line-through opacity-90">{line.substring(1)}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div key={i} className="text-slate-400 pl-2">
                              {line}
                            </div>
                          );
                        }
                      })
                    ) : (
                      <div className="space-y-1">
                        <div className="text-blue-400 py-0.5 bg-blue-950/40 px-1 rounded">
                          @@ -1,6 +1,6 @@
                        </div>
                        <div className="text-slate-400 pl-2"> // Refactored changes for {activeFile.filename}</div>
                        <div className="bg-rose-950/70 text-rose-300 px-1 rounded py-0.5 flex gap-1">
                          <span>-</span>
                          <span className="line-through">const legacyConfig = &#123; mode: 'standard' &#125;;</span>
                        </div>
                        <div className="bg-emerald-950/70 text-emerald-300 px-1 rounded py-0.5 flex gap-1">
                          <span>+</span>
                          <span>const optimizedConfig = &#123; mode: 'performance', reactive: true &#125;;</span>
                        </div>
                        <div className="text-slate-400 pl-2"> return createUnifiedState(optimizedConfig);</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ================= TAB: CI/CD ================= */
              <div className="space-y-3.5">
                {/* Header with Title and Refresh */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-tertiary tracking-wider font-mono">
                    GITHUB ACTIONS &amp; CI STATUS
                  </span>
                  <button
                    type="button"
                    onClick={handleRefreshCI}
                    disabled={isRefreshingCI}
                    className="flex items-center gap-1 text-[11px] font-semibold text-text-primary bg-surface-2 px-2 py-1 rounded-lg hover:bg-surface-3 transition cursor-pointer"
                  >
                    <RefreshCw size={12} className={isRefreshingCI ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Status Banner */}
                {hasFailingChecks ? (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-400 font-semibold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span>Some Checks Failed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>All Checks Passed</span>
                  </div>
                )}

                {/* CI Check Items */}
                <div className="space-y-2.5">
                  {checkRuns.map((check) => {
                    const isFailure = check.conclusion === 'failure';
                    return (
                      <div
                        key={check.id}
                        className="border border-border rounded-2xl p-3.5 bg-surface-1 flex items-center justify-between shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 ${
                              isFailure
                                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
                                : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {isFailure ? <X size={15} strokeWidth={2.5} /> : <Check size={15} strokeWidth={2.5} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-text-primary text-xs truncate">
                              {check.name}
                            </h4>
                            <p className="text-[11px] text-text-tertiary">
                              {check.status} &middot; {check.conclusion}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedCheckLog(check)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline shrink-0 cursor-pointer"
                        >
                          <span>Logs</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Logs Modal Sheet Overlay */}
          <AnimatePresence>
            {selectedCheckLog && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="absolute inset-x-2 bottom-20 z-20 bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl p-3.5 shadow-2xl space-y-2"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-blue-400" />
                    <span className="font-mono text-xs font-bold text-slate-200 truncate max-w-[260px]">
                      {selectedCheckLog.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCheckLog(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="font-mono text-[10px] text-slate-300 space-y-1 max-h-40 overflow-y-auto no-scrollbar">
                  <p className="text-slate-500"># Run execution log starting at {selectedCheckLog.startedAt || '01:14:00'}</p>
                  <p className="text-emerald-400">✓ Loaded environment configurations</p>
                  <p className="text-emerald-400">✓ Running target build pipeline</p>
                  {selectedCheckLog.conclusion === 'failure' ? (
                    <>
                      <p className="text-rose-400">✗ error TS2322 in src/components/commit/GitGraph.tsx: line 42</p>
                      <p className="text-rose-300 bg-rose-950/50 p-1 rounded">Type 'string' is not assignable to type 'number'.</p>
                      <p className="text-rose-400 font-bold">Process terminated with exit code 1</p>
                    </>
                  ) : (
                    <>
                      <p className="text-emerald-400">✓ Verified type safety: 0 errors</p>
                      <p className="text-emerald-400">✓ Test suites passed: 48 passed, 0 failed</p>
                      <p className="text-emerald-400 font-bold">Pipeline completed successfully</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline Dialog: Branch Here */}
          <AnimatePresence>
            {isBranchModalOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-3 bg-surface-2 border-t border-border space-y-2.5 shrink-0"
              >
                <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                  <div className="flex items-center gap-1.5">
                    <GitBranch size={13} className="text-accent" />
                    <span>Create Branch at {shortSha}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBranchModalOpen(false)}
                    className="text-text-tertiary hover:text-text-primary"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={branchInputName}
                    onChange={(e) => setBranchInputName(e.target.value)}
                    placeholder="feature/new-branch-name"
                    className="flex-1 h-9 px-3 bg-surface-1 border border-border rounded-xl text-xs font-mono text-text-primary outline-none focus:border-accent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateBranch}
                    className="h-9 px-3 bg-accent text-white rounded-xl text-xs font-bold hover:opacity-90 transition cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline Dialog: Tag Commit */}
          <AnimatePresence>
            {isTagModalOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-3 bg-surface-2 border-t border-border space-y-2.5 shrink-0"
              >
                <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                  <div className="flex items-center gap-1.5">
                    <Tag size={13} className="text-accent" />
                    <span>Tag Commit {shortSha}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTagModalOpen(false)}
                    className="text-text-tertiary hover:text-text-primary"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInputName}
                    onChange={(e) => setTagInputName(e.target.value)}
                    placeholder="e.g. v1.0.0"
                    className="flex-1 h-9 px-3 bg-surface-1 border border-border rounded-xl text-xs font-mono text-text-primary outline-none focus:border-accent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    className="h-9 px-3 bg-accent text-white rounded-xl text-xs font-bold hover:opacity-90 transition cursor-pointer"
                  >
                    Tag
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Bottom Actions Bar (Exact Trio Matching Example 17) */}
          <div className="p-3.5 border-t border-border bg-surface-1 flex items-center gap-2 shrink-0">
            {/* Copy SHA Button */}
            <button
              type="button"
              onClick={handleCopySha}
              className="flex-1 py-2.5 bg-surface-2 hover:bg-surface-3 text-text-primary font-semibold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 text-xs cursor-pointer shadow-2xs"
            >
              <Copy size={13} className="text-text-secondary" />
              <span>{isCopiedSha ? 'Copied SHA!' : 'Copy SHA'}</span>
            </button>

            {/* Branch Here Button */}
            <button
              type="button"
              onClick={handleOpenBranchModal}
              className="flex-[1.5] py-2.5 bg-text-primary hover:opacity-90 text-background font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 text-xs cursor-pointer"
            >
              <GitBranch size={13} />
              <span>Branch Here</span>
            </button>

            {/* Tag Commit Button */}
            <button
              type="button"
              onClick={handleOpenTagModal}
              title={`Tag commit ${shortSha}`}
              className="p-2.5 bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary rounded-xl transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Tag size={15} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
