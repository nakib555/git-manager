import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, Check, X, Layers } from 'lucide-react';
import { DirectoryNode } from '../../../mobile/utils/zipAutoDetect';

interface DirectoryTreeModalProps {
  isOpen: boolean;
  activeRoot: string;
  suggestedRoot: string;
  directoryTree: DirectoryNode;
  onSelectRoot: (rootPath: string) => void;
  onClose: () => void;
}

export const DirectoryTreeModal: React.FC<DirectoryTreeModalProps> = ({
  isOpen,
  activeRoot,
  suggestedRoot,
  directoryTree,
  onSelectRoot,
  onClose,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['', suggestedRoot]));

  if (!isOpen) return null;

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderTreeNode = (node: DirectoryNode, depth: number = 0) => {
    const isSelected = activeRoot === node.fullPath;
    const isExpanded = expandedFolders.has(node.fullPath);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.fullPath || 'root'} className="flex flex-col select-none">
        <div
          onClick={() => {
            onSelectRoot(node.fullPath);
            if (hasChildren) toggleFolder(node.fullPath);
          }}
          style={{ paddingLeft: `${Math.max(12, depth * 20 + 12)}px` }}
          className={`min-h-[44px] flex items-center justify-between pr-4 rounded-xl cursor-pointer transition-colors active:scale-[0.99] ${
            isSelected
              ? 'bg-accent/15 text-accent font-bold border border-accent/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/60 border border-transparent font-medium'
          }`}
        >
          <div className="flex items-center gap-2.5 truncate">
            {node.fullPath === '' ? (
              <Layers size={16} className="text-accent shrink-0" />
            ) : isExpanded ? (
              <FolderOpen size={16} className="text-amber-400 shrink-0" />
            ) : (
              <Folder size={16} className="text-amber-400 shrink-0" />
            )}
            <span className="font-mono text-xs truncate">{node.name}</span>
            {node.fullPath === suggestedRoot && (
              <span className="text-[10px] bg-accent/20 text-accent font-sans font-bold px-1.5 py-0.5 rounded-md shrink-0">
                Auto-Detected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSelected && <Check size={16} className="text-accent" />}
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(node.fullPath);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-tertiary"
              >
                <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="flex flex-col mt-1">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs cursor-pointer" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg max-h-[85vh] bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5 -mb-1 sm:hidden shrink-0" />
        <div className="h-14 px-5 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
            <FolderOpen size={18} className="text-amber-400" />
            <span>Select Project Root Folder</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1 no-scrollbar min-h-[250px]">
          {renderTreeNode(directoryTree, 0)}
        </div>

        <div className="p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] border-t border-border bg-surface-2/40 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 bg-accent hover:opacity-90 text-white font-bold rounded-xl text-xs cursor-pointer active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
