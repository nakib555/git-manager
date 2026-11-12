import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../../../AppContext';
import { fetchFileContentSafe, fetchFileCommitHistorySafe } from '../../../utils/gitApi';
import { isRepositoryOwnedByUser } from '../../../utils/repoOwnership';

export function useFilesScreen() {
  const { 
    activeFiles, 
    currentRepo, 
    currentRepoOwner,
    currentBranch,
    githubToken,
    githubUser,
    githubRepos,
    adminModeOverride,
    activeCommits, 
    showToast,
    openModal,
    refreshData,
    openZipSync
  } = useAppContext();

  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string>('');
  const [activeFileLoading, setActiveFileLoading] = useState<boolean>(false);
  const [fileContentError, setFileContentError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components']));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileForModal, setSelectedFileForModal] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [contentTab, setContentTab] = useState<'code' | 'history' | 'info'>('code');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [fileHistory, setFileHistory] = useState<any[]>([]);
  const [isFileHistoryLoading, setIsFileHistoryLoading] = useState<boolean>(false);

  const isOwner = useMemo(() => {
    return isRepositoryOwnedByUser({
      repoName: currentRepo,
      repoOwner: currentRepoOwner,
      userLogin: githubUser?.login,
      reposList: githubRepos,
      adminOverride: adminModeOverride,
    });
  }, [currentRepo, currentRepoOwner, githubUser?.login, githubRepos, adminModeOverride]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const loadFileContent = async (filePath: string) => {
    setActiveFilePath(filePath);
    setSelectedFileForModal(filePath);
    setContentTab('code');
    setFileContentError(null);
    if (!currentRepo || !filePath) return;
    setActiveFileLoading(true);
    try {
      const content = await fetchFileContentSafe({
        filePath,
        repoName: currentRepo,
        owner: currentRepoOwner || githubUser?.login || '',
        branch: currentBranch || 'main',
        token: githubToken,
      });
      setActiveFileContent(content);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to stream file content';
      setFileContentError(errMsg);
      setActiveFileContent('');
      showToast(`Error loading file: ${errMsg}`, 'error');
    } finally {
      setActiveFileLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (activeFileContent) {
      navigator.clipboard.writeText(activeFileContent);
      setIsCopied(true);
      showToast('File content copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    if (!selectedFileForModal || !activeFileContent) return;
    const blob = new Blob([activeFileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFileForModal.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Download started', 'info');
  };

  // Fetch complete commit lineage from first to current for the selected file
  useEffect(() => {
    if (!selectedFileForModal) {
      setFileHistory([]);
      return;
    }

    let isCancelled = false;
    setIsFileHistoryLoading(true);

    fetchFileCommitHistorySafe({
      filePath: selectedFileForModal,
      repoName: currentRepo || '',
      owner: currentRepoOwner || githubUser?.login || '',
      branch: currentBranch || 'main',
      token: githubToken,
      fallbackCommits: activeCommits || [],
    })
      .then((history) => {
        if (!isCancelled) {
          setFileHistory(history);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setFileHistory(activeCommits || []);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsFileHistoryLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedFileForModal, currentRepo, currentRepoOwner, currentBranch, githubToken, activeCommits, githubUser?.login]);

  return {
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
  };
}
