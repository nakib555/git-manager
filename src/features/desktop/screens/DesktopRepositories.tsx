import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { Search, FolderGit2, Plus } from 'lucide-react';
import { DesktopRepoCard } from './DesktopRepoCard';
import { DeleteRepoModal } from '../../../components/DeleteRepoModal';
import { PaginationControls } from '../../../components/common/PaginationControls';

export const DesktopRepositories: React.FC<{ globalSearch?: string }> = ({ globalSearch = '' }) => {
  const {
    githubRepos, currentRepo, openRepo, openModal,
    repoTypeFilter, setRepoTypeFilter, repoSortBy, setRepoSortBy,
    repoPage, setRepoPage, repoPerPage,
  } = useAppContext();

  const [localSearch, setLocalSearch] = useState('');
  const [repoToDelete, setRepoToDelete] = useState<{ name: string; owner?: string } | null>(null);

  const activeQuery = localSearch || globalSearch;

  const filteredRepos = useMemo(() => {
    return (githubRepos || []).filter(r => {
      if (activeQuery.trim()) {
        const q = activeQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchDesc = r.description ? r.description.toLowerCase().includes(q) : false;
        if (!matchName && !matchDesc) return false;
      }
      if (repoTypeFilter === 'public') return !r.private;
      if (repoTypeFilter === 'private') return r.private;
      if (repoTypeFilter === 'forks') return r.fork;
      if (repoTypeFilter === 'sources') return !r.fork;
      return true;
    });
  }, [githubRepos, activeQuery, repoTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRepos.length / repoPerPage));
  const paginatedRepos = filteredRepos.slice((repoPage - 1) * repoPerPage, repoPage * repoPerPage);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setRepoPage(1);
              }}
              placeholder="Filter repositories..."
              className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-main outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-card border border-border rounded-xl p-1 text-xs">
            {(['all', 'public', 'private', 'forks'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setRepoTypeFilter(f); setRepoPage(1); }}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                  repoTypeFilter === f ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => openModal('repo')}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-primary/20 shrink-0"
          >
            <Plus size={14} />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Grid of Repos */}
      <div className="flex-1 overflow-y-auto pr-1 no-scrollbar min-h-0">
        {paginatedRepos.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-hover border border-border flex items-center justify-center text-text-muted mb-3">
              <FolderGit2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-text-main">No repositories found</h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm">No repositories matched your current filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-4">
            {paginatedRepos.map(repo => (
              <DesktopRepoCard
                key={repo.name}
                repo={repo}
                isActive={currentRepo === repo.name}
                onOpen={() => openRepo(repo.name)}
                onDelete={() => setRepoToDelete({ name: repo.name, owner: (repo as any).owner?.login })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="pt-3 border-t border-border shrink-0">
        <PaginationControls
          currentPage={repoPage}
          totalItems={filteredRepos.length}
          pageSize={repoPerPage}
          onPageChange={setRepoPage}
        />
      </div>

      <DeleteRepoModal
        isOpen={!!repoToDelete}
        repoName={repoToDelete?.name || ''}
        repoOwner={repoToDelete?.owner}
        onClose={() => setRepoToDelete(null)}
      />
    </div>
  );
};
