import React, { memo } from 'react';
import { motion } from 'motion/react';
import { MoreVertical } from 'lucide-react';
import { CiCdBadge } from './CiCdStatus';
import { formatRelativeTime } from '../../mobile/utils/formatters';

export const CommitItem = memo(({ commit, isSelected, isLatest, onSelect, onActionClick, style, isDesktop }: any) => {
  return (
    <motion.div
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.14 } }}
      transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }}
      className="pr-2"
    >
      <div
        onClick={() => onSelect(commit)}
        className={`relative group/commit p-3 border rounded-xl btn-tactile ${
          isSelected 
            ? 'bg-primary/5 border-primary/45 cursor-default shadow-xs' 
            : 'border-transparent bg-hover/10 hover:bg-hover/30 affordance-card cursor-pointer'
        } ${isDesktop ? '' : 'flex justify-between items-start gap-2 mb-1.5'}`}
      >
        {/* Timeline Bullet Indicator */}
        {isDesktop ? (
          <div className={`absolute -left-[22px] top-4.5 w-3 h-3 bg-main border-2 rounded-full z-10 transition-colors ${isSelected ? 'border-primary' : 'border-text-muted'}`} />
        ) : (
          <div className={`absolute -left-[23px] top-2 w-3.5 h-3.5 bg-main border-2 rounded-full z-10 transition-colors ${isLatest ? 'border-primary' : 'border-text-muted'}`}></div>
        )}

        {isDesktop ? (
          <>
            <div className="flex justify-between items-center gap-2 mb-1.5 text-xs">
              <span className="font-mono text-[11px] font-bold text-primary tabular-nums tracking-mono">
                {commit.hash}
              </span>
              {isLatest && (
                <span className="text-[10px] font-mono font-semibold text-emerald-500 uppercase tracking-micro">
                  latest
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-text-main truncate text-pretty">{commit.msg}</p>
            <div className="mt-1 flex">
              <CiCdBadge hash={commit.hash} isCompact={true} />
            </div>
            <div className="flex justify-between text-[9px] text-text-muted mt-2">
              <span className="font-semibold">{commit.author}</span>
              <span className="font-mono tabular-nums">{formatRelativeTime(commit.timestamp || commit.date, commit.time)}</span>
            </div>
          </>
        ) : (
          <>
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
                      <img src={commit.avatar} alt="Author" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/40 to-info/40"></div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-text-main/80 truncate max-w-[100px]">{commit.author}</span>
                  <span className="text-[10px] text-text-muted font-mono tabular-nums">{formatRelativeTime(commit.timestamp || commit.date, commit.time)}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono tabular-nums shrink-0">
                  <span className="text-addition-oklch font-bold">+{commit.add}</span>
                  <span className="text-deletion-oklch font-bold">-{commit.del}</span>
                </div>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onActionClick(commit);
              }}
              aria-label="Commit options"
              className="touch-target-44 w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover active:bg-border transition-colors btn-tactile cursor-pointer -mr-1 shrink-0"
            >
              <MoreVertical size={16} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
});
