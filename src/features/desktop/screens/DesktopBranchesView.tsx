import React, { useState } from 'react';
import { Search, GitBranch, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { DesktopDeleteBranchModal } from './branches/DesktopDeleteBranchModal';

export const DesktopBranchesView: React.FC = () => {
  const { activeBranches, openModal, deleteBranch, switchBranch, currentBranch } = useAppContext();
  const [search, setSearch] = useState('');
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

  const filtered = activeBranches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center shrink-0">
        <div className="bg-card border border-border rounded-xl px-3 py-2 flex items-center gap-2.5 w-80">
          <Search size={15} className="text-text-muted" />
          <input 
            type="text" 
            placeholder="Search branches..." 
            className="bg-transparent border-none text-xs text-text-main w-full outline-none placeholder:text-text-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => openModal('branch')}
          className="bg-info hover:bg-info/80 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm shadow-info/15 flex items-center gap-1.5 cursor-pointer"
        >
          <GitBranch size={14} />
          <span>New Branch</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
        {filtered.map(branch => {
          const isActive = branch.name === (currentBranch || 'main');
          const isDefault = branch.isDefault;

          return (
            <div 
              key={branch.name}
              onClick={() => switchBranch(branch.name)}
              className={`bg-card p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all relative group cursor-pointer ${
                isActive 
                  ? 'border-primary ring-2 ring-primary/10 shadow-sm bg-primary/5' 
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="space-y-1.5 truncate flex-1">
                <span className="text-sm font-bold text-text-main flex items-center gap-2 truncate">
                  <GitBranch size={14} className={isActive ? "text-primary shrink-0 animate-pulse" : "text-text-muted shrink-0"} />
                  <span className="truncate">{branch.name}</span>
                </span>
                <p className="text-xs text-text-muted truncate">{branch.desc || 'Active branch'}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isDefault && (
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-info/15 text-info border border-info/30 font-semibold shrink-0">
                    Default
                  </span>
                )}
                {isActive && !isDefault && (
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30 font-semibold shrink-0">
                    Active
                  </span>
                )}
                {!isDefault && !isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBranchToDelete(branch.name);
                    }}
                    className="p-2 bg-error/10 text-error hover:bg-error/25 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                    title="Delete Branch"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted text-xs font-semibold uppercase tracking-wider">
            No branches found matching your search.
          </div>
        )}
      </div>

      <DesktopDeleteBranchModal
        branchName={branchToDelete}
        onClose={() => setBranchToDelete(null)}
        onConfirmDelete={deleteBranch}
      />
    </div>
  );
};
