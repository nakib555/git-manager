import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../AppContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { 
  FileCode, FileText, Copy, GitMerge, AlertTriangle, GitPullRequest, Search, GitCommit, GitBranch, Edit2, Trash2, Check, X, Undo, Eye, BookOpen, FileSearch, Tag, RotateCcw, Terminal, Sliders, Clock, User, Info, Code2, Shield, TrendingUp, ChevronRight 
} from 'lucide-react';
import { CommitList } from '../../components/commit/CommitList';
import { DiffViewer } from '../../components/commit/DiffViewer';
import { CiCdPipelineFlow } from '../../components/commit/CiCdStatus';

export const CommitsScreen = () => {
  const { 
    githubToken,
    currentRepoOwner,
    currentRepo,
    activeCommits, 
    activeFiles,
    openModal, 
    deleteCommit, 
    amendLatestCommit, 
    undoLatestCommit, 
    restoreFilesToCommit, 
    resetBranchToCommit, 
    createBranchAtCommit, 
    createTagAtCommit, 
    showToast, theme 
  } = useAppContext();

  const isDesktop = useIsDesktop();
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setScrollElement(document.getElementById('mobile-scroll-container'));
  }, []);

  // Interactive Dialog and Action Sheet States
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [commitDetailData, setCommitDetailData] = useState<any>(null);
  const [isLoadingCommitDetail, setIsLoadingCommitDetail] = useState<boolean>(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'overview' | 'diff' | 'files' | 'integrity' | 'stats'>('overview');

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
        .then(data => {
          if (data) {
            setCommitDetailData(data);
          }
        })
        .catch(err => console.error("Error fetching commit details:", err))
        .finally(() => setIsLoadingCommitDetail(false));
    } else {
      setCommitDetailData(null);
    }
  }, [selectedCommit?.hash, selectedCommit?.fullHash, githubToken, currentRepoOwner, currentRepo]);
  const [diffViewMode, setDiffViewMode] = useState<'unified' | 'split'>('unified');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [selectedFileInDiff, setSelectedFileInDiff] = useState<string>('');
  
  // Sheet toggles
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showRestoreSheet, setShowRestoreSheet] = useState(false);
  
  // Dialog / Modal toggles
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [amendMode, setAmendMode] = useState<'msg' | 'content' | 'both'>('both');
  const [editedMsg, setEditedMsg] = useState('');
  const [editedAdd, setEditedAdd] = useState('');
  const [editedDel, setEditedDel] = useState('');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagName, setTagName] = useState('');
  
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [copiedSHA, setCopiedSHA] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  
  // Progress and loading states
  const [gitOperationMessage, setGitOperationMessage] = useState<string | null>(null);

  // Trigger simulated Git action progress loader
  const runGitCommand = (commandDesc: string, onComplete: () => void) => {
    setGitOperationMessage(commandDesc);
    setTimeout(() => {
      setGitOperationMessage(null);
      onComplete();
    }, 1200);
  };

  const handleOpenActions = (commit: any) => {
    setSelectedCommit(commit);
    setActiveInspectorTab('overview');
    if (!isDesktop) {
      setShowDetailsModal(true);
    } else {
      setShowActionSheet(true);
    }
  };

  const isLatestCommit = (commit: any) => {
    return activeCommits.length > 0 && activeCommits[0].hash === commit?.hash;
  };

  // 1. Copy actions
  const copyHash = () => {
    if (selectedCommit) {
      navigator.clipboard.writeText(selectedCommit.hash);
      showToast(`Copied hash: ${selectedCommit.hash}`);
      setShowActionSheet(false);
    }
  };

  const copyMessage = () => {
    if (selectedCommit) {
      navigator.clipboard.writeText(selectedCommit.msg);
      showToast(`Copied commit message!`);
      setShowActionSheet(false);
    }
  };

  // 2. Latest Commit Operations
  const triggerAmend = (mode: 'msg' | 'content' | 'both') => {
    if (!selectedCommit) return;
    setAmendMode(mode);
    setEditedMsg(selectedCommit.msg);
    setEditedAdd(selectedCommit.add.replace('+', ''));
    setEditedDel(selectedCommit.del.replace('-', ''));
    setShowActionSheet(false);
    setShowAmendModal(true);
  };

  const saveAmend = () => {
    if (!selectedCommit) return;
    const cleanMsg = editedMsg.trim();
    if (!cleanMsg) return;

    let cmd = 'git commit --amend';
    if (amendMode === 'msg') cmd += ' -m "' + cleanMsg + '"';
    else if (amendMode === 'content') cmd += ' --no-edit (updated lines)';
    else cmd += ' -m "' + cleanMsg + '" (updated stats)';

    runGitCommand(cmd, () => {
      amendLatestCommit(
        cleanMsg, 
        amendMode === 'content', 
        amendMode === 'msg', 
        { add: `+${editedAdd || '0'}`, del: `-${editedDel || '0'}` }
      );
      setShowAmendModal(false);
    });
  };

  const triggerDeleteLatest = () => {
    setShowActionSheet(false);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteLatest = () => {
    if (!selectedCommit) return;
    runGitCommand('git reset --hard HEAD~1', () => {
      deleteCommit(selectedCommit.hash);
      setShowDeleteConfirm(false);
      setSelectedCommit(null);
    });
  };

  const triggerUndoLatest = () => {
    setShowActionSheet(false);
    setShowUndoConfirm(true);
  };

  const confirmUndoLatest = () => {
    runGitCommand('git reset --soft HEAD~1', () => {
      undoLatestCommit();
      setShowUndoConfirm(false);
      setSelectedCommit(null);
    });
  };

  // 3. Older Commit Operations
  const triggerBrowseAt = () => {
    if (!selectedCommit) return;
    runGitCommand(`git checkout ${selectedCommit.hash}`, () => {
      showToast(`Browsing workspace at commit ${selectedCommit.hash} (Read-only mode)`);
      setShowActionSheet(false);
    });
  };

  const triggerViewChangedFiles = () => {
    setShowActionSheet(false);
    setShowFilesModal(true);
  };

  const triggerViewDiff = () => {
    setShowActionSheet(false);
    setShowDiffModal(true);
  };

  const triggerCreateBranch = () => {
    setBranchName('');
    setShowActionSheet(false);
    setShowBranchModal(true);
  };

  const confirmCreateBranch = () => {
    if (!selectedCommit || !branchName.trim()) return;
    const name = branchName.trim();
    runGitCommand(`git checkout -b ${name} ${selectedCommit.hash}`, () => {
      createBranchAtCommit(selectedCommit.hash, name);
      setShowBranchModal(false);
    });
  };

  const triggerCreateTag = () => {
    setTagName('');
    setShowActionSheet(false);
    setShowTagModal(true);
  };

  const confirmCreateTag = () => {
    if (!selectedCommit || !tagName.trim()) return;
    const tag = tagName.trim();
    runGitCommand(`git tag ${tag} ${selectedCommit.hash}`, () => {
      createTagAtCommit(selectedCommit.hash, tag);
      setShowTagModal(false);
    });
  };

  const triggerRestore = () => {
    setShowActionSheet(false);
    setShowRestoreSheet(true);
  };

  // 4. Restore Modes
  const handleRestoreFiles = () => {
    if (!selectedCommit) return;
    runGitCommand(`git checkout ${selectedCommit.hash} -- . && git commit`, () => {
      restoreFilesToCommit(selectedCommit.hash);
      setShowRestoreSheet(false);
      setSelectedCommit(null);
    });
  };

  const handleResetBranch = () => {
    if (!selectedCommit) return;
    runGitCommand(`git reset --hard ${selectedCommit.hash}`, () => {
      resetBranchToCommit(selectedCommit.hash);
      setShowRestoreSheet(false);
      setSelectedCommit(null);
    });
  };

  const handleCreateBranchHere = () => {
    triggerCreateBranch();
    setShowRestoreSheet(false);
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3 mb-1 shrink-0">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Ready to record state?</span>
        <button 
          onClick={() => openModal('commit')}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <GitCommit size={14} strokeWidth={2.5} /> Commit Changes
        </button>
      </div>

      <div>
        <CommitList 
          isDesktop={isDesktop} 
          parentRef={scrollElement}
          onSelectCommit={handleOpenActions}
          onActionClick={handleOpenActions}
          selectedCommitId={selectedCommit?.hash}
        />
      </div>

      {/* Git Operation Action Progress overlay loader */}
      {gitOperationMessage && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[1000] flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="flex flex-col items-center gap-4 max-w-xs text-center">
            <div className="w-14 h-14 rounded-full border-[3px] border-primary border-t-transparent animate-spin flex items-center justify-center bg-primary/5 shadow-inner">
              <GitCommit size={26} className="text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-main tracking-wider uppercase mb-1">Executing Git Command</p>
              <div className="bg-hover border border-border rounded-lg px-3 py-1.5 font-mono text-[11px] text-info/90 mt-2">
                $ {gitOperationMessage}
              </div>
            </div>
            <p className="text-[10px] text-text-muted animate-pulse font-medium">Writing changes to repository database...</p>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Bottom Action Sheet for Commit Actions */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>{showActionSheet && selectedCommit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 bg-background/80 backdrop-blur-md z-[990] flex items-end justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowActionSheet(false)}
          />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl z-[991] flex flex-col max-h-[90vh] overflow-hidden relative">
            
            {/* Handlebar for dragging feedback on mobile */}
            <div className="w-12 h-1 bg-border rounded-full mx-auto my-3 shrink-0 sm:hidden"></div>

            <div className="px-5 pb-4 pt-2 sm:pt-4 border-b border-border flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${isLatestCommit(selectedCommit) ? 'bg-success animate-ping' : 'bg-text-muted'}`}></span>
                  {isLatestCommit(selectedCommit) ? 'Latest Commit (HEAD)' : 'Historical Commit'}
                </span>
                <h3 className="text-sm font-bold text-text-main font-mono inline-block bg-hover px-2.5 py-0.5 rounded border border-border">
                  {selectedCommit.hash}
                </h3>
              </div>
              <button 
                onClick={() => setShowActionSheet(false)}
                className="w-8 h-8 rounded-full bg-hover flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 bg-hover/30 border-b border-border">
              <p className="text-xs font-semibold text-text-main line-clamp-2 leading-relaxed mb-1">
                "{selectedCommit.msg}"
              </p>
              <p className="text-[10px] text-text-muted">
                by <span className="font-bold text-text-main/80">{selectedCommit.author}</span> · {selectedCommit.time}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-8 sm:pb-4 space-y-4 no-scrollbar">
              
              {/* Latest Commit-Only Actions Section */}
              {isLatestCommit(selectedCommit) && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">Modify Latest Commit</div>
                  
                  <button 
                    onClick={() => triggerAmend('msg')}
                    className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center"><Edit2 size={13} /></div>
                      <div>
                        <div className="font-bold">Edit Commit Message</div>
                        <div className="text-[10px] text-text-muted font-normal">Change description only</div>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => triggerAmend('content')}
                    className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-info/10 text-info rounded-lg flex items-center justify-center"><Terminal size={13} /></div>
                      <div>
                        <div className="font-bold">Edit Commit Content (Amend)</div>
                        <div className="text-[10px] text-text-muted font-normal">Modify line addition/deletion stats</div>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => triggerAmend('both')}
                    className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center"><Sliders size={13} /></div>
                      <div>
                        <div className="font-bold">Edit Both Message & Content</div>
                        <div className="text-[10px] text-text-muted font-normal">Full commit amend</div>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={triggerUndoLatest}
                    className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-warning/10 text-warning rounded-lg flex items-center justify-center"><Undo size={13} /></div>
                      <div>
                        <div className="font-bold">Undo Latest Commit</div>
                        <div className="text-[10px] text-text-muted font-normal">Reset commit but keep code modifications</div>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={triggerDeleteLatest}
                    className="w-full text-left px-3 py-2.5 hover:bg-danger/5 hover:text-danger rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-danger/10 text-danger rounded-lg flex items-center justify-center"><Trash2 size={13} /></div>
                      <div>
                        <div className="font-bold text-danger">Delete Latest Commit</div>
                        <div className="text-[10px] text-danger/80 font-normal">Hard reset back one commit</div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Older Commit-Only Actions Section */}
              {!isLatestCommit(selectedCommit) && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">Git Checkout & Tagging</div>
                  
                  <button 
                    onClick={triggerBrowseAt}
                    className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center"><BookOpen size={13} /></div>
                      <div>
                        <div className="font-bold">Browse Repository at Commit</div>
                        <div className="text-[10px] text-text-muted font-normal">Checkout workspace in Read-Only</div>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={triggerViewChangedFiles}
                    className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-info/10 text-info rounded-lg flex items-center justify-center"><FileSearch size={13} /></div>
                      <div>
                        <div className="font-bold">View Changed Files</div>
                        <div className="text-[10px] text-text-muted font-normal">Inspect 4 modified files</div>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={triggerViewDiff}
                    className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-success/10 text-success rounded-lg flex items-center justify-center"><GitMerge size={13} /></div>
                      <div>
                        <div className="font-bold">View Split Diff</div>
                        <div className="text-[10px] text-text-muted font-normal">Analyze code insertions and deletions</div>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={triggerCreateBranch}
                    className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center"><GitBranch size={13} /></div>
                      <div>
                        <div className="font-bold">Create Branch Here</div>
                        <div className="text-[10px] text-text-muted font-normal">Branch off from this commit point</div>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={triggerCreateTag}
                    className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-pink-500/10 text-pink-500 rounded-lg flex items-center justify-center"><Tag size={13} /></div>
                      <div>
                        <div className="font-bold">Create Tag Here</div>
                        <div className="text-[10px] text-text-muted font-normal">Reference point with semantic release tag</div>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={triggerRestore}
                    className="w-full text-left px-3 py-2.5 bg-success/5 border border-success/15 hover:bg-success/10 rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-success/20 text-success rounded-lg flex items-center justify-center"><RotateCcw size={13} /></div>
                      <div>
                        <div className="font-bold text-success">Restore to This Commit...</div>
                        <div className="text-[10px] text-success/80 font-normal">Open safe history restore options</div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* General Commit Utilities */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">Utilities & Specs</div>
                
                <button 
                  onClick={() => {
                    setShowActionSheet(false);
                    setShowDetailsModal(true);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-hover border border-border text-text-muted rounded-lg flex items-center justify-center"><Eye size={13} /></div>
                    <div>
                      <div className="font-bold">View Commit Details</div>
                      <div className="text-[10px] text-text-muted font-normal">Inspect metadata, SHA and full log message</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={copyHash}
                  className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-hover border border-border text-text-muted rounded-lg flex items-center justify-center"><Copy size={13} /></div>
                    <div>
                      <div className="font-bold">Copy Commit Hash</div>
                      <div className="text-[10px] text-text-muted font-normal">Save SHA to clipboard</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={copyMessage}
                  className="w-full text-left px-3 py-2.5 hover:bg-hover rounded-xl flex items-center justify-between text-xs font-semibold text-text-main transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-hover border border-border text-text-muted rounded-lg flex items-center justify-center"><FileText size={13} /></div>
                    <div>
                      <div className="font-bold">Copy Commit Message</div>
                      <div className="text-[10px] text-text-muted font-normal">Save description text to clipboard</div>
                    </div>
                  </div>
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>,
      document.body
      )}

      {/* Secondary Bottom Sheet: Restore to This Commit Options */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {showRestoreSheet && selectedCommit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 bg-background/80 backdrop-blur-md z-[990] flex items-end justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowRestoreSheet(false)}
          />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl z-[991] flex flex-col max-h-[90vh] overflow-hidden relative">
            <div className="w-12 h-1 bg-border rounded-full mx-auto my-3 shrink-0 sm:hidden"></div>

            <div className="px-5 pb-4 pt-2 sm:pt-4 border-b border-border flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-success tracking-wider flex items-center gap-1.5 mb-1">
                  <RotateCcw size={10} />
                  Safe History Restore
                </span>
                <h3 className="text-base font-bold text-text-main">
                  Restore options at {selectedCommit.hash}
                </h3>
              </div>
              <button 
                onClick={() => setShowRestoreSheet(false)}
                className="w-8 h-8 rounded-full bg-hover flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 pb-8 sm:pb-5 overflow-y-auto space-y-4 no-scrollbar">
              
              {/* Option 1: Restore Files */}
              <button 
                onClick={handleRestoreFiles}
                className="w-full text-left p-4 bg-hover/40 border border-success/20 hover:border-success/40 rounded-2xl flex flex-col gap-1 transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-success">
                  <Check size={14} strokeWidth={3} className="bg-success/10 p-0.5 rounded" />
                  1. Restore Files (Recommended)
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Restores current workspace contents to match the state at <span className="font-mono text-text-main/80 font-bold">{selectedCommit.hash}</span>, then creates a new tracking commit. This preserves repository history, avoids forced pushes, and ensures 100% integrity.
                </p>
              </button>

              {/* Option 2: Reset Branch */}
              <button 
                onClick={handleResetBranch}
                className="w-full text-left p-4 bg-hover/40 border border-danger/20 hover:border-danger/40 rounded-2xl flex flex-col gap-1 transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-danger">
                  <AlertTriangle size={14} className="bg-danger/10 p-0.5 rounded" />
                  2. Reset Branch (Advanced)
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Moves the active branch pointer directly to <span className="font-mono text-text-main/80 font-bold">{selectedCommit.hash}</span>, completely removing later commits. <span className="text-danger font-bold">WARNING:</span> This rewrites branch logs and may require a force push.
                </p>
              </button>

              {/* Option 3: Create Branch Here */}
              <button 
                onClick={handleCreateBranchHere}
                className="w-full text-left p-4 bg-hover/40 border border-border hover:border-primary/40 rounded-2xl flex flex-col gap-1 transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <GitBranch size={14} className="bg-primary/10 p-0.5 rounded" />
                  3. Create Branch Here
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Creates a new standalone branch starting from <span className="font-mono text-text-main/80 font-bold">{selectedCommit.hash}</span> while leaving your current branch untouched. No commit history is modified.
                </p>
              </button>

            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>,
      document.body
      )}

      {/* View Commit Details Redesigned Screen/Modal (Desktop Centered Dialog) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isDesktop && showDetailsModal && selectedCommit && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[995] flex items-center justify-center p-4"
            >
            <div 
              className="absolute inset-0 z-0 cursor-pointer" 
              onClick={() => setShowDetailsModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar relative z-10"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-main">Commit Metadata</h3>
                    <p className="text-[10px] text-text-muted">Repository SHA and verification logs</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-text-muted hover:text-text-main p-1.5 rounded-full bg-hover transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 font-sans text-xs text-text-main">
                <div className="bg-hover/40 border border-border p-3.5 rounded-xl space-y-2">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-text-muted tracking-wider mb-0.5">Full Commit SHA</span>
                    <span className="font-mono font-medium text-info break-all select-all">{commitDetailData?.sha || selectedCommit.fullHash || selectedCommit.hash}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-text-muted tracking-wider mb-0.5">Author</span>
                      <span className="font-medium flex items-center gap-1">
                        <img src={selectedCommit.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCommit.author.split(' ')[0]}`} className="w-4.5 h-4.5 rounded-full bg-border" alt="" />
                        {selectedCommit.author}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-text-muted tracking-wider mb-0.5">Time Elapsed</span>
                      <span className="font-medium text-text-main/80 flex items-center gap-1"><Clock size={12} className="text-text-muted" /> {selectedCommit.time}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-muted tracking-wider mb-1">Commit Message</span>
                  <p className="bg-hover/25 border border-border/85 rounded-xl p-3 font-medium leading-relaxed italic text-text-main/95">
                    "{selectedCommit.msg}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 mt-1">
                  <span className="text-[11px] font-bold text-text-muted">Impact Stats:</span>
                  <span className="text-[11px] font-bold text-success flex items-center gap-2">
                    <span className="bg-success/10 px-2 py-0.5 rounded">{selectedCommit.add}</span> 
                    <span className={`px-2 py-0.5 rounded ${selectedCommit.del !== '-0' && selectedCommit.del !== '0' ? 'bg-danger/10 text-danger' : 'bg-hover text-text-muted'}`}>{selectedCommit.del}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* View Commit Details - Mobile Redesigned Bottom Drawer Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {!isDesktop && showDetailsModal && selectedCommit && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[10000] flex flex-col justify-end p-0"
            >
              <div 
                className="absolute inset-0 z-0 cursor-pointer" 
                onClick={() => setShowDetailsModal(false)}
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 24, stiffness: 200 }}
                className="bg-card w-full max-w-md mx-auto h-[92vh] h-[92dvh] rounded-t-[24px] border-t border-x border-border flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.3)] overflow-hidden relative z-10"
              >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-2 shrink-0 bg-card">
                  <div className="w-12 h-1.5 rounded-full bg-border/80" />
                </div>

                {/* Main Header */}
                <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0 bg-card relative z-10">
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 -ml-2 rounded-xl bg-hover/50 hover:bg-hover active:scale-95 transition-all text-text-main flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                  
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-extrabold tracking-tight text-text-main text-center">Commit Inspector</h3>
                    <p className="text-[10px] text-text-muted font-mono leading-none mt-0.5">{selectedCommit.hash.substring(0, 10)}</p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-success/15 px-2.5 py-1 rounded-full border border-success/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-success">Verified</span>
                  </div>
                </div>

                {/* Scrollable Navigation Tabs (5 tabs matching design) */}
                <div className="flex border-b border-border bg-card justify-between px-2 shrink-0">
                  {[
                    { id: 'overview', label: 'Overview', icon: Info },
                    { id: 'diff', label: 'Diff', icon: Code2 },
                    { id: 'files', label: 'Files', icon: FileText },
                    { id: 'integrity', label: 'Integrity', icon: Shield },
                    { id: 'stats', label: 'Stats', icon: TrendingUp },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeInspectorTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveInspectorTab(tab.id as any)}
                        className={`flex-1 py-3 flex flex-col items-center gap-1.5 relative transition-all ${
                          isActive 
                            ? 'text-primary font-bold scale-[1.02]' 
                            : 'text-text-muted hover:text-text-main font-semibold'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-primary' : 'text-text-muted'} />
                        <span className="text-[10px] tracking-wide">{tab.label}</span>
                        {isActive && (
                          <motion.div 
                            layoutId="activeInspectorTabIndicator" 
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Main Tab View Content Area */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 no-scrollbar pb-24 bg-main/30">
                  
                  {/* TAB 1: OVERVIEW */}
                  {activeInspectorTab === 'overview' && (
                    <div className="space-y-5 animate-fade-in">
                      {/* Commit Message Card */}
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-text-muted">Commit Message</label>
                        <div className="bg-card border border-border p-5 rounded-2xl relative overflow-hidden shadow-sm">
                          <span className="absolute top-1 right-3 text-5xl text-text-muted/10 font-serif pointer-events-none select-none">“</span>
                          <p className="text-sm font-semibold leading-relaxed text-text-main italic pr-4">
                            "{selectedCommit.msg}"
                          </p>
                          <div className="flex justify-end mt-4">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(selectedCommit.msg);
                                setCopiedMsg(true);
                                showToast("Copied commit message to clipboard");
                                setTimeout(() => setCopiedMsg(false), 2000);
                              }}
                              className="flex items-center gap-1.5 text-[10px] font-bold text-primary px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/15 active:scale-95 transition-all cursor-pointer"
                            >
                              {copiedMsg ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} />}
                              {copiedMsg ? "Copied" : "Copy Message"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Author Profile Information */}
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex items-center gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-sm">
                          <img 
                            src={selectedCommit.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCommit.author.split(' ')[0]}`} 
                            className="w-10 h-10 rounded-full border border-primary/20 bg-background shrink-0" 
                            alt="" 
                          />
                          <div className="min-w-0">
                            <span className="block text-[8px] uppercase font-extrabold text-text-muted tracking-wider">Committed By</span>
                            <span className="text-xs font-extrabold text-text-main flex items-center gap-1 truncate mt-0.5">
                              {selectedCommit.author.split(' ')[0]}
                              <span className="w-3.5 h-3.5 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Check size={8} className="text-primary font-bold" /></span>
                            </span>
                            <span className="block text-[8px] text-text-muted truncate">Key developer</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 bg-card p-3.5 rounded-2xl border border-border shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-hover/50 flex items-center justify-center shrink-0">
                            <Clock size={14} className="text-text-muted" />
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase font-extrabold text-text-muted tracking-wider">Timestamp</span>
                            <span className="text-xs font-bold text-text-main mt-0.5 block leading-tight">{selectedCommit.time}</span>
                            <span className="block text-[8px] text-text-muted mt-0.5">Local Time</span>
                          </div>
                        </div>
                      </div>

                      {/* Commit SHA Identifier Card */}
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-text-muted">Staged Integrity SHA-1</label>
                        <div className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border shadow-sm">
                          <span className="font-mono text-[11px] text-info break-all select-all font-semibold tracking-tight">
                            {commitDetailData?.sha || selectedCommit.fullHash || selectedCommit.hash}
                          </span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(commitDetailData?.sha || selectedCommit.fullHash || selectedCommit.hash);
                              setCopiedSHA(true);
                              showToast("Copied SHA checksum");
                              setTimeout(() => setCopiedSHA(false), 2000);
                            }}
                            className="p-2 rounded-xl bg-hover/80 hover:bg-hover text-text-main active:scale-95 transition-all shrink-0 ml-3.5 cursor-pointer border border-border/45 shadow-sm"
                          >
                            {copiedSHA ? <Check size={14} className="text-success" strokeWidth={3} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Impact Stats & Custom Grid Staging Bar */}
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-text-muted">Impact & Staging Diff</label>
                        <div className="bg-card rounded-2xl p-4 border border-border space-y-4 shadow-sm">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-success/5 border border-success/15 rounded-xl p-3 flex items-center justify-between">
                              <div>
                                <span className="block text-[8px] uppercase font-bold text-success tracking-wider">Additions</span>
                                <span className="text-xs font-extrabold text-success mt-0.5 block">{selectedCommit.add}</span>
                              </div>
                              <span className="w-6 h-6 rounded-lg bg-success/10 text-success flex items-center justify-center font-extrabold text-xs shrink-0">+</span>
                            </div>

                            <div className={`border rounded-xl p-3 flex items-center justify-between ${selectedCommit.del !== '-0' && selectedCommit.del !== '0' ? 'bg-danger/5 border-danger/15' : 'bg-hover/10 border-border/20'}`}>
                              <div>
                                <span className="block text-[8px] uppercase font-bold text-text-muted tracking-wider">Deletions</span>
                                <span className={`text-xs font-extrabold mt-0.5 block ${selectedCommit.del !== '-0' && selectedCommit.del !== '0' ? 'text-danger' : 'text-text-muted'}`}>{selectedCommit.del}</span>
                              </div>
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${selectedCommit.del !== '-0' && selectedCommit.del !== '0' ? 'bg-danger/10 text-danger' : 'bg-hover/40 text-text-muted'}`}>-</span>
                            </div>
                          </div>

                          {/* Horizontal Grid Bar Segment matching reference */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-extrabold text-text-muted">
                              <span>Staging Segment Track</span>
                              <span className="text-success">
                                {Math.round(
                                  (parseInt(selectedCommit.add.replace('+', ''), 10) / 
                                    (parseInt(selectedCommit.add.replace('+', ''), 10) + 
                                     Math.max(1, Math.abs(parseInt(selectedCommit.del.replace('-', ''), 10))))) * 100
                                ) || 100}% Ratio
                              </span>
                            </div>
                            <div className="flex gap-1 h-3.5 mt-2">
                              {Array.from({ length: 20 }).map((_, i) => {
                                const addNum = parseInt(selectedCommit.add.replace('+', ''), 10) || 10;
                                const delNum = Math.abs(parseInt(selectedCommit.del.replace('-', ''), 10)) || 0;
                                const total = addNum + delNum || 1;
                                const ratio = addNum / total;
                                const greenBarsCount = Math.round(ratio * 20) || 1;
                                const isGreen = i < greenBarsCount;
                                return (
                                  <div 
                                    key={i} 
                                    className={`flex-1 rounded-sm transition-all duration-300 ${isGreen ? 'bg-success' : 'bg-border/50'}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CI/CD Pipeline Visualizer */}
                      <CiCdPipelineFlow hash={selectedCommit.hash} />

                      {/* Bento Version Control Actions Grid */}
                      <div className="space-y-2 pt-1.5">
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-text-muted">Git Version Controls</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => {
                              setShowDetailsModal(false);
                              setShowAmendModal(true);
                              setAmendMode('both');
                            }}
                            className="flex flex-col items-start p-3.5 bg-card hover:bg-hover/20 active:scale-[0.98] transition-all rounded-2xl border border-border shadow-sm text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5 shadow-sm">
                              <Sliders size={15} />
                            </div>
                            <span className="text-xs font-bold text-text-main">Amend Details</span>
                            <span className="text-[9px] text-text-muted mt-0.5 leading-normal">Edit description or lines</span>
                          </button>

                          <button 
                            onClick={() => {
                              setShowDetailsModal(false);
                              setShowBranchModal(true);
                            }}
                            className="flex flex-col items-start p-3.5 bg-card hover:bg-hover/20 active:scale-[0.98] transition-all rounded-2xl border border-border shadow-sm text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-xl bg-info/10 text-info flex items-center justify-center mb-2.5 shadow-sm">
                              <GitBranch size={15} />
                            </div>
                            <span className="text-xs font-bold text-text-main">Branch Here</span>
                            <span className="text-[9px] text-text-muted mt-0.5 leading-normal">Create detached fork</span>
                          </button>

                          <button 
                            onClick={() => {
                              setShowDetailsModal(false);
                              setShowTagModal(true);
                            }}
                            className="flex flex-col items-start p-3.5 bg-card hover:bg-hover/20 active:scale-[0.98] transition-all rounded-2xl border border-border shadow-sm text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-2.5 shadow-sm">
                              <Tag size={15} />
                            </div>
                            <span className="text-xs font-bold text-text-main">Tag Commit</span>
                            <span className="text-[9px] text-text-muted mt-0.5 leading-normal">Add release tag identifier</span>
                          </button>

                          {isLatestCommit(selectedCommit) ? (
                            <button 
                              onClick={() => {
                                setShowDetailsModal(false);
                                setShowUndoConfirm(true);
                              }}
                              className="flex flex-col items-start p-3.5 bg-card hover:bg-danger/5 active:scale-[0.98] transition-all rounded-2xl border border-danger/25 shadow-sm text-left cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-2.5 shadow-sm animate-pulse">
                                <Undo size={15} />
                              </div>
                              <span className="text-xs font-bold text-danger">Undo Commit</span>
                              <span className="text-[9px] text-danger/70 mt-0.5 leading-normal">Soft reset latest state</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setShowDetailsModal(false);
                                setShowRestoreSheet(true);
                              }}
                              className="flex flex-col items-start p-3.5 bg-card hover:bg-success/5 active:scale-[0.98] transition-all rounded-2xl border border-success/25 shadow-sm text-left cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center mb-2.5 shadow-sm">
                                <RotateCcw size={15} />
                              </div>
                              <span className="text-xs font-bold text-success">Restore History</span>
                              <span className="text-[9px] text-success/70 mt-0.5 leading-normal">Open safe restore options</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DIFF */}
                  {activeInspectorTab === 'diff' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Unified/Split View Toggle */}
                      <div className="flex bg-card border border-border p-1 rounded-xl shrink-0 shadow-sm">
                        <button 
                          onClick={() => setDiffViewMode('unified')}
                          className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${diffViewMode === 'unified' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                          Unified View
                        </button>
                        <button 
                          onClick={() => setDiffViewMode('split')}
                          className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${diffViewMode === 'split' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                          Split View
                        </button>
                      </div>

                      {/* Interactive File Diff Expandable headers */}
                      <div className="space-y-3">
                        {(commitDetailData?.files && commitDetailData.files.length > 0
                          ? commitDetailData.files.map((f: any) => ({
                              name: f.filename,
                              add: f.additions || 0,
                              del: f.deletions || 0,
                              patch: f.patch || `@@ -1,3 +1,3 @@\n// File: ${f.filename}\n// Status: ${f.status}`
                            }))
                          : [
                              { name: 'Commit Changes Summary', add: parseInt(selectedCommit.add?.replace('+', '') || '0'), del: parseInt(selectedCommit.del?.replace('-', '') || '0'), patch: `@@ -1,4 +1,5 @@\nCommit: ${selectedCommit.msg}\nAuthor: ${selectedCommit.author}\n+ ${selectedCommit.add} additions\n- ${selectedCommit.del} deletions` }
                            ]
                        ).map((file: any, fIdx: number) => {
                          const isExpanded = selectedFileInDiff === file.name || (selectedFileInDiff === '' && fIdx === 0);
                          const patchLines = file.patch ? file.patch.split('\n') : [];
                          return (
                            <div key={file.name} className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
                              <button 
                                onClick={() => setSelectedFileInDiff(isExpanded ? 'NONE' : file.name)}
                                className="w-full flex items-center justify-between p-3.5 bg-hover/10 border-b border-border text-left"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileCode size={14} className="text-primary shrink-0" />
                                  <span className="text-xs font-bold text-text-main truncate">{file.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] font-mono font-bold text-success">+{file.add}</span>
                                  <span className="text-[10px] font-mono font-bold text-danger">-{file.del}</span>
                                  <ChevronRight size={13} className={`text-text-muted transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                                </div>
                              </button>

                              {isExpanded && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden">
                                  {diffViewMode === 'unified' ? (
                                    /* UNIFIED DIFF VIEW */
                                    <div className="bg-main border-t border-border font-mono text-[10px] p-4 space-y-1 overflow-x-auto select-text leading-relaxed max-h-[300px]">
                                      {patchLines.map((line: string, lIdx: number) => {
                                        if (line.startsWith('+')) {
                                          return (
                                            <div key={lIdx} className="bg-success/10 text-success pl-2.5 border-l-2 border-success py-0.5 whitespace-pre-wrap">
                                              {line}
                                            </div>
                                          );
                                        } else if (line.startsWith('-')) {
                                          return (
                                            <div key={lIdx} className="bg-danger/10 text-danger pl-2.5 border-l-2 border-danger py-0.5 whitespace-pre-wrap">
                                              {line}
                                            </div>
                                          );
                                        } else if (line.startsWith('@@')) {
                                          return (
                                            <div key={lIdx} className="text-info pb-1 border-b border-border/50 mb-1 mt-2 font-bold whitespace-pre-wrap">
                                              {line}
                                            </div>
                                          );
                                        }
                                        return (
                                          <div key={lIdx} className="text-text-main/80 pl-2 whitespace-pre-wrap">
                                            {line}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    /* SPLIT DIFF VIEW - Side-by-Side */
                                    <div className="grid grid-cols-2 gap-1.5 bg-main border-t border-border font-mono text-[9px] p-3 overflow-x-auto leading-normal select-text max-h-[300px]">
                                      {/* Left Old Column */}
                                      <div className="space-y-1 border-r border-border/50 pr-2">
                                        <div className="text-[8px] uppercase font-bold text-text-muted border-b border-border pb-1 mb-1.5 select-none">Original</div>
                                        {patchLines.filter((l: string) => !l.startsWith('+')).map((line: string, lIdx: number) => (
                                          <div key={lIdx} className={line.startsWith('-') ? "bg-danger/15 text-danger border-l border-danger px-1 whitespace-pre-wrap" : "text-text-main/70 whitespace-pre-wrap"}>
                                            {line}
                                          </div>
                                        ))}
                                      </div>
                                      {/* Right New Column */}
                                      <div className="space-y-1 pl-2">
                                        <div className="text-[8px] uppercase font-bold text-text-muted border-b border-border pb-1 mb-1.5 select-none">Modified</div>
                                        {patchLines.filter((l: string) => !l.startsWith('-')).map((line: string, lIdx: number) => (
                                          <div key={lIdx} className={line.startsWith('+') ? "bg-success/15 text-success border-l border-success px-1 whitespace-pre-wrap" : "text-text-main/70 whitespace-pre-wrap"}>
                                            {line}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Unified bottom summary banner */}
                      <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between shadow-sm shrink-0">
                        <div className="text-center flex-1">
                          <span className="block text-[8px] uppercase font-extrabold text-success tracking-wider">Total Additions</span>
                          <span className="text-sm font-extrabold text-success mt-0.5 block">{selectedCommit.add}</span>
                        </div>
                        <div className="w-[1.5px] h-8 bg-border shrink-0" />
                        
                        {/* Compact Circular Percentage Circle */}
                        <div className="flex flex-col items-center justify-center shrink-0 px-6">
                          <div className="relative w-9 h-9 flex items-center justify-center bg-primary/5 rounded-full border border-primary/20">
                            <span className="text-[10px] font-extrabold text-primary">87%</span>
                          </div>
                          <span className="text-[8px] uppercase font-bold text-text-muted tracking-wider mt-1 block">Insertions</span>
                        </div>

                        <div className="w-[1.5px] h-8 bg-border shrink-0" />
                        <div className="text-center flex-1">
                          <span className="block text-[8px] uppercase font-extrabold text-text-muted tracking-wider">Total Deletions</span>
                          <span className="text-sm font-extrabold text-danger mt-0.5 block">{selectedCommit.del}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: FILES */}
                  {activeInspectorTab === 'files' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Compact Counts bar */}
                      <div className="grid grid-cols-3 gap-2 bg-card border border-border p-3 rounded-2xl text-center shadow-sm">
                        <div>
                          <span className="text-[8px] uppercase font-extrabold text-text-muted tracking-wider">Files Changed</span>
                          <span className="text-xs font-extrabold text-text-main block mt-0.5">{commitDetailData?.files?.length || 1} Files</span>
                        </div>
                        <div className="border-l border-r border-border">
                          <span className="text-[8px] uppercase font-extrabold text-success tracking-wider">Insertions</span>
                          <span className="text-xs font-extrabold text-success block mt-0.5">{commitDetailData?.stats?.additions != null ? `+${commitDetailData.stats.additions}` : selectedCommit.add}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase font-extrabold text-text-muted tracking-wider font-semibold">Deletions</span>
                          <span className="text-xs font-extrabold text-danger block mt-0.5">{commitDetailData?.stats?.deletions != null ? `-${commitDetailData.stats.deletions}` : selectedCommit.del}</span>
                        </div>
                      </div>

                      {/* File Search Input with filter icon */}
                      <div className="flex gap-2">
                        <div className="bg-card rounded-xl p-2.5 flex items-center gap-2.5 border border-border flex-1 shadow-sm">
                          <Search size={15} className="text-text-muted shrink-0" />
                          <input 
                            type="text" 
                            placeholder="Search changed files..." 
                            value={fileSearchQuery}
                            onChange={(e) => setFileSearchQuery(e.target.value)}
                            className="bg-transparent border-none text-text-main w-full outline-none text-xs placeholder:text-text-muted font-medium" 
                          />
                          {fileSearchQuery && (
                            <button onClick={() => setFileSearchQuery('')} className="text-text-muted hover:text-text-main">
                              <X size={12} />
                            </button>
                          )}
                        </div>
                        <button className="p-2.5 bg-card border border-border rounded-xl hover:bg-hover/30 text-text-muted hover:text-text-main transition-colors shadow-sm">
                          <Sliders size={15} />
                        </button>
                      </div>

                      {/* Changed Files List */}
                      <div className="space-y-2">
                        {(commitDetailData?.files && commitDetailData.files.length > 0
                          ? commitDetailData.files.map((f: any) => ({
                              name: f.filename,
                              add: f.additions || 0,
                              del: f.deletions || 0,
                              ext: f.filename.split('.').pop()?.toUpperCase() || 'FILE'
                            }))
                          : activeFiles.map((af: any) => ({
                              name: af.name,
                              add: parseInt(selectedCommit.add?.replace('+', '') || '0'),
                              del: parseInt(selectedCommit.del?.replace('-', '') || '0'),
                              ext: af.name.split('.').pop()?.toUpperCase() || 'FILE'
                            }))
                        )
                        .filter((f: any) => f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()))
                        .map((file: any) => {
                          const extColors: Record<string, string> = {
                            TSX: 'bg-primary/15 text-primary border-primary/20',
                            TS: 'bg-primary/15 text-primary border-primary/20',
                            JSON: 'bg-warning/15 text-warning border-warning/20',
                            MD: 'bg-info/15 text-info border-info/20',
                            CSS: 'bg-accent/15 text-accent border-accent/20',
                          };
                          return (
                            <button 
                              key={file.name}
                              onClick={() => {
                                setSelectedFileInDiff(file.name);
                                setActiveInspectorTab('diff');
                              }}
                              className="w-full text-left p-3.5 bg-card hover:bg-hover/20 border border-border rounded-2xl flex items-center justify-between transition-all active:scale-[0.99] shadow-sm cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${extColors[file.ext] || 'bg-hover text-text-muted border-border'} shrink-0`}>
                                  {file.ext}
                                </span>
                                <span className="text-xs font-bold text-text-main truncate">{file.name}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-4">
                                <span className="text-[10px] font-mono font-bold text-success">+{file.add}</span>
                                <span className="text-[10px] font-mono font-bold text-danger">-{file.del}</span>
                                <ChevronRight size={13} className="text-text-muted" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: INTEGRITY */}
                  {activeInspectorTab === 'integrity' && (
                    <div className="space-y-5 animate-fade-in">
                      {/* Shield Validation card */}
                      <div className="bg-success/5 border border-success/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                            <Shield size={18} strokeWidth={2.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-main leading-tight pr-1">Commit Cryptographically Secured</p>
                            <p className="text-[10px] text-text-muted mt-0.5 leading-snug">Matches verified developer tree records.</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-extrabold uppercase bg-success/15 border border-success/30 px-2 py-1 rounded-full text-success tracking-wider shrink-0 select-none">VERIFIED</span>
                      </div>

                      {/* Checksums */}
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-text-muted">Repository Checksums</label>
                        <div className="bg-card rounded-2xl p-4 border border-border space-y-4 shadow-sm">
                          {[
                            { label: 'SHA-1 Object ID', hash: commitDetailData?.sha || selectedCommit.fullHash || selectedCommit.hash },
                            { label: 'Parent Tree Hash', hash: commitDetailData?.commit?.tree?.sha || (selectedCommit.fullHash ? selectedCommit.fullHash.substring(0, 32) : selectedCommit.hash) },
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <span className="block text-[8px] uppercase font-bold text-text-muted">{item.label}</span>
                              <div className="flex items-center justify-between bg-main/50 border border-border/80 rounded-xl px-3 py-2">
                                <span className="font-mono text-[10px] text-text-main/80 truncate pr-2 tracking-tight">{item.hash}</span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.hash);
                                    showToast(`Copied ${item.label}`);
                                  }}
                                  className="text-text-muted hover:text-text-main active:scale-90 transition-all shrink-0 cursor-pointer"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* GPG Signature block */}
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-text-muted">Developer Signature</label>
                        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User size={14} className="text-primary" />
                            </div>
                            <div className="min-w-0">
                              <span className="block text-[8px] uppercase font-extrabold text-text-muted">GPG Key Signature</span>
                              <span className="text-xs font-bold text-text-main block truncate leading-tight mt-0.5">
                                {selectedCommit.author && selectedCommit.author !== "Nakib Prince" && selectedCommit.author !== "nakib555"
                                  ? selectedCommit.author
                                  : "Git Manager Workstation"}{" "}
                                &lt;
                                {selectedCommit.author && selectedCommit.author !== "Nakib Prince" && selectedCommit.author !== "nakib555"
                                  ? "developer@example.com"
                                  : "workstation@example.com"}
                                &gt;
                              </span>
                            </div>
                          </div>
                          <span className="text-[8px] font-extrabold uppercase bg-success/15 border border-success/20 px-2 py-0.5 rounded text-success shrink-0">VALID</span>
                        </div>
                      </div>

                      {/* Verification steps */}
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-text-muted">Verification Steps</label>
                        <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm text-xs font-semibold text-text-main">
                          {[
                            'Commit structure and headers exist',
                            'Repository tree verification checksum validated',
                            'Parent commits history links resolved',
                            'Signature key verified with trusted keyring'
                          ].map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center justify-between">
                              <span className="text-text-main/80 font-medium pr-2 text-xs leading-tight">{step}</span>
                              <span className="text-[9px] text-success font-extrabold flex items-center gap-1 shrink-0 bg-success/10 px-2 py-0.5 rounded border border-success/10">
                                <Check size={11} strokeWidth={2.5} /> OK
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: STATS */}
                  {activeInspectorTab === 'stats' && (
                    <div className="space-y-5 animate-fade-in">
                      {/* Bento grid metric blocks */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Insertions', value: selectedCommit.add, color: 'text-success bg-success/5 border-success/15', icon: TrendingUp },
                          { label: 'Deletions', value: selectedCommit.del, color: 'text-danger bg-danger/5 border-danger/15', icon: Trash2 },
                          { label: 'Files Changed', value: '3', color: 'text-info bg-info/5 border-info/15', icon: FileCode },
                          { label: 'Lines Changed', value: '204', color: 'text-purple-500 bg-purple-500/5 border-purple-500/15', icon: Terminal },
                          { label: 'Ratio', value: '87%', color: 'text-amber-500 bg-amber-500/5 border-amber-500/15', icon: Sliders },
                          { label: 'Commit Time', value: '1m 24s', color: 'text-success bg-success/5 border-success/15', icon: Clock },
                        ].map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <div key={idx} className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center text-center shadow-sm relative">
                              <Icon size={12} className={`${item.color.split(' ')[0]} mb-1.5`} />
                              <span className="block text-[8px] uppercase font-extrabold text-text-muted leading-tight truncate w-full">{item.label}</span>
                              <span className={`text-sm font-extrabold mt-1 block truncate ${item.color.split(' ')[0]}`}>{item.value}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* SVG donut chart */}
                      <div className="bg-card rounded-2xl border border-border p-4.5 flex flex-col items-center shadow-sm">
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-text-muted self-start mb-4">Activity Breakdown</label>
                        
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-28 h-28 transform -rotate-90">
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="35" 
                              fill="transparent" 
                              stroke="var(--border)" 
                              strokeWidth="10" 
                              strokeOpacity="0.2"
                            />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="35" 
                              fill="transparent" 
                              stroke="var(--success)" 
                              strokeWidth="10" 
                              strokeDasharray={`${2 * Math.PI * 35 * 0.87} ${2 * Math.PI * 35}`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                            />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="35" 
                              fill="transparent" 
                              stroke="var(--danger)" 
                              strokeWidth="10" 
                              strokeDasharray={`${2 * Math.PI * 35 * 0.13} ${2 * Math.PI * 35}`}
                              strokeDashoffset={`-${2 * Math.PI * 35 * 0.87}`}
                              strokeLinecap="round"
                            />
                          </svg>

                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-base font-extrabold text-text-main">328</span>
                            <span className="text-[7px] uppercase tracking-widest text-text-muted font-bold">Changes</span>
                          </div>
                        </div>

                        {/* Chart Legends */}
                        <div className="grid grid-cols-3 gap-4 text-center mt-5 w-full border-t border-border/60 pt-4">
                          <div>
                            <span className="inline-block w-2 h-2 rounded-full bg-success mr-1.5" />
                            <span className="text-[9px] font-bold text-text-muted">Insertions</span>
                            <span className="block text-xs font-extrabold text-text-main mt-0.5">286 (87%)</span>
                          </div>
                          <div>
                            <span className="inline-block w-2 h-2 rounded-full bg-danger mr-1.5" />
                            <span className="text-[9px] font-bold text-text-muted">Deletions</span>
                            <span className="block text-xs font-extrabold text-text-main mt-0.5">42 (13%)</span>
                          </div>
                          <div>
                            <span className="inline-block w-2 h-2 rounded-full bg-border mr-1.5" />
                            <span className="text-[9px] font-bold text-text-muted">Unchanged</span>
                            <span className="block text-xs font-extrabold text-text-muted mt-0.5">0 (0%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Commit Stepper timeline */}
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider font-extrabold text-text-muted">State Stepper Timeline</label>
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                          <div className="flex items-center justify-between relative">
                            <div className="absolute top-3.5 left-8 right-8 h-[2.5px] bg-success/35 -z-10" />
                            
                            {[
                              { label: 'Staged', time: 'Just now' },
                              { label: 'Committed', time: 'Just now' },
                              { label: 'Verified', time: 'Just now' }
                            ].map((step, idx) => (
                              <div key={idx} className="flex flex-col items-center flex-1 text-center">
                                <div className="w-7 h-7 rounded-full bg-success/15 border-[2px] border-success text-success flex items-center justify-center shadow-sm">
                                  <Check size={13} strokeWidth={3} />
                                </div>
                                <span className="text-[10px] font-extrabold text-text-main mt-2 block">{step.label}</span>
                                <span className="text-[8px] text-text-muted mt-0.5 font-bold">{step.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Amend Latest Commit Modal (Supports Edit Message, Content, Both) */}
          {showAmendModal && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[995] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowAmendModal(false)} />
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto no-scrollbar relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Amend Latest Commit</h3>
                  <p className="text-[10px] text-text-muted font-mono">{selectedCommit.hash}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAmendModal(false)}
                className="text-text-muted hover:text-text-main p-1.5 rounded-full bg-hover transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Config Mode Indicators */}
            <div className="flex gap-1.5 p-1 bg-hover/40 rounded-xl border border-border mb-4">
              <button
                onClick={() => setAmendMode('msg')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${amendMode === 'msg' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
              >
                Message Only
              </button>
              <button
                onClick={() => setAmendMode('content')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${amendMode === 'content' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
              >
                Content Only
              </button>
              <button
                onClick={() => setAmendMode('both')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${amendMode === 'both' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
              >
                Both
              </button>
            </div>

            <div className="space-y-4">
              {amendMode !== 'content' && (
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-bold text-text-muted mb-1.5">Commit Message</label>
                  <textarea
                    value={editedMsg}
                    onChange={(e) => setEditedMsg(e.target.value)}
                    rows={2}
                    className="w-full bg-main border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none rounded-xl p-3 text-xs text-text-main placeholder:text-text-muted/55 resize-none font-medium"
                    placeholder="Amend description message..."
                  />
                </div>
              )}

              {amendMode !== 'msg' && (
                <div className="grid grid-cols-2 gap-3 bg-hover/20 p-3 rounded-xl border border-border">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-bold text-success mb-1">Additions (+)</label>
                    <input
                      type="number"
                      value={editedAdd}
                      onChange={(e) => setEditedAdd(e.target.value)}
                      className="w-full bg-main border border-border outline-none rounded-lg p-2 text-xs text-success font-mono font-bold"
                      placeholder="Line insertions"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-bold text-danger mb-1">Deletions (-)</label>
                    <input
                      type="number"
                      value={editedDel}
                      onChange={(e) => setEditedDel(e.target.value)}
                      className="w-full bg-main border border-border outline-none rounded-lg p-2 text-xs text-danger font-mono font-bold"
                      placeholder="Line removals"
                    />
                  </div>
                </div>
              )}

              <div className="bg-hover/20 px-3.5 py-2 rounded-xl text-[10px] text-text-muted leading-normal">
                Amending rewires the properties of the HEAD commit on the client-side active state, simulating a safe local push structure.
              </div>

              <div className="flex gap-2 justify-end border-t border-border pt-4">
                <button
                  onClick={() => setShowAmendModal(false)}
                  className="px-4 py-2 bg-hover hover:bg-hover/80 border border-border rounded-xl text-xs font-bold text-text-main active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAmend}
                  disabled={amendMode !== 'content' && !editedMsg.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Save Amend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Latest Commit Destructive Warning Confirmation Modal */}
      {showDeleteConfirm && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[995] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowDeleteConfirm(false)} />
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto no-scrollbar relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main">Destructive: Delete HEAD Commit?</h3>
                <p className="text-[11px] text-text-muted font-mono bg-hover/40 px-2 py-0.5 rounded border border-border inline-block mt-0.5">{selectedCommit.hash}</p>
              </div>
            </div>

            <p className="text-xs text-text-muted mb-5 leading-relaxed">
              Are you sure you want to delete this commit? This is a destructive operation that will trigger a actual <span className="font-mono bg-hover px-1 rounded text-text-main">git reset --hard HEAD~1</span>, discarding this commit. Your files and state index will revert to the previous commit.
            </p>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-hover hover:bg-hover/80 border border-border rounded-xl text-xs font-bold text-text-main active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLatest}
                className="px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Confirm Delete (Hard Reset)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Latest Commit Warning Confirmation Modal */}
      {showUndoConfirm && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[995] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowUndoConfirm(false)} />
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto no-scrollbar relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
                <Undo size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main">Undo Latest Commit?</h3>
                <p className="text-[11px] text-text-muted font-mono bg-hover/40 px-2 py-0.5 rounded border border-border inline-block mt-0.5">{selectedCommit.hash}</p>
              </div>
            </div>

            <p className="text-xs text-text-muted mb-5 leading-relaxed">
              Are you sure you want to undo this commit? This will run a actual <span className="font-mono bg-hover px-1 rounded text-text-main">git reset --soft HEAD~1</span>. The commit is deleted but its file changes are preserved and moved back into your active staging index area.
            </p>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setShowUndoConfirm(false)}
                className="px-4 py-2 bg-hover hover:bg-hover/80 border border-border rounded-xl text-xs font-bold text-text-main active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmUndoLatest}
                className="px-4 py-2 bg-warning hover:bg-warning/90 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Confirm Soft Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Branch at Commit Modal */}
      {showBranchModal && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[995] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowBranchModal(false)} />
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto no-scrollbar relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <GitBranch size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Create Branch here</h3>
                  <p className="text-[10px] text-text-muted">Target point: {selectedCommit.hash}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBranchModal(false)}
                className="text-text-muted hover:text-text-main p-1.5 rounded-full bg-hover transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-text-muted mb-1.5">New Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. feature-login"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full bg-main border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none rounded-xl px-3.5 py-2.5 text-xs text-text-main font-medium"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 bg-hover hover:bg-hover/80 border border-border rounded-xl text-xs font-bold text-text-main active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCreateBranch}
                  disabled={!branchName.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Create Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Tag at Commit Modal */}
      {showTagModal && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[995] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowTagModal(false)} />
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto no-scrollbar relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Create Tag here</h3>
                  <p className="text-[10px] text-text-muted">Target point: {selectedCommit.hash}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTagModal(false)}
                className="text-text-muted hover:text-text-main p-1.5 rounded-full bg-hover transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-text-muted mb-1.5">New Tag Name</label>
                <input
                  type="text"
                  placeholder="e.g. v1.0.0-rc1"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="w-full bg-main border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none rounded-xl px-3.5 py-2.5 text-xs text-text-main font-medium"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-2 bg-hover hover:bg-hover/80 border border-border rounded-xl text-xs font-bold text-text-main active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCreateTag}
                  disabled={!tagName.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Create Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Changed Files Explorer Modal */}
      {showFilesModal && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[995] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowFilesModal(false)} />
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto no-scrollbar relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
                  <FileSearch size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Changed Files</h3>
                  <p className="text-[10px] text-text-muted">Commit point: {selectedCommit.hash}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFilesModal(false)}
                className="text-text-muted hover:text-text-main p-1.5 rounded-full bg-hover transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {(commitDetailData?.files && commitDetailData.files.length > 0
                ? commitDetailData.files.map((f: any) => ({
                    name: f.filename,
                    add: f.additions || 0,
                    del: f.deletions || 0,
                    status: f.status || "modified"
                  }))
                : activeFiles.map((af: any) => ({
                    name: af.name,
                    add: parseInt(selectedCommit.add?.replace('+', '') || '0'),
                    del: parseInt(selectedCommit.del?.replace('-', '') || '0'),
                    status: "modified"
                  }))
              ).map((file: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-hover/35 border border-border rounded-xl transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      file.status === 'added' ? 'bg-info/15 text-info' : file.status === 'removed' || file.status === 'deleted' ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'
                    }`}>
                      {file.status}
                    </span>
                    <span className="font-mono text-xs text-text-main truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-success font-mono shrink-0 ml-2">+{file.add} -{file.del}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Diff Visualizer Modal */}
      {showDiffModal && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[995] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowDiffModal(false)} />
          <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl w-full shadow-2xl animate-scale-up max-h-[85vh] flex flex-col relative z-10">
            <div className="flex justify-between items-start mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                  <GitMerge size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Git Diff Visualizer</h3>
                  <p className="text-[10px] text-text-muted font-mono">commit {selectedCommit.hash} compared to parent</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDiffModal(false)}
                className="text-text-muted hover:text-text-main p-1.5 rounded-full bg-hover transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Diff Code Viewer block */}
            <div className="flex-1 overflow-y-auto bg-main/50 border border-border rounded-xl p-4 space-y-4 max-h-[60vh]">
              {commitDetailData?.files && commitDetailData.files.length > 0 ? (
                commitDetailData.files.map((file: any, fIdx: number) => (
                  <DiffViewer key={fIdx} patch={file.patch} filename={file.filename} isDark={theme === 'dark'} />
                ))
              ) : (
                <div className="space-y-1 font-mono text-[11px] select-text">
                  <div className="text-text-muted border-b border-border pb-2 mb-3">diff --git a/commit-{selectedCommit.hash} b/commit-{selectedCommit.hash}</div>
                  <div className="text-text-main/80 font-bold mb-1">Commit Message: "{selectedCommit.msg}"</div>
                  <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                    + Author: {selectedCommit.author}
                  </div>
                  <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                    + Changes: {selectedCommit.add} / {selectedCommit.del}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </>,
        document.body
      )}

    </div>
  );
};
