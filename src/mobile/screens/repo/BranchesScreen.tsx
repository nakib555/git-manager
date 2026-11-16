import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../../AppContext';
import { GitBranch, Plus, RefreshCw } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { InlineErrorCard } from '../../components/InlineErrorCard';
import { CommitDetailModal } from '../../components/CommitDetailModal';
import { BranchCardItem } from './branches/BranchCardItem';
import { BranchDetailModal } from './branches/BranchDetailModal';
import {
  enrichBranchesWithCommits,
  resolveDefaultBranchName,
} from '../../../features/branches/branchInspectionService';
import {
  BranchFilterMode,
  BranchOverviewStrip,
} from '../../../features/branches/components/BranchOverviewStrip';

export const BranchesScreen: React.FC = () => {
  const {
    activeBranches,
    currentBranch,
    switchBranch,
    openModal,
    currentRepo,
    currentRepoOwner,
    githubToken,
    githubUser,
    showToast,
    refreshData,
    activeCommits,
    deleteBranch: deleteBranchOnGitHub,
  } = useAppContext();

  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'compare'>('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<BranchFilterMode>('all');

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
    () => enrichedBranches.find((b) => b.name === selectedBranchName) || null,
    [enrichedBranches, selectedBranchName]
  );

  const handleSwitch = async (name: string) => {
    if (isSwitching || name === currentBranch) return;
    setIsSwitching(true);
    setSwitchError(null);
    try {
      await switchBranch(name);
      showToast(`Switched to branch "${name}"`, 'success');
    } catch (err: any) {
      const msg = err.message || `Failed to switch to branch "${name}"`;
      setSwitchError(msg);
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSwitching(false);
    }
  };

  const handleDelete = async (name: string) => {
    const target = enrichedBranches.find((b) => b.name === name);
    if (name === activeHeadName || target?.isDefault || name === 'main' || name === 'master') {
      const msg = 'Cannot delete default or currently active branch';
      showToast(msg, 'error');
      throw new Error(msg);
    }
    setIsDeleting(true);
    try {
      await deleteBranchOnGitHub(name);
      showToast(`Deleted branch "${name}"`, 'success');
    } catch (err: any) {
      const msg = `Delete failed: ${err.message || err}`;
      showToast(msg, 'error');
      throw new Error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-8 select-none">
      {enrichedBranches.length > 0 && (
        <BranchOverviewStrip
          branches={enrichedBranches}
          activeBranchName={activeHeadName}
          defaultBranchName={defaultBranchName}
          search={search}
          filter={filter}
          compact
          onSearchChange={setSearch}
          onFilterChange={setFilter}
          onCreateBranch={() => openModal('branch')}
        />
      )}

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

      {enrichedBranches.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No branches available"
          description={`No active branches were detected in ${currentRepo || 'this repository'}.`}
          primaryAction={{ label: 'Create New Branch', icon: Plus, onClick: () => openModal('branch') }}
          secondaryAction={{ label: 'Refresh Repository', icon: RefreshCw, onClick: () => refreshData() }}
        />
      ) : filteredBranches.length === 0 ? (
        <div className="p-8 text-center bg-surface-1 border border-border rounded-2xl space-y-1.5">
          <p className="text-sm font-semibold text-text-primary">No matching branches</p>
          <p className="text-xs text-text-secondary">
            Try clearing the filter or search query.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredBranches.map((branch, idx) => (
            <BranchCardItem
              key={branch.name}
              branch={branch}
              isSwitching={isSwitching}
              index={idx}
              onSelect={() => setSelectedBranchName(branch.name)}
              onSwitch={(e) => {
                e.stopPropagation();
                handleSwitch(branch.name);
              }}
            />
          ))}
        </div>
      )}

      <BranchDetailModal
        selectedBranch={selectedBranch}
        baseBranchName={defaultBranchName}
        owner={currentRepoOwner || githubUser?.login || null}
        repo={currentRepo}
        token={githubToken}
        activeTab={activeTab}
        activeCommits={activeCommits}
        isSwitching={isSwitching}
        isDeleting={isDeleting}
        onTabChange={setActiveTab}
        onClose={() => setSelectedBranchName(null)}
        onSelectCommit={setSelectedCommit}
        onCreatePR={() => {
          setSelectedBranchName(null);
          openModal('pr');
        }}
        onSwitch={() => selectedBranch && handleSwitch(selectedBranch.name)}
        onDelete={() => selectedBranch && handleDelete(selectedBranch.name)}
      />

      <CommitDetailModal commit={selectedCommit} onClose={() => setSelectedCommit(null)} />
    </div>
  );
};

export const MobileBranches = BranchesScreen;
