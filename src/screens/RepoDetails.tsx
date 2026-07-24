import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppContext } from '../AppContext';
import { Home, FileCode, FileText, Copy, GitMerge, AlertTriangle, GitPullRequest, Search, Folder, GitCommit, GitBranch, Edit2, Trash2, Check, X, MoreVertical, Undo, Eye, BookOpen, FileSearch, Tag, RotateCcw, HelpCircle, Terminal, Sliders, Clock, User } from 'lucide-react';

const getLanguageColor = (lang: string | null) => {
  if (!lang) return '#8F8F9D';
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Rust: '#DEA584',
    Swift: '#F05138',
    Go: '#00ADD8',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
  };
  return colors[lang] || '#8F8F9D';
};

const SkeletonDetails: React.FC<{ screen: string }> = ({ screen }) => {
  if (screen === 'files') {
    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[60vh] animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="px-4 py-4 border-b border-border flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-border/60"></div>
          <div className="w-2 bg-border/40 h-3 rounded"></div>
          <div className="w-20 bg-border/60 h-3.5 rounded"></div>
          <div className="w-2 bg-border/40 h-3 rounded"></div>
          <div className="w-24 bg-border/45 h-3.5 rounded"></div>
        </div>
        {/* Pills Skeleton */}
        <div className="flex p-3 gap-2 border-b border-border bg-hover/10 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-2.5 rounded-full bg-border/50 border border-border/20 w-24 h-7 shrink-0"></div>
          ))}
        </div>
        {/* Code Content Area Skeleton */}
        <div className="flex-1 p-5 bg-hover/5 flex flex-col gap-3 font-mono">
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">1</div>
            <div className="w-[80%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">2</div>
            <div className="w-[50%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">3</div>
            <div className="w-[60%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">4</div>
            <div className="w-[30%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">5</div>
            <div className="w-[75%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">6</div>
            <div className="w-[40%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">7</div>
            <div className="w-[55%] bg-border/50 h-3 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'commits') {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {/* Staging Button Card Skeleton */}
        <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3.5">
          <div className="w-32 bg-border/50 h-3.5 rounded"></div>
          <div className="w-28 bg-border/60 h-8 rounded-xl"></div>
        </div>

        {/* Timeline Commits Skeleton */}
        <div className="pl-5 border-l-2 border-border/60 relative flex flex-col gap-7 pt-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative">
              {/* Timeline circle marker */}
              <div className="absolute -left-[27px] top-1.5 w-3 h-3 bg-main border-2 border-border/70 rounded-full z-10"></div>
              
              {/* Commit Hash badge skeleton */}
              <div className="w-20 bg-border/40 border border-border/20 h-6 rounded-lg mb-2"></div>
              
              {/* Commit Message skeleton */}
              <div className="w-[70%] bg-border/60 h-4 rounded mb-2.5"></div>
              
              {/* Commit Author and Meta skeleton */}
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-border/60"></div>
                  <div className="w-24 bg-border/50 h-3 rounded"></div>
                  <div className="w-12 bg-border/30 h-3 rounded"></div>
                </div>
                <div className="w-16 bg-border/60 h-3 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'branches') {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        {/* Search Bar Skeleton */}
        <div className="bg-card rounded-xl p-3.5 h-11 border border-border flex items-center gap-3">
          <div className="w-5 h-5 bg-border/50 rounded"></div>
          <div className="w-32 bg-border/40 h-3 rounded"></div>
        </div>
        {/* Branch main Card Skeleton */}
        <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3.5">
          <div className="w-28 bg-border/50 h-3.5 rounded"></div>
          <div className="w-24 bg-border/60 h-8 rounded-xl"></div>
        </div>
        {/* Branch lists Skeleton */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-border/50 rounded"></div>
                  <div className="w-24 bg-border/60 h-3.5 rounded"></div>
                </div>
                {i === 1 && <div className="w-14 bg-border/40 h-5 rounded-full"></div>}
              </div>
              <div className="w-32 bg-border/40 h-3 rounded mt-0.5"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'prs') {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        {/* Tabs Skeleton */}
        <div className="flex border-b border-border gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-3.5 flex items-center gap-1.5 border-b-2 border-transparent w-20">
              <div className="w-10 bg-border/60 h-4 rounded"></div>
              <div className="w-6 bg-border/40 h-4.5 rounded-full"></div>
            </div>
          ))}
        </div>
        {/* Merge Button Card Skeleton */}
        <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3.5">
          <div className="w-36 bg-border/50 h-3.5 rounded"></div>
          <div className="w-24 bg-border/60 h-8 rounded-xl"></div>
        </div>
        {/* PR List Skeleton */}
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 p-4 border border-border rounded-2xl bg-card">
              <div className="w-5 h-5 bg-border/50 rounded-full shrink-0 mt-0.5"></div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="w-[75%] bg-border/60 h-4 rounded"></div>
                <div className="w-36 bg-border/40 h-3 rounded"></div>
                <div className="flex justify-between items-center mt-2">
                  <div className="w-5 h-5 rounded-full bg-border/50"></div>
                  <div className="w-14 bg-border/40 h-5 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'insights') {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        {/* 3 Metric cards grid skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-4 border border-border flex flex-col items-center text-center gap-1.5">
              <div className="w-10 bg-border/40 h-2.5 rounded"></div>
              <div className="w-8 bg-border/60 h-5 rounded mt-1"></div>
            </div>
          ))}
        </div>

        {/* Chart Card Skeleton */}
        <div className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-3">
          <div className="w-24 bg-border/50 h-3 rounded"></div>
          <div className="h-[120px] bg-border/10 rounded-xl flex items-end p-2 gap-2">
            {[20, 45, 30, 80, 50, 65, 40, 90, 35, 75, 50, 60].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-border/25 rounded-t animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 75}ms` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Languages breakdown skeleton */}
        <div className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-3">
          <div className="w-20 bg-border/50 h-3 rounded mb-1"></div>
          <div className="flex items-center justify-between">
            {/* Donut skeleton */}
            <div className="w-[92px] h-[92px] rounded-full border-[14px] border-border/25 flex items-center justify-center shrink-0"></div>
            {/* Legend list skeleton */}
            <div className="flex-1 flex flex-col gap-2.5 max-w-[50%] mt-1 ml-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-border/50"></div>
                    <div className="w-14 bg-border/60 h-3 rounded"></div>
                  </div>
                  <div className="w-8 bg-border/40 h-3 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export const RepoDetails: React.FC = () => {
  const { currentScreen, isLoadingRepoDetails, currentRepo, navigate } = useAppContext();

  if (!currentRepo) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center flex flex-col items-center justify-center my-12 mx-5 animate-fade-up">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Folder size={24} />
        </div>
        <h3 className="font-semibold text-text-main mb-1 text-sm">No Repository Selected</h3>
        <p className="text-xs text-text-muted max-w-[280px] mb-4">Please select a repository from the list to view its commits, pull requests, files, and branch details.</p>
        <button
          onClick={() => navigate('repos')}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          View Repositories
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {isLoadingRepoDetails ? (
        <SkeletonDetails screen={currentScreen} />
      ) : (
        <>
          {currentScreen === 'files' && <FilesScreen />}
          {currentScreen === 'commits' && <CommitsScreen />}
          {currentScreen === 'branches' && <BranchesScreen />}
          {currentScreen === 'insights' && <InsightsScreen />}
          {currentScreen === 'prs' && <PRsScreen />}
        </>
      )}
    </div>
  );
};

const FilesScreen = () => {
  const { activeFiles, currentRepo, githubToken, currentRepoOwner } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  const getSimulatedCode = (fileName: string) => {
    if (!fileName) return '// Select a file to view content';
    if (fileName.toLowerCase().endsWith('.md')) {
      return `# ${currentRepo || 'Repository'}\n\nNo detailed documentation added yet.`;
    }
    return `// Content for ${fileName}\n// No preview content available for this file.`;
  };

  const filesToDisplay = activeFiles;
  const activeFileName = selectedFile || filesToDisplay[0]?.name || '';

  React.useEffect(() => {
    const fileName = selectedFile || filesToDisplay[0]?.name;
    if (!fileName) return;

    if (githubToken && currentRepoOwner && currentRepoOwner !== 'mock') {
      const fetchFileContent = async () => {
        setIsLoadingFile(true);
        try {
          const headers = {
            Authorization: githubToken.startsWith('ghp_') || githubToken.startsWith('github_pat_') || githubToken.startsWith('gho_')
              ? `Bearer ${githubToken}`
              : `token ${githubToken}`
          };
          const res = await fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/contents/${fileName}`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.encoding === 'base64') {
              const decoded = decodeURIComponent(atob(data.content.replace(/\s/g, '')).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              setFileContent(decoded);
            } else {
              setFileContent(data.content || '');
            }
          } else {
            setFileContent(`// Error loading file from GitHub (status ${res.status})`);
          }
        } catch (err: any) {
          console.error(err);
          setFileContent(`// Error loading file: ${err.message || err}`);
        } finally {
          setIsLoadingFile(false);
        }
      };
      fetchFileContent();
    } else {
      setFileContent(getSimulatedCode(fileName));
    }
  }, [selectedFile, filesToDisplay, githubToken, currentRepo, currentRepoOwner]);

  if (filesToDisplay.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center flex flex-col items-center justify-center my-4">
        <Folder size={32} className="text-text-muted mb-2" />
        <p className="font-semibold text-sm mb-1 text-text-main">No files found</p>
        <p className="text-xs text-text-muted max-w-[260px]">This repository currently has no files loaded.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[60vh]">
      <div className="px-4 py-3.5 text-xs text-text-muted border-b border-border flex items-center gap-1.5 font-medium">
        <Home size={14} className="text-primary" /> / <span className="text-text-main font-semibold">{currentRepo || 'repo'}</span> / <span className="text-text-main font-semibold">{activeFileName}</span>
      </div>
      <div className="flex overflow-x-auto p-3 gap-2 border-b border-border bg-hover/20 no-scrollbar shrink-0">
        {filesToDisplay.map(file => {
          const isSelected = activeFileName === file.name;
          const Icon = file.type === 'dir' ? Folder : file.name.endsWith('.md') ? FileText : FileCode;
          const iconColor = file.type === 'dir' ? 'text-info' : 'text-primary';
          return (
            <div 
              key={file.name}
              onClick={() => {
                if (file.type === 'file') {
                  setSelectedFile(file.name);
                }
              }}
              className={`border px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${isSelected ? 'border-primary/40 text-primary bg-primary/10 shadow-sm' : 'border-border text-text-muted bg-card hover:border-text-muted/40'}`}
            >
              <Icon size={13} className={iconColor} /> {file.name}
            </div>
          );
        })}
      </div>
      <div className="flex-1 font-mono text-[11px] leading-relaxed p-4 overflow-auto bg-hover/10">
        {isLoadingFile ? (
          <div className="flex items-center justify-center h-full gap-2 text-text-muted">
            <span className="w-4 h-4 rounded-full border border-primary border-t-transparent animate-spin"></span>
            Loading file contents from GitHub...
          </div>
        ) : (
          fileContent.trim().split('\n').map((line, idx) => (
            <div key={idx} className="flex">
              <span className="text-[#4B4B5E] w-6 select-none shrink-0">{idx + 1}</span>
              <span className="text-text-main/90 whitespace-pre">{line}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CommitsScreen = () => {
  const { 
    activeCommits, 
    openModal, 
    deleteCommit, 
    amendLatestCommit, 
    undoLatestCommit, 
    restoreFilesToCommit, 
    resetBranchToCommit, 
    createBranchAtCommit, 
    createTagAtCommit, 
    showToast 
  } = useAppContext();

  const rowVirtualizer = useVirtualizer({
    count: activeCommits.length,
    getScrollElement: () => typeof document !== 'undefined' ? document.getElementById('mobile-scroll-container') : null,
    estimateSize: () => 110,
    overscan: 5,
  });
  
  // Interactive Dialog and Action Sheet States
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  
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
    setShowActionSheet(true);
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
    runGitCommand(`git reset --hard ${selectedCommit.hash} (Force push simulated)`, () => {
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
      <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3 mb-1">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Ready to record state?</span>
        <button 
          onClick={() => openModal('commit')}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <GitCommit size={14} strokeWidth={2.5} /> Commit Changes
        </button>
      </div>

      <div className="pl-5 border-l-2 border-border relative pt-2" style={{ height: activeCommits.length > 0 ? `${rowVirtualizer.getTotalSize()}px` : 'auto' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const commit = activeCommits[virtualRow.index];
          const idx = virtualRow.index;
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingLeft: '1.25rem', // pl-5 equivalent for positioning children correctly relative to the line
                paddingBottom: '1.5rem', // gap-6 equivalent
              }}
            >
              <CommitItem 
                hash={commit.hash} 
                msg={commit.msg} 
                author={commit.author} 
                time={commit.time} 
                add={commit.add} 
                del={commit.del} 
                isPrimary={idx === 0} 
                avatar={commit.avatar}
                onActionTrigger={() => handleOpenActions(commit)}
              />
            </div>
          );
        })}
        {activeCommits.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs font-semibold uppercase tracking-wider">No commits yet. Make your first staging commit!</div>
        )}
      </div>

      {/* Git Operation Action Progress overlay loader */}
      {gitOperationMessage && (
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
        </div>
      )}

      {/* Custom Bottom Action Sheet for Commit Actions */}
      {showActionSheet && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[990] flex items-end justify-center animate-fade-in p-0 sm:p-4">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowActionSheet(false)}
          />
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl z-[991] flex flex-col max-h-[90vh] overflow-hidden animate-slide-up relative">
            
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              
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
          </div>
        </div>
      )}

      {/* Secondary Bottom Sheet: Restore to This Commit Options */}
      {showRestoreSheet && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[990] flex items-end justify-center animate-fade-in p-0 sm:p-4">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowRestoreSheet(false)}
          />
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl z-[991] flex flex-col max-h-[90vh] overflow-hidden animate-slide-up relative">
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

            <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
              
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
                  Moves the active branch pointer directly to <span className="font-mono text-text-main/80 font-bold">{selectedCommit.hash}</span>, completely removing later commits. <span className="text-danger font-medium font-bold">WARNING:</span> This rewrites branch logs and may require a force push.
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
          </div>
        </div>
      )}

      {/* View Commit Details Modal */}
      {showDetailsModal && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[995] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
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
                  <span className="font-mono font-medium text-info break-all select-all">{selectedCommit.hash}8b4c9ea92df4762cf1b8d23</span>
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
          </div>
        </div>
      )}

      {/* Amend Latest Commit Modal (Supports Edit Message, Content, Both) */}
      {showAmendModal && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[995] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up">
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
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up">
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
              Are you sure you want to delete this commit? This is a destructive operation that will trigger a simulated <span className="font-mono bg-hover px-1 rounded text-text-main">git reset --hard HEAD~1</span>, discarding this commit. Your files and state index will revert to the previous commit.
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
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up">
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
              Are you sure you want to undo this commit? This will run a simulated <span className="font-mono bg-hover px-1 rounded text-text-main">git reset --soft HEAD~1</span>. The commit is deleted but its file changes are preserved and moved back into your active staging index area.
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
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up">
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
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up">
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
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-up">
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
              <div className="flex items-center justify-between p-2.5 hover:bg-hover/35 border border-border rounded-xl transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded uppercase">Modified</span>
                  <span className="text-xs font-mono text-text-main">src/screens/RepoDetails.tsx</span>
                </div>
                <span className="text-[10px] font-bold text-success font-mono">+124 -12</span>
              </div>

              <div className="flex items-center justify-between p-2.5 hover:bg-hover/35 border border-border rounded-xl transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded uppercase">Modified</span>
                  <span className="text-xs font-mono text-text-main">src/AppContext.tsx</span>
                </div>
                <span className="text-[10px] font-bold text-success font-mono">+48 -4</span>
              </div>

              <div className="flex items-center justify-between p-2.5 hover:bg-hover/35 border border-border rounded-xl transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded uppercase font-bold text-info bg-info/10">Added</span>
                  <span className="text-xs font-mono text-text-main">src/components/ActionSheets.tsx</span>
                </div>
                <span className="text-[10px] font-bold text-success font-mono">+32 -0</span>
              </div>

              <div className="flex items-center justify-between p-2.5 hover:bg-hover/35 border border-border rounded-xl transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-danger/15 text-danger px-1.5 py-0.5 rounded uppercase font-bold text-danger">Deleted</span>
                  <span className="text-xs font-mono text-text-main">src/old_styles.css</span>
                </div>
                <span className="text-[10px] font-bold text-danger font-mono">+0 -214</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diff Visualizer Modal */}
      {showDiffModal && selectedCommit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[995] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl w-full shadow-2xl animate-scale-up max-h-[85vh] flex flex-col">
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

            {/* Simulated Diff Code Viewer block */}
            <div className="flex-1 overflow-y-auto bg-main border border-border rounded-xl font-mono text-[11px] p-4 space-y-2 select-text">
              <div className="text-text-muted border-b border-border pb-2 mb-3">diff --git a/src/screens/RepoDetails.tsx b/src/screens/RepoDetails.tsx</div>
              
              <div className="bg-danger/10 text-danger pl-2.5 py-0.5 whitespace-pre">
                - const oldCommit = activeCommits.find(c =&gt; c.hash === target);
              </div>
              <div className="bg-danger/10 text-danger pl-2.5 py-0.5 whitespace-pre">
                - deleteCommit(oldCommit.hash);
              </div>
              
              <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                + const targetCommit = activeCommits.find(c =&gt; c.hash === target);
              </div>
              <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                + if (isLatestCommit(targetCommit)) &#123;
              </div>
              <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                +   deleteCommit(targetCommit.hash);
              </div>
              <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                + &#125; else &#123;
              </div>
              <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                +   showToast("Dangerous: cannot modify historical commits without rewriting!");
              </div>
              <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                + &#125;
              </div>

              <div className="text-text-muted pt-3 border-t border-border mt-3 pb-2">diff --git a/src/AppContext.tsx b/src/AppContext.tsx</div>
              <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                + const restoreFilesToCommit = (hash: string) =&gt; &#123; ... &#125;
              </div>
              <div className="bg-success/10 text-success pl-2.5 py-0.5 whitespace-pre border-l-4 border-success/60">
                + const resetBranchToCommit = (hash: string) =&gt; &#123; ... &#125;
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const CommitItem = ({ hash, msg, author, time, add, del, isPrimary = false, avatar, onActionTrigger }: any) => {
  return (
    <div className="relative group/commit">
      {/* Timeline Bullet Indicator */}
      <div className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 bg-main border-2 rounded-full z-10 transition-colors ${isPrimary ? 'border-primary' : 'border-text-muted'}`}></div>
      
      <div className="flex justify-between items-start mb-1 gap-2">
        <div className="flex items-center gap-1.5">
          <div className="font-mono font-bold inline-flex items-center px-2 py-0.5 bg-card border border-border rounded-lg text-xs text-primary">
            {hash}
          </div>
          {isPrimary && (
            <span className="text-[9px] uppercase font-extrabold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded">
              Latest
            </span>
          )}
        </div>
        
        {/* Actions Button */}
        <button 
          onClick={onActionTrigger}
          className="p-1 rounded-lg bg-hover border border-border/80 hover:bg-hover/80 text-text-muted hover:text-text-main transition-all cursor-pointer active:scale-90"
          title="Commit Actions"
        >
          <MoreVertical size={13} />
        </button>
      </div>

      <div className="text-xs text-text-main font-semibold mb-2 leading-relaxed pl-0.5 mt-1.5">{msg}</div>
      <div className="text-[10px] text-text-muted flex justify-between items-center pl-0.5">
        <div className="flex items-center gap-1.5">
          <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.split(' ')[0]}`} className="w-4.5 h-4.5 rounded-full bg-border" alt="" /> 
          <span className="font-bold text-text-main/75">{author}</span> · {time}
        </div>
        <span className="text-[10px] font-bold text-success flex items-center gap-1">
          {add} <span className={del !== '-0' && del !== '0' ? 'text-danger' : 'text-text-muted'}>{del}</span>
        </span>
      </div>
    </div>
  );
};

