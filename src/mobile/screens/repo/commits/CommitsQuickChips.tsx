import React from 'react';
import { Filter } from 'lucide-react';

interface CommitsQuickChipsProps {
  activeQuickChip: 'all' | 'my' | 'week' | 'merges' | 'ci';
  onSelectChip: (type: 'all' | 'my' | 'week' | 'merges' | 'ci') => void;
  activeFilterCount: number;
  onOpenFilterSheet: () => void;
}

export const CommitsQuickChips: React.FC<CommitsQuickChipsProps> = ({
  activeQuickChip,
  onSelectChip,
  activeFilterCount,
  onOpenFilterSheet,
}) => {
  const chips: { id: 'all' | 'my' | 'week' | 'merges' | 'ci'; label: string }[] = [
    { id: 'all', label: 'All Commits' },
    { id: 'my', label: 'My Commits' },
    { id: 'week', label: 'Past 7 Days' },
    { id: 'merges', label: 'Merges Only' },
    { id: 'ci', label: 'Failing CI' },
  ];

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
