import React from 'react';
import { Home, Sparkles, Search, X, ShieldCheck } from 'lucide-react';

interface FilesHeaderBarProps {
  currentRepo: string;
  filesCount: number;
  searchQuery: string;
  isOwner?: boolean;
  onSearchChange: (q: string) => void;
  onZipSync: () => void;
}

export const FilesHeaderBar: React.FC<FilesHeaderBarProps> = ({
  currentRepo,
  filesCount,
  searchQuery,
  isOwner,
  onSearchChange,
  onZipSync,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-surface-1/90 backdrop-blur-md border-b border-border px-4 py-3 space-y-2.5 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-mono truncate">
          <Home size={14} className="text-text-tertiary shrink-0" />
          <span>/</span>
          <span className="text-text-primary font-bold truncate">{currentRepo}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onZipSync}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/30 text-accent font-bold text-xs active:scale-95 transition-all cursor-pointer"
            title="Sync changes from AI Studio ZIP package"
          >
            <Sparkles size={12} />
            <span>Sync ZIP</span>
          </button>
          <span className="text-[11px] font-mono text-text-tertiary tabular-nums">
            {filesCount} files
          </span>
        </div>
      </div>

      <div className="relative flex items-center">
        <Search size={15} className="absolute left-3 text-text-tertiary pointer-events-none" />
        <input
          type="text"
          placeholder="Search file name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-9 pr-8 bg-surface-2 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 text-text-tertiary hover:text-text-primary"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
