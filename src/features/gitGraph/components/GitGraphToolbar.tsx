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
    <div className="absolute top-3 right-3 z-20 flex items-center bg-card/90 backdrop-blur-xs border border-border rounded-xl p-1 shadow-md gap-0.5">
      <button
        type="button"
        onClick={onZoomIn}
        className="p-1.5 hover:bg-hover rounded-lg text-text-muted hover:text-text-main transition-colors cursor-pointer"
        title="Zoom In"
      >
        <ZoomIn size={14} />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="p-1.5 hover:bg-hover rounded-lg text-text-muted hover:text-text-main transition-colors cursor-pointer"
        title="Zoom Out"
      >
        <ZoomOut size={14} />
      </button>
      <button
        type="button"
        onClick={onResetZoom}
        className="p-1.5 hover:bg-hover rounded-lg text-text-muted hover:text-text-main transition-colors cursor-pointer"
        title="Reset Zoom"
      >
        <RotateCcw size={13} />
      </button>
    </div>
  );
};
