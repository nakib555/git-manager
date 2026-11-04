import React, { useState, useMemo } from 'react';
import { 
  Folder, FolderOpen, FileCode, Search, Copy, Check, 
  ChevronRight, ChevronDown, ListFilter, FileText 
} from 'lucide-react';

interface RepoReferenceTreeProps {
  repoName: string;
  repoOwner: string;
  branch: string;
  files: { name: string; type: 'file' | 'dir' }[];
  onSelectFile?: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'dir' | 'file';
  children?: TreeNode[];
}

export const RepoReferenceTree: React.FC<RepoReferenceTreeProps> = ({
  repoName,
  repoOwner,
  branch,
  files,
  onSelectFile,
}) => {
  const [search, setSearch] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components', 'public']));

  // Build hierarchical tree
  const tree = useMemo(() => {
    const root: TreeNode[] = [];
    const dirMap = new Map<string, TreeNode>();

    const filtered = files.filter(f => {
      if (!search.trim()) return true;
      return f.name.toLowerCase().includes(search.toLowerCase());
    });

    for (const file of filtered) {
      const parts = file.name.split('/');
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1 && file.type === 'file';
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (isFile) {
          const node: TreeNode = { name: part, path: currentPath, type: 'file' };
          if (i === 0) {
            root.push(node);
          } else {
            const parent = dirMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(node);
            }
          }
        } else {
          if (!dirMap.has(currentPath)) {
            const node: TreeNode = { name: part, path: currentPath, type: 'dir', children: [] };
            dirMap.set(currentPath, node);
            if (i === 0) {
              root.push(node);
            } else {
              const parent = dirMap.get(parentPath);
              if (parent && parent.children) {
                parent.children.push(node);
              }
            }
          }
        }
      }
    }

    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1;
        if (a.type !== 'dir' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name);
      });
      for (const node of nodes) {
        if (node.children) sortNodes(node.children);
      }
    };
    sortNodes(root);
    return root;
  }, [files, search]);

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

  const handleCopyPaths = () => {
    const pathList = files.map(f => f.name).join('\n');
    navigator.clipboard.writeText(pathList);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isFolder = node.type === 'dir';
    const isExpanded = expandedFolders.has(node.path);

    return (
      <div key={node.path} className="flex flex-col select-none">
        <div
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path);
            } else {
              onSelectFile?.(node.path);
            }
          }}
          style={{ paddingLeft: `${Math.max(8, depth * 16 + 8)}px` }}
          className={`h-7 flex items-center gap-1.5 py-1 pr-2 text-xs rounded-md cursor-pointer transition-colors ${
            isFolder 
              ? 'text-text-secondary hover:text-text-primary hover:bg-surface-2/40 font-medium' 
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/30 font-mono text-[11px]'
          }`}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown size={12} className="text-text-tertiary shrink-0" />
              ) : (
                <ChevronRight size={12} className="text-text-tertiary shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen size={13} className="text-accent shrink-0" />
              ) : (
                <Folder size={13} className="text-accent shrink-0" />
              )}
              <span className="truncate">{node.name}</span>
            </>
          ) : (
            <>
              <span className="w-3 shrink-0" />
              <FileCode size={12} className="text-text-tertiary shrink-0" />
              <span className="truncate">{node.name}</span>
            </>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div className="flex flex-col">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-surface-1 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-border bg-surface-2/30 flex items-center justify-between gap-2 shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
            Target Repo File Tree
          </span>
          <span className="font-mono text-xs text-text-primary font-semibold flex items-center gap-1">
            <span>{repoOwner}/{repoName}</span>
            <span className="text-text-tertiary">@</span>
            <span className="text-accent">{branch}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyPaths}
          className="px-2 py-1 bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary text-[10px] font-semibold rounded-lg border border-border flex items-center gap-1 transition-colors cursor-pointer"
          title="Copy full repository paths list to clipboard"
        >
          {isCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          <span>{isCopied ? 'Copied' : 'Copy Paths'}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-border bg-surface-1/50 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-2/60 border border-border/80 text-xs">
          <Search size={13} className="text-text-tertiary shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repo paths..."
            className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-tertiary text-xs"
          />
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto p-1.5 no-scrollbar">
        {tree.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-tertiary">
            No files matched search filter.
          </div>
        ) : (
          tree.map(node => renderNode(node, 0))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 border-t border-border bg-surface-2/20 text-[10px] text-text-tertiary flex items-center justify-between">
        <span>{files.length} total repository files</span>
        <span>Reference structure</span>
      </div>
    </div>
  );
};
