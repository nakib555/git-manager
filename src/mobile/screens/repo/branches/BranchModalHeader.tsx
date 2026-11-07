import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface BranchModalHeaderProps {
  selectedBranch: string;
  currentBranch: string | null;
  activeTab: 'overview' | 'commits' | 'compare';
  onTabChange: (tab: 'overview' | 'commits' | 'compare') => void;
  onClose: () => void;
}

export const BranchModalHeader: React.FC<BranchModalHeaderProps> = ({
  selectedBranch,
  currentBranch,
  activeTab,
  onTabChange,
  onClose,
}) => {
  return (
    <>
      <div className="w-10 h-1 bg-border-accent rounded-full mx-auto mt-2.5 mb-1.5 shrink-0" />
      <div className="px-4 py-3 border-b border-border-accent/80 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 text-xs font-mono">
              <span className="text-text-tertiary uppercase tracking-wider font-semibold">Branch Overview</span>
              {selectedBranch === currentBranch && <span className="text-emerald-400 font-bold">· Active HEAD</span>}
              {(selectedBranch === 'main' || selectedBranch === 'master') && <span className="text-text-tertiary">· Default</span>}
            </div>
            <h3 className="text-base font-bold text-text-primary leading-tight truncate">{selectedBranch}</h3>
            <p className="text-[11px] text-text-tertiary mt-0.5">Inspect branch tracking, commits, and checkout revisions</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-border shrink-0 bg-surface-1 px-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'commits', label: 'Commits' },
          { id: 'compare', label: 'Compare & PR' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`flex-1 py-3 text-xs font-bold transition-all relative cursor-pointer ${
                isActive ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div layoutId="activeBranchTabIndicator" className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
