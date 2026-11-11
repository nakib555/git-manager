import React, { useState, useMemo } from 'react';
import {
  FileText,
  History,
  ArrowUpDown,
  Search,
  CheckCircle2,
  Sparkles,
  Milestone,
  ExternalLink,
  GitCommitHorizontal,
  Clock,
  User,
  X,
} from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { CommitDetailModal } from '../../../components/CommitDetailModal';
import { formatBytes, formatRelativeTime } from '../../../utils/formatters';
import { getCodeLanguage } from './fileLanguageUtils';
import { UniversalFilePreview } from '../../../../features/preview/components/UniversalFilePreview';

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
  activeFileLoading,
  fileContentError,
  fileHistory,
  isFileHistoryLoading = false,
  currentRepo = '',
  currentRepoOwner = '',
  currentBranch = 'main',
  githubToken,
  isOwner = true,
  onRetry,
  onSetContentTab,
}) => {
  const [selectedCommitForDetail, setSelectedCommitForDetail] = useState<any | null>(null);
  const [historyOrder, setHistoryOrder] = useState<'newest_first' | 'oldest_first'>('newest_first');
  const [filterQuery, setFilterQuery] = useState('');
  const [pathCopied, setPathCopied] = useState(false);
  const [shaCopied, setShaCopied] = useState<string | null>(null);

  const lineCount = activeFileContent ? activeFileContent.split('\n').length : 0;
  const characterCount = activeFileContent ? activeFileContent.length : 0;
  const fileName = selectedFile.split('/').pop() || selectedFile;

  // Latest commit for "Last Change" features
  const lastChange = useMemo(() => {
    if (!fileHistory || fileHistory.length === 0) return null;
    return fileHistory[0];
  }, [fileHistory]);

  // Compute chronologically indexed lineage (oldest is #1 Genesis, newest is #N HEAD)
  // Regardless of original order, we assume fileHistory array is ordered newest-to-oldest by default
  const indexedCommits = useMemo(() => {
    if (!fileHistory || fileHistory.length === 0) return [];
    const total = fileHistory.length;
    return fileHistory.map((commit, idx) => {
      // In a newest-first list:
      // index 0 is HEAD (newest)
      // index total - 1 is Genesis (first commit)
      const chronologicalIndex = total - idx; // 1 = genesis, total = current
      const isCurrentHead = idx === 0;
      const isInitialGenesis = idx === total - 1;

      return {
        ...commit,
        chronologicalIndex,
        isCurrentHead,
        isInitialGenesis,
      };
    });
  }, [fileHistory]);

  // Apply sorting and filtering
  const displayCommits = useMemo(() => {
    let list = [...indexedCommits];
    if (historyOrder === 'oldest_first') {
      list.reverse();
    }
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      list = list.filter(
        c =>
          (c.msg && c.msg.toLowerCase().includes(q)) ||
          (c.fullMsg && c.fullMsg.toLowerCase().includes(q)) ||
          (c.author && c.author.toLowerCase().includes(q)) ||
          (c.hash && c.hash.toLowerCase().includes(q)) ||
          (c.fullHash && c.fullHash.toLowerCase().includes(q))
      );
    }
    return list;
  }, [indexedCommits, historyOrder, filterQuery]);

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
      <div className="p-4 space-y-4 font-sans text-xs">
        {/* Header & Meta Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} className="text-accent" />
                Complete File History
              </span>
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold text-[11px] tabular-nums">
                {fileHistory.length} {fileHistory.length === 1 ? 'commit' : 'commits'}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">
              From first commit (initial creation) to current commit (HEAD) for{' '}
              <span className="font-mono text-text-primary font-semibold">{fileName}</span>
            </p>
          </div>

          {/* Controls: Order Toggle & Commits count */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHistoryOrder(prev => (prev === 'newest_first' ? 'oldest_first' : 'newest_first'))}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 text-text-primary text-[11px] font-medium transition-all active:scale-[0.98] cursor-pointer touch-target-44"
              title="Toggle chronological order"
            >
              <ArrowUpDown size={12} className="text-accent shrink-0" />
              <span>{historyOrder === 'newest_first' ? 'Newest → First' : 'First → Current'}</span>
            </button>
          </div>
        </div>

        {/* Search filter if there are several commits */}
        {fileHistory.length > 3 && (
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Filter by commit message, author, or SHA..."
              className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-border bg-surface-1 text-text-primary text-xs placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-0.5 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {isFileHistoryLoading ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-xs text-text-secondary animate-pulse">
              <History size={14} className="animate-spin text-accent" />
              <span>Loading complete commit lineage for this file...</span>
            </div>
            <div className="space-y-3 pl-4 border-l-2 border-border/60">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="relative pl-4 space-y-1.5 animate-pulse">
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-border" />
                  <div className="h-4 bg-surface-2 rounded-md w-3/4" />
                  <div className="h-3 bg-surface-2 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : displayCommits.length === 0 ? (
          filterQuery ? (
            <div className="p-6 text-center rounded-xl bg-surface-1 border border-border space-y-2">
              <p className="text-text-secondary font-medium">No commits match &ldquo;{filterQuery}&rdquo;</p>
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="text-xs text-accent font-semibold hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <EmptyState
              icon={History}
              title="No commit history found"
              description="No separate commits have touched this specific file path on the active branch."
              compact
            />
          )
        ) : (
          /* Vertical Timeline from First to Current */
          <div className="relative pl-4 sm:pl-6 border-l-2 border-border space-y-4 pt-1 pb-2">
            {displayCommits.map((c, i) => {
              const shortSha = (c.hash || c.fullHash || '').substring(0, 7);
              const isHead = c.isCurrentHead;
              const isGenesis = c.isInitialGenesis;

              return (
                <div
                  key={`${c.hash || c.fullHash}-${i}`}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedCommitForDetail(c)}
                >
                  {/* Timeline Node Bullet */}
                  <div
                    className={`absolute -left-[23px] sm:-left-[31px] top-3.5 w-4 h-4 rounded-full border-2 transition-transform duration-200 group-hover:scale-125 flex items-center justify-center ${
                      isHead
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                        : isGenesis
                        ? 'bg-indigo-500 border-indigo-600 text-white shadow-xs'
                        : 'bg-surface-1 border-border group-hover:border-accent'
                    }`}
                  >
                    {isHead && <CheckCircle2 size={10} className="stroke-[3]" />}
                    {isGenesis && <Sparkles size={8} className="stroke-[3]" />}
                  </div>

                  {/* Commit Card Container */}
                  <div className="p-3.5 rounded-xl border border-border bg-surface-1 hover:bg-surface-2/70 transition-all shadow-2xs hover:shadow-xs space-y-2">
                    {/* Header Row: Milestone Badge + Chronological Step + SHA */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isHead && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wide border border-emerald-200 dark:border-emerald-800/40">
                            <CheckCircle2 size={10} />
                            Current (HEAD)
                          </span>
                        )}
                        {isGenesis && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wide border border-indigo-200 dark:border-indigo-800/40">
                            <Milestone size={10} />
                            Initial / First Commit
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary font-mono text-[10px] font-semibold tabular-nums">
                          Commit #{c.chronologicalIndex} of {fileHistory.length}
                        </span>
                      </div>

                      {/* Commit SHA + Diff Stats */}
                      <div className="flex items-center gap-2">
                        {c.add && c.add !== '+0' && (
                          <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {c.add}
                          </span>
                        )}
                        {c.del && c.del !== '-0' && (
                          <span className="text-[10px] font-mono font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                            {c.del}
                          </span>
                        )}
                        <span className="font-mono text-accent font-bold text-[11px] tabular-nums tracking-wider px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20">
                          {shortSha}
                        </span>
                      </div>
                    </div>

                    {/* Commit Message */}
                    <div className="text-xs font-semibold text-text-primary leading-snug line-clamp-2">
                      {c.msg}
                    </div>

                    {/* Meta Row: Author, Avatar, Relative Time */}
                    <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-text-tertiary border-t border-border/50">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {c.authorAvatar ? (
                          <img
                            src={c.authorAvatar}
                            alt={c.author}
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[9px] font-bold shrink-0">
                            {(c.author || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-text-secondary truncate">{c.author}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-mono text-text-tertiary shrink-0">
                        <Clock size={11} className="text-text-tertiary" />
                        <span className="tabular-nums">
                          {formatRelativeTime(c.timestamp || c.date, c.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Commit Detail Modal */}
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
    <div className="p-4 sm:p-5 space-y-5 font-sans text-xs">
      {/* ── SECTION 1: File Metadata & Attributes ── */}
      <div>
        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider block mb-2.5">
          File Metadata & Attributes
        </span>
        {/* 1st line: Path box takes full width across all 3 columns */}
        {/* 2nd line: Remaining three boxes (Language, Total Lines, Size) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* 1st Line: Path Box */}
          <div className="col-span-3 p-3.5 rounded-xl bg-surface-1 border border-border shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-text-tertiary block text-[10px] uppercase font-bold tracking-wider">
                Path
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(selectedFile);
                  setPathCopied(true);
                  setTimeout(() => setPathCopied(false), 2000);
                }}
                className="text-text-tertiary hover:text-text-primary text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy full file path"
              >
                {pathCopied ? (
                  <>
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <ExternalLink size={11} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <span className="font-mono text-text-primary text-xs break-all select-all font-medium leading-relaxed block">
              {selectedFile}
            </span>
          </div>

          {/* 2nd Line: Box 1 - Language */}
          <div className="p-3 rounded-xl bg-surface-1 border border-border shadow-2xs">
            <span className="text-text-tertiary block text-[10px] uppercase font-bold tracking-wider">
              Language
            </span>
            <span className="font-mono text-text-primary text-xs font-semibold mt-1 block truncate">
              {getCodeLanguage(selectedFile).toUpperCase()}
            </span>
          </div>

          {/* 2nd Line: Box 2 - Total Lines */}
          <div className="p-3 rounded-xl bg-surface-1 border border-border shadow-2xs">
            <span className="text-text-tertiary block text-[10px] uppercase font-bold tracking-wider">
              Total Lines
            </span>
            <span className="font-mono text-text-primary text-xs font-semibold mt-1 block tabular-nums">
              {lineCount}
            </span>
          </div>

          {/* 2nd Line: Box 3 - Size */}
          <div className="p-3 rounded-xl bg-surface-1 border border-border shadow-2xs">
            <span className="text-text-tertiary block text-[10px] uppercase font-bold tracking-wider">
              Size
            </span>
            <span className="font-mono text-text-primary text-xs font-semibold mt-1 block tabular-nums">
              {formatBytes(characterCount)}
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Last Changes Features ── */}
      <div className="pt-1">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
            <GitCommitHorizontal size={14} className="text-accent" />
            Last Changes
          </span>
          {fileHistory.length > 0 && onSetContentTab && (
            <button
              type="button"
              onClick={() => onSetContentTab('history')}
              className="text-[11px] text-accent font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all {fileHistory.length} commits</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          )}
        </div>

        {isFileHistoryLoading ? (
          <div className="p-4 rounded-xl bg-surface-1 border border-border animate-pulse space-y-2">
            <div className="h-3 bg-surface-2 rounded-md w-1/3" />
            <div className="h-4 bg-surface-2 rounded-md w-3/4" />
            <div className="h-3 bg-surface-2 rounded-md w-1/2" />
          </div>
        ) : lastChange ? (
          <div className="rounded-xl bg-surface-1 border border-border overflow-hidden shadow-2xs">
            {/* Last Change Card Header */}
            <div className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wide border border-emerald-200 dark:border-emerald-800/40">
                    <CheckCircle2 size={10} />
                    Latest Revision (HEAD)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary font-mono text-[10px] font-semibold tabular-nums">
                    Commit #{fileHistory.length} of {fileHistory.length}
                  </span>
                </div>

                {/* Commit SHA + Diff Stats */}
                <div className="flex items-center gap-2">
                  {lastChange.add && lastChange.add !== '+0' && (
                    <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {lastChange.add}
                    </span>
                  )}
                  {lastChange.del && lastChange.del !== '-0' && (
                    <span className="text-[10px] font-mono font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                      {lastChange.del}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const sha = lastChange.fullHash || lastChange.hash;
                      if (sha) {
                        navigator.clipboard?.writeText(sha);
                        setShaCopied(lastChange.hash);
                        setTimeout(() => setShaCopied(null), 2000);
                      }
                    }}
                    className="font-mono text-accent font-bold text-[11px] tabular-nums tracking-wider px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer flex items-center gap-1"
                    title="Click to copy commit hash"
                  >
                    <span>{(lastChange.hash || lastChange.fullHash || '').substring(0, 7)}</span>
                    {shaCopied === lastChange.hash ? (
                      <CheckCircle2 size={10} className="text-emerald-500" />
                    ) : null}
                  </button>
                </div>
              </div>

              {/* Commit Message */}
              <div className="text-xs font-semibold text-text-primary leading-snug">
                {lastChange.msg}
              </div>
              {lastChange.fullMsg && lastChange.fullMsg !== lastChange.msg && (
                <div className="text-[11px] text-text-secondary line-clamp-2 font-normal leading-relaxed">
                  {lastChange.fullMsg}
                </div>
              )}

              {/* Author & Timestamp */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 text-[11px] text-text-tertiary">
                <div className="flex items-center gap-1.5 min-w-0">
                  {lastChange.authorAvatar ? (
                    <img
                      src={lastChange.authorAvatar}
                      alt={lastChange.author}
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[9px] font-bold shrink-0">
                      {(lastChange.author || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-text-secondary truncate">{lastChange.author}</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-text-tertiary shrink-0">
                  <Clock size={11} className="text-text-tertiary" />
                  <span className="tabular-nums">
                    {formatRelativeTime(lastChange.timestamp || lastChange.date, lastChange.time)}
                  </span>
                </div>
              </div>
            </div>

            {/* Last Change Actions Toolbar */}
            <div className="px-3.5 py-2.5 bg-surface-2/40 border-t border-border flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedCommitForDetail(lastChange)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white font-medium text-[11px] shadow-2xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
              >
                <GitCommitHorizontal size={13} />
                <span>Inspect Last Change Details & Diff</span>
              </button>

              {onSetContentTab && (
                <button
                  type="button"
                  onClick={() => onSetContentTab('history')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 text-text-primary text-[11px] font-medium transition-all active:scale-[0.98] cursor-pointer"
                >
                  <History size={12} className="text-accent" />
                  <span>Full Lineage ({fileHistory.length})</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-1 border border-border text-center text-text-secondary text-xs">
            No git commit records available for this path.
          </div>
        )}
      </div>

      {/* ── SECTION 3: Repository & Branch Environment ── */}
      <div className="p-3.5 rounded-xl bg-surface-1 border border-border shadow-2xs space-y-2">
        <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider block">
          Git Repository Context
        </span>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-text-tertiary block text-[10px]">Active Branch</span>
            <span className="font-mono text-accent font-semibold">{currentBranch}</span>
          </div>
          <div>
            <span className="text-text-tertiary block text-[10px]">Repository</span>
            <span className="font-mono text-text-primary font-semibold truncate block">
              {currentRepoOwner ? `${currentRepoOwner}/${currentRepo}` : currentRepo}
            </span>
          </div>
        </div>
      </div>

      {/* Commit Detail Modal when opened from Info tab's Last Change feature */}
      {selectedCommitForDetail && (
        <CommitDetailModal
          commit={selectedCommitForDetail}
          onClose={() => setSelectedCommitForDetail(null)}
        />
      )}
    </div>
  );
};

