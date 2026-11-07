import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

interface CommitsFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  authors: string[];
  selectedAuthor: string;
  setSelectedAuthor: (a: string) => void;
  dateRange: 'all' | 'today' | '7d' | '30d' | 'custom';
  setDateRange: (d: 'all' | 'today' | '7d' | '30d' | 'custom') => void;
  ciStatus: 'all' | 'passing' | 'failing';
  setCiStatus: (s: 'all' | 'passing' | 'failing') => void;
  mergesOnly: boolean;
  setMergesOnly: (m: boolean) => void;
  onReset: () => void;
  onApply: () => void;
}

export const CommitsFilterDrawer: React.FC<CommitsFilterDrawerProps> = ({
  isOpen,
  onClose,
  authors,
  selectedAuthor,
  setSelectedAuthor,
  dateRange,
  setDateRange,
  ciStatus,
  setCiStatus,
  mergesOnly,
  setMergesOnly,
  onReset,
  onApply,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 flex items-end justify-center backdrop-blur-xs">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-card border-t border-border rounded-t-3xl w-full max-w-lg p-5 space-y-4 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-border">
          <div>
            <h3 className="font-bold text-sm text-text-main">Filter Commits</h3>
            <p className="text-[11px] text-text-muted mt-0.5">Filter by author, time window, and CI status</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:text-text-main cursor-pointer" aria-label="Close filters">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-muted uppercase">Author</label>
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="w-full bg-main border border-border rounded-xl px-3 py-2 text-xs text-text-main outline-none focus:border-primary"
          >
            <option value="all">All Authors</option>
            {authors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-muted uppercase">Date Range</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDateRange(p.id as any)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  dateRange === p.id
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-main border-border text-text-muted'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-muted uppercase">CI/CD Status</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'passing', label: 'Passing' },
              { id: 'failing', label: 'Failing' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCiStatus(s.id as any)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  ciStatus === s.id
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-main border-border text-text-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 pt-1 text-xs text-text-main cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mergesOnly}
            onChange={(e) => setMergesOnly(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span>Show merge commits only</span>
        </label>

        <div className="flex gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 py-2.5 rounded-xl border border-border bg-main text-xs font-bold text-text-muted hover:text-text-main transition-colors"
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={onApply}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
};
