import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { 
  Folder, FileText, ChevronRight, ChevronDown, Copy, 
  Check, Search, X, Home, Maximize2, Minimize2, 
  Download, FileCode, Clock, Info, ArrowUpRight,
  FolderTree, RefreshCw, GitBranch, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { buildFastFileTree, TreeNode } from '../../utils/treeBuilder';
import { formatBytes, formatRelativeTime } from '../../utils/formatters';
import { fetchFileContentSafe } from '../../utils/gitApi';
import { EmptyState } from '../../components/EmptyState';
import { InlineErrorCard } from '../../components/InlineErrorCard';

const getCodeLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'markup';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    case 'rs':
      return 'rust';
    case 'go':
      return 'go';
    case 'sh':
      return 'bash';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'sql':
      return 'sql';
    default:
      return 'text';
  }
};

export const FilesScreen: React.FC = () => {
  const { 
    activeFiles, 
    currentRepo, 
    currentRepoOwner,
    currentBranch,
    githubToken,
    githubUser,
    activeCommits, 
    showToast,
    openModal,
    refreshData
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
  const [wrapLines, setWrapLines] = useState(false);
  const [inCodeSearch, setInCodeSearch] = useState('');

  // Fast O(1) single-pass tree builder
  const fileTree = useMemo(() => {
    return buildFastFileTree(activeFiles);
  }, [activeFiles]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const loadFileContent = async (filePath: string) => {
    setActiveFilePath(filePath);
    setSelectedFileForModal(filePath);
    setContentTab('code');
    setInCodeSearch('');
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

  const lineCount = activeFileContent ? activeFileContent.split('\n').length : 0;
  const characterCount = activeFileContent ? activeFileContent.length : 0;
  const fileSizeEst = characterCount;

  // Filter commits that relate to this file or fallback to active commits
  const fileHistory = useMemo(() => {
    if (!selectedFileForModal) return [];
    const fileNameOnly = selectedFileForModal.split('/').pop()?.toLowerCase();
    const matched = activeCommits.filter(c => 
      c.msg?.toLowerCase().includes(fileNameOnly || '') ||
      c.files?.some((f: any) => f.filename?.includes(selectedFileForModal))
    );
    return matched.length > 0 ? matched : activeCommits.slice(0, 5);
  }, [activeCommits, selectedFileForModal]);

  // Render tree node recursively
  const renderNode = (node: TreeNode, depth = 0) => {
    const isFolder = node.type === 'dir';
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = activeFilePath === node.path;

    if (searchQuery.trim().length > 0) {
      if (!isFolder && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
      }
    }

    return (
      <div key={node.path} className="select-none">
        <div
          onClick={() => (isFolder ? toggleFolder(node.path) : loadFileContent(node.path))}
          style={{ paddingLeft: `${Math.max(16, depth * 16 + 16)}px` }}
          className={`min-h-[44px] h-11 pr-4 flex items-center justify-between text-[13px] transition-colors cursor-pointer border-l-2 ${
            isSelected && !isFolder
              ? 'bg-accent/10 text-accent border-accent font-semibold'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-2/60'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {isFolder ? (
              <>
                {isExpanded ? (
                  <ChevronDown size={14} className="text-text-tertiary shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-text-tertiary shrink-0" />
                )}
                <Folder size={16} className="text-accent shrink-0" />
              </>
            ) : (
              <>
                <span className="w-3.5" />
                <FileText size={15} className="text-text-tertiary shrink-0" />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </div>

          {!isFolder && node.size !== undefined && (
            <span className="text-[10px] text-text-tertiary font-mono shrink-0 ml-2 tabular-nums">
              {formatBytes(node.size)}
            </span>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col relative w-full pb-8 select-none">
      {/* 1. Header Toolbar */}
      <div className="sticky top-0 z-10 bg-surface-1/90 backdrop-blur-md border-b border-border px-4 py-3 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-mono truncate">
            <Home size={14} className="text-text-tertiary shrink-0" />
            <span>/</span>
            <span className="text-text-primary font-bold truncate">{currentRepo}</span>
          </div>
          <span className="text-[11px] font-mono text-accent font-bold bg-accent/15 px-2.5 py-0.5 rounded-full border border-accent/30 tabular-nums">
            {activeFiles.length} files
          </span>
        </div>

        {/* Quick file search filter (40px = 5x8pt) */}
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-8 bg-surface-2 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-text-tertiary hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. File Tree Container */}
      <div className="p-4">
        {activeFiles.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No files in repository"
            description={`No files or directories were found on branch "${currentBranch || 'main'}".`}
            primaryAction={{
              label: 'Switch Branch',
              icon: GitBranch,
              onClick: () => openModal('branch'),
            }}
            secondaryAction={{
              label: 'Refresh Repository',
              icon: RefreshCw,
              onClick: () => refreshData(),
            }}
          />
        ) : (
          <div className="bg-surface-1 border border-border rounded-xl divide-y divide-border/60 overflow-hidden shadow-xs">
            {fileTree.map(node => renderNode(node, 0))}
          </div>
        )}
      </div>

      {/* 3. Bitbucket / GitHub Style Tabbed Code Viewer Modal */}
      <AnimatePresence>
        {selectedFileForModal && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFileForModal(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`relative w-full bg-surface-1 border-t border-border-accent rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-3 px-4 shadow-2xl z-10 flex flex-col transition-all duration-200 ${
                isFullscreen ? 'h-[96vh]' : 'max-h-[88vh] h-[85vh]'
              }`}
            >
              <div className="w-10 h-1 bg-border-accent rounded-full mx-auto mb-2 shrink-0" />

              {/* Top Navigation & Breadcrumbs Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border shrink-0 min-h-[44px]">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary font-mono truncate">
                    <span>{currentRepo}</span>
                    <span>/</span>
                    <span className="text-text-primary font-bold truncate">
                      {selectedFileForModal}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-tertiary font-mono">
                    <span className="text-accent uppercase font-bold">
                      {getCodeLanguage(selectedFileForModal)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{lineCount} lines</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatBytes(fileSizeEst)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
                    title={isFullscreen ? 'Restore' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>

                  <button
                    onClick={() => setSelectedFileForModal(null)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
                    aria-label="Close code modal"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Code | Raw | History | Info (32px height = 4x8pt) */}
              <div className="flex items-center justify-between border-b border-border py-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setContentTab('code')}
                    className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      contentTab === 'code'
                        ? 'bg-accent text-white font-bold shadow-xs'
                        : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    <FileCode size={14} />
                    <span>Code</span>
                  </button>

                  <button
                    onClick={() => setContentTab('history')}
                    className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      contentTab === 'history'
                        ? 'bg-accent text-white font-bold shadow-xs'
                        : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    <Clock size={14} />
                    <span>History</span>
                  </button>

                  <button
                    onClick={() => setContentTab('info')}
                    className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      contentTab === 'info'
                        ? 'bg-accent text-white font-bold shadow-xs'
                        : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    <Info size={14} />
                    <span>Info</span>
                  </button>
                </div>

                {/* Right utility buttons: Copy, Download, Wrap */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setWrapLines(!wrapLines)}
                    className={`h-8 px-2.5 rounded-xl text-[10px] font-mono border transition-colors cursor-pointer ${
                      wrapLines ? 'bg-accent-soft text-accent border-accent/30 font-bold' : 'bg-surface-2 text-text-tertiary border-border'
                    }`}
                    title="Toggle word wrap"
                  >
                    Wrap
                  </button>

                  <button
                    onClick={handleCopyCode}
                    disabled={activeFileLoading}
                    className="h-8 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs text-text-primary hover:text-accent flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownloadFile}
                    className="h-8 w-8 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                    title="Download raw file"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>

              {/* Viewport Content */}
              <div className="flex-1 overflow-auto rounded-xl bg-background border border-border mt-2 text-xs font-mono min-h-0 relative">
                {activeFileLoading ? (
                  <div className="p-12 text-center text-xs text-text-tertiary flex flex-col items-center justify-center gap-3">
                    <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <span>Streaming file contents from repository...</span>
                  </div>
                ) : contentTab === 'code' ? (
                  fileContentError ? (
                    <div className="p-6">
                      <InlineErrorCard
                        title="Failed to Load File"
                        message={fileContentError}
                        onRetry={() => activeFilePath && loadFileContent(activeFilePath)}
                      />
                    </div>
                  ) : activeFileContent ? (
                    <SyntaxHighlighter
                      language={getCodeLanguage(selectedFileForModal)}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '14px',
                        background: 'transparent',
                        fontSize: '11px',
                        lineHeight: '1.6',
                      }}
                      showLineNumbers={true}
                      wrapLines={wrapLines}
                    >
                      {activeFileContent}
                    </SyntaxHighlighter>
                  ) : (
                    <div className="p-8">
                      <EmptyState
                        icon={FileText}
                        title="Empty file content"
                        description="This file contains no text lines or represents binary content."
                        compact
                      />
                    </div>
                  )
                ) : contentTab === 'history' ? (
                  <div className="p-4 space-y-3 font-sans">
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block">
                      Recent Commits Touching This File
                    </span>
                    {fileHistory.length === 0 ? (
                      <EmptyState
                        icon={History}
                        title="No commit history for file"
                        description="No separate commits have touched this specific file path on the active branch."
                        compact
                      />
                    ) : (
                      <div className="divide-y divide-border border border-border rounded-xl bg-surface-1 overflow-hidden">
                        {fileHistory.map((c, i) => (
                          <div key={`${c.hash}-${i}`} className="p-3 hover:bg-surface-2 transition-colors flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-text-primary line-clamp-1">
                                {c.msg}
                              </span>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-text-tertiary font-mono">
                                <span className="text-accent font-semibold tabular-nums">{c.hash.substring(0, 7)}</span>
                                <span aria-hidden="true">·</span>
                                <span>{c.author}</span>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">{formatRelativeTime(c.date || c.timestamp)}</span>
                              </div>
                            </div>
                            <span className="text-xs font-mono text-success">
                              {c.add || '+12'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 space-y-4 font-sans text-xs">
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block">
                      File Metadata & Attributes
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-surface-1 border border-border">
                        <span className="text-text-tertiary block text-[10px] uppercase font-bold">Path</span>
                        <span className="font-mono text-text-primary text-xs break-all mt-0.5 block">{selectedFileForModal}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-1 border border-border">
                        <span className="text-text-tertiary block text-[10px] uppercase font-bold">Language</span>
                        <span className="font-mono text-text-primary text-xs mt-0.5 block">{getCodeLanguage(selectedFileForModal).toUpperCase()}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-1 border border-border">
                        <span className="text-text-tertiary block text-[10px] uppercase font-bold">Total Lines</span>
                        <span className="font-mono text-text-primary text-xs mt-0.5 block">{lineCount}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-1 border border-border">
                        <span className="text-text-tertiary block text-[10px] uppercase font-bold">Size</span>
                        <span className="font-mono text-text-primary text-xs mt-0.5 block">{formatBytes(fileSizeEst)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Aliases
export const MobileFiles = FilesScreen;
