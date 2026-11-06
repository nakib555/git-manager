import React from 'react';
import { Activity as ActivityIcon, Github, RefreshCw } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { InlineErrorCard } from '../../components/InlineErrorCard';
import { TimelineEventItem } from '../../utils/gitApi';
import { ActivityTimelineItem } from './ActivityTimelineItem';

interface ActivityTimelineFeedProps {
  timelineError: string | null;
  isLoadingEvents: boolean;
  eventsCount: number;
  filteredEvents: TimelineEventItem[];
  eventFilter: string;
  githubToken: string | null;
  onRefresh: () => void;
  onConnectGitHub: () => void;
  onOpenRepo: (name: string, owner?: string) => void;
  onSelectCommit: (commit: any) => void;
}

export const ActivityTimelineFeed: React.FC<ActivityTimelineFeedProps> = ({
  timelineError,
  isLoadingEvents,
  eventsCount,
  filteredEvents,
  eventFilter,
  githubToken,
  onRefresh,
  onConnectGitHub,
  onOpenRepo,
  onSelectCommit,
}) => {
  if (timelineError) {
    return <InlineErrorCard title="Timeline Feed Failed" message={timelineError} onRetry={onRefresh} />;
  }

  if (isLoadingEvents && eventsCount === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-text-tertiary">
        <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <span>Fetching live GitHub event stream...</span>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    if (!githubToken) {
      return (
        <EmptyState
          icon={ActivityIcon}
          title="GitHub not connected"
          description="Connect your GitHub account to stream live pushes, PRs, and releases."
          primaryAction={{ label: 'Connect GitHub Account', icon: Github, onClick: onConnectGitHub }}
        />
      );
    }
    return (
      <EmptyState
        icon={ActivityIcon}
        title="No timeline events found"
        description={
          eventFilter === 'all'
            ? 'Recent pushes, pull requests, and releases will appear in real time.'
            : `No events of type "${eventFilter}" detected in recent timeline activity.`
        }
        primaryAction={{ label: 'Refresh Timeline', icon: RefreshCw, onClick: onRefresh }}
      />
    );
  }

  return (
    <div className="space-y-2.5 mb-6">
      {filteredEvents.map((ev) => (
        <ActivityTimelineItem
          key={ev.id}
          ev={ev}
          onOpenRepo={onOpenRepo}
          onSelectCommit={onSelectCommit}
        />
      ))}
    </div>
  );
};
