import React from 'react';
import { motion } from 'motion/react';
import { FileViewerTabs } from './FileViewerTabs';
import { FileViewerModalHeader } from './FileViewerModalHeader';

interface FileViewerModalProps {
  selectedFile: string;
  currentRepo: string;
  currentRepoOwner?: string;
  currentBranch?: string;
  githubToken?: string | null;
  activeFileContent: string;
  activeFileLoading: boolean;
  fileContentError: string | null;
  fileHistory: any[];
  isFileHistoryLoading?: boolean;
  contentTab: 'code' | 'history' | 'info';
  isFullscreen: boolean;
  isCopied: boolean;
  isOwner?: boolean;
  onSetContentTab: (tab: 'code' | 'history' | 'info') => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onRetry: () => void;
  onDelete?: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  selectedFile,
  currentRepo,
  currentRepoOwner,
  currentBranch,
  githubToken,
  activeFileContent,
  activeFileLoading,
  fileContentError,
  fileHistory,
  isFileHistoryLoading = false,
  contentTab,
  isFullscreen,
  isCopied,
  isOwner = true,
  onSetContentTab,
  onToggleFullscreen,
  onClose,
  onEdit,
  onCopy,
  onDownload,
  onRetry,
  onDelete,
}) => {
  const lineCount = activeFileContent ? activeFileContent.split('\n').length : 0;
  const fileSizeEst = activeFileContent ? activeFileContent.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className={`relative w-full bg-surface-1 border-t border-border-accent rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-4 shadow-2xl z-10 flex flex-col transition-all duration-200 ${
          isFullscreen ? 'h-[96vh]' : 'max-h-[88vh] h-[85vh]'
        }`}
      >
        <div className="w-10 h-1 bg-border-accent rounded-full mx-auto mb-2 shrink-0" />

        <FileViewerModalHeader
          selectedFile={selectedFile}
          currentRepo={currentRepo}
          lineCount={lineCount}
          fileSizeEst={fileSizeEst}
          contentTab={contentTab}
          isFullscreen={isFullscreen}
          isCopied={isCopied}
          activeFileLoading={activeFileLoading}
          isOwner={isOwner}
          onSetContentTab={onSetContentTab}
          onToggleFullscreen={onToggleFullscreen}
          onClose={onClose}
          onEdit={onEdit}
          onCopy={onCopy}
          onDownload={onDownload}
          onDelete={onDelete}
        />

        <div className="flex-1 overflow-auto rounded-xl bg-background border border-border mt-2 text-xs font-mono min-h-0 relative">
          <FileViewerTabs
            contentTab={contentTab}
            selectedFile={selectedFile}
            activeFileContent={activeFileContent}
            activeFileLoading={activeFileLoading}
            fileContentError={fileContentError}
            fileHistory={fileHistory}
            isFileHistoryLoading={isFileHistoryLoading}
            currentRepo={currentRepo}
            currentRepoOwner={currentRepoOwner}
            currentBranch={currentBranch}
            githubToken={githubToken}
            isOwner={isOwner}
            onRetry={onRetry}
            onSetContentTab={onSetContentTab}
          />
        </div>
      </motion.div>
    </div>
  );
};
