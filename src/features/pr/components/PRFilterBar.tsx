import React from 'react';
import { Search, Plus, GitPullRequest } from 'lucide-react';
import { PRStatusTab } from '../types';

interface PRFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeTab: PRStatusTab;
  setActiveTab: (tab: PRStatusTab) => void;
  counts: { open: number; merged: number; closed: number };
  onNewPR: () => void;
}

export const PRFilterBar: React.FC<PRFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  counts,
  onNewPR,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pull requests..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-main outline-none focus:border-primary"
          />
        </div>

        <div className="flex bg-main p-1 rounded-xl border border-border">
          {(['Open', 'Merged', 'Closed'] as PRStatusTab[]).map((tab) => {
            const count = tab === 'Open' ? counts.open : tab === 'Merged' ? counts.merged : counts.closed;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab ? 'bg-card text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
                }`}
              >
                <span>{tab}</span>
                <span className="text-[10px] font-mono text-text-muted">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onNewPR}
        className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
      >
        <Plus size={14} />
        <span>New Pull Request</span>
      </button>
    </div>
  );
};
