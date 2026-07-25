import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { Search, GitBranch } from 'lucide-react';

const BranchLabel = ({ title, desc, isDefault = false, borderColor = 'transparent' }: any) => (
  <div 
    className="flex flex-col gap-1 bg-card p-3.5 rounded-2xl border transition-all" 
    style={{ borderColor: borderColor !== 'transparent' ? borderColor : 'var(--border)' }}
  >
    <div className="text-[14px] font-bold flex items-center justify-between text-text-main">
      <span className="flex items-center gap-1.5"><GitBranch size={14} className="text-primary" /> {title}</span>
      {isDefault && <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-info/10 text-info border border-info/20 font-bold">Default</span>}
    </div>
    <span className="text-[11px] text-text-muted font-medium">{desc}</span>
  </div>
);

export const BranchesScreen = () => {
  const { activeBranches, openModal } = useAppContext();
  const [search, setSearch] = useState('');

  const filteredBranches = activeBranches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="bg-card rounded-xl p-3 flex items-center gap-3 mb-4 border border-border">
        <Search size={20} className="text-text-muted" />
        <input 
          type="text" 
          placeholder="Search branches..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-text-main w-full outline-none text-sm placeholder:text-text-muted" 
        />
      </div>
      <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3 mb-4">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Branch from main</span>
        <button 
          onClick={() => openModal('branch')}
          className="bg-info text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <GitBranch size={14} strokeWidth={2.5} /> New Branch
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {filteredBranches.map(branch => (
          <BranchLabel 
            key={branch.name} 
            title={branch.name} 
            desc={branch.desc || 'Active branch'} 
            isDefault={branch.isDefault} 
            borderColor={branch.borderColor} 
          />
        ))}
        {filteredBranches.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs font-semibold uppercase tracking-wider">No branches found matching your search.</div>
        )}
      </div>
    </>
  );
};
