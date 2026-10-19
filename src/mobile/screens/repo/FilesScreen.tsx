import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { 
  Folder, FileText, ChevronRight, ChevronDown, Copy, 
  Check, Search, X, Home, Maximize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { buildFastFileTree, TreeNode, safeBase64Decode } from '../../utils/treeBuilder';
import { formatBytes } from '../../utils/formatters';

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
    loadFileContent, 
    activeFileContent, 
    activeFilePath, 
    activeFileLoading, 
    currentRepo, 
    showToast 
  } = useAppContext();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components']));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileForModal, setSelectedFileForModal] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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

  const handleFileClick = (path: string) => {
    loadFileContent(path);
    setSelectedFileForModal(path);
  };

  const handleCopyCode = () => {
    if (activeFileContent) {
      navigator.clipboard.writeText(activeFileContent);
      setIsCopied(true);
      showToast('File content copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

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
          onClick={() => (isFolder ? toggleFolder(node.path) : handleFileClick(node.path))}
          style={{ paddingLeft: `${Math.max(12, depth * 16 + 12)}px` }}
          className={`h-9 pr-3 flex items-center justify-between text-xs transition-colors cursor-pointer border-l-2 ${
            isSelected && !isFolder
              ? 'bg-accent-soft text-accent border-accent font-semibold'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-2'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isFolder ? (
              <>
                {isExpanded ? (
                  <ChevronDown size={14} className="text-text-tertiary shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-text-tertiary shrink-0" />
                )}
                <Folder size={15} className="text-accent shrink-0" />
              </>
            ) : (
              <>
                <span className="w-3.5" />
                <FileText size={14} className="text-text-tertiary shrink-0" />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </div>

          {!isFolder && node.size !== undefined && (
            <span className="text-[10px] text-text-tertiary font-mono shrink-0 ml-2">
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
    <div className="flex flex-col h-full relative">
      {/* 1. Header Toolbar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-4 py-2.5 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-mono truncate">
            <Home size={13} className="text-text-tertiary shrink-0" />
            <span>/</span>
            <span className="text-text-primary font-semibold truncate">{currentRepo}</span>
          </div>
          <span className="text-[11px] font-mono text-accent font-semibold bg-accent-soft px-2 py-0.5 rounded border border-accent/20">
            {activeFiles.length} files
          </span>
        </div>

        {/* Quick file search filter */}
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-8 bg-surface-1 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-text-tertiary hover:text-text-primary"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 2. File Tree Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/20 py-2">
        {activeFiles.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-tertiary">
            Loading file tree structure...
          </div>
        ) : (
          fileTree.map(node => renderNode(node, 0))
        )}
      </div>

      {/* 3. Bottom Sheet / Modal: Code Viewer */}
      <AnimatePresence>
        {selectedFileForModal && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFileForModal(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-surface-1 border-t border-x border-border rounded-t-[20px] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-4 shadow-2xl z-10 flex flex-col max-h-[88vh]"
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />

              {/* File details bar */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-mono font-bold text-text-primary truncate block">
                    {selectedFileForModal}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-mono">
                    {getCodeLanguage(selectedFileForModal).toUpperCase()} source code
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyCode}
                    disabled={activeFileLoading}
                    className="h-8 px-2.5 rounded-lg bg-surface-2 border border-border text-xs text-text-primary hover:text-accent flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedFileForModal(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Code viewer viewport */}
              <div className="flex-1 overflow-auto rounded-xl bg-background border border-border mt-3 text-xs font-mono">
                {activeFileLoading ? (
                  <div className="p-8 text-center text-xs text-text-tertiary flex flex-col items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <span>Fetching file stream...</span>
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
                    wrapLines={false}
                  >
                    {activeFileContent}
                  </SyntaxHighlighter>
                ) : (
                  <div className="p-8 text-center text-xs text-text-tertiary">
                    No content available or binary file.
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
