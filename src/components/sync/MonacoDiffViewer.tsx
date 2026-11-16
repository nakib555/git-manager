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
  backLabel?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  alwaysShowResolutionBar?: boolean;
}

const RES_SUMMARY: Record<'take_zip' | 'keep_original' | 'delete' | 'restore', string> = {
  take_zip: 'Use ZIP',
  keep_original: 'Keep Repo',
  delete: 'Delete in Git',
  restore: 'Retain in Repo',
};

export const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({
  file,
  resolution = 'take_zip',
  onResolve,
  onBack,
  backLabel,
  isExpanded = false,
  onToggleExpand,
  alwaysShowResolutionBar = false,
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
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-surface-1 text-text-secondary">
        <FileCode size={36} className="opacity-30 mb-3 text-text-tertiary" />
        <span className="text-sm font-semibold text-text-primary">No File Selected</span>
        <p className="text-xs text-text-tertiary mt-1 max-w-xs">Select a file from the tree to inspect its line-by-line diff.</p>
      </div>
    );
  }

  if (file.isBinary) {
    return (
      <div className="h-full flex flex-col bg-surface-1 text-text-primary overflow-hidden">
        <MonacoDiffTitleBar
          file={file}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCopy={handleCopy}
          isCopied={isCopied}
          onBack={onBack}
          backLabel={backLabel}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/12 text-accent flex items-center justify-center mb-3">
            <FileCheck2 size={24} />
          </div>
          <span className="text-sm font-bold font-mono text-text-primary text-balance">{file.path}</span>
          <span className="text-xs text-text-secondary mt-1 text-pretty">Binary asset · line diff preview unavailable</span>
        </div>
        {onResolve && (
          <MonacoDiffResolutionBar
            file={file}
            resolution={resolution}
            onResolve={onResolve}
            alwaysShow={alwaysShowResolutionBar}
          />
        )}
      </div>
    );
  }

  const oldLines = (file.oldContent || '').split('\n');
  const newLines = (file.newContent || '').split('\n');

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="h-full flex flex-col bg-surface-1 text-text-primary overflow-hidden">
      <MonacoDiffTitleBar
        file={file}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCopy={handleCopy}
        isCopied={isCopied}
        onBack={onBack}
        backLabel={backLabel}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
      <div className="flex-1 overflow-auto font-mono text-[12px] leading-5 select-text bg-surface-1 tabular-nums">
        <MonacoDiffMobileView mobileTab={mobileTab} onTabChange={setMobileTab} diffLines={diffData.lines} oldLines={oldLines} newLines={newLines} />
        <MonacoDiffSplitView viewMode={viewMode} splitRows={splitRows} diffLines={diffData.lines} oldLinesCount={oldLines.length} newLinesCount={newLines.length} />
      </div>
      {onResolve && (
        <MonacoDiffResolutionBar
          file={file}
          resolution={resolution}
          onResolve={onResolve}
          alwaysShow={alwaysShowResolutionBar}
        />
      )}
      <div className="hidden lg:flex h-8 px-4 border-t border-border bg-surface-2/50 text-text-secondary items-center justify-between text-[11px] font-sans shrink-0 select-none">
        <div className="flex items-center gap-2 tabular-nums">
          <span className="font-medium text-text-primary">Diff Inspector</span>
          <span aria-hidden="true" className="text-text-tertiary">·</span>
          <span>{Math.max(oldLines.length, newLines.length)} lines</span>
          <span aria-hidden="true" className="text-text-tertiary">·</span>
          <span>UTF-8</span>
        </div>
        <span className="text-xs font-semibold text-accent">
          Action: {RES_SUMMARY[resolution]}
        </span>
      </div>
    </div>
  );
};
