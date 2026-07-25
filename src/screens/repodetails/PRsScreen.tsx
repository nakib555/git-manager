import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { GitPullRequest } from 'lucide-react';

export const PRsScreen = () => {
  const { activePRs, openModal } = useAppContext();
  const [activeTab, setActiveTab] = useState('Open');

  const filteredPRs = activePRs.filter(pr => {
    if (activeTab === 'Open') return pr.status === 'Open' || pr.status === 'Review Req.' || pr.status === 'Draft' || pr.status === 'Approved';
    if (activeTab === 'Merged') return pr.status === 'Merged';
    if (activeTab === 'Closed') return pr.status === 'Closed';
    return true;
  });

  return (
    <>
      <div className="flex border-b border-border mb-4">
        {['Open', 'Merged', 'Closed'].map((tab) => {
          const count = activePRs.filter(pr => {
            if (tab === 'Open') return pr.status === 'Open' || pr.status === 'Review Req.' || pr.status === 'Draft' || pr.status === 'Approved';
            if (tab === 'Merged') return pr.status === 'Merged';
            if (tab === 'Closed') return pr.status === 'Closed';
            return false;
          }).length;
          
          return (
            <div 
              key={tab}
              className={`px-4 py-3 text-[13px] font-semibold relative cursor-pointer transition-colors ${activeTab === tab ? 'text-primary' : 'text-text-muted'}`}
              onClick={() => { setActiveTab(tab); }}
            >
              {tab}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ml-1.5 font-bold ${activeTab === tab ? 'bg-primary/20 text-primary border border-primary/25' : 'bg-hover/40 text-text-muted border border-border'}`}>
                {count}
              </span>
              {activeTab === tab && <div className="absolute -bottom-[1px] left-0 w-full h-[2.5px] bg-primary rounded-t-sm"></div>}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3 mb-4">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Ready to merge changes?</span>
        <button 
          onClick={() => openModal('pr')}
          className="bg-success text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <GitPullRequest size={14} strokeWidth={2.5} /> Open PR
        </button>
      </div>

      <div className="space-y-3">
        {filteredPRs.map(pr => (
          <div key={pr.id} className="flex gap-3.5 p-4 border border-border rounded-2xl bg-card transition-all hover:border-primary/40">
            <GitPullRequest size={20} className={`${pr.status === 'Open' || pr.status === 'Approved' ? 'text-success' : pr.status === 'Merged' ? 'text-purple-500' : 'text-text-muted'} shrink-0`} strokeWidth={2.5} />
            <div className="flex-1">
              <div className="text-sm font-bold mb-1 leading-snug text-text-main">{pr.title}</div>
              <div className="text-xs text-text-muted mb-3 font-medium">#{pr.id} opened {pr.time} by {pr.author}</div>
              <div className="flex justify-between items-center">
                {pr.avatar ? (
                  <img src={pr.avatar} className="w-5 h-5 rounded-full bg-border" alt="" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-[9px] font-bold flex items-center justify-center text-primary border border-primary/10">{pr.author.substring(0, 2).toUpperCase()}</div>
                )}
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${pr.status === 'Approved' || pr.status === 'Open' ? 'bg-success/10 text-success border-success/30' : pr.status === 'Merged' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-hover text-text-muted border-border'}`}>
                  {pr.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredPRs.length === 0 && (
          <div className="text-center py-10 text-text-muted text-xs font-semibold uppercase tracking-wider">No pull requests found.</div>
        )}
      </div>
    </>
  );
};
