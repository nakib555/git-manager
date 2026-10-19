import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { CommitCard } from '../components/CommitCard';
import { CommitDetailModal } from '../components/CommitDetailModal';
import { 
  GitCommit, Activity as ActivityIcon, GitPullRequest, 
  Star, GitBranch, ArrowUpRight, RefreshCw, Clock, User
} from 'lucide-react';
import { fetchTimelineEvents, TimelineEventItem } from '../utils/gitApi';
import { formatRelativeTime } from '../utils/formatters';

export const Activity: React.FC = () => {
  const { 
    activeCommits, 
    showToast, 
    currentRepo, 
    currentRepoOwner, 
    githubToken, 
    githubUser,
    openRepo
  } = useAppContext();

  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [events, setEvents] = useState<TimelineEventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [activeFeedTab, setActiveFeedTab] = useState<'events' | 'commits'>('events');
  const [eventFilter, setEventFilter] = useState<'all' | 'push' | 'pr' | 'star'>('all');

  const loadTimeline = async () => {
    setIsLoadingEvents(true);
    try {
      const data = await fetchTimelineEvents({
        username: githubUser?.login,
        repoOwner: currentRepoOwner,
        repoName: currentRepo,
        token: githubToken,
      });
      setEvents(data);
    } catch (e) {
      console.warn('Could not load events timeline:', e);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [githubUser?.login, currentRepo, currentRepoOwner, githubToken]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast(`Copied SHA: ${hash.substring(0, 7)}`, 'success');
  };

  const filteredEvents = events.filter((ev) => {
    if (eventFilter === 'all') return true;
    if (eventFilter === 'push') return ev.type === 'PushEvent';
    if (eventFilter === 'pr') return ev.type === 'PullRequestEvent';
    if (eventFilter === 'star') return ev.type === 'WatchEvent';
    return true;
  });

  return (
    <div className="px-4 py-4 space-y-4">
      {/* 1. Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">Activity Feed</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            {githubUser ? `@${githubUser.login} timeline & repo actions` : 'Live repository activity & commit history'}
          </p>
        </div>

        <button
          onClick={loadTimeline}
          disabled={isLoadingEvents}
          className="w-9 h-9 rounded-xl bg-surface-1 border border-border text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
          title="Refresh activity"
          aria-label="Refresh activity"
        >
          <RefreshCw size={15} className={isLoadingEvents ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. Feed Mode Segmented Control: Real Events vs Commits */}
      <div className="h-9 p-1 bg-surface-1 border border-border rounded-xl flex items-center gap-1 select-none">
        <button
          onClick={() => setActiveFeedTab('events')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeFeedTab === 'events'
              ? 'bg-accent text-white shadow-xs font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <ActivityIcon size={13} />
          <span>GitHub Timeline</span>
        </button>

        <button
          onClick={() => setActiveFeedTab('commits')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeFeedTab === 'commits'
              ? 'bg-accent text-white shadow-xs font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <GitCommit size={13} />
          <span>Branch Commits ({activeCommits.length})</span>
        </button>
      </div>

      {activeFeedTab === 'events' ? (
        <div className="space-y-3">
          {/* Sub-filter chips for events */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'push', label: 'Pushes' },
              { id: 'pr', label: 'Pull Requests' },
              { id: 'star', label: 'Stars' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEventFilter(f.id as any)}
                className={`h-7 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  eventFilter === f.id
                    ? 'bg-accent-soft text-accent border border-accent/25 font-bold'
                    : 'bg-surface-1 border border-border text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoadingEvents ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-text-tertiary">
              <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <span>Fetching live GitHub event stream...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-surface-1 border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
              <ActivityIcon size={32} className="text-text-tertiary mb-2 opacity-50" />
              <span className="text-sm font-semibold text-text-primary mb-1">No timeline events found</span>
              <span className="text-xs text-text-tertiary max-w-[260px] leading-relaxed">
                {githubToken 
                  ? 'Recent pushes, pull requests, and releases will appear in real time.' 
                  : 'Connect GitHub in Settings to stream your personal organization timeline.'}
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredEvents.map((ev) => {
                const isPush = ev.type === 'PushEvent';
                const isPR = ev.type === 'PullRequestEvent';
                const isWatch = ev.type === 'WatchEvent';
                const commitsList = ev.payload?.commits || [];

                return (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-surface-1 border border-border space-y-2 hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {ev.actor.avatarUrl ? (
                          <img
                            src={ev.actor.avatarUrl}
                            alt=""
                            className="w-5 h-5 rounded-full border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center text-text-tertiary shrink-0">
                            <User size={12} />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {ev.actor.login}
                        </span>
                        <span className="text-xs text-text-tertiary shrink-0">
                          {isPush ? 'pushed to' : isPR ? `${ev.payload?.action || 'updated'} PR on` : isWatch ? 'starred' : 'updated'}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-text-tertiary shrink-0 tabular-nums">
                        {formatRelativeTime(ev.createdAt)}
                      </span>
                    </div>

                    {/* Repository Anchor */}
                    <div
                      onClick={() => {
                        const parts = ev.repo.name.split('/');
                        const repoName = parts[1] || parts[0];
                        const repoOwner = parts[0];
                        openRepo(repoName, repoOwner);
                      }}
                      className="group flex items-center justify-between p-2 rounded-lg bg-background border border-border cursor-pointer hover:border-accent transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {isPush ? (
                          <GitCommit size={14} className="text-accent shrink-0" />
                        ) : isPR ? (
                          <GitPullRequest size={14} className="text-warning shrink-0" />
                        ) : isWatch ? (
                          <Star size={14} className="text-warning shrink-0" />
                        ) : (
                          <GitBranch size={14} className="text-success shrink-0" />
                        )}
                        <span className="font-mono text-xs font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                          {ev.repo.name}
                        </span>
                      </div>
                      <ArrowUpRight size={13} className="text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
                    </div>

                    {/* Commits detail summary if a push event */}
                    {isPush && commitsList.length > 0 && (
                      <div className="pl-2 border-l border-border space-y-1">
                        {commitsList.slice(0, 2).map((c: any) => (
                          <div
                            key={c.sha}
                            onClick={() => setSelectedCommit({ hash: c.sha.substring(0, 7), fullHash: c.sha, msg: c.message, author: ev.actor.login, date: ev.createdAt })}
                            className="text-xs font-mono text-text-secondary hover:text-accent truncate cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="text-[10px] text-accent font-bold tabular-nums shrink-0">
                              {c.sha.substring(0, 7)}
                            </span>
                            <span className="truncate">{c.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Commits Feed View */
        <div className="space-y-3">
          {activeCommits.length === 0 ? (
            <div className="bg-surface-1 border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
              <GitCommit size={32} className="text-text-tertiary mb-2 opacity-50" />
              <span className="text-sm font-semibold text-text-primary mb-1">No commits on active branch</span>
              <span className="text-xs text-text-tertiary">
                Select a repository with commit history or commit changes to track activity here.
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeCommits.map((commit, idx) => (
                <CommitCard
                  key={`${commit.hash}-${idx}`}
                  commit={{
                    hash: commit.hash,
                    msg: commit.msg,
                    author: commit.author,
                    date: commit.date || commit.timestamp,
                    avatarUrl: commit.avatarUrl,
                    stats: commit.stats,
                  }}
                  onClick={() => setSelectedCommit(commit)}
                  onCopyHash={() => handleCopyHash(commit.hash)}
                  isLatest={idx === 0}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabbed Commit Inspector Sheet */}
      <CommitDetailModal
        commit={selectedCommit}
        onClose={() => setSelectedCommit(null)}
      />
    </div>
  );
};

export const MobileActivity = Activity;
