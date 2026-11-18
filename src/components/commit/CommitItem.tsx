import React, { memo } from 'react';
import { MoreVertical } from 'lucide-react';
import { CiCdBadge } from './CiCdStatus';
import { formatRelativeTime } from '../../mobile/utils/formatters';

export const CommitItem = memo(({ commit, isSelected, isLatest, onSelect, onActionClick, style, isDesktop }: any) => {
  const addCount = String(commit.add ?? 0).replace(/^\+/, '');
  const delCount = String(commit.del ?? 0).replace(/^-/, '');

  return (
    <div style={style} className="pb-2">
      <div
        className={`relative group/commit p-3 border rounded-xl transition-colors ${
          isSelected
            ? 'bg-primary/8 border-primary/50 shadow-xs'
            : 'border-border bg-surface-1 hover:bg-hover/60'
        } flex items-start justify-between gap-2`}
      >
        <button
          type="button"
          onClick={() => onSelect(commit)}
          aria-pressed={isSelected}
          className="flex-1 min-w-0 text-left cursor-pointer"
        >
          {isDesktop ? (
            <>
              <div className="flex justify-between items-center gap-2 mb-1 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-primary' : isLatest ? 'bg-emerald-500' : 'bg-text-tertiary/60'}`} />
                  <span className="font-mono text-[11px] font-bold text-primary tabular-nums tracking-mono">
                    {commit.hash}
                  </span>
                  {isLatest && (
                    <span className="text-[10px] font-mono font-semibold text-emerald-500 uppercase tracking-micro shrink-0">
                      HEAD
                    </span>
                  )}
                </div>
                <CiCdBadge hash={commit.hash} isCompact={true} />
              </div>
              <p className="text-xs font-semibold text-text-main truncate text-pretty leading-snug">{commit.msg}</p>
              <div className="flex items-center justify-between gap-2 text-[10px] text-text-muted mt-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium truncate">{commit.author}</span>
                  <span className="text-border" aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums shrink-0">{formatRelativeTime(commit.timestamp || commit.date, commit.time)}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono tabular-nums shrink-0">
                  <span className="text-addition-oklch font-semibold">+{addCount}</span>
                  <span className="text-deletion-oklch font-semibold">-{delCount}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 text-xs">
                <span className="font-mono font-bold text-primary tabular-nums tracking-mono">
                  {commit.hash}
                </span>
                {isLatest && (
                  <span className="text-[10px] font-mono font-semibold text-emerald-500 uppercase tracking-micro">
                    latest
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-text-main line-clamp-2 leading-relaxed max-w-[95%] text-pretty">
                {commit.msg}
              </p>
              <div className="mt-1.5 flex">
                <CiCdBadge hash={commit.hash} isCompact={true} />
              </div>
              <div className="flex justify-between items-center mt-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-border overflow-hidden shrink-0 border border-border">
                    {commit.avatar ? (
                      <img src={commit.avatar} alt="Author" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/40 to-info/40" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-text-main/80 truncate max-w-[100px]">{commit.author}</span>
                  <span className="text-[10px] text-text-muted font-mono tabular-nums">{formatRelativeTime(commit.timestamp || commit.date, commit.time)}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono tabular-nums shrink-0">
                  <span className="text-addition-oklch font-bold">+{addCount}</span>
                  <span className="text-deletion-oklch font-bold">-{delCount}</span>
                </div>
              </div>
            </div>
          )}
        </button>

        {onActionClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onActionClick(commit, e);
            }}
            aria-label={`Commit options for ${commit.hash}`}
            className={`${isDesktop ? 'w-6 h-6 opacity-0 group-hover/commit:opacity-100 group-focus-within/commit:opacity-100 focus-visible:opacity-100' : 'touch-target-44 w-10 h-10 -mr-1'} rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover active:bg-border transition-all btn-tactile cursor-pointer shrink-0`}
          >
            <MoreVertical size={isDesktop ? 13 : 16} />
          </button>
        )}
      </div>
    </div>
  );
});
