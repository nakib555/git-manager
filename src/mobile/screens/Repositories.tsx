import React, { useState } from 'react';
import { RepoCard } from '../components/RepoCard';
import { PaginationControls } from '../../components/common/PaginationControls';
import { InlineErrorCard } from '../components/InlineErrorCard';
import { GitHubRepo } from '../../types';
import { DeleteRepoModal } from '../../components/DeleteRepoModal';
import { RepoControlsHeader } from './repositories/RepoControlsHeader';
import { RepoSortSheet } from './repositories/RepoSortSheet';
import { RepoEmptyStates } from './repositories/RepoEmptyStates';
import { useRepositoriesState } from './repositories/useRepositoriesState';
import { filterChips, sortOptions } from './repositories/repoConstants';

export const Repositories: React.FC = () => {
  const [repoToDelete, setRepoToDelete] = useState<GitHubRepo | null>(null);
  const {
    githubRepos, openRepo, currentRepo, repoPage, repoPageSize, totalItems, paginatedRepos,
    syncError, localSearch, isSortSheetOpen, scrollRef, repoSearchScope, repoTypeFilter,
    repoSortBy, repoSortDirection, isFetchingRepos, githubToken, setRepoPage, setRepoPageSize,
    setSyncError, setLocalSearch, setIsSortSheetOpen, setRepoSearchScope, setRepoTypeFilter,
    setRepoSortBy, setRepoSortDirection, connectGitHub, openModal, navigate, refreshData, showToast,
  } = useRepositoriesState();

  const handleRetrySync = async () => {
    setSyncError(null);
    try {
      await refreshData();
      showToast('Repositories refreshed successfully', 'success');
    } catch (err: any) {
      setSyncError(err.message || 'Failed to refresh repositories');
      showToast('Failed to refresh repositories', 'error');
    }
  };

  return (
    <div className="flex flex-col relative w-full" ref={scrollRef}>
      <RepoControlsHeader
        repoSearchScope={repoSearchScope}
        localSearch={localSearch}
        isFetchingRepos={isFetchingRepos}
        repoTypeFilter={repoTypeFilter}
        filterChips={filterChips}
        onScopeChange={(scope) => { setRepoSearchScope(scope); setRepoPage(1); }}
        onSearchChange={setLocalSearch}
        onClearSearch={() => setLocalSearch('')}
        onOpenSortSheet={() => setIsSortSheetOpen(true)}
        onFilterChange={(id) => { setRepoTypeFilter(id); setRepoPage(1); }}
      />

      <div className="p-4 space-y-3 flex-1 min-h-0">
        {syncError ? (
          <InlineErrorCard
            title="Repository Sync Failed"
            message="Unable to fetch repositories from GitHub."
            error={syncError}
            onRetry={handleRetrySync}
            secondaryAction={{ label: 'Open Clone Screen', onClick: () => navigate('clone') }}
          />
        ) : githubRepos.length === 0 ? (
          <RepoEmptyStates
            localSearch={localSearch}
            repoSearchScope={repoSearchScope}
            githubToken={githubToken}
            onClearSearch={() => setLocalSearch('')}
            onSetGlobalScope={() => { setRepoSearchScope('global'); setRepoPage(1); }}
            onCreateRepo={() => openModal('repo')}
            onConnectGitHub={connectGitHub}
            onNavigateClone={() => navigate('clone')}
          />
        ) : (
          <div className="space-y-3.5 pb-6">
            {paginatedRepos.map((repo, idx) => {
              const staggerClass = `stagger-${Math.min(idx + 1, 8)}`;
              return (
                <div key={repo.name} className={`${staggerClass} cascade-item`}>
                  <RepoCard
                    repo={repo}
                    isActive={currentRepo === repo.name}
                    onClick={() => openRepo(repo.name, (repo as any).owner?.login)}
                    onDelete={(r) => setRepoToDelete(r)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-surface-1 border-t border-border px-4 py-3 shrink-0 select-none mb-6">
        <PaginationControls
          currentPage={repoPage}
          totalItems={totalItems}
          pageSize={repoPageSize}
          pageSizeOptions={[10, 25, 50, -1]}
          onPageSizeChange={(newSize) => { setRepoPageSize(newSize); setRepoPage(1); }}
          onPageChange={(page) => setRepoPage(page)}
          isLoading={isFetchingRepos}
          compact={false}
          itemName="repos"
        />
      </div>

      <RepoSortSheet
        isOpen={isSortSheetOpen}
        repoSortBy={repoSortBy}
        repoSortDirection={repoSortDirection}
        sortOptions={sortOptions}
        onClose={() => setIsSortSheetOpen(false)}
        onSetSortBy={(opt) => setRepoSortBy(opt)}
        onSetDirection={(dir) => setRepoSortDirection(dir)}
      />

      <DeleteRepoModal
        isOpen={!!repoToDelete}
        repoName={repoToDelete?.name || ''}
        repoOwner={(repoToDelete as any)?.owner?.login}
        onClose={() => setRepoToDelete(null)}
      />
    </div>
  );
};

export const MobileRepositories = Repositories;
