import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  useEffect(() => {
    if (isOpen && suggestedRoot) {
      setExpandedFolders((prev) => new Set(prev).add('').add(suggestedRoot));
    }
  }, [isOpen, suggestedRoot]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [isOpen, onClose]);

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
          style={{ paddingLeft: `${Math.max(12, depth * 20 + 12)}px` }}
          className={`min-h-[42px] flex items-center justify-between pr-2 rounded-xl transition-colors ${
            isSelected
              ? 'bg-accent/15 text-text-primary font-semibold border border-accent/40'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/60 border border-transparent font-medium'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onSelectRoot(node.fullPath);
              if (hasChildren && !isExpanded) toggleFolder(node.fullPath);
            }}
            className="flex-1 min-w-0 flex items-center gap-2.5 text-left py-2 cursor-pointer"
          >
            {node.fullPath === '' ? (
              <Layers size={15} className="text-accent shrink-0" />
            ) : isExpanded ? (
              <FolderOpen size={15} className="text-accent shrink-0" />
            ) : (
              <Folder size={15} className="text-text-tertiary shrink-0" />
            )}
            <span className="font-mono text-xs truncate">{node.name}</span>
            {node.fullPath === suggestedRoot && suggestedRoot !== '' && (
              <span className="text-[11px] font-sans font-medium text-success shrink-0">
                · Recommended
              </span>
            )}
          </button>

          <div className="flex items-center gap-1 shrink-0">
            {isSelected && <Check size={15} className="text-accent mr-1" />}
            {hasChildren && (
              <button
                type="button"
                aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
                onClick={() => toggleFolder(node.fullPath)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-tertiary cursor-pointer"
              >
                <ChevronRight size={14} className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col mt-0.5"
            >
              {node.children.map(child => renderTreeNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[220] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-0 bg-black/75 cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Select Project Root Folder"
            className="relative w-full max-w-lg max-h-[85vh] bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 pb-[env(safe-area-inset-bottom,0px)]"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5 -mb-1 sm:hidden shrink-0" />
            <div className="py-3.5 px-5 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-start gap-2.5">
                <FolderOpen size={18} className="text-accent mt-0.5 shrink-0" />
                <div>
                  <h2 className="font-bold text-sm text-text-primary leading-tight">Select Project Root Folder</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Pick the folder in your ZIP that maps to the repository root</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close folder tree"
                onClick={onClose}
                className="touch-target-44 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-1 no-scrollbar min-h-[240px]">
              {renderTreeNode(directoryTree, 0)}
            </div>

            <div className="p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] border-t border-border bg-surface-2/40 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[40px] px-5 bg-accent hover:opacity-90 text-white font-semibold rounded-xl text-xs cursor-pointer btn-tactile"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
