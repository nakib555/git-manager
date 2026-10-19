import React from 'react';
import { useAppContext } from '../../../AppContext';
import { GitBranch, Check, Plus } from 'lucide-react';

export const MobileBranches: React.FC = () => {
  const { activeBranches, currentBranch, switchBranch, openModal, currentRepo, showToast } = useAppContext();

  const handleSwitch = (name: string) => {
    switchBranch(name);
    showToast(`Switched to branch "${name}"`, 'success');
  };

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#F4F4F5] tracking-tight">Branches</h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Active branches in {currentRepo}
          </p>
        </div>
        <button
          onClick={() => openModal('branch')}
          className="h-8 px-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-[#3B82F6]/20 cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>New Branch</span>
        </button>
      </div>

      <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl overflow-hidden divide-y divide-[#2A2A2E]">
        {activeBranches.map((branch) => {
          const isActive = branch.name === currentBranch;
          return (
            <div
              key={branch.name}
              onClick={() => handleSwitch(branch.name)}
              className={`p-3.5 flex items-center justify-between transition-colors cursor-pointer ${
                isActive ? 'bg-[#3B82F6]/10' : 'hover:bg-[#1A1A1D]'
              }`}
            >
              <div className="flex items-center gap-3">
                <GitBranch size={16} className={isActive ? 'text-[#3B82F6]' : 'text-[#71717A]'} />
                <div>
                  <span className={`text-xs block ${isActive ? 'font-bold text-[#3B82F6]' : 'font-medium text-[#F4F4F5]'}`}>
                    {branch.name}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-[#3B82F6] font-mono">
                      Current HEAD
                    </span>
                  )}
                </div>
              </div>

              {isActive ? (
                <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
                  <Check size={14} strokeWidth={2.5} />
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwitch(branch.name);
                  }}
                  className="text-xs text-[#71717A] hover:text-[#3B82F6] font-medium"
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