const BranchesScreen = () => {
  const { activeBranches, openModal } = useAppContext();
  const [search, setSearch] = useState('');

  const filteredBranches = activeBranches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="bg-card rounded-xl p-3 flex items-center gap-3 mb-4 border border-border">
        <Search size={20} className="text-text-muted" />
        <input 
          type="text" 
          placeholder="Search branches..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-text-main w-full outline-none text-sm placeholder:text-text-muted" 
        />
      </div>
      <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3 mb-4">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Branch from main</span>
        <button 
          onClick={() => openModal('branch')}
          className="bg-info text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <GitBranch size={14} strokeWidth={2.5} /> New Branch
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {filteredBranches.map(branch => (
          <BranchLabel 
            key={branch.name} 
            title={branch.name} 
            desc={branch.desc || 'Active branch'} 
            isDefault={branch.isDefault} 
            borderColor={branch.borderColor} 
          />
        ))}
        {filteredBranches.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs font-semibold uppercase tracking-wider">No branches found matching your search.</div>
        )}
      </div>
    </>
  );
};

const BranchLabel = ({ title, desc, isDefault = false, borderColor = 'transparent' }: any) => (
  <div 
    className="flex flex-col gap-1 bg-card p-3.5 rounded-2xl border transition-all" 
    style={{ borderColor: borderColor !== 'transparent' ? borderColor : 'var(--border)' }}
  >
    <div className="text-[14px] font-bold flex items-center justify-between text-text-main">
      <span className="flex items-center gap-1.5"><GitBranch size={14} className="text-primary" /> {title}</span>
      {isDefault && <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-info/10 text-info border border-info/20 font-bold">Default</span>}
    </div>
    <span className="text-[11px] text-text-muted font-medium">{desc}</span>
  </div>
);

const InsightsScreen = () => {
  const { activeLanguages, activeCommits, activePRs } = useAppContext();

  const commitCount = activeCommits.length;
  const uniqueAuthors = new Set(activeCommits.map(c => c.author)).size;
  const mergedPRsCount = activePRs.filter(pr => pr.status === 'Merged').length;

  const pieData = Object.entries(activeLanguages).map(([name, val]) => ({
    name,
    value: val as number,
    color: getLanguageColor(name)
  })).sort((a, b) => b.value - a.value);

  const displayPie = pieData.length > 4 
    ? [...pieData.slice(0, 3), { name: 'Others', value: pieData.slice(3).reduce((acc, curr) => acc + curr.value, 0), color: '#262636' }]
    : pieData;

  const finalTotal = displayPie.reduce((acc, curr) => acc + curr.value, 0) || 1;

  const chartData = commitCount > 0 ? [
    { name: 'Commits', uv: commitCount }
  ] : [
    { name: 'No data', uv: 0 }
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-card rounded-2xl p-3 border border-border flex flex-col items-center text-center">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">Commits</span>
          <span className="text-lg font-bold text-text-main">{commitCount}</span>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border flex flex-col items-center text-center">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">Contributors</span>
          <span className="text-lg font-bold text-warning">{uniqueAuthors}</span>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border flex flex-col items-center text-center">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">PRs Merged</span>
          <span className="text-lg font-bold text-text-main">{mergedPRsCount}</span>
        </div>
      </div>
      
      <div className="bg-card rounded-2xl p-4 mb-5 border border-border">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Activity Overview</div>
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUvIns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="uv" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUvIns)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Languages</div>
        {displayPie.length === 0 ? (
          <div className="text-xs text-text-muted text-center py-4">No language breakdown available.</div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="w-[100px] h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={displayPie} innerRadius={28} outerRadius={46} paddingAngle={0} dataKey="value" stroke="none">
                    {displayPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '11px' }} itemStyle={{ color: 'var(--text-main)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs flex flex-col gap-2 w-[50%]">
              {displayPie.map(lang => (
                <div key={lang.name} className="flex justify-between items-center text-text-main/90 font-medium">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                    {lang.name}
                  </span> 
                  <span className="text-text-muted font-bold">{Math.round((lang.value / finalTotal) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const PRsScreen = () => {
  const { activePRs, openModal } = useAppContext();
  const [activeTab, setActiveTab] = useState('Open');

  const filteredPRs = activePRs.filter(pr => {
    if (activeTab === 'Open') return pr.status === 'Open' || pr.status === 'Review Req.' || pr.status === 'Draft' || pr.status === 'Approved';
    if (activeTab === 'Merged') return pr.status === 'Merged';
    if (activeTab === 'Closed') return pr.status === 'Closed';
    return true;
  });

  return (
    <>
      <div className="flex border-b border-border mb-4">
        {['Open', 'Merged', 'Closed'].map((tab) => {
          const count = activePRs.filter(pr => {
            if (tab === 'Open') return pr.status === 'Open' || pr.status === 'Review Req.' || pr.status === 'Draft' || pr.status === 'Approved';
            if (tab === 'Merged') return pr.status === 'Merged';
            if (tab === 'Closed') return pr.status === 'Closed';
            return false;
          }).length;
          
          return (
            <div 
              key={tab}
              className={`px-4 py-3 text-[13px] font-semibold relative cursor-pointer transition-colors ${activeTab === tab ? 'text-primary' : 'text-text-muted'}`}
              onClick={() => { setActiveTab(tab); }}
            >
              {tab}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ml-1.5 font-bold ${activeTab === tab ? 'bg-primary/20 text-primary border border-primary/25' : 'bg-hover/40 text-text-muted border border-border'}`}>
                {count}
              </span>
              {activeTab === tab && <div className="absolute -bottom-[1px] left-0 w-full h-[2.5px] bg-primary rounded-t-sm"></div>}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3 mb-4">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Ready to merge changes?</span>
        <button 
          onClick={() => openModal('pr')}
          className="bg-success text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <GitPullRequest size={14} strokeWidth={2.5} /> Open PR
        </button>
      </div>

      <div className="space-y-3">
        {filteredPRs.map(pr => (
          <div key={pr.id} className="flex gap-3.5 p-4 border border-border rounded-2xl bg-card transition-all hover:border-primary/40">
            <GitPullRequest size={20} className={`${pr.status === 'Open' || pr.status === 'Approved' ? 'text-success' : pr.status === 'Merged' ? 'text-purple-500' : 'text-text-muted'} shrink-0`} strokeWidth={2.5} />
            <div className="flex-1">
              <div className="text-sm font-bold mb-1 leading-snug text-text-main">{pr.title}</div>
              <div className="text-xs text-text-muted mb-3 font-medium">#{pr.id} opened {pr.time} by {pr.author}</div>
              <div className="flex justify-between items-center">
                {pr.avatar ? (
                  <img src={pr.avatar} className="w-5 h-5 rounded-full bg-border" alt="" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-[9px] font-bold flex items-center justify-center text-primary border border-primary/10">{pr.author.substring(0, 2).toUpperCase()}</div>
                )}
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${pr.status === 'Approved' || pr.status === 'Open' ? 'bg-success/10 text-success border-success/30' : pr.status === 'Merged' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-hover text-text-muted border-border'}`}>
                  {pr.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredPRs.length === 0 && (
          <div className="text-center py-10 text-text-muted text-xs font-semibold uppercase tracking-wider">No pull requests found.</div>
        )}
      </div>
    </>
  );
};
