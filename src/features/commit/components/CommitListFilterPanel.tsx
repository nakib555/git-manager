import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, RotateCcw } from 'lucide-react';
import { CommitFilter, DatePreset } from '../utils/commitFilterUtils';

interface CommitListFilterPanelProps {
  showFilters: boolean;
  filters: CommitFilter;
  setFilters: React.Dispatch<React.SetStateAction<CommitFilter>>;
  authorInput: string;
  setAuthorInput: (val: string) => void;
  branchInput: string;
  setBranchInput: (val: string) => void;
  onClearFilters: () => void;
  onApplyPreset: (preset: DatePreset) => void;
}

export const CommitListFilterPanel: React.FC<CommitListFilterPanelProps> = ({
  showFilters,
  filters,
  setFilters,
  authorInput,
  setAuthorInput,
  branchInput,
  setBranchInput,
  onClearFilters,
  onApplyPreset,
}) => {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex flex-col gap-2.5 overflow-hidden p-3 bg-main/40 rounded-xl border border-border"
        >
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              Date Range Preset
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: 'year', label: 'This Year' },
                { id: 'custom', label: 'Custom' },
              ].map((p) => {
                const isSelected = filters.datePreset === p.id || (p.id === 'all' && !filters.since && !filters.until && !filters.datePreset);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onApplyPreset(p.id as DatePreset)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-card border-border text-text-muted hover:text-text-main'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <input
              type="text"
              className="w-full bg-card border border-border text-text-main text-xs rounded-xl px-3 py-2 outline-none focus:border-primary placeholder:text-text-muted/60"
              placeholder="Author (e.g. alex)"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
            />
            <input
              type="text"
              className="w-full bg-card border border-border text-text-main text-xs rounded-xl px-3 py-2 outline-none focus:border-primary placeholder:text-text-muted/60"
              placeholder="Branch (e.g. main)"
              value={branchInput}
              onChange={(e) => setBranchInput(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-start pt-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-text-muted pl-1">Since (From)</span>
              <div className="relative">
                <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input
                  type="date"
                  className="w-full bg-card border border-border text-text-main text-xs rounded-xl pl-8 pr-2 py-1.5 outline-none focus:border-primary"
                  value={filters.since}
                  onChange={(e) => setFilters(prev => ({ ...prev, since: e.target.value, datePreset: 'custom', page: 1 }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-text-muted pl-1">Until (To)</span>
              <div className="relative">
                <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input
                  type="date"
                  className="w-full bg-card border border-border text-text-main text-xs rounded-xl pl-8 pr-2 py-1.5 outline-none focus:border-primary"
                  value={filters.until}
                  onChange={(e) => setFilters(prev => ({ ...prev, until: e.target.value, datePreset: 'custom', page: 1 }))}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-[10px] text-text-muted">
              {filters.since || filters.until ? `${filters.since || 'Start'} → ${filters.until || 'Now'}` : 'All dates'}
            </span>
            <button
              type="button"
              onClick={onClearFilters}
              className="text-[11px] text-text-muted hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
