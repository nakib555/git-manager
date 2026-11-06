import React from 'react';

interface SyncConflictTabsProps {
  filter: 'all' | 'conflicts' | 'missing' | 'added';
  onFilterChange: (filter: 'all' | 'conflicts' | 'missing' | 'added') => void;
  totalCount: number;
  conflictsCount: number;
  missingCount: number;
  addedCount: number;
}

export const SyncConflictTabs: React.FC<SyncConflictTabsProps> = ({
  filter,
  onFilterChange,
  totalCount,
  conflictsCount,
  missingCount,
  addedCount,
}) => {
  return (
    <div className="px-4 py-2 border-b border-border bg-surface-1/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs font-medium">
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        className={`min-h-[36px] px-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
          filter === 'all' ? 'bg-card text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        All ({totalCount})
      </button>
      <button
        type="button"
        onClick={() => onFilterChange('conflicts')}
        className={`min-h-[36px] px-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
          filter === 'conflicts' ? 'bg-card text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span>Overlapping ({conflictsCount})</span>
      </button>
      <button
        type="button"
        onClick={() => onFilterChange('missing')}
        className={`min-h-[36px] px-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
          filter === 'missing' ? 'bg-card text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-rose-400" />
        <span>Missing / Deletions ({missingCount})</span>
      </button>
      <button
        type="button"
        onClick={() => onFilterChange('added')}
        className={`min-h-[36px] px-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
          filter === 'added' ? 'bg-card text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>New Additions ({addedCount})</span>
      </button>
    </div>
  );
};
