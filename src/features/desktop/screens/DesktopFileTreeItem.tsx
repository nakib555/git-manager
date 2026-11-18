import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, FileText, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { formatBytes } from '../../../mobile/utils/formatters';

export interface DesktopTreeNode {
  name: string;
  path: string;
  type: 'dir' | 'file';
  size?: number;
  lines?: number;
  children?: DesktopTreeNode[];
}

export const DesktopFileTreeItem: React.FC<{
  item: DesktopTreeNode;
  depth: number;
  activeFileName: string;
  isOwner?: boolean;
  forceExpanded?: boolean;
  onSelect: (item: DesktopTreeNode) => void;
  onDelete?: (item: DesktopTreeNode) => void;
}> = ({ item, depth, activeFileName, isOwner, forceExpanded, onSelect, onDelete }) => {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const expanded = forceExpanded || isOpen;
  const isSelected = activeFileName === item.path;
  const isDir = item.type === 'dir';

  if (isDir) {
    return (
      <div>
        <div
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className="group/item flex items-center justify-between pr-1 rounded-lg text-xs font-semibold text-text-muted hover:text-text-main hover:bg-hover/40 transition-colors"
        >
          <button
            type="button"
            onClick={() => setIsOpen(!expanded)}
            aria-expanded={expanded}
            className="flex-1 min-w-0 flex items-center gap-1.5 py-1.5 pl-1 text-left cursor-pointer"
          >
            {expanded ? <ChevronDown size={12} className="shrink-0 text-text-muted/70" /> : <ChevronRight size={12} className="shrink-0 text-text-muted/70" />}
            {expanded ? <FolderOpen size={14} className="text-primary shrink-0" /> : <Folder size={14} className="text-primary shrink-0" />}
            <span className="truncate">{item.name}</span>
          </button>

          {isOwner && onDelete && (
            <button
              type="button"
              aria-label={`Delete folder '${item.name}'`}
              onClick={() => onDelete(item)}
              className="opacity-0 group-hover/item:opacity-100 group-focus-within/item:opacity-100 focus-visible:opacity-100 p-1 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded transition-opacity cursor-pointer shrink-0"
              title={`Delete folder '${item.name}'`}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        {expanded && item.children && (
          <div className="space-y-0.5">
            {item.children.map(child => (
              <DesktopFileTreeItem
                key={child.path}
                item={child}
                depth={depth + 1}
                activeFileName={activeFileName}
                isOwner={isOwner}
                forceExpanded={forceExpanded}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const Icon = item.name.endsWith('.md') ? FileText : FileCode;

  return (
    <div
      style={{ paddingLeft: `${depth * 14 + 18}px` }}
      className={`group/item flex items-center justify-between pr-1 rounded-lg text-xs btn-tactile ${
        isSelected
          ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
          : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="flex-1 min-w-0 flex items-center gap-1.5 py-1.5 pl-1 text-left cursor-pointer"
      >
        <Icon size={13} className={`shrink-0 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
        <span className="truncate">{item.name}</span>
      </button>
      <div className="flex items-center gap-1 shrink-0 ml-1">
        {typeof item.size === 'number' && item.size > 0 && (
          <span className="text-[10px] font-mono text-text-muted/70 group-hover/item:hidden group-focus-within/item:hidden tabular-nums pr-1">
            {formatBytes(item.size)}
          </span>
        )}
        {isOwner && onDelete && (
          <button
            type="button"
            aria-label={`Delete file '${item.name}'`}
            onClick={() => onDelete(item)}
            className="opacity-0 group-hover/item:opacity-100 group-focus-within/item:opacity-100 focus-visible:opacity-100 p-1 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded btn-tactile cursor-pointer"
            title={`Delete file '${item.name}'`}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

