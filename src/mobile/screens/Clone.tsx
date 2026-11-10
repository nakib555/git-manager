import React from 'react';
import { CloneFormInputs } from '../../features/clone/components/CloneFormInputs';
import { CloneSelectiveTab } from '../../features/clone/components/CloneSelectiveTab';
import { CloneTabHeader } from '../../features/clone/components/CloneTabHeader';
import { CloneBrowseSection } from '../../features/clone/components/CloneBrowseSection';
import { CloneQrCodeModal } from '../../features/clone/components/CloneQrCodeModal';
import { useCloneWorkbench } from '../../features/clone/hooks/useCloneWorkbench';

export const Clone: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    archiveFormat,
    setArchiveFormat,
    isDownloadingArchive,
    handleDownloadArchive,
    intakeMode,
    setIntakeMode,
    browseCategory,
    setBrowseCategory,
    url,
    urlMode,
    branch,
    setBranch,
    availableBranches,
    isLoadingBranches,
    depth,
    setDepth,
    isQrOpen,
    setIsQrOpen,
    repoSearch,
    setRepoSearch,
    parsedRepoInfo,
    activeBrowseList,
    myGitHubReposCount,
    recentCount,
    handleProtocolChange,
    handleUrlChange,
    handleSelectRepo,
  } = useCloneWorkbench();

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar pb-[calc(env(safe-area-inset-bottom,0px)+80px)]">
      <CloneTabHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
        {activeTab === 'clone_archive' && (
          <div className="space-y-4">
            <div className="flex bg-main p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setIntakeMode('url')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  intakeMode === 'url' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
                }`}
              >
                URL Input
              </button>
              <button
                type="button"
                onClick={() => setIntakeMode('browse')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  intakeMode === 'browse' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Browse Repos
              </button>
            </div>

            {intakeMode === 'url' ? (
              <CloneFormInputs
                url={url}
                setUrl={handleUrlChange}
                branch={branch}
                setBranch={setBranch}
                availableBranches={availableBranches}
                isLoadingBranches={isLoadingBranches}
                urlMode={urlMode}
                setUrlMode={handleProtocolChange}
                depth={depth}
                setDepth={setDepth}
                archiveFormat={archiveFormat}
                setArchiveFormat={setArchiveFormat}
                onOpenQr={() => setIsQrOpen(true)}
                onDownloadArchive={handleDownloadArchive}
                isDownloadingArchive={isDownloadingArchive}
              />
            ) : (
              <CloneBrowseSection
                repoSearch={repoSearch}
                setRepoSearch={setRepoSearch}
                browseCategory={browseCategory}
                setBrowseCategory={setBrowseCategory}
                recentList={activeBrowseList}
                myReposCount={myGitHubReposCount}
                recentCount={recentCount}
                onSelectRepo={handleSelectRepo}
              />
            )}
          </div>
        )}

        {activeTab === 'selective' && (
          <CloneSelectiveTab
            repoName={parsedRepoInfo.repo}
            repoOwner={parsedRepoInfo.owner}
            branch={branch}
          />
        )}
      </div>

      <CloneQrCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={url} />
    </div>
  );
};
