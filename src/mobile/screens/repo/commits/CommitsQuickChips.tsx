import React from 'react';
import { Filter, ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-react';

interface CommitsQuickChipsProps {
  activeQuickChip: 'all' | 'my' | 'week' | 'merges' | 'ci';
  onSelectChip: (type: 'all' | 'my' | 'week' | 'merges' | 'ci') => void;
  activeFilterCount: number;
  onOpenFilterSheet: () => void;
  sortDirection?: 'asc' | 'desc';
  onSetSortDirection?: (dir: 'asc' | 'desc') => void;
  onToggleSortDirection?: () => void;
}

export const CommitsQuickChips: React.FC<CommitsQuickChipsProps> = ({
  activeQuickChip,
  onSelectChip,
  activeFilterCount,
  onOpenFilterSheet,
  sortDirection = 'desc',
  onSetSortDirection,
  onToggleSortDirection,
}) => {
  const chips: { id: 'all' | 'my' | 'week' | 'merges' | 'ci'; label: string }[] = [
    { id: 'all', label: 'All Commits' },
    { id: 'my', label: 'My Commits' },
    { id: 'week', label: 'Past 7 Days' },
    { id: 'merges', label: 'Merges Only' },
    { id: 'ci', label: 'Failing CI' },
  ];

  const handleSetDirection = (dir: 'asc' | 'desc') => {
    if (onSetSortDirection) {
      onSetSortDirection(dir);
    } else if (onToggleSortDirection && sortDirection !== dir) {
      onToggleSortDirection();
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      <button
        type="button"
        onClick={onOpenFilterSheet}
        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
          activeFilterCount > 0
            ? 'bg-primary/10 border-primary/40 text-primary'
            : 'bg-card border-border text-text-muted hover:text-text-main'
        }`}
      >
        <Filter size={13} />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Both Descending and Ascending in horizontal list */}
      <button
        type="button"
        onClick={() => handleSetDirection('desc')}
        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
          sortDirection === 'desc'
            ? 'bg-primary text-white border-primary shadow-xs font-bold'
            : 'bg-card border-border text-text-muted hover:text-text-main'
        }`}
        title="Show newest commits first (Default)"
      >
        <ArrowDownWideNarrow size={13} />
        <span>Descending</span>
      </button>

      <button
        type="button"
        onClick={() => handleSetDirection('asc')}
        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
          sortDirection === 'asc'
            ? 'bg-primary text-white border-primary shadow-xs font-bold'
            : 'bg-card border-border text-text-muted hover:text-text-main'
        }`}
        title="Show oldest commits first (Chronological)"
      >
        <ArrowUpNarrowWide size={13} />
        <span>Ascending</span>
      </button>

      {chips.map((chip) => {
        const isSelected = activeQuickChip === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onSelectChip(chip.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              isSelected
                ? 'bg-primary text-white border-primary shadow-xs font-bold'
                : 'bg-card border-border text-text-muted hover:text-text-main'
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
};
