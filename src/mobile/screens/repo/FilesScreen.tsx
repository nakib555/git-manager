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

export const FilesScreen: React.FC = () => {
  const {
    activeFiles,
    currentRepo,
    currentBranch,
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
    fileHistory,
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

  return (
    <div className="flex flex-col relative w-full pb-8 select-none">
      <FilesHeaderBar
        currentRepo={currentRepo || ''}
        filesCount={activeFiles.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onZipSync={openZipSync}
      />

      <div className="p-4">
        {activeFiles.length === 0 ? (
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
                onToggleFolder={toggleFolder}
                onSelectFile={loadFileContent}
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
            activeFileContent={activeFileContent}
            activeFileLoading={activeFileLoading}
            fileContentError={fileContentError}
            fileHistory={fileHistory}
            contentTab={contentTab}
            isFullscreen={isFullscreen}
            isCopied={isCopied}
            onSetContentTab={setContentTab}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            onClose={() => setSelectedFileForModal(null)}
            onEdit={() => setIsEditingFile(true)}
            onCopy={handleCopyCode}
            onDownload={handleDownloadFile}
            onRetry={() => activeFilePath && loadFileContent(activeFilePath)}
          />
        )}
      </AnimatePresence>

      {isEditingFile && selectedFileForModal && (
        <MobileFileEditor
          filePath={selectedFileForModal}
          initialContent={activeFileContent}
          onClose={() => setIsEditingFile(false)}
          onCommitted={() => {
            setIsEditingFile(false);
            if (selectedFileForModal) loadFileContent(selectedFileForModal);
          }}
        />
      )}
    </div>
  );
};

export const MobileFiles = FilesScreen;
