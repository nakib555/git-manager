import React from 'react';

interface SyncDiffSplitColumnsProps {
  oldLines: string[];
  newLines: string[];
}

export const SyncDiffSplitColumns: React.FC<SyncDiffSplitColumnsProps> = ({
  oldLines,
  newLines,
}) => {
  return (
    <div className="grid grid-cols-2 divide-x divide-border min-w-[700px]">
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
  );
};
