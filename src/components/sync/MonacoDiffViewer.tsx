import React, { useState, useMemo, useRef } from 'react';
import { 
  Columns, AlignJustify, Copy, Check, FileCode, 
  FileCheck2, ArrowLeft, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import { DiffFileItem, computeLineDiff } from '../../mobile/utils/zipSyncEngine';

interface MonacoDiffViewerProps {
  file: DiffFileItem | null;
  theme?: 'dark' | 'light' | 'slate' | 'fantasy';
  resolution?: 'take_zip' | 'keep_original' | 'delete' | 'restore';
  onResolve?: (action: 'take_zip' | 'keep_original' | 'delete' | 'restore') => void;
  onBack?: () => void;
}

export const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({
  file,
  theme = 'dark',
  resolution = 'take_zip',
  onResolve,
  onBack,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [mobileTab, setMobileTab] = useState<'diff' | 'original' | 'zip'>('diff');
  const [isCopied, setIsCopied] = useState(false);

  // Swipe handling on mobile
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) > 48) {
      if (deltaX < 0) {
        // Swiped Left -> advance tab
        if (mobileTab === 'original') setMobileTab('zip');
        else if (mobileTab === 'zip') setMobileTab('diff');
      } else {
        // Swiped Right -> previous tab
        if (mobileTab === 'diff') setMobileTab('zip');
        else if (mobileTab === 'zip') setMobileTab('original');
      }
    }
  };

  const diffData = useMemo(() => {
    if (!file || file.isBinary) return { additions: 0, deletions: 0, lines: [] };
    return computeLineDiff(file.oldContent || '', file.newContent || '');
  }, [file]);

  const handleCopy = () => {
    const textToCopy = mobileTab === 'original' 
      ? (file?.oldContent ?? '') 
      : (file?.newContent ?? file?.oldContent ?? '');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Pre-calculate aligned side-by-side rows for split view
  interface SplitRow {
    left?: { lineNum?: number; text: string; type: 'same' | 'del' };
    right?: { lineNum?: number; text: string; type: 'same' | 'add' };
  }

  const splitRows = useMemo<SplitRow[]>(() => {
    if (!diffData || !diffData.lines) return [];
    const rows: SplitRow[] = [];
    const lines = diffData.lines;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (line.type === 'same') {
        rows.push({
          left: { lineNum: line.oldLine, text: line.text, type: 'same' },
          right: { lineNum: line.newLine, text: line.text, type: 'same' },
        });
        i++;
      } else {
        const dels: typeof lines = [];
        const adds: typeof lines = [];
        while (i < lines.length && (lines[i].type === 'del' || lines[i].type === 'add')) {
          if (lines[i].type === 'del') {
            dels.push(lines[i]);
          } else {
            adds.push(lines[i]);
          }
          i++;
        }
        const maxLen = Math.max(dels.length, adds.length);
        for (let j = 0; j < maxLen; j++) {
          const d = dels[j];
          const a = adds[j];
          rows.push({
            left: d ? { lineNum: d.oldLine, text: d.text, type: 'del' } : undefined,
            right: a ? { lineNum: a.newLine, text: a.text, type: 'add' } : undefined,
          });
        }
      }
    }
    return rows;
  }, [diffData]);

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#1E1E1E] text-slate-400 rounded-2xl border border-[#2D2D2D]">
        <FileCode size={40} className="opacity-30 mb-3 text-slate-500" />
        <span className="text-sm font-semibold text-slate-200">No File Selected</span>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Select a file from the conflict list to inspect diffs and resolve overlapping changes.
        </p>
      </div>
    );
  }

  if (file.isBinary) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#1E1E1E] text-slate-400 rounded-2xl border border-[#2D2D2D]">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
          <FileCheck2 size={28} />
        </div>
        <span className="text-sm font-bold text-slate-200">{file.path}</span>
        <span className="text-xs text-slate-400 mt-1">Binary file asset</span>
        <p className="text-xs text-slate-500 mt-2 max-w-sm">
          Binary assets (images, fonts, or media) are synchronized via raw byte stream.
        </p>
      </div>
    );
  }

  const oldLines = (file.oldContent || '').split('\n');
  const newLines = (file.newContent || '').split('\n');
  const lineCount = Math.max(oldLines.length, newLines.length);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-full flex flex-col bg-[#1E1E1E] text-[#D4D4D4] rounded-2xl border border-[#2D2D2D] overflow-hidden shadow-xl"
    >
      {/* 1. Monaco Editor Title Bar (Height: 48px = 6x8pt) */}
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

        {/* Desktop Diff View Toggle & Copy */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop Mode Toggle: Split vs Unified */}
          <div className="hidden sm:flex items-center bg-[#1E1E1E] p-0.5 rounded-lg border border-[#333333] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`min-h-[28px] px-2.5 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                viewMode === 'split' ? 'bg-[#0E639C] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns size={12} />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
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
            onClick={handleCopy}
            className="min-h-[32px] min-w-[32px] px-2 rounded-lg border border-[#333333] hover:bg-[#2A2D2E] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
            title="Copy content"
          >
            {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* 2. Mobile Responsive Tab Strip (Height: 40px = 5x8pt) with Touch Target */}
      <div className="sm:hidden flex items-center bg-[#252526] border-b border-[#2D2D2D] px-2 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('diff')}
          className={`flex-1 min-h-[40px] text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
            mobileTab === 'diff' 
              ? 'border-sky-400 text-sky-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Diff Hunks</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('original')}
          className={`flex-1 min-h-[40px] text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
            mobileTab === 'original' 
              ? 'border-sky-400 text-sky-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Original (Repo)</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('zip')}
          className={`flex-1 min-h-[40px] text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
            mobileTab === 'zip' 
              ? 'border-sky-400 text-sky-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Uploaded (ZIP)</span>
        </button>
      </div>

      {/* 3. Monaco Editor Diff Content Area */}
      <div className="flex-1 overflow-auto font-mono text-[12px] leading-5 select-text bg-[#1E1E1E]">
        {/* Mobile View: Render chosen Tab */}
        <div className="sm:hidden">
          {mobileTab === 'diff' && (
            <div className="min-w-full inline-block py-1">
              {diffData.lines.map((line, idx) => {
                const isAdd = line.type === 'add';
                const isDel = line.type === 'del';
                return (
                  <div
                    key={idx}
                    className={`flex ${
                      isAdd
                        ? 'bg-[#1e3a24] text-[#86efac]'
                        : isDel
                        ? 'bg-[#3b1d1d] text-[#fca5a5]'
                        : 'text-[#9ca3af] hover:bg-[#262626]'
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

        {/* Desktop View: Side-by-Side Split or Unified */}
        <div className="hidden sm:block">
          {viewMode === 'split' ? (
            <div className="flex flex-col min-w-[750px]">
              {/* Sticky Split Headers */}
              <div className="grid grid-cols-2 divide-x divide-[#2D2D2D] bg-[#252526] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#2D2D2D] sticky top-0 z-10">
                <div className="px-3 py-1 flex justify-between">
                  <span>Repository Base (Original)</span>
                  <span className="font-mono text-slate-500">{oldLines.length} lines</span>
                </div>
                <div className="px-3 py-1 flex justify-between">
                  <span>Uploaded ZIP (Incoming)</span>
                  <span className="font-mono text-slate-500">{newLines.length} lines</span>
                </div>
              </div>
              {/* Split Rows */}
              <div className="divide-y divide-[#262626]">
                {splitRows.map((row, idx) => {
                  const leftDel = row.left?.type === 'del';
                  const rightAdd = row.right?.type === 'add';

                  return (
                    <div key={idx} className="grid grid-cols-2 divide-x divide-[#2D2D2D] leading-5 font-mono text-[11px]">
                      {/* Left Side (Repository Base) */}
                      <div className={`flex ${
                        leftDel 
                          ? 'bg-[#3b1d1d]/90 text-[#fca5a5]' 
                          : row.left ? 'text-[#9ca3af] hover:bg-[#262626]' : 'bg-[#181818]/60 text-transparent select-none'
                      }`}>
                        <span className="w-10 text-right pr-2 text-[10px] text-[#555] select-none tabular-nums shrink-0 border-r border-[#333]">
                          {row.left?.lineNum || ''}
                        </span>
                        <span className="w-4 text-center text-[10px] select-none font-bold shrink-0">
                          {leftDel ? '-' : ''}
                        </span>
                        <span className="whitespace-pre px-2 flex-1 overflow-x-hidden">{row.left?.text ?? ' '}</span>
                      </div>

                      {/* Right Side (Uploaded ZIP) */}
                      <div className={`flex ${
                        rightAdd 
                          ? 'bg-[#1e3a24]/90 text-[#86efac]' 
                          : row.right ? 'text-[#D4D4D4] hover:bg-[#262626]' : 'bg-[#181818]/60 text-transparent select-none'
                      }`}>
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
            /* Unified View */
            <div className="min-w-full inline-block py-1">
              {diffData.lines.map((line, idx) => {
                const isAdd = line.type === 'add';
                const isDel = line.type === 'del';
                return (
                  <div
                    key={idx}
                    className={`flex ${
                      isAdd
                        ? 'bg-[#1e3a24] text-[#86efac]'
                        : isDel
                        ? 'bg-[#3b1d1d] text-[#fca5a5]'
                        : 'text-[#9ca3af] hover:bg-[#262626]'
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
      </div>

      {/* Mobile Sticky Quick Resolution Bar (>=44px touch target) */}
      {onResolve && file && (
        <div className="lg:hidden p-2.5 bg-[#252526] border-t border-[#2D2D2D] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
              {file.status === 'modified' ? 'Conflict Resolution' : file.status === 'removed' ? 'Missing File Action' : 'New File Action'}
            </span>
            <span className="text-xs font-bold text-slate-200 truncate block">
              {resolution.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {file.status === 'modified' && (
              <>
                <button
                  type="button"
                  onClick={() => onResolve('take_zip')}
                  className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    resolution === 'take_zip' ? 'bg-[#0E639C] text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
                  }`}
                >
                  <Check size={13} />
                  <span>Take ZIP</span>
                </button>
                <button
                  type="button"
                  onClick={() => onResolve('keep_original')}
                  className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    resolution === 'keep_original' ? 'bg-[#3E3E42] text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
                  }`}
                >
                  <span>Keep Repo</span>
                </button>
              </>
            )}

            {file.status === 'removed' && (
              <>
                <button
                  type="button"
                  onClick={() => onResolve('restore')}
                  className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    resolution === 'restore' ? 'bg-amber-600 text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
                  }`}
                >
                  <span>Restore</span>
                </button>
                <button
                  type="button"
                  onClick={() => onResolve('delete')}
                  className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    resolution === 'delete' ? 'bg-rose-600 text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
                  }`}
                >
                  <span>Delete</span>
                </button>
              </>
            )}

            {file.status === 'added' && (
              <>
                <button
                  type="button"
                  onClick={() => onResolve('take_zip')}
                  className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    resolution === 'take_zip' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
                  }`}
                >
                  <Check size={13} />
                  <span>Include</span>
                </button>
                <button
                  type="button"
                  onClick={() => onResolve('keep_original')}
                  className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    resolution === 'keep_original' ? 'bg-[#3E3E42] text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
                  }`}
                >
                  <span>Skip</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Monaco Status Footer Bar (Height: 32px = 4x8pt, hidden on mobile) */}
      <div className="hidden sm:flex h-8 px-4 border-t border-[#2D2D2D] bg-[#007ACC] text-white items-center justify-between text-[11px] font-sans shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Monaco Diff Inspector</span>
          <span className="opacity-75">·</span>
          <span>{lineCount} lines</span>
          <span className="opacity-75">·</span>
          <span>UTF-8</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-[10px] bg-white/20 px-2 py-0.5 rounded">
            {resolution === 'take_zip' ? 'Action: Take ZIP' : resolution === 'keep_original' ? 'Action: Keep Original' : resolution === 'delete' ? 'Action: Delete' : 'Action: Restore'}
          </span>
        </div>
      </div>
    </div>
  );
};
