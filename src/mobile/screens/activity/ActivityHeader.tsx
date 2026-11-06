import React from 'react';
import { Activity as ActivityIcon, GitCommit, RefreshCw } from 'lucide-react';

interface ActivityHeaderProps {
  userLogin?: string;
  activeCommitsCount: number;
  activeFeedTab: 'events' | 'commits';
  isLoadingEvents: boolean;
  onRefresh: () => void;
  onSetFeedTab: (tab: 'events' | 'commits') => void;
}

export const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  userLogin,
  activeCommitsCount,
  activeFeedTab,
  isLoadingEvents,
  onRefresh,
  onSetFeedTab,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">Activity Feed</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            {userLogin ? `@${userLogin} timeline & repo actions` : 'Live repository activity & commit history'}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoadingEvents}
          className="w-10 h-10 rounded-xl bg-surface-1 border border-border text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
          title="Refresh activity"
        >
          <RefreshCw size={16} className={isLoadingEvents ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="h-10 p-1 bg-surface-1 border border-border rounded-xl flex items-center gap-1 select-none">
        <button
          onClick={() => onSetFeedTab('events')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeFeedTab === 'events' ? 'bg-text-primary text-background shadow-xs font-bold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <ActivityIcon size={14} />
          <span>GitHub Timeline</span>
        </button>

        <button
          onClick={() => onSetFeedTab('commits')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeFeedTab === 'commits' ? 'bg-text-primary text-background shadow-xs font-bold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <GitCommit size={14} />
          <span>Branch Commits ({activeCommitsCount})</span>
        </button>
      </div>
    </div>
  );
};
