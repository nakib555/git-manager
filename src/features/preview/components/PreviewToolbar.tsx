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
        className={`flex items-center gap-1 h-7 px-2 border rounded-md text-[11px] font-medium btn-tactile cursor-pointer whitespace-nowrap shrink-0 ${
          viewMode === 'hex'
            ? 'bg-accent text-white border-accent'
            : 'bg-surface-1 hover:bg-surface-2 border-border text-text-secondary hover:text-text-primary'
        }`}
        title="Toggle Hex View"
      >
        <Binary size={12} />
        <span>{viewMode === 'hex' ? 'Hex View' : 'Hex'}</span>
      </button>

      {canCopy && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={isCopied ? 'Copied content' : 'Copy file content'}
          className="flex items-center gap-1 h-7 px-2 bg-surface-1 hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary rounded-md text-[11px] font-medium btn-tactile cursor-pointer whitespace-nowrap shrink-0"
          title="Copy content"
        >
          {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{isCopied ? 'Copied' : 'Copy'}</span>
        </button>
      )}

      <button
        type="button"
        onClick={onDownload}
        aria-label="Download file"
        className="p-1.5 bg-surface-1 hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary rounded-md btn-tactile cursor-pointer shrink-0"
        title="Download file"
      >
        <Download size={13} />
      </button>

      {onEdit && isOwner && (
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 h-7 px-2 bg-surface-1 hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary rounded-md text-[11px] font-medium btn-tactile cursor-pointer whitespace-nowrap shrink-0"
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
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="p-1.5 bg-surface-1 hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary rounded-md btn-tactile cursor-pointer shrink-0"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Preview"
          className="p-1.5 hover:bg-surface-2 rounded-md text-text-tertiary hover:text-text-primary btn-tactile cursor-pointer ml-1 shrink-0"
          title="Close Preview"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};
