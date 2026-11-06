import React from 'react';
import { X, Maximize2, Minimize2, FileCode, Clock, Info, Edit3, Copy, Check, Download } from 'lucide-react';
import { formatBytes } from '../../../utils/formatters';
import { getCodeLanguage } from './fileLanguageUtils';

interface FileViewerModalHeaderProps {
  selectedFile: string;
  currentRepo: string;
  lineCount: number;
  fileSizeEst: number;
  contentTab: 'code' | 'history' | 'info';
  isFullscreen: boolean;
  isCopied: boolean;
  activeFileLoading: boolean;
  onSetContentTab: (tab: 'code' | 'history' | 'info') => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDownload: () => void;
}

export const FileViewerModalHeader: React.FC<FileViewerModalHeaderProps> = ({
  selectedFile,
  currentRepo,
  lineCount,
  fileSizeEst,
  contentTab,
  isFullscreen,
  isCopied,
  activeFileLoading,
  onSetContentTab,
  onToggleFullscreen,
  onClose,
  onEdit,
  onCopy,
  onDownload,
}) => {
  return (
    <>
      <div className="flex items-center justify-between pb-2 border-b border-border shrink-0 min-h-[44px]">
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary font-mono truncate">
            <span>{currentRepo}</span>
            <span>/</span>
            <span className="text-text-primary font-bold truncate">{selectedFile}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-tertiary font-mono">
            <span className="text-accent uppercase font-bold">{getCodeLanguage(selectedFile)}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{lineCount} lines</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{formatBytes(fileSizeEst)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleFullscreen}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
            title={isFullscreen ? 'Restore' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Close code modal"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border py-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSetContentTab('code')}
            title="Code View"
            className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              contentTab === 'code' ? 'bg-accent text-white shadow-xs' : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
            }`}
          >
            <FileCode size={15} />
          </button>
          <button
            onClick={() => onSetContentTab('history')}
            title="Commit History"
            className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              contentTab === 'history' ? 'bg-accent text-white shadow-xs' : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
            }`}
          >
            <Clock size={15} />
          </button>
          <button
            onClick={() => onSetContentTab('info')}
            title="File Info"
            className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              contentTab === 'info' ? 'bg-accent text-white shadow-xs' : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
            }`}
          >
            <Info size={15} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            disabled={activeFileLoading}
            className="h-8 w-8 rounded-xl bg-accent hover:opacity-90 text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            title="Edit file"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onCopy}
            disabled={activeFileLoading}
            className="h-8 w-8 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-primary hover:text-accent flex items-center justify-center transition-colors cursor-pointer"
            title={isCopied ? 'Copied' : 'Copy'}
          >
            {isCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
          <button
            onClick={onDownload}
            className="h-8 w-8 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            title="Download raw file"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    </>
  );
};
