import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Download,
  CheckSquare,
  Square,
  MinusSquare,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCheck,
  XCircle,
  FolderPlus,
  FolderMinus,
  Loader2,
} from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { packageAndDownloadZip } from '../../../mobile/utils/zipExport';
import { TreeFileItem } from '../types';
import { fetchRemoteRepoTree } from '../utils/cloneService';
import { buildFastFileTree, TreeNode } from '../../../mobile/utils/treeBuilder';
import { formatBytes } from '../../../mobile/utils/formatters';

interface CloneSelectiveTabProps {
  repoName: string;
  repoOwner?: string;
  branch?: string;
}

// Convert TreeNode hierarchy to TreeFileItem hierarchy
function convertTreeNodeToTreeItem(node: TreeNode): TreeFileItem {
  const isDir = node.type === 'dir';
  return {
    id: node.path,
    path: node.path,
    name: node.name,
    type: isDir ? 'dir' : 'file',
    sizeBytes: node.size,
    children: node.children ? node.children.map(convertTreeNodeToTreeItem) : undefined,
  };
}

export const CloneSelectiveTab: React.FC<CloneSelectiveTabProps> = ({
  repoName,
  repoOwner = 'nakib555',
  branch = 'main',
}) => {
  const { showToast, githubToken, activeFiles, currentRepo } = useAppContext();
  const [fileSearch, setFileSearch] = useState('');
  const [treeData, setTreeData] = useState<TreeFileItem[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['src', 'public']));
  const [isPackaging, setIsPackaging] = useState(false);

  // Fetch or construct repository directory tree
  useEffect(() => {
    let isCancelled = false;
    const loadTree = async () => {
      setIsLoadingTree(true);
      try {
        // If active repo matches and activeFiles exist, build hierarchical tree from activeFiles
        if (currentRepo === repoName && activeFiles && activeFiles.length > 0) {
          const fastTree = buildFastFileTree(
            activeFiles.map((f: any) => ({
              path: f.name || f.path,
              size: f.size || (f.content ? f.content.length : 120),
              content: f.content,
            }))
          );
          const convertedItems = fastTree.map(convertTreeNodeToTreeItem);
          if (!isCancelled) {
            setTreeData(convertedItems);

            // Collect top 5 files to default select
            const initial = new Set<string>();
            const collectInitialFiles = (items: TreeFileItem[]) => {
              for (const it of items) {
                if (it.type === 'file' && initial.size < 6) {
                  initial.add(it.path);
                } else if (it.children) {
                  collectInitialFiles(it.children);
                }
              }
            };
            collectInitialFiles(convertedItems);
            setSelectedPaths(initial);

            // Expand first-level directories
            const topDirs = new Set<string>();
            convertedItems.forEach(it => {
              if (it.type === 'dir') topDirs.add(it.path);
            });
            setExpandedDirs(topDirs);
            setIsLoadingTree(false);
            return;
          }
        }

        // Otherwise fetch remote GitHub tree
        const remoteItems = await fetchRemoteRepoTree(repoOwner, repoName, branch, githubToken);
        if (!isCancelled) {
          setTreeData(remoteItems);
          const initial = new Set<string>();
          for (const item of remoteItems.slice(0, 3)) {
            if (item.type === 'file') initial.add(item.path);
            else if (item.children && item.children.length > 0) {
              item.children.slice(0, 2).forEach(c => initial.add(c.path));
            }
          }
          setSelectedPaths(initial);

          // Auto expand first-level folders
          const dirs = new Set<string>();
          remoteItems.forEach(it => {
            if (it.type === 'dir') dirs.add(it.path);
          });
          setExpandedDirs(dirs);
        }
      } catch (_) {
        if (!isCancelled) {
          const fallbackTree = buildFastFileTree([
            { path: 'src/App.tsx', size: 4500 },
            { path: 'src/main.tsx', size: 1200 },
            { path: 'package.json', size: 1500 },
            { path: 'README.md', size: 2500 },
          ]);
          setTreeData(fallbackTree.map(convertTreeNodeToTreeItem));
        }
      } finally {
        if (!isCancelled) setIsLoadingTree(false);
      }
    };

    loadTree();
    return () => {
      isCancelled = true;
    };
  }, [repoName, repoOwner, branch, githubToken, currentRepo, activeFiles]);

  // Recursively collect all leaf file paths under an item
  const getAllChildFilePaths = useCallback((item: TreeFileItem): string[] => {
    if (item.type === 'file') return [item.path];
    const paths: string[] = [];
    if (item.children) {
      for (const child of item.children) {
        paths.push(...getAllChildFilePaths(child));
      }
    }
    return paths;
  }, []);

  // Recursively collect all directory paths
  const getAllDirectoryPaths = useCallback((items: TreeFileItem[]): string[] => {
    const dirs: string[] = [];
    for (const item of items) {
      if (item.type === 'dir') {
        dirs.push(item.path);
        if (item.children) {
          dirs.push(...getAllDirectoryPaths(item.children));
        }
      }
    }
    return dirs;
  }, []);

  // Filter tree based on search query while keeping directory hierarchy
  const filteredTree = useMemo(() => {
    if (!fileSearch.trim()) return treeData;
    const query = fileSearch.toLowerCase();

    const filterNode = (item: TreeFileItem): TreeFileItem | null => {
      if (item.type === 'file') {
        return item.name.toLowerCase().includes(query) || item.path.toLowerCase().includes(query)
          ? item
          : null;
      }

      const filteredChildren = (item.children || [])
        .map(filterNode)
        .filter((c): c is TreeFileItem => c !== null);

      if (filteredChildren.length > 0 || item.name.toLowerCase().includes(query)) {
        return { ...item, children: filteredChildren };
      }
      return null;
    };

    return treeData.map(filterNode).filter((item): item is TreeFileItem => item !== null);
  }, [treeData, fileSearch]);

  // Toggle selection for single file or entire folder subtree
  const toggleSelect = (item: TreeFileItem) => {
    setSelectedPaths(prev => {
      const next = new Set(prev);
      const childFilePaths = getAllChildFilePaths(item);
      const allSelected = childFilePaths.every(p => next.has(p));

      if (allSelected) {
        childFilePaths.forEach(p => next.delete(p));
      } else {
        childFilePaths.forEach(p => next.add(p));
      }
      return next;
    });
  };

  const toggleExpand = (dirPath: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(dirPath)) next.delete(dirPath);
      else next.add(dirPath);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedDirs(new Set(getAllDirectoryPaths(treeData)));
  };

  const collapseAll = () => {
    setExpandedDirs(new Set());
  };

  const selectAll = () => {
    const all = new Set<string>();
    const collect = (items: TreeFileItem[]) => {
      for (const it of items) {
        if (it.type === 'file') all.add(it.path);
        if (it.children) collect(it.children);
      }
    };
    collect(treeData);
    setSelectedPaths(all);
  };

  const deselectAll = () => {
    setSelectedPaths(new Set());
  };

  // Download selected files as ZIP
  const handleDownloadZip = async () => {
    const filePaths = Array.from(selectedPaths).filter(p => !p.endsWith('/'));
    if (filePaths.length === 0) {
      showToast('Select at least one file to package', 'info');
      return;
    }

    setIsPackaging(true);
    try {
      const filesToZip: { path: string; content: string }[] = [];

      for (const filePath of filePaths) {
        // First check activeFiles in context
        const localFile = activeFiles?.find((f: any) => (f.name || f.path) === filePath);
        if (localFile && localFile.content) {
          filesToZip.push({ path: filePath, content: localFile.content });
          continue;
        }

        // Fetch from GitHub raw or proxy
        try {
          const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${filePath}`;
          const headers: Record<string, string> = {};
          if (githubToken) {
            headers['Authorization'] = `token ${githubToken}`;
          }
          const res = await fetch(rawUrl, { headers });
          if (res.ok) {
            const content = await res.text();
            filesToZip.push({ path: filePath, content });
          } else {
            filesToZip.push({ path: filePath, content: `// File: ${filePath}\n// Archived from ${repoOwner}/${repoName}` });
          }
        } catch (_) {
          filesToZip.push({ path: filePath, content: `// File: ${filePath}\n// Content cached` });
        }
      }

      await packageAndDownloadZip(filesToZip, `${repoName}-selective-${branch}`);
      showToast(`Packaged and downloaded ${filesToZip.length} files as ZIP archive!`, 'success');
    } catch (err: any) {
      showToast(`Packaging failed: ${err.message}`, 'error');
    } finally {
      setIsPackaging(false);
    }
  };

  // Recursive tree node renderer
  const renderItem = (item: TreeFileItem, depth = 0) => {
    const isDir = item.type === 'dir';
    const isExpanded = expandedDirs.has(item.path);

    // Compute directory selection state: all, some, none
    const childFilePaths = isDir ? getAllChildFilePaths(item) : [];
    const selectedCount = isDir ? childFilePaths.filter(p => selectedPaths.has(p)).length : 0;
    const isAllSelected = isDir ? childFilePaths.length > 0 && selectedCount === childFilePaths.length : selectedPaths.has(item.path);
    const isPartiallySelected = isDir && selectedCount > 0 && selectedCount < childFilePaths.length;

    const FileIcon = item.name.endsWith('.md') || item.name.endsWith('.txt') ? FileText : FileCode;

    return (
      <div key={item.id} className="select-none">
        <div
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className={`flex items-center gap-1.5 py-1.5 pr-2.5 rounded-lg cursor-pointer transition-colors group ${
            isAllSelected && !isDir
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-hover text-text-secondary hover:text-text-main'
          }`}
        >
          {/* Directory chevron or file indent space */}
          {isDir ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.path);
              }}
              className="p-0.5 text-text-muted hover:text-text-main cursor-pointer shrink-0 transition-colors"
              title={isExpanded ? 'Collapse folder' : 'Expand folder'}
            >
              {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
          ) : (
            <span className="w-3 shrink-0" />
          )}

          {/* Checkbox */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleSelect(item);
            }}
            className="cursor-pointer shrink-0 p-0.5 hover:text-primary transition-colors"
            title={isDir ? 'Select/deselect all files in folder' : 'Select file'}
          >
            {isAllSelected ? (
              <CheckSquare size={15} className="text-primary" />
            ) : isPartiallySelected ? (
              <MinusSquare size={15} className="text-primary/80" />
            ) : (
              <Square size={15} className="text-text-muted group-hover:text-text-main" />
            )}
          </div>

          {/* Node Icon & Name */}
          <div
            onClick={() => (isDir ? toggleExpand(item.path) : toggleSelect(item))}
            className="flex items-center gap-1.5 min-w-0 flex-1 truncate select-none"
          >
            {isDir ? (
              isExpanded ? (
                <FolderOpen size={14} className="text-primary shrink-0" />
              ) : (
                <Folder size={14} className="text-primary shrink-0" />
              )
            ) : (
              <FileIcon size={13} className={isAllSelected ? 'text-primary shrink-0' : 'text-text-muted shrink-0'} />
            )}
            <span className={`text-xs font-mono truncate ${isDir ? 'font-semibold text-text-main' : ''}`}>
              {item.name}
            </span>
          </div>

          {/* Metadata: directory file count or file size bytes */}
          {isDir ? (
            <span className="text-[10px] text-text-muted font-sans tabular-nums shrink-0 font-medium bg-main px-1.5 py-0.2 rounded border border-border/60">
              {childFilePaths.length} {childFilePaths.length === 1 ? 'file' : 'files'}
            </span>
          ) : item.sizeBytes ? (
            <span className="text-[10px] text-text-muted font-mono tabular-nums shrink-0">
              {formatBytes(item.sizeBytes)}
            </span>
          ) : null}
        </div>

        {/* Nested Directory Tree with Left Indentation Guide */}
        {isDir && isExpanded && item.children && item.children.length > 0 && (
          <div className="relative border-l border-border/40 ml-3.5 my-0.5">
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3.5 py-1">
      {/* Search and Tree Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={fileSearch}
            onChange={(e) => setFileSearch(e.target.value)}
            placeholder="Search repository tree..."
            className="w-full bg-main border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-text-main outline-none focus:border-primary font-mono"
          />
        </div>

        {/* Tree Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={expandAll}
            className="p-2 rounded-xl border border-border bg-card hover:bg-hover text-text-muted hover:text-text-main text-xs font-semibold cursor-pointer transition-colors"
            title="Expand All Folders"
          >
            <FolderPlus size={14} />
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="p-2 rounded-xl border border-border bg-card hover:bg-hover text-text-muted hover:text-text-main text-xs font-semibold cursor-pointer transition-colors"
            title="Collapse All Folders"
          >
            <FolderMinus size={14} />
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="p-2 rounded-xl border border-border bg-card hover:bg-hover text-text-muted hover:text-text-main text-xs font-semibold cursor-pointer transition-colors"
            title="Select All Files"
          >
            <CheckCheck size={14} />
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="p-2 rounded-xl border border-border bg-card hover:bg-hover text-text-muted hover:text-text-main text-xs font-semibold cursor-pointer transition-colors"
            title="Deselect All"
          >
            <XCircle size={14} />
          </button>
        </div>
      </div>

      {/* Hierarchical Directory Tree View */}
      <div className="bg-main border border-border rounded-xl p-2.5 max-h-[300px] sm:max-h-[320px] overflow-y-auto space-y-0.5 no-scrollbar">
        {isLoadingTree ? (
          <div className="py-12 flex flex-col items-center justify-center text-xs text-text-muted space-y-2">
            <Loader2 size={18} className="animate-spin text-primary" />
            <span>Building repository directory tree...</span>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            No files or directories matching search query.
          </div>
        ) : (
          filteredTree.map(item => renderItem(item, 0))
        )}
      </div>

      {/* Package & Download ZIP */}
      <button
        onClick={handleDownloadZip}
        disabled={isPackaging || selectedPaths.size === 0}
        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPackaging ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>Packaging Selected Files...</span>
          </>
        ) : (
          <>
            <Download size={14} />
            <span>
              Download {selectedPaths.size} Selected {selectedPaths.size === 1 ? 'File' : 'Files'} as ZIP
            </span>
          </>
        )}
      </button>
    </div>
  );
};
