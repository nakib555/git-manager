import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronRight, GitBranch, Lock, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { useResponsiveBreakpoints } from '../../../hooks/useIsDesktop';
import { DesktopDeleteBranchModal } from './branches/DesktopDeleteBranchModal';
import { CommitDetailModal } from '../../../mobile/components/CommitDetailModal';
import {
  enrichBranchesWithCommits,
  resolveDefaultBranchName,
} from '../../branches/branchInspectionService';
import {
  BranchFilterMode,
  BranchOverviewStrip,
} from '../../branches/components/BranchOverviewStrip';
import { BranchInspectorPanel } from '../../branches/components/BranchInspectorPanel';

export const DesktopBranchesView: React.FC = () => {
  const {
    activeBranches,
    activeCommits,
    currentBranch,
    currentRepo,
    currentRepoOwner,
    githubToken,
    githubUser,
    openModal,
    deleteBranch,
    switchBranch,
    showToast,
  } = useAppContext();

  const { isDesktop } = useResponsiveBreakpoints();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<BranchFilterMode>('all');
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);

  const defaultBranchName = useMemo(
    () => resolveDefaultBranchName(activeBranches),
    [activeBranches]
  );

  const activeHeadName = currentBranch || defaultBranchName;

  const enrichedBranches = useMemo(
    () =>
      enrichBranchesWithCommits(
        activeBranches,
        activeCommits,
        activeHeadName,
        defaultBranchName
      ),
    [activeBranches, activeCommits, activeHeadName, defaultBranchName]
  );

  // Keep desktop selection aligned cleanly with existing branches
  useEffect(() => {
    if (enrichedBranches.length === 0) {
      setSelectedBranchName(null);
      return;
    }
    if (
      !selectedBranchName ||
      !enrichedBranches.some((b) => b.name === selectedBranchName)
    ) {
      setSelectedBranchName(
        enrichedBranches.find((b) => b.isActive)?.name || enrichedBranches[0].name
      );
    }
  }, [enrichedBranches, selectedBranchName]);

  // Escape closes slide-over inspector drawer on Tablet
  useEffect(() => {
    if (!isDrawerOpen || isDesktop) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isDrawerOpen, isDesktop]);

  const filteredBranches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrichedBranches.filter((branch) => {
      if (filter === 'protected' && !branch.isProtected) return false;
      if (!q) return true;
      return (
        branch.name.toLowerCase().includes(q) ||
        branch.lastCommitMsg.toLowerCase().includes(q) ||
        branch.shortSha.toLowerCase().includes(q)
      );
    });
  }, [enrichedBranches, filter, search]);

  const selectedBranch = useMemo(
    () =>
      enrichedBranches.find((b) => b.name === selectedBranchName) ||
      enrichedBranches[0] ||
      null,
    [enrichedBranches, selectedBranchName]
  );

  const handleSelectBranch = (branchName: string) => {
    setSelectedBranchName(branchName);
    if (!isDesktop) {
      setIsDrawerOpen(true);
    }
  };

  const handleCheckout = async (branchName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isSwitching || branchName === activeHeadName) return;
    setIsSwitching(true);
    try {
      await switchBranch(branchName);
      showToast(`Checked out branch '${branchName}'`, 'success');
    } catch (err: any) {
      showToast(err?.message || `Failed to switch to '${branchName}'`, 'error');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4 relative">
      <BranchOverviewStrip
        branches={enrichedBranches}
        activeBranchName={activeHeadName}
        defaultBranchName={defaultBranchName}
        search={search}
        filter={filter}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
        onCreateBranch={() => openModal('branch')}
      />

      {/* Master-Detail Split on Desktop (>= 1024px) | Full-width List + Slide-over Drawer on Tablet */}
      <div className="flex-1 min-h-0 flex gap-4">
        <div className="flex-1 min-w-0 overflow-y-auto pr-1 space-y-2.5 pb-4">
          {filteredBranches.map((branch, idx) => {
            const isSelected = selectedBranch?.name === branch.name && (isDesktop || isDrawerOpen);
            const staggerClass = `cascade-item stagger-${Math.min(idx + 1, 8)}`;

            return (
              <div
                key={branch.name}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectBranch(branch.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectBranch(branch.name);
                  }
                }}
                aria-current={isSelected ? 'true' : undefined}
                className={`bg-surface-1 rounded-2xl border p-4 flex items-center justify-between gap-4 transition-colors cursor-pointer ${staggerClass} ${
                  isSelected
                    ? 'border-accent bg-accent-soft/40'
                    : branch.isActive
                      ? 'border-border hover:border-accent/50'
                      : 'border-border hover:border-text-tertiary/50 hover:bg-surface-2/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      branch.isActive
                        ? 'bg-accent-soft border-accent/30 text-accent'
                        : 'bg-surface-2 border-border text-text-secondary'
                    }`}
                  >
                    <GitBranch size={16} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-text-primary font-mono truncate">
                        {branch.name}
                      </span>
                      {branch.isActive && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-addition/15 text-addition shrink-0">
                          HEAD
                        </span>
                      )}
                      {branch.isDefault && (
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-secondary shrink-0">
                          Default
                        </span>
                      )}
                      {branch.isProtected && !branch.isDefault && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-text-tertiary shrink-0">
                          <Lock size={10} /> Protected
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-text-secondary truncate">
                      {branch.lastCommitMsg}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-text-tertiary">
                      {branch.shortSha && (
                        <span className="text-accent tabular-nums">{branch.shortSha}</span>
                      )}
                      {branch.lastCommitAuthor && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[140px]">
                            {branch.lastCommitAuthor}
                          </span>
                        </>
                      )}
                      {branch.relativeTime && (
                        <>
                          <span>·</span>
                          <span className="tabular-nums shrink-0">{branch.relativeTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Always-Visible Controls for Desktop & Tablet Touch Ergonomics */}
                <div className="flex items-center gap-2 shrink-0">
                  {branch.isActive ? (
                    <span className="min-h-[36px] px-3 rounded-xl bg-surface-2 border border-border text-addition text-xs font-semibold flex items-center gap-1.5">
                      <Check size={13} strokeWidth={2.5} />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isSwitching}
                      onClick={(e) => handleCheckout(branch.name, e)}
                      className="min-h-[36px] px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-primary text-xs font-semibold transition-colors cursor-pointer btn-tactile disabled:opacity-50"
                    >
                      Checkout
                    </button>
                  )}

                  {!branch.isDefault && !branch.isActive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBranchToDelete(branch.name);
                      }}
                      aria-label={`Delete branch ${branch.name}`}
                      title={`Delete ${branch.name}`}
                      className="min-h-[36px] min-w-[36px] px-2.5 rounded-xl bg-surface-2 hover:bg-danger/15 border border-border hover:border-danger/40 text-text-secondary hover:text-danger transition-colors cursor-pointer flex items-center justify-center btn-tactile"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {!isDesktop && (
                    <ChevronRight size={16} className="text-text-tertiary ml-0.5" />
                  )}
                </div>
              </div>
            );
          })}

          {filteredBranches.length === 0 && (
            <div className="bg-surface-1 border border-border rounded-2xl p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-text-primary">
                No matching branches found
              </p>
              <p className="text-xs text-text-secondary">
                Adjust your search query or switch filters to see all repository refs.
              </p>
            </div>
          )}
        </div>

        {/* Desktop Inline Sticky Inspector Panel */}
        {isDesktop && (
          <div className="w-[390px] xl:w-[430px] shrink-0 min-h-0">
            <BranchInspectorPanel
              branch={selectedBranch}
              baseBranchName={defaultBranchName}
              owner={currentRepoOwner || githubUser?.login || null}
              repo={currentRepo}
              token={githubToken}
              activeCommits={activeCommits}
              isSwitching={isSwitching}
              onSwitchBranch={(name) => handleCheckout(name)}
              onDeleteBranch={(name) => setBranchToDelete(name)}
              onCreatePR={() => openModal('pr')}
              onSelectCommit={setSelectedCommit}
            />
          </div>
        )}
      </div>

      {/* Tablet Slide-Over Inspector Drawer (768px - 1023px) */}
      <AnimatePresence>
        {!isDesktop && isDrawerOpen && selectedBranch && (
          <div
            className="fixed inset-0 z-[160] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label={`Inspect branch ${selectedBranch.name}`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/65"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 360 }}
              className="relative z-10 w-full max-w-[460px] h-full p-3 sm:p-4 bg-background border-l border-border shadow-2xl flex flex-col"
            >
              <BranchInspectorPanel
                branch={selectedBranch}
                baseBranchName={defaultBranchName}
                owner={currentRepoOwner || githubUser?.login || null}
                repo={currentRepo}
                token={githubToken}
                activeCommits={activeCommits}
                isSwitching={isSwitching}
                showCloseButton
                onClose={() => setIsDrawerOpen(false)}
                onSwitchBranch={(name) => handleCheckout(name)}
                onDeleteBranch={(name) => {
                  setIsDrawerOpen(false);
                  setBranchToDelete(name);
                }}
                onCreatePR={() => {
                  setIsDrawerOpen(false);
                  openModal('pr');
                }}
                onSelectCommit={setSelectedCommit}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DesktopDeleteBranchModal
        branchName={branchToDelete}
        onClose={() => setBranchToDelete(null)}
        onConfirmDelete={deleteBranch}
      />

      <CommitDetailModal commit={selectedCommit} onClose={() => setSelectedCommit(null)} />
    </div>
  );
};
