import React, { useState, useMemo } from 'react';
import { DiffFileItem, computeLineDiff } from '../../mobile/utils/zipSyncEngine';
import { FileCode, FileCheck2 } from 'lucide-react';
import { SyncDiffHeader } from './diff/SyncDiffHeader';
import { SyncDiffSplitColumns } from './diff/SyncDiffSplitColumns';

interface SyncDiffViewerProps {
  file: DiffFileItem | null;
  theme?: 'dark' | 'light' | 'slate' | 'fantasy';
}

export const SyncDiffViewer: React.FC<SyncDiffViewerProps> = ({ file }) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [isCopied, setIsCopied] = useState(false);

  const diffData = useMemo(() => {
    if (!file || file.isBinary) return { additions: 0, deletions: 0, lines: [] };
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
        <p className="text-xs text-text-secondary mt-1 max-w-xs">Select a changed file to inspect diffs.</p>
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
      </div>
    );
  }

  const oldLines = (file.oldContent || '').split('\n');
  const newLines = (file.newContent || '').split('\n');

  return (
    <div className="h-full flex flex-col bg-surface-1 rounded-xl border border-border overflow-hidden">
      <SyncDiffHeader
        file={file}
        viewMode={viewMode}
        isCopied={isCopied}
        onSetViewMode={setViewMode}
        onCopy={handleCopy}
      />

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
                    isAdd ? 'bg-emerald-500/15 text-emerald-300' : isDel ? 'bg-rose-500/15 text-rose-300' : 'text-text-secondary hover:bg-surface-2/30'
                  }`}
                >
                  <span className="w-10 text-right pr-2 text-[10px] text-text-tertiary select-none opacity-50 shrink-0 tabular-nums">
                    {line.oldLine || ''}
                  </span>
                  <span className="w-10 text-right pr-2 text-[10px] text-text-tertiary select-none opacity-50 shrink-0 tabular-nums border-r border-border/40">
                    {line.newLine || ''}
                  </span>
                  <span className="w-5 text-center select-none font-bold shrink-0 opacity-70">
                    {isAdd ? '+' : isDel ? '-' : ' '}
                  </span>
                  <span className="whitespace-pre flex-1 pr-4">{line.text || ' '}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <SyncDiffSplitColumns oldLines={oldLines} newLines={newLines} />
        )}
      </div>
    </div>
  );
};
