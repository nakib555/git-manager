import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { formatBytes } from '../../../mobile/utils/formatters';

interface DesktopTreeNode {
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
  onSelect: (item: DesktopTreeNode) => void;
}> = ({ item, depth, activeFileName, onSelect }) => {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const isSelected = activeFileName === item.path;
  const isDir = item.type === 'dir';

  if (isDir) {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className="flex items-center gap-1.5 py-1.5 pr-2.5 rounded-lg text-xs font-semibold text-text-muted hover:text-text-main hover:bg-hover/40 cursor-pointer select-none transition-colors"
        >
          {isOpen ? <ChevronDown size={12} className="shrink-0 text-text-muted/70" /> : <ChevronRight size={12} className="shrink-0 text-text-muted/70" />}
          {isOpen ? <FolderOpen size={14} className="text-primary shrink-0" /> : <Folder size={14} className="text-primary shrink-0" />}
          <span className="truncate">{item.name}</span>
        </div>
        {isOpen && item.children && (
          <div className="space-y-0.5">
            {item.children.map(child => (
              <DesktopFileTreeItem
                key={child.path}
                item={child}
                depth={depth + 1}
                activeFileName={activeFileName}
                onSelect={onSelect}
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
      className={`flex items-center justify-between py-1.5 pr-2.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
        isSelected
          ? 'bg-primary/10 text-primary font-bold border border-primary/20'
          : 'text-text-muted hover:text-text-main hover:bg-hover/30 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon size={13} className={isSelected ? 'text-primary' : 'text-text-muted'} />
        <span className="truncate">{item.name}</span>
      </div>
      {typeof item.size === 'number' && item.size > 0 && (
        <span className="text-[10px] font-mono text-text-muted/70 shrink-0 ml-1">
          {formatBytes(item.size)}
        </span>
      )}
    </div>
  );
};
