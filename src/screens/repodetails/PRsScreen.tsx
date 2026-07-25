import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  GitPullRequest, GitCommit, FileCode, ArrowLeft, Check, X, Clock, 
  CornerDownRight, Trash2, Search, GitMerge, ChevronRight, ChevronDown, 
  AlertTriangle, Sparkles, Folder, FileText, Plus, RotateCcw, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiffViewer } from '../../components/commit/DiffViewer';

// ----------------------------------------------------------------------
// Interfaces & Dummy Generators
// ----------------------------------------------------------------------
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

const getPRCommits = (prId: number, title: string): PRCommit[] => {
  const cleanTitle = title || "changes";
  const baseHash = (prId * 4321).toString(16).padStart(7, '0');
  
  return [
    {
      hash: `f7a${baseHash.substring(0, 4)}`,
      msg: `feat: initial implementation of ${cleanTitle.toLowerCase()}`,
      author: 'git-manager-workstation',
      time: '2 days ago'
    },
    {
      hash: `9c2${baseHash.substring(1, 4) || 'ab'}`,
      msg: `test: add comprehensive unit test suite`,
      author: 'git-manager-workstation',
      time: '1 day ago'
    },
    {
      hash: `3b4${baseHash.substring(2, 5) || 'cd'}`,
      msg: `docs: update system documentation`,
      author: 'git-manager-workstation',
      time: '12 hours ago'
    }
  ];
};

const getPRFiles = (prId: number, title: string): PRFile[] => {
  const cleanTitle = title || "changes";
  const mainModule = cleanTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  
  return [
    {
      filename: `src/components/${mainModule || 'Feature'}.tsx`,
      additions: 42,
      deletions: 12,
      patch: `@@ -1,15 +1,45 @@\n import React, { useState } from 'react';\n+import { Shield, Sparkles } from 'lucide-react';\n \n-export const ${mainModule || 'Feature'} = () => {\n-  return <div>Feature</div>;\n-};\n+export interface ${mainModule || 'Feature'}Props {\n+  enabled?: boolean;\n+  onComplete?: () => void;\n+}\n+\n+export const ${mainModule || 'Feature'} = ({ enabled = true, onComplete }: ${mainModule || 'Feature'}Props) => {\n+  const [status, setStatus] = useState<'idle' | 'executing'>('idle');\n+\n+  const handleAction = async () => {\n+    setStatus('executing');\n+    setTimeout(() => {\n+      setStatus('idle');\n+      onComplete?.();\n+    }, 1500);\n+  };\n+\n+  return (\n+    <div className="p-6 border border-border bg-card rounded-2xl">\n+      <div className="flex items-center gap-3">\n+        <Shield className="text-primary animate-pulse" size={20} />\n+        <h3 className="font-bold text-text-main">${title}</h3>\n+      </div>\n+      <p className="text-xs text-text-muted mt-2">\n+        Autonomous verification engine compiled successfully.\n+      </p>\n+      <button \n+        onClick={handleAction}\n+        className="mt-4 bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-primary-hover"\n+      >\n+        {status === 'executing' ? 'Processing...' : 'Execute'}\n+      </button>\n+    </div>\n+  );\n+};`
    },
    {
      filename: `src/tests/${mainModule || 'Feature'}.test.tsx`,
      additions: 18,
      deletions: 2,
      patch: `@@ -1,5 +1,21 @@\n import { describe, it, expect } from 'vitest';\n+import { render, screen } from '@testing-library/react';\n+import { ${mainModule || 'Feature'} } from '../components/${mainModule || 'Feature'}';\n \n describe('${mainModule || 'Feature'} component', () => {\n-  it('renders standard state', () => {});\n+  it('renders title and details correctly', () => {\n+    render(<${mainModule || 'Feature'} />);\n+    expect(screen.getByText('${title}')).toBeInTheDocument();\n+  });\n+\n+  it('responds to user click actions', () => {\n+    const spy = vi.fn();\n+    render(<${mainModule || 'Feature'} onComplete={spy} />);\n+    screen.getByRole('button').click();\n+  });\n+});`
    }
  ];
};

