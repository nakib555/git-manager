import React from 'react';
import { User, GitCommit, GitPullRequest, Star, GitBranch, ArrowUpRight } from 'lucide-react';
import { TimelineEventItem } from '../../utils/gitApi';
import { formatRelativeTime } from '../../utils/formatters';

interface ActivityTimelineItemProps {
  ev: TimelineEventItem;
  onOpenRepo: (name: string, owner?: string) => void;
  onSelectCommit: (commit: any) => void;
}

export const ActivityTimelineItem: React.FC<ActivityTimelineItemProps> = ({
  ev,
  onOpenRepo,
  onSelectCommit,
}) => {
  const isPush = ev.type === 'PushEvent';
  const isPR = ev.type === 'PullRequestEvent';
  const isWatch = ev.type === 'WatchEvent';
  const commitsList = ev.payload?.commits || [];
  const entityColor = isPush ? '#388BFD' : isPR ? '#A371F7' : isWatch ? '#D29922' : '#3FB950';

  return (
    <div className="bg-surface-1 border border-border hover:border-border-accent rounded-xl p-3.5 space-y-2.5 select-none shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {ev.actor.avatarUrl ? (
            <img src={ev.actor.avatarUrl} alt="" className="w-6 h-6 rounded-full border border-border-accent shrink-0 object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-text-tertiary shrink-0">
              <User size={13} />
            </div>
          )}
          <span className="text-xs font-bold text-text-primary truncate">{ev.actor.login}</span>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider shrink-0" style={{ color: entityColor }}>
            · {isPush ? 'Push' : isPR ? 'PR' : isWatch ? 'Star' : 'Branch'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-text-tertiary shrink-0 tabular-nums">
          {formatRelativeTime(ev.createdAt)}
        </span>
      </div>

      <div
        onClick={() => {
          const parts = ev.repo.name.split('/');
          onOpenRepo(parts[1] || parts[0], parts[0]);
        }}
        className="group flex items-center justify-between min-h-[38px] px-3 py-1.5 rounded-lg bg-surface-2 border border-border-accent/60 cursor-pointer hover:border-accent transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {isPush ? <GitCommit size={14} className="text-[#388BFD] shrink-0" /> :
           isPR ? <GitPullRequest size={14} className="text-[#A371F7] shrink-0" /> :
           isWatch ? <Star size={14} className="text-[#D29922] shrink-0" /> :
           <GitBranch size={14} className="text-[#3FB950] shrink-0" />}
          <span className="font-mono text-xs font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
            {ev.repo.name}
          </span>
        </div>
        <ArrowUpRight size={14} className="text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
      </div>

      {isPush && commitsList.length > 0 && (
        <div className="pl-2 border-l-2 border-accent/40 space-y-1.5 pt-0.5">
          {commitsList.slice(0, 2).map((c: any) => (
            <div
              key={c.sha}
              onClick={() => onSelectCommit({ hash: c.sha.substring(0, 7), fullHash: c.sha, msg: c.message, author: ev.actor.login, date: ev.createdAt })}
              className="text-xs font-mono text-text-secondary hover:text-accent truncate cursor-pointer flex items-center gap-1.5 py-0.5 active:scale-98 transition-transform"
            >
              <span className="text-[10px] text-accent font-bold tabular-nums shrink-0 px-1.5 py-0.5 rounded bg-surface-2 border border-border">
                {c.sha.substring(0, 7)}
              </span>
              <span className="truncate">{c.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
