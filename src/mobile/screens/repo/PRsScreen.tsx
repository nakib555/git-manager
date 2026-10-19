import React, { useState } from 'react';
import { useAppContext } from '../../../AppContext';
import { GitPullRequest, Plus, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export const PRsScreen: React.FC = () => {
  const { activePRs, openModal, currentRepo, showToast } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<'open' | 'closed'>('open');

  const filteredPRs = activePRs.filter(pr => (filterStatus === 'open' ? (pr.status === 'Open' || !pr.closed) : (pr.status !== 'Open' || pr.closed)));

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
          className="h-8 px-3 rounded-lg bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-accent/20 cursor-pointer"
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
              ? 'bg-accent-soft text-accent shadow-xs border border-accent/25 font-bold'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Open ({activePRs.filter(p => p.status === 'Open' || !p.closed).length})
        </button>
        <button
          onClick={() => setFilterStatus('closed')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterStatus === 'closed'
              ? 'bg-accent-soft text-accent shadow-xs border border-accent/25 font-bold'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Closed ({activePRs.filter(p => p.status !== 'Open' || p.closed).length})
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
              onClick={() => showToast(`PR #${pr.id || pr.number}: ${pr.title}`, 'info')}
              className="bg-surface-1 border border-border hover:border-accent/40 rounded-xl p-3.5 space-y-2 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0 pr-2">
                  <GitPullRequest 
                    size={16} 
                    className={`shrink-0 mt-0.5 ${pr.status === 'Open' ? 'text-success' : 'text-text-tertiary'}`} 
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-text-primary truncate">
                      {pr.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text-tertiary font-mono">
                      <span className="text-accent font-semibold tabular-nums">#{pr.id || pr.number}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-[140px]">by {pr.author}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{pr.time || formatRelativeTime(pr.created_at || '')}</span>
                    </div>
                  </div>
                </div>

                {/* Zero-pill status tag: clean unboxed text */}
                <span className={`text-[11px] font-semibold font-mono shrink-0 ${
                  pr.status === 'Open' ? 'text-success' : 'text-text-tertiary'
                }`}>
                  {pr.status || (pr.closed ? 'Closed' : 'Open')}
                </span>
              </div>

              {/* Branch indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary pt-2 border-t border-border">
                <span className="truncate pr-2">{pr.source || pr.headBranch || 'feature'} → {pr.target || pr.baseBranch || 'main'}</span>
                <div className="flex items-center gap-1 shrink-0 tabular-nums">
                  <MessageSquare size={12} />
                  <span>{pr.comments || pr.commentsCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MobilePRs = PRsScreen;