const getAISummary = (title: string) => {
  const clean = title.toLowerCase();
  if (clean.includes('fix')) {
     return ['Fixed bug causing crashes on edge cases.', 'Added regression tests to prevent recurrence.', 'Cleaned up related utility functions.'];
  } else if (clean.includes('add') || clean.includes('feat')) {
     return ['Implemented new feature logic.', 'Integrated UI components and styling.', 'Updated relevant documentation and type definitions.'];
  } else {
     return ['Refactored existing codebase for better performance.', 'Removed deprecated functions.', 'Optimized imports across the module.'];
  }
};

export const PRsScreen = () => {
  const { 
    activePRs, 
    openModal, 
    updateLocalPRStatus, 
    showToast,
    theme 
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

  const selectedPR = activePRs.find(pr => pr.id === selectedPRId);

  useEffect(() => {
    if (selectedPR) {
      setDetailTab('overview');
      const files = getPRFiles(selectedPR.id, selectedPR.title);
      if (files.length > 0) {
        setActiveFile(files[0].filename);
      }
    }
  }, [selectedPRId]);

  const handleMergePR = () => {
    if (!selectedPRId) return;
    setIsMerging(true);
    
    setTimeout(() => {
      updateLocalPRStatus(selectedPRId, 'Merged');
      setIsMerging(false);
      showToast(`Successfully merged ${selectedPR?.source} into ${selectedPR?.target}`);
      if (deleteBranch) {
        showToast(`Branch '${selectedPR?.source}' deleted.`);
      }
    }, 1200);
  };

  const handleClosePR = () => {
    if (!selectedPRId) return;
    updateLocalPRStatus(selectedPRId, 'Closed');
    showToast('Pull request closed without merging.');
  };

  const handleReopenPR = () => {
    if (!selectedPRId) return;
    updateLocalPRStatus(selectedPRId, 'Open');
    showToast('Pull request reopened.');
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

            {/* PR List */}
            <div className="space-y-3">
              {filteredPRs.map((pr) => {
                const isDraft = pr.status === 'Draft';
                const isClosed = pr.status === 'Closed';
                const isMerged = pr.status === 'Merged';
                
                return (
                  <div 
                    key={pr.id} 
                    onClick={() => setSelectedPRId(pr.id)}
                    className="flex items-stretch border border-border/60 bg-card hover:border-primary/45 rounded-2xl overflow-hidden transition-all duration-150 cursor-pointer shadow-sm hover:shadow"
                  >
                    <div className="flex-1 p-4 flex gap-3.5 items-start min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {isMerged ? (
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
                            <GitPullRequest size={15} strokeWidth={2.5} />
                          </div>
                        ) : isClosed ? (
                          <div className="w-8 h-8 rounded-xl bg-text-muted/10 border border-border text-text-muted flex items-center justify-center">
                            <GitPullRequest size={15} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <GitPullRequest size={15} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-bold text-text-main leading-tight hover:text-primary transition-colors truncate">
                            {pr.title}
                          </h4>
                          
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border tracking-wide uppercase shrink-0 ${
                            isMerged ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                            isClosed ? 'bg-text-muted/10 text-text-muted border-border' :
                            isDraft ? 'bg-hover text-text-muted border-border/70' :
                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            {pr.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-text-muted font-semibold flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-text-main font-mono">#{pr.id}</span>
                          <span className="text-border/80">•</span>
                          <span>opened {pr.time}</span>
                        </div>

                        {/* Branch flow */}
                        <div className="flex items-center gap-1.5 pt-2 mt-1 border-t border-border/40">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-lg bg-main border border-border/50 text-text-muted max-w-[140px] truncate">
                            {pr.source || 'feature'}
                          </span>
                          <CornerDownRight size={10} className="text-text-muted shrink-0" />
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-lg bg-main border border-border/50 text-text-main font-bold max-w-[140px] truncate">
                            {pr.target || 'main'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredPRs.length === 0 && (
                <div className="bg-card border border-border rounded-2xl py-14 px-4 text-center">
                  <GitPullRequest size={40} className="text-text-muted/40 mx-auto mb-3" />
                  <p className="text-xs text-text-main font-bold uppercase tracking-wider">No Pull Requests</p>
                  <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                    No pull requests match your current filters.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // ==================================================================
          // SOLO PR DETAIL VIEW
          // ==================================================================
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 h-[calc(100vh-180px)] flex flex-col"
          >
            {/* Header */}
            <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4 shrink-0">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <button 
                  onClick={() => setSelectedPRId(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </div>

              {/* Title & Stats */}
              <div className="space-y-2">
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                    selectedPR.status === 'Merged' ? 'bg-purple-500/15 text-purple-500 border-purple-500/25' :
                    selectedPR.status === 'Closed' ? 'bg-text-muted/15 text-text-muted border-border' :
                    'bg-emerald-500/15 text-emerald-500 border-emerald-500/25'
                  }`}>
                    <GitPullRequest size={13} strokeWidth={2.5} />
                    {selectedPR.status}
                  </span>
                  <span className="text-xs text-text-muted font-mono font-bold bg-hover/50 px-2.5 py-0.5 rounded-lg border border-border/30">#{selectedPR.id}</span>
                </div>
                
                <h2 className="text-lg md:text-xl font-black text-text-main leading-snug break-words">
                  {selectedPR.title}
                </h2>

                <div className="flex items-center gap-3">
                   <span className="font-mono text-[10px] px-2 py-1 rounded bg-main border border-border/50 text-text-muted max-w-[140px] truncate">
                      {selectedPR.source || 'feature'}
                    </span>
                    <CornerDownRight size={12} className="text-text-muted shrink-0" />
                    <span className="font-mono text-[10px] px-2 py-1 rounded bg-main border border-border/50 text-text-main font-bold max-w-[140px] truncate">
                      {selectedPR.target || 'main'}
                    </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto no-scrollbar border-b border-border/40 pt-2 gap-4">
                {(['overview', 'commits', 'files'] as const).map(tab => {
                  const isActive = detailTab === tab;
                  const label = tab.charAt(0).toUpperCase() + tab.slice(1);
                  return (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`pb-3 text-xs font-bold relative transition-colors cursor-pointer whitespace-nowrap ${
                        isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      {label}
                      {isActive && (
                        <motion.div 
                          layoutId="prDetailTabIndicator" 
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 min-h-[300px] flex flex-col">
              {detailTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in pb-4">
                  
                  {/* Left Column: Summary & Stats */}
                  <div className="space-y-4">
                    {/* AI Summary */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-primary" />
                        <h3 className="text-sm font-bold text-primary">AI Summary</h3>
                      </div>
                      <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-main/90 font-medium">
                        {getAISummary(selectedPR.title).map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Stats */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
                        <BarChart2 size={16} className="text-text-muted" /> Statistics
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-main border border-border rounded-xl p-3 text-center">
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Commits</div>
                          <div className="text-lg font-black text-text-main">{getPRCommits(selectedPR.id, selectedPR.title).length}</div>
                        </div>
                        <div className="bg-main border border-border rounded-xl p-3 text-center">
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Files Changed</div>
                          <div className="text-lg font-black text-text-main">{getPRFiles(selectedPR.id, selectedPR.title).length}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-text-muted">Total Changes</span>
                          <span>
                            <span className="text-success">+60</span> <span className="text-text-muted mx-1">/</span> <span className="text-danger">-14</span>
                          </span>
                        </div>
                        <div className="flex h-2 rounded-full overflow-hidden w-full bg-main border border-border/50">
                           <div className="bg-success h-full" style={{ width: '80%' }}></div>
                           <div className="bg-danger h-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Merge Controls */}
                  <div>
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      {selectedPR.status === 'Merged' ? (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-3">
                            <GitMerge size={24} />
                          </div>
                          <h3 className="text-base font-bold text-text-main mb-1">Pull Request Merged</h3>
                          <p className="text-xs text-text-muted mb-4">The changes have been integrated into <code className="font-mono bg-main px-1 rounded">{selectedPR.target}</code>.</p>
                        </div>
                      ) : selectedPR.status === 'Closed' ? (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 rounded-full bg-text-muted/10 text-text-muted flex items-center justify-center mx-auto mb-3">
                            <X size={24} />
                          </div>
                          <h3 className="text-base font-bold text-text-main mb-1">Pull Request Closed</h3>
                          <p className="text-xs text-text-muted mb-4">This pull request was closed without merging.</p>
                          <button
                            onClick={handleReopenPR}
                            className="bg-card border border-border hover:bg-hover text-text-main text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            Reopen Pull Request
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {/* Conflict Detection (Mock) */}
                          {selectedPR.id % 4 === 0 ? (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
                              <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-xs font-bold text-rose-500 mb-1">Cannot Merge: Conflicts Detected</h4>
                                <p className="text-[11px] text-text-main/80">
                                  There are conflicting changes in the destination branch. Please resolve them locally before merging.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                              <Check size={18} className="text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                              <div>
                                <h4 className="text-xs font-bold text-emerald-500 mb-1">Able to merge</h4>
                                <p className="text-[11px] text-text-main/80">
                                  These branches have no conflicts and can be safely merged.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Controls */}
                          {selectedPR.id % 4 !== 0 && (
                            <div className="space-y-4 pt-4 border-t border-border/50">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Merge Strategy</label>
                                <div className="flex border border-border rounded-xl overflow-hidden bg-main">
                                  <button
                                    onClick={() => setMergeStrategy('merge')}
                                    className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                                      mergeStrategy === 'merge' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-hover'
                                    }`}
                                  >
                                    Merge Commit
                                  </button>
                                  <button
                                    onClick={() => setMergeStrategy('squash')}
                                    className={`flex-1 py-2.5 text-xs font-bold border-l border-border transition-colors ${
                                      mergeStrategy === 'squash' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-hover'
                                    }`}
                                  >
                                    Squash & Merge
                                  </button>
                                </div>
                                <p className="text-[10px] text-text-muted pt-1">
                                  {mergeStrategy === 'merge' 
                                    ? 'Creates a merge commit preserving full history.' 
                                    : 'Combines all commits into one before merging.'}
                                </p>
                              </div>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={deleteBranch}
                                  onChange={(e) => setDeleteBranch(e.target.checked)}
                                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                                />
                                <span className="text-xs font-semibold text-text-main">Delete source branch after merge</span>
                              </label>

                              <div className="flex gap-3 pt-2">
                                <button
                                  onClick={handleMergePR}
                                  disabled={isMerging}
                                  className="flex-1 bg-success hover:bg-emerald-600 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {isMerging ? (
                                    <>
                                      <RotateCcw size={14} className="animate-spin" /> Merging...
                                    </>
                                  ) : (
                                    <>
                                      <GitMerge size={14} /> Merge Pull Request
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={handleClosePR}
                                  disabled={isMerging}
                                  className="px-4 bg-card border border-border hover:bg-hover text-text-main text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {detailTab === 'commits' && (
                <div className="bg-card border border-border rounded-2xl p-2 animate-fade-in mb-4">
                  <div className="flex flex-col gap-1">
                    {getPRCommits(selectedPR.id, selectedPR.title).map((commit, i) => (
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
                    ))}
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
                      {getPRFiles(selectedPR.id, selectedPR.title).map((file) => {
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
                      })}
                    </div>
                  </div>

                  {/* Diff Viewer Pane */}
                  <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[400px] lg:h-full">
                     {activeFile ? (
                        (() => {
                           const fileData = getPRFiles(selectedPR.id, selectedPR.title).find(f => f.filename === activeFile);
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
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
