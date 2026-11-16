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
      <div className="flex items-center bg-surface-2/40 border-b border-border px-2 shrink-0">
        <button
          type="button"
          onClick={() => onTabChange('diff')}
          className={`flex-1 min-h-[40px] text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            mobileTab === 'diff'
              ? 'border-accent text-accent font-bold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Diff Hunks</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('original')}
          className={`flex-1 min-h-[40px] text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            mobileTab === 'original'
              ? 'border-accent text-accent font-bold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Repository</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('zip')}
          className={`flex-1 min-h-[40px] text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            mobileTab === 'zip'
              ? 'border-accent text-accent font-bold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Uploaded ZIP</span>
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
                    isAdd
                      ? 'bg-addition/12 text-addition'
                      : isDel
                        ? 'bg-deletion/12 text-deletion'
                        : 'text-text-secondary hover:bg-surface-2/45'
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

        {mobileTab === 'original' && (
          <div className="py-1">
            {oldLines.map((line, idx) => (
              <div key={idx} className="flex hover:bg-surface-2/45">
                <span className="w-12 text-right pr-2 text-[10px] text-text-tertiary select-none tabular-nums shrink-0 border-r border-border/70">
                  {idx + 1}
                </span>
                <span className="whitespace-pre px-2 flex-1 text-text-primary">{line || ' '}</span>
              </div>
            ))}
          </div>
        )}

        {mobileTab === 'zip' && (
          <div className="py-1">
            {newLines.map((line, idx) => (
              <div key={idx} className="flex hover:bg-surface-2/45">
                <span className="w-12 text-right pr-2 text-[10px] text-text-tertiary select-none tabular-nums shrink-0 border-r border-border/70">
                  {idx + 1}
                </span>
                <span className="whitespace-pre px-2 flex-1 text-text-primary">{line || ' '}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
