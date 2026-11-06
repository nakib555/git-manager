import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { CommitCard } from '../../components/CommitCard';
import { CommitDetailModal } from '../../components/CommitDetailModal';
import { CommitRestoreSheet } from '../../components/CommitRestoreSheet';
import { filterLocalCommits } from '../../../hooks/useCommits';
import { PaginationControls } from '../../../components/common/PaginationControls';
import { EmptyState } from '../../components/EmptyState';
import { GitCommit, Search, Plus } from 'lucide-react';
import { CommitsQuickChips } from './commits/CommitsQuickChips';
import { CommitsFilterDrawer } from './commits/CommitsFilterDrawer';
import { CommitsDeleteHeadDialog } from './commits/CommitsDeleteHeadDialog';

export const CommitsScreen: React.FC = () => {
  const { activeCommits, showToast, openModal, githubUser, deleteCommit } = useAppContext();
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [selectedCommitForRestore, setSelectedCommitForRestore] = useState<any | null>(null);
  const [commitToDeleteHead, setCommitToDeleteHead] = useState<any | null>(null);
  const [isDeletingHead, setIsDeletingHead] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | '7d' | '30d' | 'custom'>('all');
  const [ciStatusFilter, setCiStatusFilter] = useState<'all' | 'passing' | 'failing'>('all');
  const [mergesOnly, setMergesOnly] = useState(false);
  const [activeQuickChip, setActiveQuickChip] = useState<'all' | 'my' | 'week' | 'merges' | 'ci'>('all');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const distinctAuthors = useMemo(() => Array.from(new Set((activeCommits || []).map(c => c.author).filter(Boolean))), [activeCommits]);

  const activeFilterCount = (searchQuery ? 1 : 0) + (dateRangeFilter !== 'all' ? 1 : 0) + (authorFilter !== 'all' ? 1 : 0) + (mergesOnly ? 1 : 0);

  const filteredCommits = useMemo(() => {
    let list = filterLocalCommits(activeCommits || [], { query: searchQuery, author: authorFilter !== 'all' ? authorFilter : undefined });
    if (mergesOnly) list = list.filter((c: any) => c.parents && c.parents.length > 1);
    return list;
  }, [activeCommits, searchQuery, authorFilter, mergesOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredCommits.length / pageSize));
  const paginatedCommits = filteredCommits.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDeleteConfirm = async () => {
    if (!commitToDeleteHead) return;
    setIsDeletingHead(true);
    try {
      await deleteCommit(commitToDeleteHead.fullHash || commitToDeleteHead.hash);
      showToast('HEAD commit deleted!');
      setCommitToDeleteHead(null);
    } catch (e: any) { showToast(e.message || 'Delete failed', 'error'); }
    finally { setIsDeletingHead(false); }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-4 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search commits by message, SHA..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-main outline-none focus:border-primary"
          />
        </div>
        <button onClick={() => openModal('commit')} className="p-2 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-xs cursor-pointer">
          <Plus size={16} />
        </button>
      </div>

      <CommitsQuickChips
        activeQuickChip={activeQuickChip}
        onSelectChip={(t) => { setActiveQuickChip(t); setCurrentPage(1); if (t === 'my') setAuthorFilter(githubUser?.login || 'user'); else if (t === 'merges') setMergesOnly(true); else { setAuthorFilter('all'); setMergesOnly(false); } }}
        activeFilterCount={activeFilterCount} onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
      />

      <div className="space-y-2.5 flex-1 min-h-0">
        {paginatedCommits.map((commit, idx) => (
          <CommitCard
            key={commit.fullHash || commit.hash || idx}
            commit={commit}
            isLatest={currentPage === 1 && idx === 0}
            onClick={() => setSelectedCommit(commit)}
            onRestoreClick={() => setSelectedCommitForRestore(commit)}
            onDeleteHeadClick={() => setCommitToDeleteHead(commit)}
          />
        ))}
        {filteredCommits.length === 0 && (
          <div className="py-12 flex justify-center"><EmptyState icon={GitCommit} title="No commits found" description="Adjust search query or active filter chips." /></div>
        )}
      </div>

      <div className="pt-2 border-t border-border shrink-0">
        <PaginationControls currentPage={currentPage} totalItems={filteredCommits.length} pageSize={pageSize} onPageChange={setCurrentPage} />
      </div>

      <CommitDetailModal commit={selectedCommit} onClose={() => setSelectedCommit(null)} />
      <CommitRestoreSheet isOpen={!!selectedCommitForRestore} commit={selectedCommitForRestore} onClose={() => setSelectedCommitForRestore(null)} />
      <CommitsDeleteHeadDialog commit={commitToDeleteHead} isOpen={!!commitToDeleteHead} isDeleting={isDeletingHead} onClose={() => setCommitToDeleteHead(null)} onConfirm={handleDeleteConfirm} />
      <CommitsFilterDrawer
        isOpen={isFilterSheetOpen} onClose={() => setIsFilterSheetOpen(false)} authors={distinctAuthors}
        selectedAuthor={authorFilter} setSelectedAuthor={setAuthorFilter} dateRange={dateRangeFilter} setDateRange={setDateRangeFilter}
        ciStatus={ciStatusFilter} setCiStatus={setCiStatusFilter} mergesOnly={mergesOnly} setMergesOnly={setMergesOnly}
        onReset={() => { setAuthorFilter('all'); setDateRangeFilter('all'); setCiStatusFilter('all'); setMergesOnly(false); }}
        onApply={() => { setIsFilterSheetOpen(false); setCurrentPage(1); }}
      />
    </div>
  );
};
