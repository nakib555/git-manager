import React from 'react';

interface MonacoDiffMobileViewProps {
  mobileTab: 'diff' | 'original' | 'zip';
  onTabChange: (tab: 'diff' | 'original' | 'zip') => void;
  diffLines: { type: 'add' | 'del' | 'same'; text: string; oldLine?: number; newLine?: number }[];
  oldLines: string[];
  newLines: string[];
}

export const MonacoDiffMobileView: React.FC<MonacoDiffMobileViewProps> = ({
  mobileTab,
  onTabChange,
  diffLines,
  oldLines,
  newLines,
}) => {
  return (
    <div className="sm:hidden flex flex-col">
      <div className="flex items-center bg-[#252526] border-b border-[#2D2D2D] px-2 shrink-0">
        <button
          type="button"
          onClick={() => onTabChange('diff')}
          className={`flex-1 min-h-[40px] text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
            mobileTab === 'diff' ? 'border-sky-400 text-sky-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Diff Hunks</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('original')}
          className={`flex-1 min-h-[40px] text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
            mobileTab === 'original' ? 'border-sky-400 text-sky-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Original (Repo)</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('zip')}
          className={`flex-1 min-h-[40px] text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
            mobileTab === 'zip' ? 'border-sky-400 text-sky-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Uploaded (ZIP)</span>
        </button>
      </div>

      <div>
        {mobileTab === 'diff' && (
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

        {mobileTab === 'original' && (
          <div className="py-1">
            {oldLines.map((line, idx) => (
              <div key={idx} className="flex hover:bg-[#262626]">
                <span className="w-12 text-right pr-2 text-[10px] text-[#555] select-none tabular-nums shrink-0 border-r border-[#333]">
                  {idx + 1}
                </span>
                <span className="whitespace-pre px-2 flex-1 text-[#D4D4D4]">{line || ' '}</span>
              </div>
            ))}
          </div>
        )}

        {mobileTab === 'zip' && (
          <div className="py-1">
            {newLines.map((line, idx) => (
              <div key={idx} className="flex hover:bg-[#262626]">
                <span className="w-12 text-right pr-2 text-[10px] text-[#555] select-none tabular-nums shrink-0 border-r border-[#333]">
                  {idx + 1}
                </span>
                <span className="whitespace-pre px-2 flex-1 text-[#D4D4D4]">{line || ' '}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
