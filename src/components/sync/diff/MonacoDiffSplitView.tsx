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
        <div className="flex flex-col min-w-[750px]">
          <div className="grid grid-cols-2 divide-x divide-[#2D2D2D] bg-[#252526] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#2D2D2D] sticky top-0 z-10">
            <div className="px-3 py-1 flex justify-between">
              <span>Repository Base (Original)</span>
              <span className="font-mono text-slate-500">{oldLinesCount} lines</span>
            </div>
            <div className="px-3 py-1 flex justify-between">
              <span>Uploaded ZIP (Incoming)</span>
              <span className="font-mono text-slate-500">{newLinesCount} lines</span>
            </div>
          </div>
          <div className="divide-y divide-[#262626]">
            {splitRows.map((row, idx) => {
              const leftDel = row.left?.type === 'del';
              const rightAdd = row.right?.type === 'add';

              return (
                <div key={idx} className="grid grid-cols-2 divide-x divide-[#2D2D2D] leading-5 font-mono text-[11px]">
                  <div className={`flex ${leftDel ? 'bg-[#3b1d1d]/90 text-[#fca5a5]' : row.left ? 'text-[#9ca3af] hover:bg-[#262626]' : 'bg-[#181818]/60 text-transparent select-none'}`}>
                    <span className="w-10 text-right pr-2 text-[10px] text-[#555] select-none tabular-nums shrink-0 border-r border-[#333]">
                      {row.left?.lineNum || ''}
                    </span>
                    <span className="w-4 text-center text-[10px] select-none font-bold shrink-0">
                      {leftDel ? '-' : ''}
                    </span>
                    <span className="whitespace-pre px-2 flex-1 overflow-x-hidden">{row.left?.text ?? ' '}</span>
                  </div>

                  <div className={`flex ${rightAdd ? 'bg-[#1e3a24]/90 text-[#86efac]' : row.right ? 'text-[#D4D4D4] hover:bg-[#262626]' : 'bg-[#181818]/60 text-transparent select-none'}`}>
                    <span className="w-10 text-right pr-2 text-[10px] text-[#555] select-none tabular-nums shrink-0 border-r border-[#333]">
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
                  isAdd ? 'bg-[#1e3a24] text-[#86efac]' : isDel ? 'bg-[#3b1d1d] text-[#fca5a5]' : 'text-[#9ca3af] hover:bg-[#262626]'
                }`}
              >
                <span className="w-10 text-right pr-2 text-[10px] text-[#555] select-none tabular-nums shrink-0">
                  {line.oldLine || ''}
                </span>
                <span className="w-10 text-right pr-2 text-[10px] text-[#555] select-none tabular-nums shrink-0 border-r border-[#333]">
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
