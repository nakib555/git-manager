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
  onSelect: (item: DesktopTreeNode) => void;
  onDelete?: (item: DesktopTreeNode) => void;
}> = ({ item, depth, activeFileName, isOwner, onSelect, onDelete }) => {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const isSelected = activeFileName === item.path;
  const isDir = item.type === 'dir';

  if (isDir) {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className="group/item flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs font-semibold text-text-muted hover:text-text-main hover:bg-hover/40 cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {isOpen ? <ChevronDown size={12} className="shrink-0 text-text-muted/70" /> : <ChevronRight size={12} className="shrink-0 text-text-muted/70" />}
            {isOpen ? <FolderOpen size={14} className="text-primary shrink-0" /> : <Folder size={14} className="text-primary shrink-0" />}
            <span className="truncate">{item.name}</span>
          </div>

          {isOwner && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              className="opacity-0 group-hover/item:opacity-100 p-1 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded transition-opacity cursor-pointer shrink-0"
              title={`Delete folder '${item.name}'`}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        {isOpen && item.children && (
          <div className="space-y-0.5">
            {item.children.map(child => (
              <DesktopFileTreeItem
                key={child.path}
                item={child}
                depth={depth + 1}
                activeFileName={activeFileName}
                isOwner={isOwner}
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
      onClick={() => onSelect(item)}
      style={{ paddingLeft: `${depth * 14 + 22}px` }}
      className={`group/item flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs cursor-pointer select-none transition-colors ${
        isSelected
          ? 'bg-primary/10 text-primary font-bold border border-primary/20'
          : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon size={13} className={isSelected ? 'text-primary' : 'text-text-muted'} />
        <span className="truncate">{item.name}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-1">
        {typeof item.size === 'number' && item.size > 0 && (
          <span className="text-[10px] font-mono text-text-muted/70 group-hover/item:hidden">
            {formatBytes(item.size)}
          </span>
        )}
        {isOwner && onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="opacity-0 group-hover/item:opacity-100 p-1 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded transition-opacity cursor-pointer"
            title={`Delete file '${item.name}'`}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

