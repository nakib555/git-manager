import React, { useState, useMemo, useRef } from 'react';
import { FileCode, FileCheck2 } from 'lucide-react';
import { DiffFileItem, computeLineDiff } from '../../mobile/utils/zipSyncEngine';
import { MonacoDiffTitleBar } from './diff/MonacoDiffTitleBar';
import { MonacoDiffMobileView } from './diff/MonacoDiffMobileView';
import { MonacoDiffSplitView, SplitRow } from './diff/MonacoDiffSplitView';
import { MonacoDiffResolutionBar } from './diff/MonacoDiffResolutionBar';

interface MonacoDiffViewerProps {
  file: DiffFileItem | null;
  theme?: 'dark' | 'light' | 'slate' | 'fantasy';
  resolution?: 'take_zip' | 'keep_original' | 'delete' | 'restore';
  onResolve?: (action: 'take_zip' | 'keep_original' | 'delete' | 'restore') => void;
  onBack?: () => void;
}

export const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({
  file,
  resolution = 'take_zip',
  onResolve,
  onBack,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [mobileTab, setMobileTab] = useState<'diff' | 'original' | 'zip'>('diff');
  const [isCopied, setIsCopied] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) > 48) {
      if (deltaX < 0) {
        if (mobileTab === 'original') setMobileTab('zip');
        else if (mobileTab === 'zip') setMobileTab('diff');
      } else {
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
    const textToCopy = mobileTab === 'original' ? (file?.oldContent ?? '') : (file?.newContent ?? file?.oldContent ?? '');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const splitRows = useMemo<SplitRow[]>(() => {
    if (!diffData?.lines) return [];
    const rows: SplitRow[] = [];
    const lines = diffData.lines;
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.type === 'same') {
        rows.push({ left: { lineNum: line.oldLine, text: line.text, type: 'same' }, right: { lineNum: line.newLine, text: line.text, type: 'same' } });
        i++;
      } else {
        const dels = [];
        const adds = [];
        while (i < lines.length && (lines[i].type === 'del' || lines[i].type === 'add')) {
          if (lines[i].type === 'del') dels.push(lines[i]);
          else adds.push(lines[i]);
          i++;
        }
        for (let j = 0; j < Math.max(dels.length, adds.length); j++) {
          rows.push({
            left: dels[j] ? { lineNum: dels[j].oldLine, text: dels[j].text, type: 'del' } : undefined,
            right: adds[j] ? { lineNum: adds[j].newLine, text: adds[j].text, type: 'add' } : undefined,
          });
        }
      }
    }
    return rows;
  }, [diffData]);

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-surface-1 text-text-secondary rounded-2xl border border-border">
        <FileCode size={40} className="opacity-30 mb-3 text-text-tertiary" />
        <span className="text-sm font-semibold text-text-primary">No File Selected</span>
        <p className="text-xs text-text-tertiary mt-1 max-w-xs">Select a file from the conflict list to inspect diffs.</p>
      </div>
    );
  }

  if (file.isBinary) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-surface-1 text-text-secondary rounded-2xl border border-border optical-center-box affordance-card">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4"><FileCheck2 size={28} /></div>
        <span className="text-sm font-bold text-text-primary text-balance">{file.path}</span>
        <span className="text-xs text-text-tertiary mt-1 text-pretty">Binary file asset</span>
      </div>
    );
  }

  const oldLines = (file.oldContent || '').split('\n');
  const newLines = (file.newContent || '').split('\n');

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="h-full flex flex-col bg-surface-1 text-text-primary rounded-2xl border border-border overflow-hidden shadow-xs affordance-card">
      <MonacoDiffTitleBar file={file} viewMode={viewMode} onViewModeChange={setViewMode} onCopy={handleCopy} isCopied={isCopied} onBack={onBack} />
      <div className="flex-1 overflow-auto font-mono text-[12px] leading-5 select-text bg-surface-1 tabular-nums">
        <MonacoDiffMobileView mobileTab={mobileTab} onTabChange={setMobileTab} diffLines={diffData.lines} oldLines={oldLines} newLines={newLines} />
        <MonacoDiffSplitView viewMode={viewMode} splitRows={splitRows} diffLines={diffData.lines} oldLinesCount={oldLines.length} newLinesCount={newLines.length} />
      </div>
      {onResolve && file && <MonacoDiffResolutionBar file={file} resolution={resolution} onResolve={onResolve} />}
      <div className="hidden sm:flex h-8 px-4 border-t border-border bg-accent text-white items-center justify-between text-[11px] font-sans shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Diff Inspector</span>
          <span className="opacity-75">·</span>
          <span className="tabular-nums">{Math.max(oldLines.length, newLines.length)} lines</span>
          <span className="opacity-75">·</span>
          <span>UTF-8</span>
        </div>
        <span className="font-bold uppercase tracking-micro text-[10px] bg-white/20 px-2 py-0.5 rounded">{resolution.replace('_', ' ')}</span>
      </div>
    </div>
  );
};
