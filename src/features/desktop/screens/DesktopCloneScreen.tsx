import React from 'react';
import { CloneFormInputs } from '../../clone/components/CloneFormInputs';
import { CloneSelectiveTab } from '../../clone/components/CloneSelectiveTab';
import { CloneTabHeader } from '../../clone/components/CloneTabHeader';
import { CloneBrowseSection } from '../../clone/components/CloneBrowseSection';
import { CloneQrCodeModal } from '../../clone/components/CloneQrCodeModal';
import { useCloneWorkbench } from '../../clone/hooks/useCloneWorkbench';

export const DesktopCloneScreen: React.FC = () => {
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
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 no-scrollbar p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-text-main">Clone & Archive Workbench</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Target remote repositories, export complete archives, or select specific files for download.
          </p>
        </div>
        <CloneTabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
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
                Remote Target URL
              </button>
              <button
                type="button"
                onClick={() => setIntakeMode('browse')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  intakeMode === 'browse' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Browse Repositories
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

export const CloneScreen = DesktopCloneScreen;
