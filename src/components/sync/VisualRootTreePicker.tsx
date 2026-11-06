import React, { useState } from 'react';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';
import { RootCandidate, DirectoryNode } from '../../mobile/utils/zipAutoDetect';
import { DirectoryTreeModal } from './tree/DirectoryTreeModal';
import { VisualRootBreadcrumbs } from './tree/VisualRootBreadcrumbs';

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
  const breadcrumbSegments = activeRoot ? activeRoot.split('/').filter(Boolean) : [];

  const sampleMapped = samplePath && activeRoot && samplePath.startsWith(activeRoot)
    ? samplePath.slice(activeRoot.length)
    : samplePath;

  return (
    <div className="bg-surface-1 border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <VisualRootBreadcrumbs
          activeRoot={activeRoot}
          suggestedRoot={suggestedRoot}
          breadcrumbSegments={breadcrumbSegments}
          candidates={candidates}
          onSelectRoot={onSelectRoot}
        />

        <button
          type="button"
          onClick={() => setIsTreeModalOpen(true)}
          className="min-h-[44px] px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-xs font-bold text-text-primary flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95 shrink-0"
        >
          <SlidersHorizontal size={14} className="text-accent" />
          <span>Browse Folder Tree</span>
        </button>
      </div>

      {samplePath && (
        <div className="px-3.5 py-2.5 rounded-xl bg-surface-2/40 border border-border/80 flex items-center gap-2 text-xs font-mono overflow-hidden">
          <span className="text-[11px] text-text-tertiary font-sans font-semibold shrink-0">Sample Mapping:</span>
          <span className="text-text-tertiary truncate max-w-[200px]" title={samplePath}>{samplePath}</span>
          <ArrowRight size={12} className="text-accent shrink-0" />
          <span className="text-accent font-bold truncate max-w-[240px]" title={sampleMapped}>{sampleMapped || samplePath}</span>
        </div>
      )}

      <DirectoryTreeModal
        isOpen={isTreeModalOpen}
        activeRoot={activeRoot}
        suggestedRoot={suggestedRoot}
        directoryTree={directoryTree}
        onSelectRoot={onSelectRoot}
        onClose={() => setIsTreeModalOpen(false)}
      />
    </div>
  );
};
