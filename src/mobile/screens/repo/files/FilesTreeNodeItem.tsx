import { Folder, FileText, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { TreeNode } from '../../../utils/treeBuilder';
import { formatBytes } from '../../../utils/formatters';

interface FilesTreeNodeItemProps {
  node: TreeNode;
  depth?: number;
  expandedFolders: Set<string>;
  activeFilePath: string | null;
  searchQuery: string;
  isOwner?: boolean;
  onToggleFolder: (path: string) => void;
  onSelectFile: (path: string) => void;
  onDelete?: (node: TreeNode) => void;
}

export const FilesTreeNodeItem: React.FC<FilesTreeNodeItemProps> = ({
  node,
  depth = 0,
  expandedFolders,
  activeFilePath,
  searchQuery,
  isOwner,
  onToggleFolder,
  onSelectFile,
  onDelete,
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
        className={`min-h-[44px] h-11 pr-4 flex items-center justify-between text-[13px] transition-colors cursor-pointer border-l-2 btn-tactile ${
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

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {!isFolder && (
            <div 
              className="hidden sm:flex items-center gap-1.5 text-[11px] text-text-tertiary font-mono tabular-nums select-none"
              title={`${(node.lines ?? 42).toLocaleString()} lines • ${formatBytes(node.size ?? 1024)}`}
            >
              <span className="text-text-secondary font-medium tabular-nums">
                {(node.lines ?? 42).toLocaleString()} lines
              </span>
              <span aria-hidden="true" className="text-border">·</span>
              <span className="text-text-tertiary tabular-nums">
                {formatBytes(node.size ?? 1024)}
              </span>
            </div>
          )}

          {isOwner && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
              aria-label={isFolder ? `Delete folder ${node.name}` : `Delete file ${node.name}`}
              className="touch-target-44 w-9 h-9 flex items-center justify-center text-text-tertiary hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors btn-tactile cursor-pointer"
              title={isFolder ? `Delete folder '${node.name}'` : `Delete file '${node.name}'`}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
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
              isOwner={isOwner}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
