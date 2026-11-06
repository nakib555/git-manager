import React from 'react';
import { Columns, AlignJustify, Copy, Check, FileCode, ArrowLeft } from 'lucide-react';
import { DiffFileItem } from '../../../mobile/utils/zipSyncEngine';

interface MonacoDiffTitleBarProps {
  file: DiffFileItem;
  viewMode: 'split' | 'unified';
  onViewModeChange: (mode: 'split' | 'unified') => void;
  onCopy: () => void;
  isCopied: boolean;
  onBack?: () => void;
}

export const MonacoDiffTitleBar: React.FC<MonacoDiffTitleBarProps> = ({
  file,
  viewMode,
  onViewModeChange,
  onCopy,
  isCopied,
  onBack,
}) => {
  return (
    <div className="h-12 px-3 sm:px-4 border-b border-[#2D2D2D] bg-[#252526] flex items-center justify-between gap-2.5 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden min-h-[36px] px-2.5 bg-[#1E1E1E] hover:bg-[#2A2D2E] border border-[#3E3E42] text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
            title="Back to file list"
          >
            <ArrowLeft size={13} />
            <span>Files</span>
          </button>
        )}
        <FileCode size={15} className="text-sky-400 shrink-0 hidden sm:inline" />
        <span className="font-mono text-xs font-semibold text-slate-200 truncate" title={file.path}>
          {file.path}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {file.additions > 0 && (
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
              +{file.additions}
            </span>
          )}
          {file.deletions > 0 && (
            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded">
              -{file.deletions}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center bg-[#1E1E1E] p-0.5 rounded-lg border border-[#333333] text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('split')}
            className={`min-h-[28px] px-2.5 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer ${
              viewMode === 'split' ? 'bg-[#0E639C] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns size={12} />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('unified')}
            className={`min-h-[28px] px-2.5 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer ${
              viewMode === 'unified' ? 'bg-[#0E639C] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlignJustify size={12} />
            <span>Unified</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="min-h-[32px] min-w-[32px] px-2 rounded-lg border border-[#333333] hover:bg-[#2A2D2E] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
          title="Copy content"
        >
          {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
};
