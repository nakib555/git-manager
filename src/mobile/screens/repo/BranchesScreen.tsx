import React, { useState } from 'react';
import { useAppContext } from '../../../AppContext';
import { GitBranch, Plus, RefreshCw } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { InlineErrorCard } from '../../components/InlineErrorCard';
import { CommitDetailModal } from '../../components/CommitDetailModal';
import { BranchCardItem } from './branches/BranchCardItem';
import { BranchDetailModal } from './branches/BranchDetailModal';

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
    if (name === currentBranch || name === 'main' || name === 'master') {
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary tracking-tight">Branches</h2>
            <span className="text-xs font-mono text-text-tertiary">({activeBranches.length})</span>
          </div>
          <p className="text-xs text-text-tertiary mt-0.5">Active branches in {currentRepo || 'repository'}</p>
        </div>
        <button
          type="button"
          onClick={() => openModal('branch')}
          className="h-9 px-3.5 rounded-xl bg-text-primary text-background hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
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

      {activeBranches.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No branches available"
          description={`No active branches were detected in ${currentRepo || 'this repository'}.`}
          primaryAction={{ label: 'Create New Branch', icon: Plus, onClick: () => openModal('branch') }}
          secondaryAction={{ label: 'Refresh Repository', icon: RefreshCw, onClick: () => refreshData() }}
        />
      ) : (
        <div className="space-y-2.5">
          {activeBranches.map((branch) => (
            <BranchCardItem
              key={branch.name}
              branch={branch}
              isActive={branch.name === currentBranch}
              isDefault={branch.name === 'main' || branch.name === 'master'}
              isSwitching={isSwitching}
              onSelect={() => setSelectedBranch(branch.name)}
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
        currentBranch={currentBranch}
        activeTab={activeTab}
        activeCommits={activeCommits}
        isSwitching={isSwitching}
        isDeleting={isDeleting}
        onTabChange={setActiveTab}
        onClose={() => setSelectedBranch(null)}
        onSelectCommit={setSelectedCommit}
        onCreatePR={() => {
          setSelectedBranch(null);
          openModal('pr');
        }}
        onSwitch={() => selectedBranch && handleSwitch(selectedBranch)}
        onDelete={() => selectedBranch && handleDelete(selectedBranch)}
      />

      <CommitDetailModal commit={selectedCommit} onClose={() => setSelectedCommit(null)} />
    </div>
  );
};

export const MobileBranches = BranchesScreen;
