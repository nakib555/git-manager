import React from 'react';
import { ArrowDown, GitCommit, MinusCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatRelativeTime } from '../../../utils/formatters';

interface CommitsDeleteHeadVisualCardProps {
  commit: any;
  parentCommit?: any;
  branchName?: string;
}

export const CommitsDeleteHeadVisualCard: React.FC<CommitsDeleteHeadVisualCardProps> = ({
  commit,
  parentCommit,
  branchName = 'main',
}) => {
  const shortSha = commit.hash ? commit.hash.slice(0, 7) : (commit.shortSha || 'HEAD');
  const parentShortSha = parentCommit ? (parentCommit.hash ? parentCommit.hash.slice(0, 7) : 'Parent') : null;

  return (
    <div className="space-y-3">
      {/* Visual Transition Diagram */}
      <div className="bg-surface-2/60 border border-border/80 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
          <span>Branch Rollback Transition</span>
          <span className="font-mono text-accent normal-case font-semibold">{branchName}</span>
        </div>

        {/* Current HEAD commit to be deleted */}
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
            <MinusCircle size={13} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                HEAD (will be deleted)
              </span>
              <span className="font-mono text-[11px] font-bold text-rose-500">{shortSha}</span>
            </div>
            <p className="text-xs font-semibold text-text-primary truncate mt-1">
              {commit.msg || 'No commit message'}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-text-tertiary mt-0.5 font-mono">
              <span>{commit.author || 'Author'}</span>
              {commit.date && <span>&bull; {formatRelativeTime(commit.date)}</span>}
            </div>
          </div>
        </div>

        {/* Directional arrow */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-tertiary font-medium py-1">
          <ArrowDown size={13} className="text-accent" />
          <span>Branch rewinds to previous commit</span>
        </div>

        {/* New HEAD destination */}
        <div className="p-2.5 bg-surface-1 border border-border rounded-xl flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 size={13} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-surface-3 text-text-secondary">
                New HEAD Destination
              </span>
              {parentShortSha && (
                <span className="font-mono text-[11px] font-bold text-emerald-500">{parentShortSha}</span>
              )}
            </div>
            <p className="text-xs font-semibold text-text-primary truncate mt-1">
              {parentCommit ? (parentCommit.msg || 'Previous commit') : 'Initial repository root'}
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-surface-2/60 border border-border/80 rounded-xl flex items-start gap-2.5 text-[11px] text-text-secondary leading-relaxed">
        <ShieldAlert size={15} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-text-primary font-semibold">Safe Rollback Guarantee: </strong>
          Only the branch pointer for <code className="font-mono text-accent font-semibold">{branchName}</code> rewinds. Your local working files remain untouched, and older commits in history are preserved.
        </div>
      </div>
    </div>
  );
};
