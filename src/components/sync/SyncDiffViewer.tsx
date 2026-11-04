import React, { useState, useMemo } from 'react';
import { DiffFileItem, computeLineDiff } from '../../mobile/utils/zipSyncEngine';
import { 
  FileCode, Plus, Minus, Columns, AlignJustify, 
  Copy, Check, FileCheck2, ArrowLeft, ArrowRight 
} from 'lucide-react';

interface SyncDiffViewerProps {
  file: DiffFileItem | null;
  theme?: 'dark' | 'light' | 'slate' | 'fantasy';
}

export const SyncDiffViewer: React.FC<SyncDiffViewerProps> = ({ file, theme = 'dark' }) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [isCopied, setIsCopied] = useState(false);

  const isLight = theme === 'light';

  const diffData = useMemo(() => {
    if (!file) return { additions: 0, deletions: 0, lines: [] };
    if (file.isBinary) return { additions: 0, deletions: 0, lines: [] };
    return computeLineDiff(file.oldContent || '', file.newContent || '');
  }, [file]);

  const handleCopy = () => {
    if (!file?.newContent) return;
    navigator.clipboard.writeText(file.newContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-muted bg-surface-1/40 rounded-xl border border-border">
        <FileCode size={36} className="opacity-40 mb-3" />
        <span className="text-sm font-semibold text-text-primary">No File Selected</span>
        <p className="text-xs text-text-secondary mt-1 max-w-xs">
          Select a changed file from the checklist on the left to inspect its line-by-line diff.
        </p>
      </div>
    );
  }

  if (file.isBinary) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-surface-1/40 rounded-xl border border-border">
        <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3">
          <FileCheck2 size={24} />
        </div>
        <span className="text-sm font-bold text-text-primary">{file.path}</span>
        <span className="text-xs text-text-secondary mt-1">Binary file asset</span>
        <p className="text-xs text-text-tertiary mt-2 max-w-sm">
          Binary assets (images, fonts, or media) are compared by byte existence and synced directly via raw blobs.
        </p>
      </div>
    );
  }

  const oldLines = (file.oldContent || '').split('\n');
  const newLines = (file.newContent || '').split('\n');

  return (
    <div className="h-full flex flex-col bg-surface-1 rounded-xl border border-border overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-2.5 border-b border-border bg-surface-2/40 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode size={14} className="text-accent shrink-0" />
          <span className="font-mono text-xs font-semibold text-text-primary truncate" title={file.path}>
            {file.path}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            {file.additions > 0 && (
              <span className="inline-flex items-center text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +{file.additions}
              </span>
            )}
            {file.deletions > 0 && (
              <span className="inline-flex items-center text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                -{file.deletions}
              </span>
            )}
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Unified vs Side-by-Side Split */}
          <div className="flex items-center bg-surface-2 rounded-lg p-0.5 border border-border text-xs">
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                viewMode === 'unified' 
                  ? 'bg-accent text-white shadow-xs' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Unified View"
            >
              <AlignJustify size={12} />
              <span className="hidden sm:inline">Unified</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                viewMode === 'split' 
                  ? 'bg-accent text-white shadow-xs' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Side-by-Side Split View"
            >
              <Columns size={12} />
              <span className="hidden sm:inline">Split</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-border hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Copy new file content"
          >
            {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Diff Content Body */}
      <div className="flex-1 overflow-auto font-mono text-xs select-text">
        {viewMode === 'unified' ? (
          <div className="min-w-full inline-block">
            {diffData.lines.map((line, idx) => {
              const isAdd = line.type === 'add';
              const isDel = line.type === 'del';
              return (
                <div
                  key={idx}
                  className={`flex leading-5 transition-colors ${
                    isAdd
                      ? 'bg-emerald-500/15 text-emerald-300 dark:text-emerald-300'
                      : isDel
                      ? 'bg-rose-500/15 text-rose-300 dark:text-rose-300'
                      : 'text-text-secondary hover:bg-surface-2/30'
                  }`}
                >
                  {/* Old line number */}
                  <span className="w-10 text-right pr-2 text-[10px] text-text-tertiary select-none opacity-50 shrink-0 tabular-nums">
                    {line.oldLine || ''}
                  </span>
                  {/* New line number */}
                  <span className="w-10 text-right pr-2 text-[10px] text-text-tertiary select-none opacity-50 shrink-0 tabular-nums border-r border-border/40">
                    {line.newLine || ''}
                  </span>
                  {/* Prefix marker */}
                  <span className="w-5 text-center select-none font-bold shrink-0 opacity-70">
                    {isAdd ? '+' : isDel ? '-' : ' '}
                  </span>
                  {/* Line text */}
                  <span className="whitespace-pre flex-1 pr-4">{line.text || ' '}</span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Side-by-Side Split View */
          <div className="grid grid-cols-2 divide-x divide-border min-w-[700px]">
            {/* Left Column: Old Content (Repo) */}
            <div className="flex flex-col">
              <div className="px-3 py-1 bg-surface-2/60 text-[10px] font-bold uppercase tracking-wider text-text-tertiary border-b border-border sticky top-0 z-10 flex justify-between">
                <span>Repository Version</span>
                <span className="font-mono">{oldLines.length} lines</span>
              </div>
              <div className="divide-y divide-border/20">
                {oldLines.map((line, idx) => (
                  <div key={idx} className="flex leading-5 text-text-secondary hover:bg-surface-2/20">
                    <span className="w-9 text-right pr-2 text-[10px] text-text-tertiary select-none opacity-50 shrink-0 tabular-nums border-r border-border/30">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre px-2 flex-1 overflow-x-hidden">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: New Content (ZIP) */}
            <div className="flex flex-col">
              <div className="px-3 py-1 bg-surface-2/60 text-[10px] font-bold uppercase tracking-wider text-text-tertiary border-b border-border sticky top-0 z-10 flex justify-between">
                <span>Uploaded ZIP Version</span>
                <span className="font-mono">{newLines.length} lines</span>
              </div>
              <div className="divide-y divide-border/20">
                {newLines.map((line, idx) => (
                  <div key={idx} className="flex leading-5 text-text-primary hover:bg-surface-2/20">
                    <span className="w-9 text-right pr-2 text-[10px] text-text-tertiary select-none opacity-50 shrink-0 tabular-nums border-r border-border/30">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre px-2 flex-1 overflow-x-hidden">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
