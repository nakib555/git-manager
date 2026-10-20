import React from 'react';
import { useAppContext } from '../../../AppContext';
import { GitBranch, Check, Plus } from 'lucide-react';

export const BranchesScreen: React.FC = () => {
  const { activeBranches, currentBranch, switchBranch, openModal, currentRepo, showToast } = useAppContext();

  const handleSwitch = (name: string) => {
    switchBranch(name);
    showToast(`Switched to branch "${name}"`, 'success');
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">Branches</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            Active branches in {currentRepo}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal('branch')}
          className="h-10 px-3.5 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-accent/20 cursor-pointer active:scale-95"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Branch</span>
        </button>
      </div>

      <div className="bg-surface-1 border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {activeBranches.map((branch) => {
          const isActive = branch.name === currentBranch;
          return (
            <div
              key={branch.name}
              onClick={() => handleSwitch(branch.name)}
              className={`p-4 min-h-[56px] flex items-center justify-between transition-colors cursor-pointer select-none ${
                isActive ? 'bg-accent-soft' : 'hover:bg-surface-2'
              }`}
            >
              <div className="flex items-center gap-3">
                <GitBranch size={17} className={isActive ? 'text-accent' : 'text-text-tertiary'} />
                <div>
                  <span className={`text-xs block ${isActive ? 'font-bold text-accent' : 'font-medium text-text-primary'}`}>
                    {branch.name}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-accent font-mono font-semibold">
                      Current HEAD
                    </span>
                  )}
                </div>
              </div>

              {isActive ? (
                <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center shadow-2xs">
                  <Check size={14} strokeWidth={2.5} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwitch(branch.name);
                  }}
                  className="text-xs text-text-secondary hover:text-text-primary font-medium px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border transition-colors cursor-pointer"
                >
                  Checkout
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MobileBranches = BranchesScreen;
