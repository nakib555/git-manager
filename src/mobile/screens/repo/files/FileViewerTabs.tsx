import React from 'react';
import { FileText, History } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { EmptyState } from '../../../components/EmptyState';
import { InlineErrorCard } from '../../../components/InlineErrorCard';
import { formatBytes, formatRelativeTime } from '../../../utils/formatters';
import { getCodeLanguage } from './fileLanguageUtils';

interface FileViewerTabsProps {
  contentTab: 'code' | 'history' | 'info';
  selectedFile: string;
  activeFileContent: string;
  activeFileLoading: boolean;
  fileContentError: string | null;
  fileHistory: any[];
  onRetry: () => void;
}

export const FileViewerTabs: React.FC<FileViewerTabsProps> = ({
  contentTab,
  selectedFile,
  activeFileContent,
  activeFileLoading,
  fileContentError,
  fileHistory,
  onRetry,
}) => {
  const lineCount = activeFileContent ? activeFileContent.split('\n').length : 0;
  const characterCount = activeFileContent ? activeFileContent.length : 0;

  if (activeFileLoading) {
    return (
      <div className="p-12 text-center text-xs text-text-tertiary flex flex-col items-center justify-center gap-3">
        <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <span>Streaming file contents from repository...</span>
      </div>
    );
  }

  if (contentTab === 'code') {
    if (fileContentError) {
      return (
        <div className="p-6">
          <InlineErrorCard title="Failed to Load File" message={fileContentError} onRetry={onRetry} />
        </div>
      );
    }
    if (!activeFileContent) {
      return (
        <div className="p-8">
          <EmptyState icon={FileText} title="Empty file content" description="This file contains no text lines or represents binary content." compact />
        </div>
      );
    }
    return (
      <SyntaxHighlighter
        language={getCodeLanguage(selectedFile)}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '14px', background: 'transparent', fontSize: '11px', lineHeight: '1.6' }}
        showLineNumbers={true}
        wrapLines={false}
      >
        {activeFileContent}
      </SyntaxHighlighter>
    );
  }

  if (contentTab === 'history') {
    return (
      <div className="p-4 space-y-3 font-sans">
        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block">
          Recent Commits Touching This File
        </span>
        {fileHistory.length === 0 ? (
          <EmptyState icon={History} title="No commit history for file" description="No separate commits have touched this specific file path on the active branch." compact />
        ) : (
          <div className="divide-y divide-border border border-border rounded-xl bg-surface-1 overflow-hidden">
            {fileHistory.map((c, i) => (
              <div key={`${c.hash}-${i}`} className="p-3 hover:bg-surface-2 transition-colors flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-text-primary line-clamp-1">{c.msg}</span>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-text-tertiary font-mono">
                    <span className="text-accent font-semibold tabular-nums">{c.hash.substring(0, 7)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{c.author}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatRelativeTime(c.timestamp || c.date, c.time)}</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-success">{c.add || '+12'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4 font-sans text-xs">
      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block">File Metadata & Attributes</span>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-surface-1 border border-border">
          <span className="text-text-tertiary block text-[10px] uppercase font-bold">Path</span>
          <span className="font-mono text-text-primary text-xs break-all mt-0.5 block">{selectedFile}</span>
        </div>
        <div className="p-3 rounded-xl bg-surface-1 border border-border">
          <span className="text-text-tertiary block text-[10px] uppercase font-bold">Language</span>
          <span className="font-mono text-text-primary text-xs mt-0.5 block">{getCodeLanguage(selectedFile).toUpperCase()}</span>
        </div>
        <div className="p-3 rounded-xl bg-surface-1 border border-border">
          <span className="text-text-tertiary block text-[10px] uppercase font-bold">Total Lines</span>
          <span className="font-mono text-text-primary text-xs mt-0.5 block">{lineCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-surface-1 border border-border">
          <span className="text-text-tertiary block text-[10px] uppercase font-bold">Size</span>
          <span className="font-mono text-text-primary text-xs mt-0.5 block">{formatBytes(characterCount)}</span>
        </div>
      </div>
    </div>
  );
};
