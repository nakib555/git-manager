import React, { useState } from 'react';
import { History, ExternalLink, Check } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { CommitDetailModal } from '../../../components/CommitDetailModal';
import { formatBytes, formatRelativeTime } from '../../../utils/formatters';
import { getCodeLanguage } from './fileLanguageUtils';
import { UniversalFilePreview } from '../../../../features/preview/components/UniversalFilePreview';
import { Skeleton } from '../../../components/skeleton/BaseSkeleton';

interface FileViewerTabsProps {
  contentTab: 'code' | 'history' | 'info';
  selectedFile: string;
  activeFileContent: string;
  activeFileLoading: boolean;
  fileContentError: string | null;
  fileHistory: any[];
  isFileHistoryLoading?: boolean;
  currentRepo?: string;
  currentRepoOwner?: string;
  currentBranch?: string;
  githubToken?: string | null;
  isOwner?: boolean;
  onRetry: () => void;
  onSetContentTab?: (tab: 'code' | 'history' | 'info') => void;
}

export const FileViewerTabs: React.FC<FileViewerTabsProps> = ({
  contentTab,
  selectedFile,
  activeFileContent,
  fileHistory,
  isFileHistoryLoading = false,
  currentRepo = '',
  currentRepoOwner = '',
  currentBranch = 'main',
  githubToken,
  isOwner = true,
}) => {
  const [selectedCommitForDetail, setSelectedCommitForDetail] = useState<any | null>(null);
  const [pathCopied, setPathCopied] = useState(false);

  const lineCount = activeFileContent ? activeFileContent.split('\n').length : 0;
  const characterCount = activeFileContent ? activeFileContent.length : 0;
  const fileName = selectedFile.split('/').pop() || selectedFile;

  const handleCopyPath = () => {
    if (!selectedFile) return;
    navigator.clipboard?.writeText(selectedFile);
    setPathCopied(true);
    setTimeout(() => setPathCopied(false), 2000);
  };

  if (contentTab === 'code') {
    return (
      <UniversalFilePreview
        filePath={selectedFile}
        fileName={fileName}
        repoName={currentRepo}
        owner={currentRepoOwner}
        branch={currentBranch}
        token={githubToken}
        isOwner={isOwner}
        className="h-full border-none rounded-none"
      />
    );
  }

  if (contentTab === 'history') {
    return (
      <div className="p-4 space-y-3 font-sans">
        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block">
          Recent Commits Touching This File
        </span>

        {isFileHistoryLoading ? (
          <div className="rounded-2xl border border-border bg-surface-1 divide-y divide-border overflow-hidden">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="p-3.5 space-y-2 ghost-shimmer">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-3 w-2/5" />
              </div>
            ))}
          </div>
        ) : !fileHistory || fileHistory.length === 0 ? (
          <EmptyState
            icon={History}
            title="No commit history for file"
            description="No separate commits have touched this specific file path on the active branch."
            compact
          />
        ) : (
          <div className="rounded-2xl border border-border bg-surface-1 divide-y divide-border overflow-hidden shadow-2xs">
            {fileHistory.map((c, i) => {
              const shortHash = c.hash ? c.hash.substring(0, 7) : (c.fullHash || '').substring(0, 7);
              const authorName = c.author || 'Author';
              const timeString = formatRelativeTime(c.timestamp || c.date, c.time);
              const additions = c.add || '+0';

              return (
                <div
                  key={`${c.hash || c.fullHash}-${i}`}
                  onClick={() => setSelectedCommitForDetail(c)}
                  className="p-3.5 hover:bg-surface-2 transition-colors cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-text-primary line-clamp-1 block leading-snug">
                      {c.msg}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-text-tertiary font-mono">
                      <span className="text-text-primary font-medium">{shortHash}</span>
                      <span aria-hidden="true">·</span>
                      <span>{authorName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{timeString}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                    {additions}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Commit Detail Modal on commit tap */}
        {selectedCommitForDetail && (
          <CommitDetailModal
            commit={selectedCommitForDetail}
            onClose={() => setSelectedCommitForDetail(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 font-sans">
      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block">
        File Metadata & Attributes
      </span>

      {/* 1st Line: Path Box */}
      <div className="rounded-2xl border border-border bg-surface-1 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-text-tertiary block text-[10px] uppercase font-bold tracking-wider">
            Path
          </span>
          <button
            type="button"
            onClick={handleCopyPath}
            className="text-[11px] text-text-tertiary hover:text-text-primary flex items-center gap-1 font-sans cursor-pointer transition-colors"
            title="Copy path to clipboard"
          >
            {pathCopied ? (
              <>
                <Check size={12} className="text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <ExternalLink size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="font-mono text-text-primary text-xs break-all mt-1.5 leading-relaxed font-normal select-all">
          {selectedFile}
        </div>
      </div>

      {/* 2nd Line: Remaining Three Boxes */}
      <div className="grid grid-cols-3 gap-3">
        {/* Language Box */}
        <div className="rounded-2xl border border-border bg-surface-1 p-3.5 shadow-2xs">
          <span className="text-text-tertiary block text-[10px] uppercase font-bold tracking-wider">
            Language
          </span>
          <span className="font-mono font-bold text-xs text-text-primary mt-1.5 uppercase truncate block">
            {getCodeLanguage(selectedFile).toUpperCase()}
          </span>
        </div>

        {/* Total Lines Box */}
        <div className="rounded-2xl border border-border bg-surface-1 p-3.5 shadow-2xs">
          <span className="text-text-tertiary block text-[10px] uppercase font-bold tracking-wider">
            Total Lines
          </span>
          <span className="font-mono font-bold text-xs text-text-primary mt-1.5 tabular-nums block">
            {lineCount}
          </span>
        </div>

        {/* Size Box */}
        <div className="rounded-2xl border border-border bg-surface-1 p-3.5 shadow-2xs">
          <span className="text-text-tertiary block text-[10px] uppercase font-bold tracking-wider">
            Size
          </span>
          <span className="font-mono font-bold text-xs text-text-primary mt-1.5 tabular-nums block">
            {formatBytes(characterCount)}
          </span>
        </div>
      </div>
    </div>
  );
};
