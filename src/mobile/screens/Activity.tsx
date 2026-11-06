import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import { fetchTimelineEvents, TimelineEventItem } from '../utils/gitApi';
import { CommitDetailModal } from '../components/CommitDetailModal';
import { ActivityHeader } from './activity/ActivityHeader';
import { ActivityTimelineFeed } from './activity/ActivityTimelineFeed';
import { ActivityCommitsFeed } from './activity/ActivityCommitsFeed';

const eventFilterChips = [
  { id: 'all', label: 'All Events' },
  { id: 'push', label: 'Pushes' },
  { id: 'pr', label: 'Pull Requests' },
  { id: 'star', label: 'Stars' },
] as const;

export const Activity: React.FC = () => {
  const { 
    activeCommits, showToast, currentRepo, currentRepoOwner, 
    githubToken, githubUser, openRepo, connectGitHub,
  } = useAppContext();

  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [events, setEvents] = useState<TimelineEventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<'events' | 'commits'>('events');
  const [eventFilter, setEventFilter] = useState<'all' | 'push' | 'pr' | 'star'>('all');
  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(10);

  const loadTimeline = async (isBackground = false) => {
    if (!isBackground && events.length === 0) setIsLoadingEvents(true);
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
      const msg = e.message || 'Failed to stream live events from GitHub API';
      setTimelineError(msg);
      if (!isBackground) showToast(msg, 'error');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadTimeline(false);
    const timer = setInterval(() => {
      if (!document.hidden) loadTimeline(true);
    }, 15000);
    return () => clearInterval(timer);
  }, [githubUser?.login, currentRepo, currentRepoOwner, githubToken]);

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
      <ActivityHeader
        userLogin={githubUser?.login}
        activeCommitsCount={activeCommits.length}
        activeFeedTab={activeFeedTab}
        isLoadingEvents={isLoadingEvents}
        onRefresh={() => loadTimeline(false)}
        onSetFeedTab={setActiveFeedTab}
      />

      {activeFeedTab === 'events' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar select-none py-0.5">
            {eventFilterChips.map((f) => (
              <button
                key={f.id}
                onClick={() => setEventFilter(f.id as any)}
                className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  eventFilter === f.id
                    ? 'bg-text-primary text-background border-text-primary font-bold shadow-xs'
                    : 'bg-surface-1 border border-border text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <ActivityTimelineFeed
            timelineError={timelineError}
            isLoadingEvents={isLoadingEvents}
            eventsCount={events.length}
            filteredEvents={filteredEvents}
            eventFilter={eventFilter}
            githubToken={githubToken}
            onRefresh={() => loadTimeline(false)}
            onConnectGitHub={connectGitHub}
            onOpenRepo={(name, owner) => openRepo(name, owner)}
            onSelectCommit={setSelectedCommit}
          />
        </div>
      ) : (
        <ActivityCommitsFeed
          commits={activeCommits}
          paginatedCommits={paginatedActivityCommits}
          activityPage={activityPage}
          activityPageSize={activityPageSize}
          onPageChange={setActivityPage}
          onPageSizeChange={(newSize) => {
            setActivityPageSize(newSize);
            setActivityPage(1);
          }}
          onSelectCommit={setSelectedCommit}
          onCopyHash={(hash) => {
            navigator.clipboard.writeText(hash);
            showToast(`Copied SHA: ${hash.substring(0, 7)}`, 'success');
          }}
        />
      )}

      <CommitDetailModal commit={selectedCommit} onClose={() => setSelectedCommit(null)} />
    </div>
  );
};

export const MobileActivity = Activity;
