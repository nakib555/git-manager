import React, { useState } from 'react';
import { useAppContext } from '../../../AppContext';
import { GitPullRequest, Plus, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

export const MobilePRs: React.FC = () => {
  const { activePRs, openModal, currentRepo, showToast } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<'open' | 'closed'>('open');

  const filteredPRs = activePRs.filter(pr => (filterStatus === 'open' ? !pr.closed : pr.closed));

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#F4F4F5] tracking-tight">Pull Requests</h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Active review threads for {currentRepo}
          </p>
        </div>
        <button
          onClick={() => openModal('pr')}
          className="h-8 px-3 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-[#22C55E]/20 cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>New PR</span>
        </button>
      </div>

      {/* Segmented Filter */}
      <div className="h-9 p-1 bg-[#121214] border border-[#2A2A2E] rounded-xl flex items-center gap-1 select-none">
        <button
          onClick={() => setFilterStatus('open')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterStatus === 'open'
              ? 'bg-[#1A1A1D] text-[#22C55E] shadow-sm border border-[#2A2A2E]'
              : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          Open ({activePRs.filter(p => !p.closed).length})
        </button>
        <button
          onClick={() => setFilterStatus('closed')}
          className={`flex-1 h-full rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterStatus === 'closed'
              ? 'bg-[#1A1A1D] text-[#A1A1AA] shadow-sm border border-[#2A2A2E]'
              : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          Closed ({activePRs.filter(p => p.closed).length})
        </button>
      </div>

      {/* PR List */}
      {filteredPRs.length === 0 ? (
        <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <GitPullRequest size={32} className="text-[#71717A] mb-2 opacity-50" />
          <span className="text-sm font-semibold text-[#F4F4F5] mb-1">
            No {filterStatus} pull requests
          </span>
          <span className="text-xs text-[#71717A]">
            Create a PR to start collaborative code reviews.
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPRs.map((pr) => (
            <div
              key={pr.id}
              onClick={() => showToast(`Opened PR #${pr.number}: ${pr.title}`, 'info')}
              className="p-3.5 bg-[#121214] hover:bg-[#1A1A1D] border border-[#2A2A2E] rounded-xl transition-all cursor-pointer select-none active:scale-[0.99] group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    pr.closed
                      ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/25'
                      : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/25'
                  }`}
                >
                  <GitPullRequest size={11} />
                  <span>{pr.closed ? 'Closed' : 'Open'}</span>
                </span>
                <span className="text-xs font-mono text-[#71717A]">#{pr.number}</span>
              </div>

              <h4 className="text-sm font-semibold text-[#F4F4F5] group-hover:text-[#3B82F6] transition-colors leading-snug mb-2">
                {pr.title}
              </h4>

              <div className="flex items-center justify-between text-xs text-[#71717A] pt-1.5 border-t border-[#2A2A2E]/50">
                <span className="truncate max-w-[150px]">by {pr.author}</span>
                <span className="font-mono text-[11px]">{pr.date || 'recently'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
