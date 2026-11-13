import React, { useMemo } from 'react';
import { FolderTree, GitBranch, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { buildFastFileTree } from '../../utils/treeBuilder';
import { EmptyState } from '../../components/EmptyState';
import { MobileFileEditor } from '../../components/editor/MobileFileEditor';
import { FilesHeaderBar } from './files/FilesHeaderBar';
import { FilesTreeNodeItem } from './files/FilesTreeNodeItem';
import { FileViewerModal } from './files/FileViewerModal';
import { useFilesScreen } from './files/useFilesScreen';
import { useAppContext } from '../../../AppContext';
import { DeleteFileConfirmModal } from '../../../components/modals/DeleteFileConfirmModal';
import { FileTreeSkeleton } from '../../components/skeleton/ScreenSkeletons';

export const FilesScreen: React.FC = () => {
  const { showToast, deleteFileOrFolder, isLoadingRepoDetails } = useAppContext();
  const [deleteTarget, setDeleteTarget] = React.useState<{ path: string; isFolder: boolean } | null>(null);
  const {
    activeFiles,
    currentRepo,
    currentRepoOwner,
    currentBranch,
    githubToken,
    activeFilePath,
    activeFileContent,
    activeFileLoading,
    fileContentError,
    expandedFolders,
    searchQuery,
    selectedFileForModal,
    isCopied,
    contentTab,
    isFullscreen,
    isEditingFile,
    isOwner,
    fileHistory,
    isFileHistoryLoading,
    setSearchQuery,
    setSelectedFileForModal,
    setContentTab,
    setIsFullscreen,
    setIsEditingFile,
    toggleFolder,
    loadFileContent,
    handleCopyCode,
    handleDownloadFile,
    openModal,
    refreshData,
    openZipSync,
  } = useFilesScreen();

  const fileTree = useMemo(() => buildFastFileTree(activeFiles), [activeFiles]);

  const handleEditRequest = () => {
    if (!isOwner) {
      showToast('Read-only: You can only edit code in repositories you own.', 'error');
      return;
    }
    setIsEditingFile(true);
  };

  return (
    <div className="flex flex-col relative w-full pb-8 select-none">
      <FilesHeaderBar
        currentRepo={currentRepo || ''}
        filesCount={activeFiles.length}
        searchQuery={searchQuery}
        isOwner={isOwner}
        onSearchChange={setSearchQuery}
        onZipSync={openZipSync}
      />

      <div className="p-4">
        {isLoadingRepoDetails && activeFiles.length === 0 ? (
          <div className="bg-surface-1 border border-border rounded-xl p-2 overflow-hidden shadow-xs">
            <FileTreeSkeleton />
          </div>
        ) : activeFiles.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No files in repository"
            description={`No files or directories were found on branch "${currentBranch || 'main'}".`}
            primaryAction={{ label: 'Switch Branch', icon: GitBranch, onClick: () => openModal('branch') }}
            secondaryAction={{ label: 'Refresh Repository', icon: RefreshCw, onClick: () => refreshData() }}
          />
        ) : (
          <div className="bg-surface-1 border border-border rounded-xl divide-y divide-border/60 overflow-hidden shadow-xs">
            {fileTree.map(node => (
              <FilesTreeNodeItem
                key={node.path}
                node={node}
                depth={0}
                expandedFolders={expandedFolders}
                activeFilePath={activeFilePath}
                searchQuery={searchQuery}
                isOwner={isOwner}
                onToggleFolder={toggleFolder}
                onSelectFile={loadFileContent}
                onDelete={(node) => setDeleteTarget({ path: node.path, isFolder: node.type === 'dir' })}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedFileForModal && (
          <FileViewerModal
            selectedFile={selectedFileForModal}
            currentRepo={currentRepo || ''}
            currentRepoOwner={currentRepoOwner}
            currentBranch={currentBranch || 'main'}
            githubToken={githubToken}
            activeFileContent={activeFileContent}
            activeFileLoading={activeFileLoading}
            fileContentError={fileContentError}
            fileHistory={fileHistory}
            isFileHistoryLoading={isFileHistoryLoading}
            contentTab={contentTab}
            isFullscreen={isFullscreen}
            isCopied={isCopied}
            isOwner={isOwner}
            onSetContentTab={setContentTab}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            onClose={() => setSelectedFileForModal(null)}
            onEdit={handleEditRequest}
            onCopy={handleCopyCode}
            onDownload={handleDownloadFile}
            onDelete={() => {
              const file = selectedFileForModal;
              setSelectedFileForModal(null);
              setDeleteTarget({ path: file, isFolder: false });
            }}
            onRetry={() => activeFilePath && loadFileContent(activeFilePath)}
          />
        )}
      </AnimatePresence>

      {isEditingFile && selectedFileForModal && (
        <MobileFileEditor
          filePath={selectedFileForModal}
          initialContent={activeFileContent}
          isOwner={isOwner}
          onClose={() => setIsEditingFile(false)}
          onCommitted={() => {
            setIsEditingFile(false);
            if (selectedFileForModal) loadFileContent(selectedFileForModal);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteFileConfirmModal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          targetPath={deleteTarget.path}
          isFolder={deleteTarget.isFolder}
          currentRepo={currentRepo || ''}
          currentBranch={currentBranch || 'main'}
          allFiles={activeFiles || []}
          onConfirmDelete={async ({ targetPath, isFolder, commitMessage }) => {
            return await deleteFileOrFolder({
              targetPath,
              isFolder,
              commitMessage,
              branch: currentBranch || 'main',
              throwOnError: true,
            });
          }}
        />
      )}
    </div>
  );
};

export const MobileFiles = FilesScreen;
