import React, { useState } from 'react';
import { useAppContext } from '../../../AppContext';
import { GitPullRequest, Plus, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

export const PRsScreen: React.FC = () => {
  const { activePRs, openModal, currentRepo, showToast } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<'open' | 'closed'>('open');

  const filteredPRs = activePRs.filter(pr => (filterStatus === 'open' ? !pr.closed : pr.closed));

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">Pull Requests</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            Active review threads for {currentRepo}
          </p>
        </div>
        <button
          onClick={() => openModal('pr')}
          className="h-8 px-3 rounded-lg bg-success hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-success/20 cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>New PR</span>
        </button>
      </div>

      {/* Segmented Filter */}
      <div className="h-9 p-1 bg-surface-1 border border-border rounded-xl flex items-center gap-1 select-none">
        <button
          onClick={() => setFilterStatus('open')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterStatus === 'open'
              ? 'bg-surface-2 text-success shadow-sm border border-border font-bold'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Open ({activePRs.filter(p => !p.closed).length})
        </button>
        <button
          onClick={() => setFilterStatus('closed')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterStatus === 'closed'
              ? 'bg-surface-2 text-text-secondary shadow-sm border border-border font-bold'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Closed ({activePRs.filter(p => p.closed).length})
        </button>
      </div>

      {/* PR List */}
      {filteredPRs.length === 0 ? (
        <div className="bg-surface-1 border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <GitPullRequest size={32} className="text-text-tertiary mb-2 opacity-50" />
          <span className="text-sm font-semibold text-text-primary mb-1">
            No {filterStatus} pull requests
          </span>
          <span className="text-xs text-text-tertiary">
            Open a pull request to initiate branch review and merging.
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPRs.map((pr) => (
            <div
              key={pr.id}
              onClick={() => showToast(`Opening PR #${pr.number}: ${pr.title}`, 'info')}
              className="bg-surface-1 border border-border hover:border-accent/40 rounded-xl p-3.5 space-y-2 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <GitPullRequest 
                    size={16} 
                    className={`shrink-0 mt-0.5 ${pr.closed ? 'text-text-tertiary' : 'text-success'}`} 
                  />
                  <div>
                    <h3 className="text-xs font-semibold text-text-primary line-clamp-1">
                      {pr.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text-tertiary font-mono">
                      <span>#{pr.number}</span>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">by {pr.author}</span>
                      <span>•</span>
                      <span>{pr.created_at || 'yesterday'}</span>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                  pr.closed 
                    ? 'bg-surface-2 text-text-tertiary border border-border' 
                    : 'bg-success/10 text-success border border-success/20'
                }`}>
                  {pr.closed ? 'Closed' : 'Open'}
                </span>
              </div>

              {/* Branch indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary pt-2 border-t border-border">
                <span>{pr.headBranch || 'feature'} → {pr.baseBranch || 'main'}</span>
                <div className="flex items-center gap-1">
                  <MessageSquare size={12} />
                  <span>{pr.commentsCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Aliases
export const MobilePRs = PRsScreen;
