import React from 'react';
import { Lock, X } from 'lucide-react';
import { motion } from 'motion/react';
import { EnrichedBranch } from '../../../../features/branches/branchInspectionService';

interface BranchModalHeaderProps {
  branch: EnrichedBranch;
  activeTab: 'overview' | 'commits' | 'compare';
  commitsCount?: number;
  onTabChange: (tab: 'overview' | 'commits' | 'compare') => void;
  onClose: () => void;
}

export const BranchModalHeader: React.FC<BranchModalHeaderProps> = ({
  branch,
  activeTab,
  commitsCount,
  onTabChange,
  onClose,
}) => {
  return (
    <>
      <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5 mb-1.5 shrink-0" />
      <div className="px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5 text-[11px] font-mono flex-wrap">
              <span className="text-text-tertiary uppercase tracking-wider font-semibold">
                Branch Overview
              </span>
              {branch.isActive && (
                <span className="text-addition font-bold">· Active HEAD</span>
              )}
              {branch.isDefault && (
                <span className="text-text-secondary">· Default</span>
              )}
              {branch.isProtected && (
                <span className="inline-flex items-center gap-1 text-text-secondary">
                  · <Lock size={10} /> Protected
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-text-primary leading-tight truncate font-mono">
              {branch.name}
            </h3>
            <p className="text-[11px] text-text-tertiary mt-0.5 truncate">
              {branch.shortSha ? `Tip ${branch.shortSha}` : 'Inspect divergence, commits, and checkout'}
              {branch.relativeTime ? ` · Updated ${branch.relativeTime}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close branch modal"
            className="touch-target-44 w-10 h-10 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Branch detail tabs"
        className="flex border-b border-border shrink-0 bg-surface-1 px-2"
      >
        {[
          { id: 'overview', label: 'Overview' },
          {
            id: 'commits',
            label: typeof commitsCount === 'number' ? `Commits (${commitsCount})` : 'Commits',
          },
          { id: 'compare', label: 'Compare & PR' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id as any)}
              className={`flex-1 min-h-[44px] py-2.5 text-xs font-bold transition-colors relative cursor-pointer ${
                isActive ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeBranchTabIndicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
