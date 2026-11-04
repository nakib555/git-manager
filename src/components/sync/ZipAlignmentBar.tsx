import React, { useState } from 'react';
import { Layers, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw, SlidersHorizontal, Folder } from 'lucide-react';

interface ZipAlignmentBarProps {
  detectedRoot: string;
  activeRootPrefix: string;
  availablePrefixes: string[];
  totalFilesInZip: number;
  sampleOriginalPath?: string;
  onPrefixChange: (newPrefix: string) => void;
}

export const ZipAlignmentBar: React.FC<ZipAlignmentBarProps> = ({
  detectedRoot,
  activeRootPrefix,
  availablePrefixes,
  totalFilesInZip,
  sampleOriginalPath = '',
  onPrefixChange,
}) => {
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [customValue, setCustomValue] = useState(activeRootPrefix);

  const sampleMapped = sampleOriginalPath && activeRootPrefix && sampleOriginalPath.startsWith(activeRootPrefix)
    ? sampleOriginalPath.slice(activeRootPrefix.length)
    : sampleOriginalPath;

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    onPrefixChange(customValue.trim().endsWith('/') || !customValue.trim() ? customValue.trim() : `${customValue.trim()}/`);
    setIsCustomEditing(false);
  };

  return (
    <div className="bg-surface-2/60 border border-border rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
      {/* Left: Status & Mapping Explanation */}
      <div className="flex items-start md:items-center gap-2.5 min-w-0">
        <div className={`p-1.5 rounded-lg shrink-0 ${activeRootPrefix ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-3 text-text-tertiary'}`}>
          <Layers size={16} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-text-primary">Folder Tree Alignment:</span>
            {activeRootPrefix ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={11} />
                <span>Trimming root prefix: "{activeRootPrefix}"</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-text-tertiary bg-surface-3 px-2 py-0.5 rounded-md">
                <span>No prefix trimmed (1:1 root)</span>
              </span>
            )}
          </div>

          {/* Sample Path Mapping */}
          {sampleOriginalPath && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-text-secondary font-mono truncate">
              <span className="text-text-tertiary">Map:</span>
              <span className="text-text-tertiary truncate max-w-[180px]">{sampleOriginalPath}</span>
              <ArrowRight size={10} className="shrink-0 text-accent" />
              <span className="text-accent font-semibold truncate max-w-[180px]">{sampleMapped || sampleOriginalPath}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Controls to Switch or Override Prefix */}
      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
        {isCustomEditing ? (
          <form onSubmit={handleApplyCustom} className="flex items-center gap-1">
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="e.g. repo-main/"
              className="px-2 py-1 bg-surface-1 border border-border rounded-lg text-xs font-mono text-text-primary outline-none focus:border-accent w-36"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-accent text-white font-semibold rounded-lg text-[11px] hover:opacity-90 cursor-pointer"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setIsCustomEditing(false)}
              className="px-2 py-1 bg-surface-3 text-text-secondary rounded-lg text-[11px] hover:text-text-primary cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            {/* Quick prefix options */}
            {detectedRoot && (
              <button
                type="button"
                onClick={() => onPrefixChange(activeRootPrefix === detectedRoot ? '' : detectedRoot)}
                className={`px-2.5 py-1 rounded-lg font-medium text-xs border transition-all cursor-pointer ${
                  activeRootPrefix === detectedRoot
                    ? 'bg-accent/15 border-accent text-accent font-semibold'
                    : 'bg-surface-1 border-border text-text-secondary hover:text-text-primary'
                }`}
                title="Toggle automatically detected root directory wrapper"
              >
                {activeRootPrefix === detectedRoot ? 'Prefix Active' : `Strip "${detectedRoot}"`}
              </button>
            )}

            {/* Custom Override Button */}
            <button
              type="button"
              onClick={() => {
                setCustomValue(activeRootPrefix);
                setIsCustomEditing(true);
              }}
              className="p-1.5 bg-surface-1 hover:bg-surface-3 border border-border text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
              title="Manually specify custom root folder prefix"
            >
              <SlidersHorizontal size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
