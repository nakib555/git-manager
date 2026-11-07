import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, GitBranch, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAppContext } from '../../../AppContext';

export const DesktopBranchesView: React.FC = () => {
  const { activeBranches, openModal, deleteBranch, switchBranch, currentBranch } = useAppContext();
  const [search, setSearch] = useState('');
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      <AnimatePresence>
        {branchToDelete && (
          <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-text-main">Delete Branch</h3>
                  <p className="text-xs text-text-muted font-medium break-all">
                    Are you sure you want to delete branch <span className="font-mono font-bold text-text-main bg-hover px-1.5 py-0.5 rounded-lg border border-border/50">{branchToDelete}</span>?
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-error/5 border-y border-error/10 mx-6 rounded-2xl">
                <p className="text-[11px] font-semibold text-error leading-relaxed">
                  Warning: This action is permanent and cannot be undone. All exclusive commits and branches metadata will be removed.
                </p>
              </div>
              <div className="p-6 flex items-center gap-3">
                <button
                  disabled={isDeleting} onClick={() => setBranchToDelete(null)}
                  className="flex-1 py-3 text-xs font-bold text-text-muted bg-hover rounded-2xl hover:text-text-main hover:bg-hover/80 active:scale-95 transition-all cursor-pointer border border-border/40 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={async () => {
                    if (branchToDelete && !isDeleting) {
                      setIsDeleting(true);
                      try { await deleteBranch(branchToDelete); setBranchToDelete(null); } finally { setIsDeleting(false); }
                    }
                  }}
                  className="flex-1 py-3 text-xs font-bold text-white bg-error rounded-2xl hover:bg-error/90 active:scale-95 transition-all shadow-md shadow-error/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  <span>{isDeleting ? 'Deleting...' : 'Delete Branch'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
