import React from 'react';
import { Copy, Check, Download, Maximize2, Minimize2, Binary, Eye, Edit3, X } from 'lucide-react';

interface PreviewToolbarProps {
  viewMode: 'preview' | 'hex';
  onToggleViewMode: () => void;
  canCopy: boolean;
  isCopied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onEdit?: () => void;
  onClose?: () => void;
  isOwner?: boolean;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  viewMode,
  onToggleViewMode,
  canCopy,
  isCopied,
  onCopy,
  onDownload,
  isFullscreen,
  onToggleFullscreen,
  onEdit,
  onClose,
  isOwner,
}) => {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={onToggleViewMode}
        className={`flex items-center gap-1 h-7 px-2 border rounded-md text-[11px] font-medium btn-tactile cursor-pointer ${
          viewMode === 'hex'
            ? 'bg-accent text-white border-accent'
            : 'bg-surface-1 hover:bg-surface-2 border-border text-text-secondary hover:text-text-primary'
        }`}
        title="Toggle Hex View"
      >
        <Binary size={12} />
        <span>{viewMode === 'hex' ? 'Hex View' : 'Hex'}</span>
      </button>

      {onEdit && isOwner && (
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 h-7 px-2 bg-surface-1 hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary rounded-md text-[11px] font-medium btn-tactile cursor-pointer"
          title="Edit file"
        >
          <Edit3 size={12} />
          <span>Edit</span>
        </button>
      )}

      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-1.5 bg-surface-1 hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary rounded-md btn-tactile cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 hover:bg-surface-2 rounded-md text-text-tertiary hover:text-text-primary btn-tactile cursor-pointer ml-1"
          title="Close Preview"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};
