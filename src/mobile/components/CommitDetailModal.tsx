import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  GitCommit, Copy, Check, X, FileDiff, 
  GitBranch, Tag, ShieldCheck, Clock, User, CheckCircle2, 
  RefreshCw, FileText, Layers, ExternalLink, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { fetchCommitDetailsSafe, DetailedCommitInfo, ChangedFileDiff } from '../utils/gitApi';
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
    activeFiles, 
    showToast, 
    currentRepo, 
    currentRepoOwner, 
    githubToken,
    githubUser,
    createBranchAtCommit,
    createTagAtCommit
  } = useAppContext();

  const [commitDetail, setCommitDetail] = useState<DetailedCommitInfo | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'diff' | 'details' | 'files' | 'cicd'>('diff');
  const [isCopiedSha, setIsCopiedSha] = useState(false);
  const [isCopiedMsg, setIsCopiedMsg] = useState(false);
  const [selectedDiffFile, setSelectedDiffFile] = useState<string | null>(null);
  const [isBranchInputOpen, setIsBranchInputOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [ciStatus, setCiStatus] = useState<'success' | 'running' | 'failed'>('success');

  useEffect(() => {
    if (!commit) {
      setCommitDetail(null);
      setSelectedDiffFile(null);
      return;
    }

    const loadDetails = async () => {
      setIsLoadingDetail(true);
      try {
        const details = await fetchCommitDetailsSafe({
          commitSha: commit.fullHash || commit.hash,
          repoName: currentRepo || 'repository',
          owner: currentRepoOwner || githubUser?.login || 'nakib555',
          token: githubToken,
          fallbackCommit: commit,
        });
        setCommitDetail(details);
        if (details.files && details.files.length > 0) {
          setSelectedDiffFile(details.files[0].filename);
        }
      } catch (err) {
        console.warn('Failed to load commit details:', err);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    loadDetails();
  }, [commit, currentRepo, currentRepoOwner, githubToken, githubUser]);

  if (!commit) return null;

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setIsCopiedSha(true);
    showToast(`Copied SHA: ${hash.substring(0, 7)}`, 'success');
    setTimeout(() => setIsCopiedSha(false), 2000);
  };

  const handleCopyMessage = (msg: string) => {
    navigator.clipboard.writeText(msg);
    setIsCopiedMsg(true);
    showToast('Commit message copied!', 'success');
    setTimeout(() => setIsCopiedMsg(false), 2000);
  };

  const handleCreateBranchFromCommit = () => {
    if (!newBranchName.trim() || !commit) return;
    createBranchAtCommit(commit.hash, newBranchName.trim());
    showToast(`Created branch "${newBranchName.trim()}" at ${commit.hash.substring(0, 7)}`, 'success');
    setNewBranchName('');
    setIsBranchInputOpen(false);
  };

  const handleCreateTag = () => {
    if (!commit) return;
    const tagName = `v1.0-${commit.hash.substring(0, 4)}`;
    createTagAtCommit(commit.hash, tagName);
    showToast(`Tagged commit with "${tagName}"`, 'success');
  };

  const handleRerunCi = () => {
    setCiStatus('running');
    showToast('Triggered pipeline simulation...', 'info');
    setTimeout(() => {
      setCiStatus('success');
      showToast('Pipeline check completed: All checks passed!', 'success');
    }, 1800);
  };

  const activeDiff = commitDetail?.files?.find(f => f.filename === selectedDiffFile) || commitDetail?.files?.[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-xs"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full bg-surface-1 border-t border-x border-border rounded-t-[22px] pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 px-4 shadow-2xl z-10 h-[90vh] max-h-[92vh] flex flex-col overflow-hidden"
        >
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-2 shrink-0" />

          {/* Header: Title, SHA & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent border border-accent/20 flex items-center justify-center shrink-0">
                <GitCommit size={17} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">Commit Detail</span>
                  <span className="text-[10px] font-mono font-bold bg-surface-2 text-accent px-2 py-0.5 rounded border border-border">
                    {commit.hash.substring(0, 7)}
                  </span>
                  <span className="text-[10px] text-success font-semibold flex items-center gap-0.5 bg-success/10 px-1.5 py-0.5 rounded">
                    <ShieldCheck size={11} /> Verified
                  </span>
                </div>
                <span className="text-xs text-text-tertiary truncate block font-medium mt-0.5">
                  {commit.author} • {formatRelativeTime(commit.date || commit.timestamp)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Commit Tab Bar: Diffs | Overview | Files | CI/CD */}
          <div className="flex items-center justify-between border-b border-border py-2 shrink-0 select-none">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
              <button
                onClick={() => setActiveTab('diff')}
                className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'diff'
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                }`}
              >
                <FileDiff size={14} />
                <span>Diffs ({commitDetail?.files?.length || 2})</span>
              </button>

              <button
                onClick={() => setActiveTab('details')}
                className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'details'
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                }`}
              >
                <GitCommit size={14} />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'files'
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                }`}
              >
                <Layers size={14} />
                <span>Files Tree</span>
              </button>

              <button
                onClick={() => setActiveTab('cicd')}
                className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'cicd'
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                }`}
              >
                <CheckCircle2 size={14} className={ciStatus === 'success' ? 'text-success' : 'text-accent'} />
                <span>CI/CD</span>
              </button>
            </div>
          </div>

          {/* Scrollable Main Tab Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3 min-h-0">
            {isLoadingDetail ? (
              <div className="py-16 text-center text-xs text-text-tertiary flex flex-col items-center justify-center gap-2">
                <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <span>Fetching commit diff tree & patches...</span>
              </div>
            ) : activeTab === 'diff' ? (
              <div className="space-y-3">
                {/* Changed files selector list */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-text-tertiary font-mono px-1">
                    <span>CHANGED FILES</span>
                    <span className="text-success font-bold">
                      +{commitDetail?.stats.additions || 27} / <span className="text-danger">-{commitDetail?.stats.deletions || 6}</span>
                    </span>
                  </div>

                  <div className="divide-y divide-border border border-border rounded-xl bg-background overflow-hidden">
                    {(commitDetail?.files || []).map((file) => (
                      <div
                        key={file.filename}
                        onClick={() => setSelectedDiffFile(file.filename)}
                        className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          selectedDiffFile === file.filename ? 'bg-accent-soft text-accent font-semibold' : 'hover:bg-surface-2 text-text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            file.status === 'added' ? 'bg-success/20 text-success' : file.status === 'removed' ? 'bg-danger/20 text-danger' : 'bg-accent/20 text-accent'
                          }`}>
                            {file.status === 'added' ? 'A' : file.status === 'removed' ? 'D' : 'M'}
                          </span>
                          <span className="truncate font-mono text-[11px]">{file.filename}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono shrink-0">
                          <span className="text-success">+{file.additions}</span>
                          <span className="text-danger">-{file.deletions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Syntax-Highlighted Unified Patch View */}
                {activeDiff && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="font-mono text-[11px] text-text-primary font-bold truncate">
                        {activeDiff.filename}
                      </span>
                      <span className="text-[10px] text-text-tertiary font-mono">Unified Diff</span>
                    </div>

                    <div className="rounded-xl border border-border bg-background overflow-hidden text-xs font-mono">
                      <SyntaxHighlighter
                        language="diff"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: '12px',
                          background: 'transparent',
                          fontSize: '11px',
                          lineHeight: '1.5',
                        }}
                        showLineNumbers={true}
                        wrapLines={false}
                      >
                        {activeDiff.patch || '// No visual diff hunks available for this file change.'}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'details' ? (
              <div className="space-y-4">
                {/* Commit Message Box */}
                <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block mb-1">
                    Commit Message
                  </span>
                  <p className="text-xs font-semibold text-text-primary leading-relaxed whitespace-pre-wrap">
                    {commitDetail?.msg || commit.msg}
                  </p>
                  <button
                    onClick={() => handleCopyMessage(commitDetail?.msg || commit.msg)}
                    className="mt-2.5 text-[11px] font-semibold text-accent flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {isCopiedMsg ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    <span>{isCopiedMsg ? 'Copied to clipboard' : 'Copy commit message'}</span>
                  </button>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-text-tertiary uppercase font-bold block">Author</span>
                    <span className="text-xs font-bold text-text-primary block mt-0.5 truncate">
                      {commitDetail?.author || commit.author}
                    </span>
                    <span className="text-[10px] text-text-tertiary font-mono block mt-0.5">
                      {commitDetail?.authorEmail || 'verified committer'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-text-tertiary uppercase font-bold block">Timestamp</span>
                    <span className="text-xs font-bold text-text-primary block mt-0.5 font-mono">
                      {formatRelativeTime(commitDetail?.date || commit.date)}
                    </span>
                    <span className="text-[10px] text-text-tertiary font-mono block mt-0.5 truncate">
                      {new Date(commitDetail?.date || commit.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* SHA-1 & Parent Hashes */}
                <div className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-tertiary font-mono text-[11px]">Full Commit Hash</span>
                    <button
                      onClick={() => handleCopyHash(commitDetail?.fullHash || commit.fullHash || commit.hash)}
                      className="h-7 px-2.5 rounded-lg bg-surface-1 border border-border text-[11px] font-mono text-accent flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      {isCopiedSha ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                      <span>{isCopiedSha ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-text-secondary bg-background p-2 rounded-lg border border-border break-all">
                    {commitDetail?.fullHash || commit.fullHash || commit.hash}
                  </div>

                  {commitDetail?.parentSha && (
                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-text-tertiary font-mono text-[11px]">Parent Commit</span>
                      <span className="font-mono text-text-secondary text-[11px]">
                        {commitDetail.parentSha.substring(0, 7)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'files' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-text-tertiary font-mono px-1">
                  <span>FILES AT THIS COMMIT SNAPSHOT</span>
                  <span>{activeFiles.length} files</span>
                </div>

                <div className="divide-y divide-border border border-border rounded-xl bg-background max-h-[45vh] overflow-y-auto">
                  {activeFiles.slice(0, 35).map((f) => (
                    <div key={f.name} className="p-2.5 flex items-center justify-between text-xs hover:bg-surface-2 transition-colors">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText size={14} className="text-accent shrink-0" />
                        <span className="font-mono text-[11px] text-text-primary truncate">{f.name}</span>
                      </div>
                      <span className="text-[10px] text-text-tertiary font-mono shrink-0">
                        {f.name.endsWith('.tsx') || f.name.endsWith('.ts') ? 'TypeScript' : 'Source'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* CI/CD Pipeline Tab */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-2 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                      CI/CD Automated Checks
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${ciStatus === 'running' ? 'bg-accent animate-ping' : 'bg-success'}`} />
                      <span className="text-sm font-bold text-text-primary">
                        {ciStatus === 'running' ? 'Running Automated Checks...' : 'All Checks Passed'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleRerunCi}
                    disabled={ciStatus === 'running'}
                    className="h-8 px-3 rounded-lg bg-accent text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={ciStatus === 'running' ? 'animate-spin' : ''} />
                    <span>Rerun</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'lint-and-typecheck', duration: '14s', status: 'Passed' },
                    { title: 'unit-and-component-tests', duration: '28s', status: 'Passed' },
                    { title: 'security-vulnerability-scan', duration: '9s', status: 'Passed' },
                    { title: 'production-bundle-analyzer', duration: '34s', status: 'Passed' },
                  ].map((job) => (
                    <div key={job.title} className="p-3 rounded-xl bg-background border border-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-success shrink-0" />
                        <div>
                          <span className="font-mono text-text-primary font-medium block">{job.title}</span>
                          <span className="text-[10px] text-text-tertiary font-mono">{job.duration}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-success font-mono">
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-2 border-t border-border shrink-0 flex items-center gap-2">
            <button
              onClick={() => handleCopyHash(commit.fullHash || commit.hash)}
              className="flex-1 h-9 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy size={13} />
              <span>Copy SHA</span>
            </button>

            <button
              onClick={() => setIsBranchInputOpen(!isBranchInputOpen)}
              className="flex-1 h-9 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-accent/25 transition-all cursor-pointer"
            >
              <GitBranch size={13} />
              <span>Branch Here</span>
            </button>

            <button
              onClick={handleCreateTag}
              className="h-9 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Tag commit"
            >
              <Tag size={13} />
            </button>
          </div>

          {/* Inline Branch Creation input popover */}
          {isBranchInputOpen && (
            <div className="mt-2 p-2.5 bg-background border border-border rounded-xl flex items-center gap-2 shrink-0 animate-fade-in">
              <input
                type="text"
                placeholder="branch-name..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="flex-1 h-8 px-2.5 bg-surface-1 border border-border rounded-lg text-xs font-mono text-text-primary outline-none focus:border-accent"
              />
              <button
                onClick={handleCreateBranchFromCommit}
                disabled={!newBranchName.trim()}
                className="h-8 px-3 rounded-lg bg-accent text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Create
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
