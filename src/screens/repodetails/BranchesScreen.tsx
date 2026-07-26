import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { Search, GitBranch, Trash2, X, AlertTriangle } from 'lucide-react';

interface DeleteBranchModalProps {
  isOpen: boolean;
  branchName: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteBranchModal: React.FC<DeleteBranchModalProps> = ({
  isOpen,
  branchName,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !branchName) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div 
        className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Warning Top Banner */}
        <div className="p-6 pb-4 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text-main">Delete Branch</h3>
            <p className="text-xs text-text-muted font-medium break-all">
              Are you sure you want to delete branch <span className="font-mono font-bold text-text-main bg-hover px-1.5 py-0.5 rounded-lg border border-border/50">{branchName}</span>?
            </p>
          </div>
        </div>

        {/* Content Warning Box */}
        <div className="px-6 py-4 bg-error/5 border-y border-error/10 mx-6 rounded-2xl">
          <p className="text-[11px] font-semibold text-error leading-relaxed">
            Warning: This action is permanent and cannot be undone. All exclusive commits and branches metadata will be removed.
          </p>
        </div>

        {/* Action Footer */}
        <div className="p-6 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold text-text-muted bg-hover rounded-2xl hover:text-text-main hover:bg-hover/80 active:scale-95 transition-all cursor-pointer border border-border/40"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 text-xs font-bold text-white bg-error rounded-2xl hover:bg-error/90 active:scale-95 transition-all shadow-md shadow-error/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Delete Branch</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const BranchLabel = ({ title, desc, isDefault = false, isActive = false, onDeleteTrigger, onSwitch }: any) => {
  return (
    <div 
      className={`flex flex-col gap-1 bg-card p-3.5 rounded-2xl border transition-all relative group cursor-pointer hover:border-primary/50 ${isActive ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border'}`}
      onClick={() => onSwitch()}
    >
      <div className="text-[14px] font-bold flex items-center justify-between text-text-main">
        <span className="flex items-center gap-1.5"><GitBranch size={14} className={isActive ? "text-primary animate-pulse" : "text-primary"} /> {title}</span>
        <div className="flex items-center gap-1.5">
          {isDefault && (
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-info/10 text-info border border-info/20 font-bold">
              Default
            </span>
          )}
          {isActive && !isDefault && (
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
              Active
            </span>
          )}
        </div>
      </div>
      <span className="text-[11px] text-text-muted font-medium pr-10">{desc}</span>
      
      {!isDefault && !isActive && (
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onDeleteTrigger(); 
          }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 bg-error/10 text-error rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20"
          title="Delete Branch"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export const BranchesScreen = () => {
  const { activeBranches, openModal, deleteBranch, switchBranch, currentBranch } = useAppContext();
  const [search, setSearch] = useState('');
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

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
            onDeleteTrigger={() => setBranchToDelete(branch.name)}
            onSwitch={() => switchBranch(branch.name)}
          />
        ))}
        {filteredBranches.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs font-semibold uppercase tracking-wider">No branches found matching your search.</div>
        )}
      </div>

      <DeleteBranchModal 
        isOpen={branchToDelete !== null}
        branchName={branchToDelete}
        onClose={() => setBranchToDelete(null)}
        onConfirm={() => {
          if (branchToDelete) {
            deleteBranch(branchToDelete);
          }
        }}
      />
    </>
  );
};
