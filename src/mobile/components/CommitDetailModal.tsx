import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  GitCommit, Copy, Check, X, FileDiff, 
  GitBranch, Tag, ShieldCheck, Clock, User, CheckCircle2, 
  RefreshCw, ExternalLink, Activity, AlertCircle, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
    githubToken, 
    githubUser,
    createBranchAtCommit,
    createTagAtCommit
  } = useAppContext();

  const [commitDetail, setCommitDetail] = useState<DetailedCommitInfo | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'diff' | 'details' | 'cicd'>('diff');
  const [isCopiedSha, setIsCopiedSha] = useState(false);
  const [isCopiedMsg, setIsCopiedMsg] = useState(false);
  const [selectedDiffFile, setSelectedDiffFile] = useState<string | null>(null);
  const [isBranchInputOpen, setIsBranchInputOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [isReloadingChecks, setIsReloadingChecks] = useState(false);

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

  const handleReloadChecks = async () => {
    setIsReloadingChecks(true);
    try {
      const details = await fetchCommitDetailsSafe({
        commitSha: commit.fullHash || commit.hash,
        repoName: currentRepo || 'repository',
        owner: currentRepoOwner || githubUser?.login || 'nakib555',
        token: githubToken,
        fallbackCommit: commit,
      });
      setCommitDetail(details);
      showToast('Refreshed check runs from GitHub API', 'info');
    } catch (_) {
      showToast('Failed to refresh check runs', 'error');
    } finally {
      setIsReloadingChecks(false);
    }
  };

  const activeDiff = commitDetail?.files?.find(f => f.filename === selectedDiffFile) || commitDetail?.files?.[0];
  const checkRuns = commitDetail?.checkRuns || [];
  const allChecksPassed = checkRuns.length > 0 && checkRuns.every(cr => cr.conclusion === 'success');
  const hasFailingChecks = checkRuns.some(cr => cr.conclusion === 'failure');

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
          className="relative w-full bg-surface-1 border-t border-x border-border rounded-t-[20px] pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 px-4 shadow-2xl z-10 h-[90vh] max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Top Drag Handle (Master Prompt Spatial System: 20px top radius, 8pt grid) */}
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-2 shrink-0" />

          {/* Header: Title, SHA & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent border border-accent/20 flex items-center justify-center shrink-0">
                <GitCommit size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">Commit Detail</span>
                  <span className="text-[11px] font-mono font-bold bg-surface-2 text-accent px-2 py-0.5 rounded-md border border-border tabular-nums">
                    {commit.hash.substring(0, 7)}
                  </span>
                  {commitDetail?.verified && (
                    <span className="text-[10px] text-success font-semibold flex items-center gap-0.5 bg-success/10 px-1.5 py-0.5 rounded">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  )}
                </div>
                <span className="text-xs text-text-tertiary truncate block font-medium mt-0.5">
                  {commit.author} · {formatRelativeTime(commit.date || commit.timestamp)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-xl hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
              aria-label="Close commit sheet"
            >
              <X size={18} />
            </button>
          </div>

          {/* Commit Tab Bar: Diffs | Overview | Files | CI/CD */}
          <div className="flex items-center justify-between border-b border-border py-2 shrink-0 select-none">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
              <button
                onClick={() => setActiveTab('diff')}
                className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'diff'
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                }`}
              >
                <FileDiff size={14} />
                <span>Diffs ({commitDetail?.files?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('details')}
                className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'details'
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                }`}
              >
                <GitCommit size={14} />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('cicd')}
                className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'cicd'
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                }`}
              >
                <CheckCircle2 size={14} className={allChecksPassed ? 'text-success' : hasFailingChecks ? 'text-danger' : 'text-accent'} />
                <span>CI/CD ({checkRuns.length})</span>
              </button>
            </div>
          </div>

          {/* Scrollable Main Tab Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3 min-h-0">
            {isLoadingDetail ? (
              <div className="py-16 text-center text-xs text-text-tertiary flex flex-col items-center justify-center gap-2">
                <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <span>Fetching authentic commit tree & diffs from GitHub...</span>
              </div>
            ) : activeTab === 'diff' ? (
              <div className="space-y-3">
                {/* Changed files selector list */}
                {commitDetail?.files && commitDetail.files.length > 0 ? (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-text-tertiary font-mono px-1">
                        <span>CHANGED FILES</span>
                        <span className="text-success font-bold tabular-nums">
                          +{commitDetail.stats.additions} / <span className="text-danger tabular-nums">-{commitDetail.stats.deletions}</span>
                        </span>
                      </div>

                      <div className="divide-y divide-border border border-border rounded-xl bg-background overflow-hidden">
                        {commitDetail.files.map((file) => (
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
                                {file.status.substring(0, 3)}
                              </span>
                              <span className="font-mono text-text-primary truncate">{file.filename}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[11px] shrink-0 tabular-nums">
                              <span className="text-success">+{file.additions}</span>
                              <span className="text-danger">-{file.deletions}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active File Unified Diff Viewer */}
                    {activeDiff && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs text-text-tertiary px-1 font-mono">
                          <span className="truncate pr-2">{activeDiff.filename}</span>
                          <span className="text-[10px] uppercase font-bold text-accent shrink-0">
                            Unified Diff
                          </span>
                        </div>

                        <div className="rounded-xl border border-border bg-background overflow-hidden">
                          <div className="max-h-[48vh] overflow-x-auto overflow-y-auto font-mono text-[11px] leading-relaxed p-2 select-text">
                            {activeDiff.patch ? (
                              <pre className="text-text-primary whitespace-pre-wrap font-mono m-0">
                                {activeDiff.patch.split('\n').map((line, idx) => {
                                  let lineClass = 'text-text-tertiary';
                                  if (line.startsWith('+') && !line.startsWith('+++')) {
                                    lineClass = 'bg-success/15 text-success font-medium px-1 rounded-xs block';
                                  } else if (line.startsWith('-') && !line.startsWith('---')) {
                                    lineClass = 'bg-danger/15 text-danger font-medium px-1 rounded-xs block';
                                  } else if (line.startsWith('@@')) {
                                    lineClass = 'bg-accent/10 text-accent font-bold px-1 rounded-xs block';
                                  }
                                  return (
                                    <span key={idx} className={lineClass}>
                                      {line || ' '}
                                    </span>
                                  );
                                })}
                              </pre>
                            ) : (
                              <div className="p-4 text-center text-text-tertiary text-xs">
                                No unified patch text provided for this file (binary file or large changeset).
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center text-xs text-text-tertiary bg-background border border-border rounded-xl">
                    <p className="font-semibold text-text-secondary mb-1">No file diffs recorded for this commit</p>
                    <p>Initial commit or changeset metadata was not returned by GitHub REST API.</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'details' ? (
              <div className="space-y-4">
                {/* Full Commit Message */}
                <div className="p-3.5 rounded-xl bg-background border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <span className="font-mono text-[11px]">MESSAGE</span>
                    <button
                      onClick={() => handleCopyMessage(commitDetail?.msg || commit.msg)}
                      className="hover:text-text-primary flex items-center gap-1 cursor-pointer"
                    >
                      {isCopiedMsg ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                      <span>{isCopiedMsg ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-text-primary font-mono leading-relaxed whitespace-pre-wrap break-words">
                    {commitDetail?.msg || commit.msg}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="p-3.5 rounded-xl bg-background border border-border space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-tertiary font-mono text-[11px]">Author</span>
                    <span className="font-medium text-text-primary text-xs flex items-center gap-1.5">
                      {commitDetail?.authorAvatar && (
                        <img src={commitDetail.authorAvatar} alt="" className="w-4 h-4 rounded-full border border-border" />
                      )}
                      <span>{commitDetail?.author || commit.author}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-tertiary font-mono text-[11px]">Committed Date</span>
                    <span className="text-text-secondary text-xs font-mono tabular-nums">
                      {new Date(commitDetail?.date || commit.date || commit.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-tertiary font-mono text-[11px]">Full SHA</span>
                    <span className="font-mono text-accent text-[11px] truncate max-w-[200px] tabular-nums">
                      {commitDetail?.fullHash || commit.fullHash || commit.hash}
                    </span>
                  </div>

                  {commitDetail?.parentSha && (
                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-text-tertiary font-mono text-[11px]">Parent Commit</span>
                      <span className="font-mono text-text-secondary text-[11px] tabular-nums">
                        {commitDetail.parentSha.substring(0, 7)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* CI/CD Pipeline Tab with Authentic GitHub Check Runs */
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-surface-2 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                      GitHub Actions & CI Status
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${
                        allChecksPassed ? 'bg-success' : hasFailingChecks ? 'bg-danger' : checkRuns.length > 0 ? 'bg-accent' : 'bg-text-tertiary'
                      }`} />
                      <span className="text-xs font-bold text-text-primary">
                        {checkRuns.length === 0
                          ? 'No Check Runs Found'
                          : allChecksPassed
                            ? 'All GitHub Actions Checks Passed'
                            : hasFailingChecks
                              ? 'Some Checks Failed'
                              : 'Checks In Progress'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleReloadChecks}
                    disabled={isReloadingChecks}
                    className="h-8 px-3 rounded-lg bg-accent text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isReloadingChecks ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                {checkRuns.length > 0 ? (
                  <div className="space-y-2">
                    {checkRuns.map((cr) => (
                      <div key={cr.id} className="p-3 rounded-xl bg-background border border-border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {cr.conclusion === 'success' ? (
                            <CheckCircle2 size={16} className="text-success shrink-0" />
                          ) : cr.conclusion === 'failure' ? (
                            <XCircle size={16} className="text-danger shrink-0" />
                          ) : (
                            <AlertCircle size={16} className="text-warning shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="font-mono text-text-primary font-medium block truncate">{cr.name}</span>
                            <span className="text-[10px] text-text-tertiary font-mono">
                              {cr.status} · {cr.conclusion || 'pending'}
                            </span>
                          </div>
                        </div>

                        {cr.htmlUrl ? (
                          <a
                            href={cr.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent text-[11px] font-semibold flex items-center gap-1 hover:underline shrink-0"
                          >
                            <span>Logs</span>
                            <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className={`text-[11px] font-semibold font-mono capitalize ${
                            cr.conclusion === 'success' ? 'text-success' : cr.conclusion === 'failure' ? 'text-danger' : 'text-warning'
                          }`}>
                            {cr.conclusion || cr.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-text-tertiary bg-background border border-border rounded-xl">
                    <p className="font-semibold text-text-secondary mb-1">No automated check runs recorded</p>
                    <p className="leading-relaxed">
                      GitHub Actions workflows trigger on push when `.github/workflows` configurations are active in the repository.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Bar (Master Prompt: min 44px height, 10px radius) */}
          <div className="pt-2.5 border-t border-border shrink-0 flex items-center gap-2">
            <button
              onClick={() => handleCopyHash(commit.fullHash || commit.hash)}
              className="flex-1 min-h-[44px] rounded-[10px] bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy size={14} />
              <span>Copy SHA</span>
            </button>

            <button
              onClick={() => setIsBranchInputOpen(!isBranchInputOpen)}
              className="flex-1 min-h-[44px] rounded-[10px] bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-accent/25 transition-all cursor-pointer"
            >
              <GitBranch size={14} />
              <span>Branch Here</span>
            </button>

            <button
              onClick={handleCreateTag}
              className="w-11 min-h-[44px] rounded-[10px] bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Tag commit"
              aria-label="Tag commit"
            >
              <Tag size={14} />
            </button>
          </div>

          {/* Inline Branch Creation input popover */}
          {isBranchInputOpen && (
            <div className="mt-2 p-2.5 bg-background border border-border rounded-xl flex items-center gap-2 shrink-0 animate-fade-in">
              <input
                type="text"
                placeholder="new-branch-name..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="flex-1 h-9 px-3 bg-surface-1 border border-border rounded-lg text-xs font-mono text-text-primary outline-none focus:border-accent"
              />
              <button
                onClick={handleCreateBranchFromCommit}
                disabled={!newBranchName.trim()}
                className="h-9 px-3.5 rounded-lg bg-accent text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
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
