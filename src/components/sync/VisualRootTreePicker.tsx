import React, { useState } from 'react';
import { 
  Folder, FolderOpen, ChevronRight, Check, Sparkles, 
  Layers, SlidersHorizontal, CornerDownRight, X, ArrowRight
} from 'lucide-react';
import { RootCandidate, DirectoryNode } from '../../mobile/utils/zipAutoDetect';

interface VisualRootTreePickerProps {
  activeRoot: string;
  suggestedRoot: string;
  candidates: RootCandidate[];
  directoryTree: DirectoryNode;
  samplePath?: string;
  onSelectRoot: (rootPath: string) => void;
}

export const VisualRootTreePicker: React.FC<VisualRootTreePickerProps> = ({
  activeRoot,
  suggestedRoot,
  candidates,
  directoryTree,
  samplePath = '',
  onSelectRoot,
}) => {
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['', suggestedRoot]));

  // Break activeRoot into breadcrumb segments
  const breadcrumbSegments = activeRoot ? activeRoot.split('/').filter(Boolean) : [];

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const sampleMapped = samplePath && activeRoot && samplePath.startsWith(activeRoot)
    ? samplePath.slice(activeRoot.length)
    : samplePath;

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
            <span className="font-mono text-xs truncate">
              {node.name}
            </span>
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
    <div className="bg-surface-1 border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
      {/* 1. Header with Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-accent shrink-0" />
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              ZIP Root Alignment:
            </span>
            {activeRoot === suggestedRoot && suggestedRoot !== '' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                <Sparkles size={10} />
                <span>Auto-Detected Match</span>
              </span>
            )}
          </div>

          {/* Breadcrumb Path Bar */}
          <nav aria-label="Root Breadcrumbs" className="flex items-center flex-wrap gap-1.5 text-xs font-mono mt-0.5">
            <button
              type="button"
              onClick={() => onSelectRoot('')}
              className={`min-h-[32px] px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                activeRoot === ''
                  ? 'bg-accent text-white font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              / (archive root)
            </button>

            {breadcrumbSegments.map((segment, idx) => {
              const currentSubPath = breadcrumbSegments.slice(0, idx + 1).join('/') + '/';
              const isCurrent = activeRoot === currentSubPath;
              return (
                <React.Fragment key={currentSubPath}>
                  <ChevronRight size={12} className="text-text-tertiary shrink-0" />
                  <button
                    type="button"
                    onClick={() => onSelectRoot(currentSubPath)}
                    className={`min-h-[32px] px-2 py-1 rounded-lg transition-colors cursor-pointer truncate max-w-[160px] ${
                      isCurrent
                        ? 'bg-accent text-white font-bold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    {segment}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Tree Picker Trigger Button (8pt grid: 44px min touch height) */}
        <button
          type="button"
          onClick={() => setIsTreeModalOpen(true)}
          className="min-h-[44px] px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-xs font-bold text-text-primary flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95 shrink-0"
        >
          <SlidersHorizontal size={14} className="text-accent" />
          <span>Browse Folder Tree</span>
        </button>
      </div>

      {/* 2. Compact Folder Chips for 1-Tap Switching (Strict 8pt rhythm) */}
      {candidates.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
            Suggested Candidate Roots:
          </span>
          <div className="flex items-center flex-wrap gap-2">
            {candidates.map((cand) => {
              const isActive = activeRoot === cand.path;
              return (
                <button
                  key={cand.path}
                  type="button"
                  onClick={() => onSelectRoot(cand.path)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border active:scale-95 ${
                    isActive
                      ? 'bg-accent text-white border-accent font-bold shadow-xs'
                      : 'bg-surface-2/80 hover:bg-surface-3 border-border text-text-secondary hover:text-text-primary font-medium'
                  }`}
                >
                  <Folder size={14} className={isActive ? 'text-white' : 'text-amber-400'} />
                  <span className="truncate max-w-[180px]">{cand.displayLabel}</span>
                  {cand.matchedLandmarks.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-sans ${isActive ? 'bg-white/20 text-white' : 'bg-surface-1 text-text-tertiary'}`}>
                      {cand.matchedLandmarks.slice(0, 2).join(', ')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Real-Time Path Mapping Preview Strip */}
      {samplePath && (
        <div className="px-3.5 py-2.5 rounded-xl bg-surface-2/40 border border-border/80 flex items-center gap-2 text-xs font-mono overflow-hidden">
          <span className="text-[11px] text-text-tertiary font-sans font-semibold shrink-0">Sample Mapping:</span>
          <span className="text-text-tertiary truncate max-w-[200px]" title={samplePath}>{samplePath}</span>
          <ArrowRight size={12} className="text-accent shrink-0" />
          <span className="text-accent font-bold truncate max-w-[240px]" title={sampleMapped}>{sampleMapped || samplePath}</span>
        </div>
      )}

      {/* 4. Full Directory Tree Picker Modal */}
      {isTreeModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg max-h-[80vh] bg-surface-1 border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="h-14 px-5 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
                <FolderOpen size={18} className="text-amber-400" />
                <span>Select Project Root Folder</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTreeModalOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-1 no-scrollbar min-h-[250px]">
              {renderTreeNode(directoryTree, 0)}
            </div>

            <div className="p-4 border-t border-border bg-surface-2/40 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsTreeModalOpen(false)}
                className="min-h-[44px] px-5 bg-accent hover:opacity-90 text-white font-bold rounded-xl text-xs cursor-pointer active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
