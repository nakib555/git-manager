import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import { CommitCard } from '../components/CommitCard';
import { CommitDetailModal } from '../components/CommitDetailModal';
import { PaginationControls } from '../../components/common/PaginationControls';
import { 
  GitCommit, Activity as ActivityIcon, GitPullRequest, 
  Star, GitBranch, ArrowUpRight, RefreshCw, Clock, User, Github
} from 'lucide-react';
import { fetchTimelineEvents, TimelineEventItem } from '../utils/gitApi';
import { formatRelativeTime } from '../utils/formatters';
import { EmptyState } from '../components/EmptyState';
import { InlineErrorCard } from '../components/InlineErrorCard';

export const Activity: React.FC = () => {
  const { 
    activeCommits, 
    showToast, 
    currentRepo, 
    currentRepoOwner, 
    githubToken, 
    githubUser,
    openRepo,
    connectGitHub,
  } = useAppContext();

  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [events, setEvents] = useState<TimelineEventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<'events' | 'commits'>('events');
  const [eventFilter, setEventFilter] = useState<'all' | 'push' | 'pr' | 'star'>('all');

  // Pagination for branch commits
  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(10);

  const loadTimeline = async (isBackground = false) => {
    if (!isBackground && events.length === 0) {
      setIsLoadingEvents(true);
    }
    setTimelineError(null);
    try {
      const data = await fetchTimelineEvents({
        username: githubUser?.login,
        repoOwner: currentRepoOwner,
        repoName: currentRepo,
        token: githubToken,
      });
      setEvents(data);
    } catch (e: any) {
      console.warn('Could not load events timeline:', e);
      const msg = e.message || 'Failed to stream live events from GitHub API';
      setTimelineError(msg);
      if (!isBackground) {
        showToast(msg, 'error');
      }
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadTimeline(false);
    const timer = setInterval(() => {
      if (!document.hidden) {
        loadTimeline(true);
      }
    }, 15000);
    return () => clearInterval(timer);
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

  const paginatedActivityCommits = useMemo(() => {
    if (activityPageSize === -1) return activeCommits;
    const start = (activityPage - 1) * activityPageSize;
    return activeCommits.slice(start, start + activityPageSize);
  }, [activeCommits, activityPage, activityPageSize]);

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
          onClick={() => loadTimeline(false)}
          disabled={isLoadingEvents}
          className="w-10 h-10 rounded-xl bg-surface-1 border border-border text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
          title="Refresh activity"
          aria-label="Refresh activity"
        >
          <RefreshCw size={16} className={isLoadingEvents ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. Feed Mode Segmented Control: Real Events vs Commits */}
      <div className="h-10 p-1 bg-surface-1 border border-border rounded-xl flex items-center gap-1 select-none">
        <button
          onClick={() => setActiveFeedTab('events')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeFeedTab === 'events'
              ? 'bg-accent text-white shadow-xs font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <ActivityIcon size={14} />
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
          <GitCommit size={14} />
          <span>Branch Commits ({activeCommits.length})</span>
        </button>
      </div>

      {activeFeedTab === 'events' ? (
        <div className="space-y-3">
          {/* Sub-filter chips for events (32px height = 4x8pt) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar select-none py-0.5">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'push', label: 'Pushes' },
              { id: 'pr', label: 'Pull Requests' },
              { id: 'star', label: 'Stars' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEventFilter(f.id as any)}
                className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  eventFilter === f.id
                    ? 'bg-accent-soft text-accent border border-accent/25 font-bold'
                    : 'bg-surface-1 border border-border text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {timelineError ? (
            <InlineErrorCard
              title="Timeline Feed Failed"
              message={timelineError}
              onRetry={() => loadTimeline(false)}
            />
          ) : isLoadingEvents && events.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-text-tertiary">
              <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <span>Fetching live GitHub event stream...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            !githubToken ? (
              <EmptyState
                icon={ActivityIcon}
                title="GitHub not connected"
                description="Connect your GitHub account to stream live pushes, pull requests, and repository releases."
                primaryAction={{
                  label: 'Connect GitHub Account',
                  icon: Github,
                  onClick: connectGitHub,
                }}
              />
            ) : (
              <EmptyState
                icon={ActivityIcon}
                title="No timeline events found"
                description={
                  eventFilter === 'all'
                    ? 'Recent pushes, pull requests, and releases will appear in real time.'
                    : `No events of type "${eventFilter}" detected in recent timeline activity.`
                }
                primaryAction={
                  eventFilter !== 'all'
                    ? {
                        label: 'Show All Events',
                        onClick: () => setEventFilter('all'),
                      }
                    : {
                        label: 'Refresh Timeline',
                        icon: RefreshCw,
                        onClick: () => loadTimeline(false),
                      }
                }
              />
            )
          ) : (
            <div className="space-y-2.5 mb-6">
              {filteredEvents.map((ev) => {
                const isPush = ev.type === 'PushEvent';
                const isPR = ev.type === 'PullRequestEvent';
                const isWatch = ev.type === 'WatchEvent';
                const commitsList = ev.payload?.commits || [];

                const entityColor = isPush ? '#388BFD' : isPR ? '#A371F7' : isWatch ? '#D29922' : '#3FB950';

                return (
                  <div
                    key={ev.id}
                    className="bg-surface-1 border border-border hover:border-border-accent rounded-xl p-3.5 space-y-2.5 select-none shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {ev.actor.avatarUrl ? (
                          <img
                            src={ev.actor.avatarUrl}
                            alt=""
                            className="w-6 h-6 rounded-full border border-border-accent shrink-0 object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-text-tertiary shrink-0">
                            <User size={13} />
                          </div>
                        )}
                        <span className="text-xs font-bold text-text-primary truncate">
                          {ev.actor.login}
                        </span>
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 border"
                          style={{
                            color: entityColor,
                            backgroundColor: `${entityColor}14`,
                            borderColor: `${entityColor}30`,
                          }}
                        >
                          {isPush ? 'Push' : isPR ? 'PR' : isWatch ? 'Star' : 'Branch'}
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
                      className="group flex items-center justify-between min-h-[38px] px-3 py-1.5 rounded-lg bg-surface-2 border border-border-accent/60 cursor-pointer hover:border-accent transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {isPush ? (
                          <GitCommit size={14} className="text-[#388BFD] shrink-0" />
                        ) : isPR ? (
                          <GitPullRequest size={14} className="text-[#A371F7] shrink-0" />
                        ) : isWatch ? (
                          <Star size={14} className="text-[#D29922] shrink-0" />
                        ) : (
                          <GitBranch size={14} className="text-[#3FB950] shrink-0" />
                        )}
                        <span className="font-mono text-xs font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                          {ev.repo.name}
                        </span>
                      </div>
                      <ArrowUpRight size={14} className="text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
                    </div>

                    {/* Commits detail summary if a push event */}
                    {isPush && commitsList.length > 0 && (
                      <div className="pl-2 border-l-2 border-accent/40 space-y-1.5 pt-0.5">
                        {commitsList.slice(0, 2).map((c: any) => (
                          <div
                            key={c.sha}
                            onClick={() => setSelectedCommit({ hash: c.sha.substring(0, 7), fullHash: c.sha, msg: c.message, author: ev.actor.login, date: ev.createdAt })}
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
              })}
            </div>
          )}
        </div>
      ) : (
        /* Commits Feed View with Enhanced Pagination */
        <div className="space-y-4">
          {activeCommits.length === 0 ? (
            <div className="bg-surface-1 border border-border rounded-2xl p-8 text-center flex flex-col items-center justify-center">
              <GitCommit size={32} className="text-text-tertiary mb-2 opacity-50" />
              <span className="text-sm font-semibold text-text-primary mb-1">No commits on active branch</span>
              <span className="text-xs text-text-tertiary">
                Select a repository with commit history or commit changes to track activity here.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-3">
                {paginatedActivityCommits.map((commit, idx) => (
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
                    isLatest={idx === 0 && activityPage === 1}
                  />
                ))}
              </div>

              {/* Enhanced Pagination Bar for Activity Commits */}
              <div className="pt-3 pb-6 border-t border-border/80">
                <PaginationControls
                  currentPage={activityPage}
                  totalItems={activeCommits.length}
                  pageSize={activityPageSize}
                  pageSizeOptions={[10, 25, 50, -1]}
                  onPageSizeChange={(newSize) => {
                    setActivityPageSize(newSize);
                    setActivityPage(1);
                  }}
                  onPageChange={(p) => setActivityPage(p)}
                  compact={false}
                  itemName="commits"
                />
              </div>
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
