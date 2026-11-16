import React from 'react';

export interface SplitRow {
  left?: { lineNum?: number; text: string; type: 'same' | 'del' };
  right?: { lineNum?: number; text: string; type: 'same' | 'add' };
}

interface MonacoDiffSplitViewProps {
  viewMode: 'split' | 'unified';
  splitRows: SplitRow[];
  diffLines: { type: 'add' | 'del' | 'same'; text: string; oldLine?: number; newLine?: number }[];
  oldLinesCount: number;
  newLinesCount: number;
}

export const MonacoDiffSplitView: React.FC<MonacoDiffSplitViewProps> = ({
  viewMode,
  splitRows,
  diffLines,
  oldLinesCount,
  newLinesCount,
}) => {
  return (
    <div className="hidden sm:block">
      {viewMode === 'split' ? (
        <div className="flex flex-col min-w-[680px]">
          <div className="grid grid-cols-2 divide-x divide-border bg-surface-2/60 text-[11px] font-semibold text-text-secondary border-b border-border sticky top-0 z-10">
            <div className="px-3 py-1.5 flex justify-between items-center">
              <span>Repository Base</span>
              <span className="font-mono text-text-tertiary tabular-nums">{oldLinesCount} lines</span>
            </div>
            <div className="px-3 py-1.5 flex justify-between items-center">
              <span>Uploaded ZIP</span>
              <span className="font-mono text-text-tertiary tabular-nums">{newLinesCount} lines</span>
            </div>
          </div>
          <div className="divide-y divide-border/40">
            {splitRows.map((row, idx) => {
              const leftDel = row.left?.type === 'del';
              const rightAdd = row.right?.type === 'add';

              return (
                <div key={idx} className="grid grid-cols-2 divide-x divide-border leading-5 font-mono text-[11px]">
                  <div
                    className={`flex ${
                      leftDel
                        ? 'bg-deletion/12 text-deletion'
                        : row.left
                          ? 'text-text-secondary hover:bg-surface-2/40'
                          : 'bg-surface-2/30 text-transparent select-none'
                    }`}
                  >
                    <span className="w-10 text-right pr-2 text-[10px] text-text-tertiary select-none tabular-nums shrink-0 border-r border-border/70">
                      {row.left?.lineNum || ''}
                    </span>
                    <span className="w-4 text-center text-[10px] select-none font-bold shrink-0">
                      {leftDel ? '-' : ''}
                    </span>
                    <span className="whitespace-pre px-2 flex-1 overflow-x-hidden">{row.left?.text ?? ' '}</span>
                  </div>

                  <div
                    className={`flex ${
                      rightAdd
                        ? 'bg-addition/12 text-addition'
                        : row.right
                          ? 'text-text-primary hover:bg-surface-2/40'
                          : 'bg-surface-2/30 text-transparent select-none'
                    }`}
                  >
                    <span className="w-10 text-right pr-2 text-[10px] text-text-tertiary select-none tabular-nums shrink-0 border-r border-border/70">
                      {row.right?.lineNum || ''}
                    </span>
                    <span className="w-4 text-center text-[10px] select-none font-bold shrink-0">
                      {rightAdd ? '+' : ''}
                    </span>
                    <span className="whitespace-pre px-2 flex-1 overflow-x-hidden">{row.right?.text ?? ' '}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="min-w-full inline-block py-1">
          {diffLines.map((line, idx) => {
            const isAdd = line.type === 'add';
            const isDel = line.type === 'del';
            return (
              <div
                key={idx}
                className={`flex ${
                  isAdd
                    ? 'bg-addition/12 text-addition'
                    : isDel
                      ? 'bg-deletion/12 text-deletion'
                      : 'text-text-secondary hover:bg-surface-2/40'
                }`}
              >
                <span className="w-10 text-right pr-2 text-[10px] text-text-tertiary select-none tabular-nums shrink-0">
                  {line.oldLine || ''}
                </span>
                <span className="w-10 text-right pr-2 text-[10px] text-text-tertiary select-none tabular-nums shrink-0 border-r border-border/70">
                  {line.newLine || ''}
                </span>
                <span className="w-5 text-center font-bold select-none shrink-0">
                  {isAdd ? '+' : isDel ? '-' : ' '}
                </span>
                <span className="whitespace-pre pr-4 flex-1">{line.text || ' '}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
