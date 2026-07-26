import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { Search, GitBranch, Trash2, Check, X } from 'lucide-react';

const BranchLabel = ({ title, desc, isDefault = false, isActive = false, onDelete, onSwitch }: any) => {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <div 
      className={`flex flex-col gap-1 bg-card p-3.5 rounded-2xl border transition-all relative group cursor-pointer hover:border-primary/50 ${isActive ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}
      onClick={(e) => {
        if (!isConfirming) onSwitch();
      }}
    >
      <div className="text-[14px] font-bold flex items-center justify-between text-text-main">
        <span className="flex items-center gap-1.5"><GitBranch size={14} className="text-primary" /> {title}</span>
        {isDefault && <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-info/10 text-info border border-info/20 font-bold">Default</span>}
      </div>
      <span className="text-[11px] text-text-muted font-medium pr-10">{desc}</span>
      
      {!isDefault && !isActive && !isConfirming && (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsConfirming(true); }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 bg-error/10 text-error rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20"
          title="Delete Branch"
        >
          <Trash2 size={14} />
        </button>
      )}

      {isConfirming && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-card pl-2">
          <span className="text-[10px] font-bold text-error mr-1">Delete?</span>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsConfirming(false); }}
            className="p-1.5 bg-hover text-text-muted rounded-lg hover:text-text-main transition-colors"
          >
            <X size={12} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsConfirming(false);
              onDelete();
            }}
            className="p-1.5 bg-error text-white rounded-lg hover:bg-error/90 transition-colors shadow-sm"
          >
            <Check size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export const BranchesScreen = () => {
  const { activeBranches, openModal, deleteBranch, switchBranch, currentBranch } = useAppContext();
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
            isActive={branch.name === (currentBranch || 'main')} 
            onDelete={() => deleteBranch(branch.name)}
            onSwitch={() => switchBranch(branch.name)}
          />
        ))}
        {filteredBranches.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs font-semibold uppercase tracking-wider">No branches found matching your search.</div>
        )}
      </div>
    </>
  );
};
