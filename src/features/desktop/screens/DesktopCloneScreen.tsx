import React from 'react';
import { CloneFormInputs } from '../../clone/components/CloneFormInputs';
import { CloneProgressView } from '../../clone/components/CloneProgressView';
import { CloneSuccessView } from '../../clone/components/CloneSuccessView';
import { CloneArchiveTab } from '../../clone/components/CloneArchiveTab';
import { CloneSelectiveTab } from '../../clone/components/CloneSelectiveTab';
import { CloneTabHeader } from '../../clone/components/CloneTabHeader';
import { CloneBrowseSection } from '../../clone/components/CloneBrowseSection';
import { CloneQrCodeModal } from '../../clone/components/CloneQrCodeModal';
import { useCloneWorkbench } from '../../clone/hooks/useCloneWorkbench';

export const DesktopCloneScreen: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    intakeMode,
    setIntakeMode,
    browseCategory,
    setBrowseCategory,
    url,
    urlMode,
    dest,
    branch,
    setBranch,
    availableBranches,
    isLoadingBranches,
    depth,
    setDepth,
    step,
    setStep,
    isQrOpen,
    setIsQrOpen,
    repoSearch,
    setRepoSearch,
    parsedRepoInfo,
    progressInfo,
    activeBrowseList,
    myGitHubReposCount,
    recentCount,
    handleProtocolChange,
    handleUrlChange,
    handleDestChange,
    handlePickDirectory,
    handleSelectRepo,
    handleStartClone,
    handleCancelClone,
    handleOpenWorkspace,
  } = useCloneWorkbench();

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 no-scrollbar p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-text-main">Clone & Export Workbench</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Clone repositories, export release archives, or select specific source files for packaging.
          </p>
        </div>
        <CloneTabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        {activeTab === 'clone' && step === 'config' && (
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
                dest={dest}
                setDest={handleDestChange}
                urlMode={urlMode}
                setUrlMode={handleProtocolChange}
                depth={depth}
                setDepth={setDepth}
                onOpenQr={() => setIsQrOpen(true)}
                onSubmit={handleStartClone}
                onPickDirectory={handlePickDirectory}
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

        {activeTab === 'clone' && step === 'progress' && (
          <CloneProgressView progressInfo={progressInfo} onCancel={handleCancelClone} />
        )}

        {activeTab === 'clone' && step === 'success' && (
          <CloneSuccessView
            repoName={parsedRepoInfo.repo}
            repoOwner={parsedRepoInfo.owner}
            destPath={dest}
            onOpenRepo={handleOpenWorkspace}
            onCloneAnother={() => setStep('config')}
          />
        )}

        {activeTab === 'archive' && (
          <CloneArchiveTab
            repoName={parsedRepoInfo.repo}
            repoOwner={parsedRepoInfo.owner}
          />
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
