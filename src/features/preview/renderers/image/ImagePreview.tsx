import React, { useState, useRef, useEffect } from 'react';
import { ImageControls } from './ImageControls';
import { ImageOff } from 'lucide-react';

interface ImagePreviewProps {
  blobUrl?: string;
  base64?: string;
  rawBuffer?: Uint8Array;
  mimeType: string;
  fileName: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  blobUrl,
  base64,
  mimeType,
  fileName,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [hasError, setHasError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const imageSrc = blobUrl || (base64 ? `data:${mimeType};base64,${base64}` : '');

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.25, 8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.25, 0.1));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (hasError || !imageSrc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-text-secondary">
        <ImageOff size={44} className="mb-3 text-text-tertiary opacity-60" />
        <p className="text-sm font-medium text-text-primary">Unable to decode image preview</p>
        <p className="text-xs text-text-tertiary mt-1 max-w-sm">
          The file {fileName} may use an unsupported color profile or format encoding.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] select-none cursor-grab active:cursor-grabbing"
    >
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        className="flex items-center justify-center pointer-events-none"
      >
        <img
          src={imageSrc}
          alt={fileName}
          onLoad={(e) => {
            const img = e.currentTarget;
            setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          }}
          onError={() => setHasError(true)}
          className="max-w-[85vw] max-h-[75vh] object-contain shadow-soft rounded"
        />
      </div>

      {dimensions && (
        <div className="absolute top-3 left-3 px-2 py-1 bg-surface-1/80 backdrop-blur-xs border border-border rounded text-[11px] font-mono text-text-secondary pointer-events-none tabular-nums">
          {dimensions.width} × {dimensions.height} px
        </div>
      )}

      <ImageControls
        zoom={zoom}
        rotation={rotation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onRotate={handleRotate}
      />
    </div>
  );
};
