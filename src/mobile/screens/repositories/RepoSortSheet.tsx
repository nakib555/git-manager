import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { RepoSortBy } from '../../../types';

interface RepoSortSheetProps {
  isOpen: boolean;
  repoSortBy: string;
  repoSortDirection: 'asc' | 'desc';
  sortOptions: readonly { readonly id: string; readonly label: string }[];
  onClose: () => void;
  onSetSortBy: (opt: RepoSortBy) => void;
  onSetDirection: (dir: 'asc' | 'desc') => void;
}

export const RepoSortSheet: React.FC<RepoSortSheetProps> = ({
  isOpen,
  repoSortBy,
  repoSortDirection,
  sortOptions,
  onClose,
  onSetSortBy,
  onSetDirection,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full bg-surface-1 border-t border-x border-border rounded-t-xl pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-5 shadow-2xl z-10"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Sort Repositories</h3>
                <p className="text-[11px] text-text-tertiary mt-0.5">Choose how repositories are ordered in your workstation list</p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-2 divide-y divide-border">
              {sortOptions.map((opt) => {
                const isSelected = repoSortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSetSortBy(opt.id as RepoSortBy);
                      onClose();
                    }}
                    className="w-full py-3.5 flex items-center justify-between text-left text-xs font-medium cursor-pointer"
                  >
                    <span className={isSelected ? 'text-accent font-bold' : 'text-text-primary'}>
                      {opt.label}
                    </span>
                    {isSelected && <Check size={16} className="text-accent" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border flex gap-2">
              <button
                onClick={() => onSetDirection('desc')}
                className={`flex-1 h-9 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  repoSortDirection === 'desc'
                    ? 'bg-accent text-white border-accent font-bold'
                    : 'bg-surface-2 border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                Descending (Z-A / Newest)
              </button>
              <button
                onClick={() => onSetDirection('asc')}
                className={`flex-1 h-9 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  repoSortDirection === 'asc'
                    ? 'bg-accent text-white border-accent font-bold'
                    : 'bg-surface-2 border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                Ascending (A-Z / Oldest)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
