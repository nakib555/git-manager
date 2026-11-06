import React from 'react';
import { GitPullRequest, GitMerge, Clock, CornerDownRight } from 'lucide-react';

interface PRListItemProps {
  pr: any;
  isSelected?: boolean;
  onSelect: () => void;
}

export const PRListItem: React.FC<PRListItemProps> = ({
  pr,
  isSelected,
  onSelect,
}) => {
  const isMerged = pr.status === 'Merged';
  const isClosed = pr.status === 'Closed';

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all cursor-pointer bg-card flex flex-col justify-between gap-3 ${
        isSelected
          ? 'border-primary ring-2 ring-primary/10 shadow-sm'
          : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isMerged
                ? 'bg-purple-500/10 text-purple-400'
                : isClosed
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-emerald-500/10 text-emerald-500'
            }`}
          >
            {isMerged ? <GitMerge size={14} /> : <GitPullRequest size={14} />}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-text-main line-clamp-1">{pr.title}</h4>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
              <span className="font-mono text-primary font-bold">#{pr.id}</span>
              <span>by {pr.author}</span>
            </div>
          </div>
        </div>

        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
            isMerged
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              : isClosed
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          }`}
        >
          {pr.status}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-text-muted">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-text-main font-semibold bg-main px-1.5 py-0.5 rounded border border-border">
            {pr.branch}
          </span>
          <CornerDownRight size={10} />
          <span className="text-primary font-semibold bg-main px-1.5 py-0.5 rounded border border-border">
            {pr.target || 'main'}
          </span>
        </div>

        <span className="flex items-center gap-1">
          <Clock size={10} />
          <span>{pr.time}</span>
        </span>
      </div>
    </div>
  );
};
