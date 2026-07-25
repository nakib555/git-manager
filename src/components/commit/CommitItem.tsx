import React, { memo } from 'react';
import { motion } from 'motion/react';
import { MoreVertical } from 'lucide-react';

export const CommitItem = memo(({ commit, isSelected, isLatest, onSelect, onActionClick, style, isDesktop }: any) => {
  return (
    <motion.div
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="pr-2"
    >
      <div
        onClick={() => onSelect(commit)}
        className={`relative group/commit p-3 border rounded-xl transition-all ${
          isSelected 
            ? 'bg-primary/5 border-primary/45 cursor-default' 
            : 'border-transparent bg-hover/10 hover:bg-hover/30 cursor-pointer'
        } ${isDesktop ? '' : 'flex justify-between items-start gap-2 mb-1'}`}
      >
        {/* Timeline Bullet Indicator */}
        {isDesktop ? (
          <div className={`absolute -left-[22px] top-4.5 w-3 h-3 bg-main border-2 rounded-full z-10 transition-colors ${isSelected ? 'border-primary' : 'border-text-muted'}`} />
        ) : (
          <div className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 bg-main border-2 rounded-full z-10 transition-colors ${isLatest ? 'border-primary' : 'border-text-muted'}`}></div>
        )}

        {isDesktop ? (
          <>
            <div className="flex justify-between items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold bg-card border border-border px-1.5 py-0.5 rounded text-primary">
                {commit.hash}
              </span>
              {isLatest && (
                <span className="text-[8px] uppercase tracking-wider bg-primary/10 border border-primary/25 px-1.5 py-0.5 rounded font-extrabold text-primary">
                  LATEST
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-text-main line-clamp-1 truncate">{commit.msg}</p>
            <div className="flex justify-between text-[9px] text-text-muted mt-2">
              <span className="font-semibold">{commit.author}</span>
              <span>{commit.time}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="font-mono font-bold inline-flex items-center px-2 py-0.5 bg-card border border-border rounded-lg text-xs text-primary">
                  {commit.hash}
                </div>
                {isLatest && (
                  <span className="text-[9px] uppercase font-extrabold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded">
                    Latest
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-text-main line-clamp-2 leading-relaxed max-w-[90%]">
                {commit.msg}
              </p>
              <div className="flex justify-between items-center mt-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-border overflow-hidden shrink-0 border border-border">
                    {commit.avatar ? (
                      <img src={commit.avatar} alt="Author" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/40 to-info/40"></div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-text-main/80 truncate max-w-[100px]">{commit.author}</span>
                  <span className="text-[10px] text-text-muted">{commit.time}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-success font-bold">{commit.add}</span>
                  <span className="text-danger font-bold">{commit.del}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onActionClick(commit);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover active:bg-border transition-colors -mr-1"
            >
              <MoreVertical size={16} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
});
