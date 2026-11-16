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
  const tabs: Array<{
    id: 'all' | 'conflicts' | 'missing' | 'added';
    label: string;
    count: number;
  }> = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'conflicts', label: 'Modified', count: conflictsCount },
    { id: 'added', label: 'Added', count: addedCount },
    { id: 'missing', label: 'Missing', count: missingCount },
  ];

  return (
    <div
      role="tablist"
      aria-label="Filter changed files by status"
      className="px-3 py-2 border-b border-border bg-surface-2/25 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs"
    >
      {tabs.map((t) => {
        const isActive = filter === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onFilterChange(t.id)}
            className={`min-h-[32px] px-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 tabular-nums ${
              isActive
                ? 'bg-surface-1 text-text-primary font-semibold border border-border shadow-2xs'
                : 'text-text-secondary hover:text-text-primary border border-transparent'
            }`}
          >
            <span>{t.label}</span>
            <span className="font-mono text-[11px] text-text-tertiary">{t.count}</span>
          </button>
        );
      })}
    </div>
  );
};
