import React from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';

interface ImageControlsProps {
  zoom: number;
  rotation: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onRotate: () => void;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onRotate,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-surface-1/90 backdrop-blur-md border border-border shadow-medium rounded-full text-text-primary z-20">
      <button
        type="button"
        onClick={onZoomOut}
        className="p-1.5 hover:bg-surface-2 rounded-full text-text-secondary hover:text-text-primary btn-tactile cursor-pointer"
        title="Zoom Out"
      >
        <ZoomOut size={15} />
      </button>
      <button
        type="button"
        onClick={onReset}
        className="px-2 py-0.5 text-xs font-mono font-medium hover:bg-surface-2 rounded text-text-primary tabular-nums btn-tactile knob-stretch cursor-pointer"
        title="Reset Zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className="p-1.5 hover:bg-surface-2 rounded-full text-text-secondary hover:text-text-primary btn-tactile cursor-pointer"
        title="Zoom In"
      >
        <ZoomIn size={15} />
      </button>
      <div className="w-px h-3.5 bg-border mx-1" />
      <button
        type="button"
        onClick={onRotate}
        className="p-1.5 hover:bg-surface-2 rounded-full text-text-secondary hover:text-text-primary btn-tactile cursor-pointer"
        title="Rotate 90°"
      >
        <RotateCw size={15} />
      </button>
    </div>
  );
};
