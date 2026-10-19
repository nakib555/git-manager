import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { 
  Folder, FileText, ChevronRight, ChevronDown, Copy, 
  Check, Search, X, Home, Maximize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TreeNode {
  name: string;
  path: string;
  type: 'dir' | 'file';
  size?: number;
  children?: TreeNode[];
}

const buildFastTree = (files: any[]): TreeNode[] => {
  if (!files || files.length === 0) return [];
  const root: TreeNode[] = [];
  const dirMap = new Map<string, TreeNode>();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || !file.name) continue;
    const parts = file.name.split('/');
    let currentPath = '';

    for (let depth = 0; depth < parts.length; depth++) {
      const part = parts[depth];
      const isFile = depth === parts.length - 1 && file.type === 'file';
      const prevPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (isFile) {
        const fileNode: TreeNode = {
          name: part,
          path: currentPath,
          type: 'file',
          size: file.size,
        };
        if (depth === 0) {
          root.push(fileNode);
        } else {
          const parent = dirMap.get(prevPath);
          if (parent && parent.children) {
            parent.children.push(fileNode);
          }
        }
      } else {
        if (!dirMap.has(currentPath)) {
          const dirNode: TreeNode = {
            name: part,
            path: currentPath,
            type: 'dir',
            children: [],
          };
          dirMap.set(currentPath, dirNode);
          if (depth === 0) {
            root.push(dirNode);
          } else {
            const parent = dirMap.get(prevPath);
            if (parent && parent.children) {
              parent.children.push(dirNode);
            }
          }
        }
      }
    }
  }

  // Sort: Folders first, files second, alphabetical
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'dir' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) sortNodes(node.children);
    }
  };

  sortNodes(root);
  return root;
};

export const MobileFiles: React.FC = () => {
  const { 
    currentRepo, 
    activeFiles, 
    currentRepoOwner, 
    currentBranch, 
    githubToken,
    showToast 
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  // Build tree
  const treeData = useMemo(() => {
    let files = activeFiles;
    if (searchQuery.trim()) {
      files = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return buildFastTree(files);
  }, [activeFiles, searchQuery]);

  // Toggle directory expansion
  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  // Fetch file content when file tapped
  const handleOpenFile = async (path: string) => {
    setSelectedFile(path);
    setIsLoadingContent(true);

    if (githubToken && currentRepoOwner && currentRepo) {
      try {
        const res = await fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/contents/${path}?ref=${currentBranch}`, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            const decoded = atob(data.content.replace(/\s/g, ''));
            setFileContent(decoded);
          } else {
            setFileContent('// File content unavailable or binary file');
          }
        } else {
          setFileContent('// Failed to load file from GitHub');
        }
      } catch {
        setFileContent('// Network error reading file');
      } finally {
        setIsLoadingContent(false);
      }
    } else {
      // Local repo simulated content
      setFileContent(`// ${path}\n// Loaded in Git Manager Mobile Workspace\n\nexport const config = {\n  project: "${currentRepo}",\n  branch: "${currentBranch}",\n  status: "active"\n};\n\nconsole.log("Ready.");`);
      setIsLoadingContent(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(fileContent);
    setIsCopied(true);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Render tree item recursively
  const renderTreeNodes = (nodes: TreeNode[], depth: number = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedDirs.has(node.path);
      const isDir = node.type === 'dir';

      return (
        <div key={node.path}>
          <div
            onClick={() => {
              if (isDir) toggleDir(node.path);
              else handleOpenFile(node.path);
            }}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
            className={`h-10 pr-3 flex items-center justify-between text-xs rounded-lg transition-colors cursor-pointer select-none ${
              selectedFile === node.path
                ? 'bg-[#3B82F6]/15 text-[#3B82F6] font-semibold'
                : 'text-[#F4F4F5] hover:bg-[#1A1A1D]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {isDir ? (
                <>
                  <ChevronRight size={13} className={`text-[#71717A] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  <Folder size={15} className="text-[#3B82F6] shrink-0" />
                </>
              ) : (
                <>
                  <span className="w-3" />
                  <FileText size={15} className="text-[#71717A] shrink-0" />
                </>
              )}
              <span className="truncate">{node.name}</span>
            </div>

            {node.size !== undefined && (
              <span className="text-[10px] font-mono text-[#71717A] tabular-nums">
                {Math.round(node.size / 1024)} KB
              </span>
            )}
          </div>

          {isDir && isExpanded && node.children && (
            <div>{renderTreeNodes(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="px-5 py-4 space-y-3">
      {/* Search files input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
        <input
          type="text"
          placeholder="Filter workspace files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-8 bg-[#121214] border border-[#2A2A2E] rounded-xl text-xs text-[#F4F4F5] placeholder:text-[#71717A] outline-none focus:border-[#3B82F6]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F4F4F5]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-xs text-[#71717A] px-1 font-mono">
        <Home size={12} className="text-[#3B82F6]" />
        <span>/</span>
        <span className="text-[#F4F4F5] font-semibold">{currentRepo}</span>
        <span>/</span>
        <span>tree</span>
      </div>

      {/* File Tree Container */}
      <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-2 max-h-[65vh] overflow-y-auto no-scrollbar">
        {treeData.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#71717A]">
            No files found matching "{searchQuery}"
          </div>
        ) : (
          <div className="space-y-0.5">{renderTreeNodes(treeData)}</div>
        )}
      </div>

      {/* Code Viewer Bottom Sheet */}
      <AnimatePresence>
        {selectedFile && (
          <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setSelectedFile(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-[#0A0A0B] border-t border-x border-[#2A2A2E] rounded-t-[20px] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-4 shadow-2xl z-10 flex flex-col max-h-[88vh]"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-[#2A2A2E] rounded-full mx-auto mb-3" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] mb-2">
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText size={16} className="text-[#3B82F6] shrink-0" />
                  <span className="text-xs font-mono font-semibold text-[#F4F4F5] truncate">
                    {selectedFile.split('/').pop()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={copyCode}
                    className="h-8 px-3 rounded-lg bg-[#121214] border border-[#2A2A2E] hover:bg-[#1A1A1D] text-xs font-semibold text-[#F4F4F5] flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCopied ? <Check size={12} className="text-[#22C55E]" /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="w-8 h-8 rounded-lg bg-[#121214] border border-[#2A2A2E] flex items-center justify-center text-[#71717A] hover:text-[#F4F4F5]"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Code content scrollport */}
              <div className="flex-1 overflow-auto rounded-xl border border-[#2A2A2E] bg-[#121214] p-3 text-xs font-mono select-text">
                {isLoadingContent ? (
                  <div className="py-12 text-center text-xs text-[#71717A]">
                    Loading file contents...
                  </div>
                ) : (
                  <SyntaxHighlighter
                    language="typescript"
                    style={vscDarkPlus}
                    customStyle={{
                      background: 'transparent',
                      padding: 0,
                      margin: 0,
                      fontSize: '12px',
                    }}
                    showLineNumbers
                  >
                    {fileContent}
                  </SyntaxHighlighter>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
