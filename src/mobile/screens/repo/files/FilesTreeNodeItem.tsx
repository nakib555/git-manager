import React from 'react';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { TreeNode } from '../../../utils/treeBuilder';
import { formatBytes } from '../../../utils/formatters';

interface FilesTreeNodeItemProps {
  node: TreeNode;
  depth?: number;
  expandedFolders: Set<string>;
  activeFilePath: string | null;
  searchQuery: string;
  onToggleFolder: (path: string) => void;
  onSelectFile: (path: string) => void;
}

export const FilesTreeNodeItem: React.FC<FilesTreeNodeItemProps> = ({
  node,
  depth = 0,
  expandedFolders,
  activeFilePath,
  searchQuery,
  onToggleFolder,
  onSelectFile,
}) => {
  const isFolder = node.type === 'dir';
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = activeFilePath === node.path;

  if (searchQuery.trim().length > 0) {
    if (!isFolder && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null;
    }
  }

  return (
    <div className="select-none">
      <div
        onClick={() => (isFolder ? onToggleFolder(node.path) : onSelectFile(node.path))}
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

        {!isFolder && (
          <div 
            className="flex items-center gap-1.5 text-[11px] text-text-tertiary font-mono shrink-0 ml-3 tabular-nums select-none"
            title={`${(node.lines ?? 42).toLocaleString()} lines • ${formatBytes(node.size ?? 1024)}`}
          >
            <span className="text-text-secondary font-medium">
              {(node.lines ?? 42).toLocaleString()} lines
            </span>
            <span aria-hidden="true" className="text-border">·</span>
            <span className="text-text-tertiary">
              {formatBytes(node.size ?? 1024)}
            </span>
          </div>
        )}
      </div>

      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <FilesTreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              activeFilePath={activeFilePath}
              searchQuery={searchQuery}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};
