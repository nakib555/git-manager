import React, { useState, useEffect } from 'react';
import { useAppContext, formatTime } from '../../AppContext';
import { 
  GitPullRequest, GitCommit, FileCode, ArrowLeft, Check, X, Clock, 
  CornerDownRight, Trash2, Search, GitMerge, ChevronRight, ChevronDown, 
  AlertTriangle, Sparkles, Folder, FileText, Plus, RotateCcw, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiffViewer } from '../../components/commit/DiffViewer';

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

export const PRsScreen = () => {
  const { 
    activePRs, 
    openModal, 
    updateLocalPRStatus, 
    showToast,
    theme,
    githubToken,
    currentRepo,
    currentRepoOwner,
    deleteBranch: deleteBranchOnGitHub
  } = useAppContext();

  // List States
  const [activeTab, setActiveTab] = useState<'Open' | 'Merged' | 'Closed'>('Open');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail States
  const [selectedPRId, setSelectedPRId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'commits' | 'files'>('overview');
  const [activeFile, setActiveFile] = useState<string | null>(null);
  
  // Merge States
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'squash'>('merge');
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [isMerging, setIsMerging] = useState(false);

  // Real GitHub API loaded states
  const [prCommits, setPrCommits] = useState<PRCommit[]>([]);
  const [prFiles, setPrFiles] = useState<PRFile[]>([]);
  const [isLoadingPRDetails, setIsLoadingPRDetails] = useState(false);

  const selectedPR = activePRs.find(pr => pr.id === selectedPRId);

  useEffect(() => {
    if (selectedPR && githubToken && currentRepoOwner && currentRepo) {
      setDetailTab('overview');
      setIsLoadingPRDetails(true);
      const headers = {
        Authorization: githubToken.startsWith('gh') ? `Bearer ${githubToken}` : `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      };
      
      // Fetch PR Commits
      fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/pulls/${selectedPR.id}/commits`, { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mappedCommits = data.map(c => ({
              hash: c.sha.substring(0, 7),
              msg: c.commit.message,
              author: c.commit.author?.name || c.author?.login || 'unknown',
              time: formatTime(c.commit.author?.date || c.commit.committer?.date),
            }));
            setPrCommits(mappedCommits);
          }
        })
        .catch(console.error);

      // Fetch PR Files
      fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/pulls/${selectedPR.id}/files`, { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mappedFiles = data.map(f => ({
              filename: f.filename,
              additions: f.additions,
              deletions: f.deletions,
              patch: f.patch || '',
            }));
            setPrFiles(mappedFiles);
            if (mappedFiles.length > 0) {
              setActiveFile(mappedFiles[0].filename);
            }
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingPRDetails(false));
    } else {
      setPrCommits([]);
      setPrFiles([]);
    }
  }, [selectedPRId, selectedPR, githubToken, currentRepoOwner, currentRepo]);

  const handleMergePR = async () => {
    if (!selectedPRId || !selectedPR) return;
    setIsMerging(true);
    try {
      await updateLocalPRStatus(selectedPRId, 'Merged', mergeStrategy);
      if (deleteBranch && selectedPR.source) {
        await deleteBranchOnGitHub(selectedPR.source);
      }
    } catch (e) {}
    setIsMerging(false);
  };

  const handleClosePR = async () => {
    if (!selectedPRId) return;
    try {
      await updateLocalPRStatus(selectedPRId, 'Closed');
    } catch (e) {}
  };

  const handleReopenPR = async () => {
    if (!selectedPRId) return;
    try {
      await updateLocalPRStatus(selectedPRId, 'Open');
    } catch (e) {}
  };

  const filteredPRs = activePRs.filter(pr => {
    const tabMatches = (() => {
      if (activeTab === 'Open') return pr.status === 'Open' || pr.status === 'Review Req.' || pr.status === 'Draft' || pr.status === 'Approved';
      if (activeTab === 'Merged') return pr.status === 'Merged';
      if (activeTab === 'Closed') return pr.status === 'Closed';
      return true;
    })();

    const query = searchQuery.toLowerCase().trim();
    const queryMatches = !query || 
      pr.title.toLowerCase().includes(query) || 
      `#${pr.id}`.includes(query) || 
      (pr.source && pr.source.toLowerCase().includes(query)) ||
      (pr.target && pr.target.toLowerCase().includes(query));

    return tabMatches && queryMatches;
  }).sort((a, b) => b.id - a.id);

  const totalAdditions = prFiles.reduce((acc, f) => acc + f.additions, 0);
  const totalDeletions = prFiles.reduce((acc, f) => acc + f.deletions, 0);
  const totalChanges = totalAdditions + totalDeletions;
  const additionPercentage = totalChanges > 0 ? (totalAdditions / totalChanges) * 100 : 50;

  return (
    <div className="w-full pb-8">
      <AnimatePresence mode="wait">
        {!selectedPR ? (
          // ==================================================================
          // SOLO PR LIST VIEW
          // ==================================================================
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-text-main tracking-tight flex items-center gap-2">
                    <GitPullRequest className="text-primary" size={22} strokeWidth={2.5} />
                    Pull Requests
                  </h1>
                  <p className="text-xs text-text-muted mt-1 font-medium">
                    Manage your feature branches and integrations.
                  </p>
                </div>

                <button 
                  onClick={() => openModal('pr')}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>New Pull Request</span>
                </button>
              </div>

              {/* Basic Tab Strip */}
              <div className="flex items-center justify-between border-b border-border/40 pt-2">
                <div className="flex overflow-x-auto no-scrollbar -mb-[1px] gap-1">
                  {(['Open', 'Merged', 'Closed'] as const).map((tab) => {
                    const count = activePRs.filter(pr => {
                      if (tab === 'Open') return pr.status === 'Open' || pr.status === 'Draft' || pr.status === 'Review Req.' || pr.status === 'Approved';
                      if (tab === 'Merged') return pr.status === 'Merged';
                      if (tab === 'Closed') return pr.status === 'Closed';
                      return false;
                    }).length;
                    
                    const isActive = activeTab === tab;
                    return (
                      <button 
                        key={tab}
                        className={`px-4 py-3 text-xs font-bold relative transition-all cursor-pointer shrink-0 ${
                          isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        <span className="flex items-center gap-1.5">
                          {tab}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-primary/10 text-primary border border-primary/25' : 'bg-hover/50 text-text-muted border border-border/40'
                          }`}>
                            {count}
                          </span>
                        </span>
                        {isActive && (
                          <motion.div 
                            layoutId="activeTabUnderline" 
                            className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t" 
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Simple Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-[13px] text-text-muted" size={15} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PRs by title or branch..."
                  className="w-full bg-main/40 text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main placeholder:text-text-muted/60 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-[13px] text-xs text-text-muted hover:text-text-main font-bold cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredPRs.length === 0 ? (
                <div className="bg-card border border-border/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <GitPullRequest size={22} />
                  </div>
                  <h3 className="font-bold text-sm text-text-main">No pull requests found</h3>
                  <p className="text-xs text-text-muted mt-1 max-w-[280px] leading-relaxed">
                    There are no pull requests matching the selected filters in this repository.
                  </p>
                </div>
              ) : (
                filteredPRs.map((pr) => (
                  <div 
                    key={pr.id}
                    onClick={() => setSelectedPRId(pr.id)}
                    className="bg-card border border-border/60 rounded-2xl p-4 hover:border-primary/35 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group shadow-sm flex items-start gap-4"
                  >
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                      pr.status === 'Merged' ? 'bg-purple-500/10 text-purple-500' :
                      pr.status === 'Closed' ? 'bg-danger/10 text-danger' :
                      'bg-success/10 text-success'
                    }`}>
                      <GitPullRequest size={16} strokeWidth={2.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-text-muted">#{pr.id}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                          pr.status === 'Merged' ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' :
                          pr.status === 'Closed' ? 'bg-danger/10 border-danger/20 text-danger' :
                          'bg-success/10 border-success/20 text-success'
                        }`}>
                          {pr.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors truncate mb-1">
                        {pr.title}
                      </h3>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1 text-[10px] font-mono bg-hover border border-border px-1.5 py-0.5 rounded text-text-main/80">
                          {pr.source}
                        </div>
                        <CornerDownRight size={10} className="text-text-muted" />
                        <div className="flex items-center gap-1 text-[10px] font-mono bg-hover border border-border px-1.5 py-0.5 rounded text-text-muted">
                          {pr.target}
                        </div>
                        <span className="text-[10px] text-text-muted">•</span>
                        <span className="text-[10px] text-text-muted">by {pr.author}</span>
                        <span className="text-[10px] text-text-muted">•</span>
                        <span className="text-[10px] text-text-muted">{pr.time}</span>
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-text-muted group-hover:text-text-main transition-colors self-center" />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          // ==================================================================
          // PR DETAIL VIEW
          // ==================================================================
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-1"
          >
            {/* Header / Actions strip */}
            <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm mb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedPRId(null)}
                    className="w-8 h-8 rounded-xl bg-hover border border-border flex items-center justify-center text-text-muted hover:text-text-main active:scale-95 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={16} strokeWidth={2.5} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-muted">PR #{selectedPR.id}</span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                        selectedPR.status === 'Merged' ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' :
                        selectedPR.status === 'Closed' ? 'bg-danger/10 border-danger/20 text-danger' :
                        'bg-success/10 border-success/20 text-success'
                      }`}>
                        {selectedPR.status}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-text-main truncate max-w-md md:max-w-xl mt-0.5">{selectedPR.title}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-main p-1 rounded-xl border border-border/50 self-start md:self-auto">
                  {(['overview', 'commits', 'files'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                        detailTab === tab ? 'bg-card text-primary shadow-sm border border-border/40' : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inner Views with Loading */}
            <div className="flex-1 min-h-0 relative">
              {isLoadingPRDetails ? (
                <div className="bg-card border border-border/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center my-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
                  <span className="text-xs font-bold text-text-muted">Loading pull request timeline and files...</span>
                </div>
              ) : (
                <>
                  {detailTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      
                      {/* Left Side: Overview Details */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
                            <img src={selectedPR.avatar || 'https://github.com/github.png'} className="w-9 h-9 rounded-full border border-border shrink-0" alt="" />
                            <div>
                              <span className="block text-xs font-extrabold text-text-main">{selectedPR.author}</span>
                              <span className="block text-[10px] text-text-muted mt-0.5">Opened this PR {selectedPR.time}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Description</h3>
                            <p className="text-xs text-text-main/90 leading-relaxed font-medium bg-main/30 border border-border/50 p-4 rounded-xl whitespace-pre-wrap">
                              {selectedPR.desc}
                            </p>
                          </div>
                        </div>

                        {/* Integration timeline */}
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Integration Pipeline</h3>
                          <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-xl">
                            <Check size={16} strokeWidth={3} className="text-success shrink-0" />
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-success">This branch has no conflicts</span>
                              <span className="block text-[10px] text-text-muted mt-0.5 truncate">Merging can be performed automatically on the default branch.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Stats & Merge Controls */}
                      <div className="space-y-4">
                        {/* Stats */}
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                          <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
                            <BarChart2 size={16} className="text-text-muted" /> Statistics
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-main border border-border rounded-xl p-3 text-center">
                              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Commits</div>
                              <div className="text-lg font-black text-text-main">{prCommits.length}</div>
                            </div>
                            <div className="bg-main border border-border rounded-xl p-3 text-center">
                              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Files Changed</div>
                              <div className="text-lg font-black text-text-main">{prFiles.length}</div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col gap-2">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-text-muted">Total Changes</span>
                              <span>
                                <span className="text-success">+{totalAdditions}</span> <span className="text-text-muted mx-1">/</span> <span className="text-danger">-{totalDeletions}</span>
                              </span>
                            </div>
                            <div className="flex h-2 rounded-full overflow-hidden w-full bg-main border border-border/50">
                               <div className="bg-success h-full" style={{ width: `${additionPercentage}%` }}></div>
                               <div className="bg-danger h-full" style={{ width: `${100 - additionPercentage}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Merge Controls */}
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                          {selectedPR.status === 'Merged' ? (
                            <div className="text-center py-6">
                              <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-3">
                                <GitMerge size={24} />
                              </div>
                              <h3 className="text-base font-bold text-text-main mb-1">Pull Request Merged</h3>
                              <p className="text-xs text-text-muted">The changes have been integrated into <code className="font-mono bg-main px-1 rounded text-text-main/80">{selectedPR.target}</code>.</p>
                            </div>
                          ) : selectedPR.status === 'Closed' ? (
                            <div className="text-center py-6">
                              <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-3">
                                <X size={24} />
                              </div>
                              <h3 className="text-base font-bold text-text-main mb-1">PR Closed</h3>
                              <p className="text-xs text-text-muted mb-4">Closed without merging changes.</p>
                              <button 
                                onClick={handleReopenPR}
                                className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-sm"
                              >
                                Reopen Pull Request
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Merge Pull Request</h3>
                              
                              <div className="space-y-2">
                                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Strategy</span>
                                <div className="flex border border-border rounded-xl overflow-hidden bg-main">
                                  <button 
                                    onClick={() => setMergeStrategy('merge')}
                                    className={`flex-1 py-1.5 text-[10px] font-bold transition-all cursor-pointer ${mergeStrategy === 'merge' ? 'bg-card text-primary shadow-sm border border-border/30 rounded-xl' : 'text-text-muted hover:text-text-main'}`}
                                  >
                                    Create Merge Commit
                                  </button>
                                  <button 
                                    onClick={() => setMergeStrategy('squash')}
                                    className={`flex-1 py-1.5 text-[10px] font-bold transition-all cursor-pointer ${mergeStrategy === 'squash' ? 'bg-card text-primary shadow-sm border border-border/30 rounded-xl' : 'text-text-muted hover:text-text-main'}`}
                                  >
                                    Squash and Merge
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 p-1">
                                <input 
                                  type="checkbox" 
                                  id="deleteBranchCb"
                                  checked={deleteBranch}
                                  onChange={(e) => setDeleteBranch(e.target.checked)}
                                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                                />
                                <label htmlFor="deleteBranchCb" className="text-xs text-text-main/80 font-semibold cursor-pointer">
                                  Delete branch {selectedPR.source} after merge
                                </label>
                              </div>

                              <div className="flex flex-col gap-2 pt-2">
                                <button 
                                  onClick={handleMergePR}
                                  disabled={isMerging}
                                  className="w-full py-2.5 bg-success hover:bg-success/90 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  {isMerging ? 'Merging...' : 'Merge Pull Request'}
                                </button>
                                <button 
                                  onClick={handleClosePR}
                                  className="w-full py-2.5 bg-hover hover:bg-hover/80 text-text-main rounded-xl text-xs font-bold active:scale-95 transition-all border border-border/80 cursor-pointer text-center"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {detailTab === 'commits' && (
                    <div className="bg-card border border-border rounded-2xl p-2 animate-fade-in mb-4">
                      <div className="flex flex-col gap-1">
                        {prCommits.length === 0 ? (
                          <div className="p-8 text-center text-xs font-bold text-text-muted">No commits found in this pull request.</div>
                        ) : (
                          prCommits.map((commit, i) => (
                             <div 
                               key={commit.hash} 
                               onClick={() => setDetailTab('files')}
                               className="flex items-center justify-between p-3 hover:bg-hover/50 rounded-xl transition-colors border-b border-border/30 last:border-0 cursor-pointer"
                             >
                               <div>
                                  <div className="text-xs font-bold text-text-main mb-1">{commit.msg}</div>
                                  <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium">
                                     <span className="font-mono bg-main border border-border px-1.5 rounded text-primary">{commit.hash}</span>
                                     <span>•</span>
                                     <span>{commit.author}</span>
                                     <span>•</span>
                                     <span>{commit.time}</span>
                                  </div>
                               </div>
                               <ChevronRight size={16} className="text-text-muted" />
                             </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {detailTab === 'files' && (
                    <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 animate-fade-in pb-4">
                      
                      {/* File List Pane */}
                      <div className="w-full lg:w-[280px] shrink-0 bg-card border border-border rounded-2xl flex flex-col h-[250px] lg:h-full">
                        <div className="bg-main/50 px-3 py-2.5 border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          Files Changed
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 no-scrollbar space-y-1">
                          {prFiles.length === 0 ? (
                            <div className="p-8 text-center text-xs font-bold text-text-muted">No files modified.</div>
                          ) : (
                            prFiles.map((file) => {
                               const isActive = activeFile === file.filename;
                               const fileNameParts = file.filename.split('/');
                               const shortName = fileNameParts.pop();
                               const dirPath = fileNameParts.join('/');
      
                               return (
                                 <div 
                                   key={file.filename}
                                   onClick={() => setActiveFile(file.filename)}
                                   className={`p-2 rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                                     isActive ? 'bg-primary/10 text-primary' : 'hover:bg-hover text-text-main'
                                   }`}
                                 >
                                   <div className="flex items-center gap-2 min-w-0">
                                      <FileCode size={14} className={isActive ? 'text-primary' : 'text-text-muted'} />
                                      <div className="min-w-0">
                                         <div className={`text-xs font-bold truncate ${isActive ? 'text-primary' : ''}`}>{shortName}</div>
                                         {dirPath && <div className="text-[9px] text-text-muted truncate">{dirPath}</div>}
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold shrink-0 ml-2">
                                      <span className="text-success">+{file.additions}</span>
                                      <span className="text-danger">-{file.deletions}</span>
                                   </div>
                                 </div>
                               );
                            })
                          )}
                        </div>
                      </div>

                      {/* Diff Viewer Pane */}
                      <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[400px] lg:h-full">
                         {activeFile ? (
                            (() => {
                               const fileData = prFiles.find(f => f.filename === activeFile);
                               if (!fileData) return null;
                               return (
                                 <div className="flex-1 overflow-y-auto no-scrollbar relative">
                                   <DiffViewer patch={fileData.patch} filename={fileData.filename} isDark={theme === 'dark'} />
                                 </div>
                               );
                            })()
                         ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
                               <FileCode size={32} className="mb-2 opacity-50" />
                               <span className="text-sm font-semibold">Select a file to view changes</span>
                            </div>
                         )}
                      </div>

                    </div>
                  )}
                </>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
