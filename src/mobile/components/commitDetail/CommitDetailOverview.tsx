import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { DetailedCommitInfo } from '../../utils/gitApi';
import { formatCommitDateTime } from '../../utils/formatters';
import { useAppContext } from '../../../AppContext';

interface CommitDetailOverviewProps {
  commit: any;
  detail: DetailedCommitInfo | null;
  htmlUrl?: string;
  onSelectParentCommit?: (parentSha: string) => void;
}

export const CommitDetailOverview: React.FC<CommitDetailOverviewProps> = ({
  commit,
  detail,
  onSelectParentCommit,
}) => {
  const { showToast } = useAppContext();
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);

  const fullSha = commit?.fullHash || commit?.hash || detail?.fullHash || detail?.hash || '';
  const truncatedFullSha = fullSha ? (fullSha.length > 28 ? `${fullSha.slice(0, 28)}...` : fullSha) : '—';

  // Parent commit calculation
  let parentSha = detail?.parentSha || '';
  if (!parentSha && commit?.parents && commit.parents.length > 0) {
    const pRaw = commit.parents[0];
    parentSha = typeof pRaw === 'string' ? pRaw : (pRaw?.sha || '');
  }
  const parentShortSha = parentSha ? parentSha.slice(0, 7) : '';

  // Message parsing: title and bulleted description
  const rawMessage = (commit?.msg || commit?.message || detail?.msg || '').trim();
  const lines = rawMessage.split('\n').map((l: string) => l.trim()).filter(Boolean);
  const title = lines[0] || 'No commit message';
  const bodyLines = lines.slice(1);

  const authorName = commit?.author || detail?.author || 'Unknown Author';
  const authorInitial = (authorName.trim()[0] || 'A').toUpperCase();
  const committedDate = commit?.timestamp || commit?.date || detail?.date || Date.now();
  const formattedDate = formatCommitDateTime(committedDate);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopiedMessage(true);
    showToast('Commit message copied to clipboard');
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleCopySha = () => {
    if (!fullSha) return;
    navigator.clipboard.writeText(fullSha);
    setCopiedSha(true);
    showToast(`Copied SHA: ${fullSha.slice(0, 7)}`);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 1. MESSAGE CARD */}
      <div className="bg-surface-1 border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2.5">
          <span className="text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
            MESSAGE
          </span>
          <button
            type="button"
            onClick={handleCopyMessage}
            className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            title="Copy commit message"
          >
            {copiedMessage ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Message Title */}
        <h4 className="font-mono text-sm font-bold text-text-primary leading-relaxed break-words">
          {title}
        </h4>

        {/* Description / Bullet Points */}
        {bodyLines.length > 0 ? (
          <div className="mt-3 space-y-1.5 text-xs text-text-secondary leading-relaxed font-sans">
            {bodyLines.map((line: string, idx: number) => {
              const formattedLine = line.startsWith('-') || line.startsWith('*') ? line : `- ${line}`;
              return (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-text-tertiary select-none">-</span>
                  <span className="flex-1">{formattedLine.replace(/^[-*]\s*/, '')}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* 2. METADATA KEY-VALUE CARD */}
      <div className="bg-surface-1 border border-border rounded-2xl divide-y divide-border/60 overflow-hidden shadow-xs">
        {/* Author Row */}
        <div className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-text-tertiary font-medium">Author</span>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              {authorInitial}
            </div>
            <span className="font-semibold text-text-primary truncate">{authorName}</span>
          </div>
        </div>

        {/* Committed Date Row */}
        <div className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-text-tertiary font-medium">Committed Date</span>
          <span className="font-mono font-semibold text-text-primary tabular-nums tracking-tight">
            {formattedDate}
          </span>
        </div>

        {/* Full SHA Row */}
        <div className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-text-tertiary font-medium">Full SHA</span>
          <button
            type="button"
            onClick={handleCopySha}
            className="font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer truncate max-w-[210px] sm:max-w-[260px] text-right flex items-center gap-1.5 group"
            title="Click to copy Full SHA"
          >
            <span>{truncatedFullSha}</span>
            {copiedSha && <Check size={11} className="text-emerald-600 shrink-0" />}
          </button>
        </div>

        {/* Parent Commit Row */}
        <div className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-text-tertiary font-medium">Parent Commit</span>
          {parentShortSha ? (
            <button
              type="button"
              onClick={() => onSelectParentCommit?.(parentSha)}
              className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 border border-accent/25 font-semibold transition-colors cursor-pointer active:scale-95"
              title={`View parent commit ${parentShortSha}`}
            >
              {parentShortSha}
            </button>
          ) : (
            <span className="text-text-tertiary italic text-xs">None (initial commit)</span>
          )}
        </div>
      </div>
    </div>
  );
};
