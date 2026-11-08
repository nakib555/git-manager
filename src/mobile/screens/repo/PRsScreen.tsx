import React, { useState, useEffect } from 'react';
import { useAppContext, formatTime } from '../../../AppContext';
import { ArrowLeft } from 'lucide-react';
import { PRCommit, PRFile, PRStatusTab, PRDetailSubTab } from '../../../features/pr/types';
import { PRFilterBar } from '../../../features/pr/components/PRFilterBar';
import { PRListItem } from '../../../features/pr/components/PRListItem';
import { PRDetailOverview } from '../../../features/pr/components/PRDetailOverview';
import { PRDetailCommits } from '../../../features/pr/components/PRDetailCommits';
import { PRDetailFiles } from '../../../features/pr/components/PRDetailFiles';

export const PRsScreen: React.FC = () => {
  const { activePRs, openModal, updateLocalPRStatus, showToast, theme, githubToken, currentRepo, currentRepoOwner, deleteBranch } = useAppContext();
  const [activeTab, setActiveTab] = useState<PRStatusTab>('Open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPRId, setSelectedPRId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<PRDetailSubTab>('overview');
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'squash'>('merge');
  const [shouldDeleteBranch, setShouldDeleteBranch] = useState(true);
  const [isMerging, setIsMerging] = useState(false);
  const [prCommits, setPrCommits] = useState<PRCommit[]>([]);
  const [prFiles, setPrFiles] = useState<PRFile[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const counts = {
    open: activePRs.filter(p => p.status === 'Open').length,
    merged: activePRs.filter(p => p.status === 'Merged').length,
    closed: activePRs.filter(p => p.status === 'Closed').length,
  };

  const filteredPRs = activePRs.filter(p => {
    if (p.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedPR = activePRs.find(p => p.id === selectedPRId);

  useEffect(() => {
    if (!selectedPR || !githubToken || !currentRepoOwner || !currentRepo) {
      setPrCommits([]); setPrFiles([]); return;
    }
    setIsLoadingDetails(true);
    const headers = { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github.v3+json' };
    Promise.all([
      fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/pulls/${selectedPR.id}/commits`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/pulls/${selectedPR.id}/files`, { headers }).then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([commitsData, filesData]) => {
      setPrCommits((commitsData || []).map((c: any) => ({
        hash: (c.sha || '').substring(0, 7), msg: c.commit?.message || '', author: c.commit?.author?.name || 'user', time: formatTime(c.commit?.author?.date)
      })));
      setPrFiles((filesData || []).map((f: any) => ({
        filename: f.filename, additions: f.additions, deletions: f.deletions, patch: f.patch || ''
      })));
    }).finally(() => setIsLoadingDetails(false));
  }, [selectedPRId, githubToken, currentRepoOwner, currentRepo]);

  const handleMerge = async () => {
    if (!selectedPR) return;
    setIsMerging(true);
    try {
      updateLocalPRStatus(selectedPR.id, 'Merged');
      if (shouldDeleteBranch && selectedPR.branch) deleteBranch(selectedPR.branch);
      showToast(`Pull Request #${selectedPR.id} merged!`);
      setSelectedPRId(null);
    } catch (e: any) { showToast(e.message || 'Merge failed', 'error'); }
    finally { setIsMerging(false); }
  };

  if (selectedPR) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <button onClick={() => setSelectedPRId(null)} className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-main cursor-pointer">
            <ArrowLeft size={14} /> Back to PRs
          </button>
          <div className="flex gap-1.5">
            {(['overview', 'commits', 'files'] as PRDetailSubTab[]).map(tab => (
              <button
                key={tab} onClick={() => setDetailTab(tab)}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize cursor-pointer ${
                  detailTab === tab ? 'bg-primary text-white' : 'text-text-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <h3 className="font-bold text-base text-text-main">#{selectedPR.id} {selectedPR.title}</h3>

        {detailTab === 'overview' && (
          <PRDetailOverview
            pr={selectedPR} mergeStrategy={mergeStrategy} setMergeStrategy={setMergeStrategy}
            deleteBranch={shouldDeleteBranch} setDeleteBranch={setShouldDeleteBranch}
            isMerging={isMerging} onMerge={handleMerge}
            onClosePR={() => { updateLocalPRStatus(selectedPR.id, 'Closed'); setSelectedPRId(null); }}
          />
        )}
        {detailTab === 'commits' && <PRDetailCommits commits={prCommits} isLoading={isLoadingDetails} />}
        {detailTab === 'files' && <PRDetailFiles files={prFiles} isDark={false} isLoading={isLoadingDetails} />}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-4 py-4 space-y-4">
      <PRFilterBar
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        activeTab={activeTab} setActiveTab={setActiveTab}
        counts={counts} onNewPR={() => openModal('pr')}
      />

      <div className="space-y-3">
        {filteredPRs.map(pr => (
          <PRListItem key={pr.id} pr={pr} onSelect={() => setSelectedPRId(pr.id)} />
        ))}
        {filteredPRs.length === 0 && (
          <div className="text-center py-12 text-xs text-text-muted">No {activeTab.toLowerCase()} pull requests found</div>
        )}
      </div>
    </div>
  );
};
