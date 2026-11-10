import React from 'react';
import { useAppContext } from '../AppContext';
import { motion } from 'motion/react';
import { CloneFormInputs } from '../features/clone/components/CloneFormInputs';
import { CloneSelectiveTab } from '../features/clone/components/CloneSelectiveTab';
import { CloneTabHeader } from '../features/clone/components/CloneTabHeader';
import { CloneBrowseSection } from '../features/clone/components/CloneBrowseSection';
import { CloneQrCodeModal } from '../features/clone/components/CloneQrCodeModal';
import { useCloneWorkbench } from '../features/clone/hooks/useCloneWorkbench';

export const CloneModal = () => {
  const { closeModal } = useAppContext();

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
  } = useCloneWorkbench({ isModal: true, onCloseModal: closeModal });

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="absolute inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
        aria-hidden="true"
      />
      <motion.div
        initial={{ y: '100%', opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
        role="dialog"
        aria-modal="true"
        className="relative bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-10 pb-[env(safe-area-inset-bottom,0px)] sm:-translate-y-4 affordance-card"
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5 -mb-1 sm:hidden shrink-0" />
        <CloneTabHeader activeTab={activeTab} setActiveTab={setActiveTab} onClose={closeModal} />

        <div className="p-5 sm:p-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] overflow-y-auto flex-1 no-scrollbar">
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
      </motion.div>

      <CloneQrCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={url} />
    </div>
  );
};
