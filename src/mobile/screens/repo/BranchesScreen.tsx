import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { 
  GitBranch, Check, Plus, RefreshCw, GitCommit, GitPullRequest, 
  Trash2, ShieldCheck, ArrowRight, X, ExternalLink, ArrowUpRight,
  TrendingUp, Clock, Copy, GitFork, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from '../../components/EmptyState';
import { InlineErrorCard } from '../../components/InlineErrorCard';
import { formatRelativeTime } from '../../utils/formatters';
import { CommitDetailModal } from '../../components/CommitDetailModal';

export const BranchesScreen: React.FC = () => {
  const { 
    activeBranches, 
    currentBranch, 
    switchBranch, 
    openModal, 
    currentRepo, 
    showToast, 
    refreshData,
    activeCommits,
    deleteBranch: deleteBranchOnGitHub
  } = useAppContext();

  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'compare'>('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);

  const handleSwitch = async (name: string) => {
    if (isSwitching || name === currentBranch) return;
    setIsSwitching(true);
    setSwitchError(null);
    try {
      await switchBranch(name);
      showToast(`Switched to branch "${name}"`, 'success');
      setSelectedBranch(null);
    } catch (err: any) {
      const msg = err.message || `Failed to switch to branch "${name}"`;
      setSwitchError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (name === currentBranch || name === 'main' || name === 'master') {
      showToast('Cannot delete default or currently active branch', 'error');
      return;
    }
    setIsDeleting(true);
    try {
      await deleteBranchOnGitHub(name);
      showToast(`Deleted branch "${name}"`, 'success');
      setSelectedBranch(null);
    } catch (err: any) {
      showToast(`Delete failed: ${err.message || err}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const branchObj = activeBranches.find(b => b.name === selectedBranch);

  return (
    <div className="px-4 py-4 space-y-4 pb-8 select-none">
      {/* 1. Header with Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary tracking-tight">Branches</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-2 border border-border-accent text-text-secondary">
              {activeBranches.length}
            </span>
          </div>
          <p className="text-xs text-text-tertiary mt-0.5">
            Active branches in {currentRepo || 'repository'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal('branch')}
          className="h-9 px-3.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Branch</span>
        </button>
      </div>

      {switchError && (
        <InlineErrorCard
          title="Branch Operation Failed"
          message={switchError}
          onRetry={() => {
            setSwitchError(null);
            refreshData();
          }}
          compact
        />
      )}

      {/* 2. Branches Card Stream */}
      {activeBranches.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No branches available"
          description={`No active branches were detected in ${currentRepo || 'this repository'}. Create a new branch off main or refresh.`}
          primaryAction={{
            label: 'Create New Branch',
            icon: Plus,
            onClick: () => openModal('branch'),
          }}
          secondaryAction={{
            label: 'Refresh Repository',
            icon: RefreshCw,
            onClick: () => refreshData(),
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {activeBranches.map((branch) => {
            const isActive = branch.name === currentBranch;
            const isDefault = branch.name === 'main' || branch.name === 'master';

            return (
              <div
                key={branch.name}
                onClick={() => setSelectedBranch(branch.name)}
                className={`rounded-xl p-3.5 space-y-2.5 border transition-all cursor-pointer select-none active:scale-98 shadow-xs ${
                  isActive
                    ? 'bg-surface-1 border-accent/60 ring-1 ring-accent/30'
                    : 'bg-surface-1 border-border hover:border-border-accent'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive 
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                        : 'bg-surface-2 border border-border-accent text-accent'
                    }`}>
                      <GitBranch size={15} strokeWidth={2.4} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${
                          isActive ? 'text-accent' : 'text-text-primary'
                        }`}>
                          {branch.name}
                        </span>

                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                            HEAD
                          </span>
                        )}

                        {isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-surface-2 text-text-tertiary border border-border shrink-0">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-text-tertiary font-mono">
                        <span className="text-text-tertiary">ahead 2 · behind 0</span>
                        <span>·</span>
                        <span>updated 2h ago</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Switch or Details Icon */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isActive ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check size={14} strokeWidth={2.5} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwitch(branch.name);
                        }}
                        disabled={isSwitching}
                        className="h-8 px-3 rounded-lg text-xs font-semibold bg-surface-2 hover:bg-surface-3 border border-border-accent text-text-primary active:scale-95 transition-all cursor-pointer"
                      >
                        Checkout
                      </button>
                    )}
                    <ChevronRight size={15} className="text-text-tertiary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Dedicated 3-Tab Branch Inspection Modal */}
      <AnimatePresence>
        {selectedBranch && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBranch(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full bg-surface-1 border-t border-border-accent rounded-t-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
            >
              {/* Drag Handle */}
              <div className="w-10 h-1 bg-border-accent rounded-full mx-auto mt-2.5 mb-1.5 shrink-0" />

              {/* Modal Header */}
              <div className="px-4 py-3 border-b border-border-accent/80 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#58A6FF]/15 text-[#58A6FF] border border-[#58A6FF]/30">
                        Branch
                      </span>
                      {selectedBranch === currentBranch && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Active HEAD
                        </span>
                      )}
                      {(selectedBranch === 'main' || selectedBranch === 'master') && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-2 text-text-tertiary border border-border">
                          Default
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-text-primary leading-tight truncate">
                      {selectedBranch}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedBranch(null)}
                    className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* 3-Tab Segmented Selector */}
              <div className="flex border-b border-border shrink-0 bg-surface-1 px-2">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'commits', label: 'Commits' },
                  { id: 'compare', label: 'Compare & PR' },
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
                          layoutId="activeBranchTabIndicator"
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
                  <div className="space-y-3.5">
                    {/* Ancestry & Ahead/Behind Card */}
                    <div className="p-3.5 bg-surface-2 rounded-xl border border-border-accent space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                        Branch Lineage & Sync Status
                      </span>

                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2.5 rounded-lg bg-surface-1 border border-border">
                          <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">↑ 2</span>
                          <span className="text-[10px] text-text-tertiary block mt-0.5">Commits Ahead</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface-1 border border-border">
                          <span className="text-lg font-bold font-mono text-text-secondary tabular-nums">↓ 0</span>
                          <span className="text-[10px] text-text-tertiary block mt-0.5">Commits Behind</span>
                        </div>
                      </div>

                      {/* Visual Ancestry Node Graph */}
                      <div className="p-3 rounded-lg bg-surface-1/80 border border-border flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span className="w-0.5 h-6 bg-border-accent" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="min-w-0 text-xs font-mono">
                          <div className="flex items-center gap-1.5 text-text-secondary">
                            <span className="text-text-tertiary">base:</span>
                            <span className="font-semibold text-text-primary">origin/main</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-400 mt-2 font-bold">
                            <span className="text-text-tertiary font-normal">tip:</span>
                            <span>{selectedBranch}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="p-3.5 bg-surface-2 rounded-xl border border-border space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                        Protection & Policies
                      </span>
                      <div className="flex items-center justify-between text-text-secondary">
                        <span>Direct Push Allowed</span>
                        <span className="font-mono text-emerald-400 font-bold">Yes</span>
                      </div>
                      <div className="flex items-center justify-between text-text-secondary">
                        <span>Require Pull Request Review</span>
                        <span className="font-mono text-text-tertiary font-semibold">Optional</span>
                      </div>
                      <div className="flex items-center justify-between text-text-secondary">
                        <span>Required Status Checks</span>
                        <span className="font-mono text-emerald-400 font-bold">CI/CD Passing</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'commits' && (
                  <div className="space-y-2">
                    {activeCommits.length === 0 ? (
                      <div className="p-6 text-center text-xs text-text-tertiary bg-surface-2 rounded-xl">
                        No commits recorded on this branch yet.
                      </div>
                    ) : (
                      activeCommits.slice(0, 5).map((commit, idx) => (
                        <div
                          key={`${commit.hash}-${idx}`}
                          onClick={() => setSelectedCommit(commit)}
                          className="p-3.5 bg-surface-2 hover:bg-surface-3 rounded-xl border border-border flex items-start justify-between gap-2.5 cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-primary truncate">
                              {commit.msg}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-text-tertiary font-mono">
                              <span className="text-accent font-semibold tabular-nums">
                                {commit.hash.substring(0, 7)}
                              </span>
                              <span>·</span>
                              <span>{commit.author.split(' ')[0]}</span>
                              <span>·</span>
                              <span className="tabular-nums">{formatRelativeTime(commit.date || commit.timestamp)}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-text-tertiary shrink-0 mt-1" />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'compare' && (
                  <div className="space-y-3.5">
                    <div className="p-3.5 bg-surface-2 rounded-xl border border-border-accent space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                        Compare Against Default Branch
                      </span>
                      <p className="text-text-secondary text-xs leading-relaxed">
                        Comparing changes from <span className="font-mono font-semibold text-accent">{selectedBranch}</span> into <span className="font-mono font-semibold text-text-primary">main</span>.
                      </p>
                      <div className="p-2.5 rounded-lg bg-surface-1 border border-border flex items-center justify-between text-xs font-mono">
                        <span className="text-text-tertiary">Status</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check size={12} /> Able to merge cleanly
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBranch(null);
                        openModal('pr');
                      }}
                      className="w-full h-11 px-4 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <GitPullRequest size={15} />
                      <span>Create Pull Request from {selectedBranch}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sticky Footer Action Bar */}
              <div className="p-3 border-t border-border-accent bg-surface-1/95 backdrop-blur-md flex items-center gap-2 shrink-0">
                {selectedBranch !== currentBranch ? (
                  <button
                    onClick={() => handleSwitch(selectedBranch)}
                    disabled={isSwitching}
                    className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Check size={15} />
                    <span>{isSwitching ? 'Checking out...' : `Switch to ${selectedBranch}`}</span>
                  </button>
                ) : (
                  <div className="flex-1 h-11 px-4 rounded-xl bg-surface-2 border border-border text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                    <Check size={15} />
                    <span>Currently Active HEAD</span>
                  </div>
                )}

                {selectedBranch !== 'main' && selectedBranch !== 'master' && selectedBranch !== currentBranch && (
                  <button
                    onClick={() => handleDelete(selectedBranch)}
                    disabled={isDeleting}
                    className="h-11 px-3.5 rounded-xl bg-surface-2 border border-border hover:border-red-500/40 text-text-secondary hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                    title="Delete Branch"
                  >
                    <Trash2 size={15} />
                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tabbed Commit Detail Inspector */}
      <CommitDetailModal
        commit={selectedCommit}
        onClose={() => setSelectedCommit(null)}
      />
    </div>
  );
};

export const MobileBranches = BranchesScreen;
