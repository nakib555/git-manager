import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GitGraphToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const GitGraphToolbar: React.FC<GitGraphToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  return (
    <div className="flex items-center bg-surface-1 border border-border rounded-lg p-0.5 gap-0.5 shrink-0">
      <button
        type="button"
        onClick={onZoomIn}
        className="w-6 h-5 flex items-center justify-center hover:bg-hover rounded-md text-text-muted hover:text-text-main transition-colors cursor-pointer"
        title="Zoom In"
        aria-label="Zoom in commit graph"
      >
        <ZoomIn size={12} />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="w-6 h-5 flex items-center justify-center hover:bg-hover rounded-md text-text-muted hover:text-text-main transition-colors cursor-pointer"
        title="Zoom Out"
        aria-label="Zoom out commit graph"
      >
        <ZoomOut size={12} />
      </button>
      <button
        type="button"
        onClick={onResetZoom}
        className="w-6 h-5 flex items-center justify-center hover:bg-hover rounded-md text-text-muted hover:text-text-main transition-colors cursor-pointer"
        title="Reset Zoom"
        aria-label="Reset commit graph zoom"
      >
        <RotateCcw size={11} />
      </button>
    </div>
  );
};
