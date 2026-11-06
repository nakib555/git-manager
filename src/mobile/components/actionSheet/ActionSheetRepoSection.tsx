import React from 'react';
import { Sparkles, GitCommit, GitBranchPlus, GitPullRequest, Trash2 } from 'lucide-react';

interface ActionSheetRepoSectionProps {
  currentRepo: string;
  handleAction: (cb: () => void) => void;
  openZipSync: () => void;
  openModal: (modal: any) => void;
  onDeleteRepo?: () => void;
}

export const ActionSheetRepoSection: React.FC<ActionSheetRepoSectionProps> = ({
  currentRepo,
  handleAction,
  openZipSync,
  openModal,
  onDeleteRepo,
}) => {
  return (
    <>
      <div className="pt-2 pb-1 border-t border-border mt-2">
        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-3">
          Active: {currentRepo}
        </span>
      </div>

      <button
        onClick={() => handleAction(openZipSync)}
        className="w-full min-h-[48px] h-12 px-3 rounded-xl flex items-center gap-4 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer active:scale-98 bg-accent/5 border border-accent/20"
      >
        <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
          <Sparkles size={17} />
        </div>
        <div>
          <span className="block font-semibold text-accent">Sync ZIP Package</span>
          <span className="block text-[11px] text-text-tertiary font-normal">Auto-align roots, resolve conflicts, commit changes</span>
        </div>
      </button>

      <button
        onClick={() => handleAction(() => openModal('commit'))}
        className="w-full min-h-[48px] h-12 px-3 rounded-xl flex items-center gap-4 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer active:scale-98"
      >
        <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-accent flex items-center justify-center shrink-0">
          <GitCommit size={17} />
        </div>
        <div>
          <span className="block font-semibold">Commit Changes</span>
          <span className="block text-[11px] text-text-tertiary font-normal">Stage and push changes to branch</span>
        </div>
      </button>

      <button
        onClick={() => handleAction(() => openModal('branch'))}
        className="w-full min-h-[48px] h-12 px-3 rounded-xl flex items-center gap-4 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer active:scale-98"
      >
        <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-accent flex items-center justify-center shrink-0">
          <GitBranchPlus size={17} />
        </div>
        <div>
          <span className="block font-semibold">Create Branch</span>
          <span className="block text-[11px] text-text-tertiary font-normal">Branch off current HEAD</span>
        </div>
      </button>

      <button
        onClick={() => handleAction(() => openModal('pr'))}
        className="w-full min-h-[48px] h-12 px-3 rounded-xl flex items-center gap-4 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer active:scale-98"
      >
        <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-emerald-400 flex items-center justify-center shrink-0">
          <GitPullRequest size={17} />
        </div>
        <div>
          <span className="block font-semibold">Open Pull Request</span>
          <span className="block text-[11px] text-text-tertiary font-normal">Submit branch review for merging</span>
        </div>
      </button>

      {onDeleteRepo && (
        <button
          onClick={() => handleAction(onDeleteRepo)}
          className="w-full min-h-[48px] h-12 px-3 rounded-xl flex items-center gap-4 hover:bg-red-500/10 transition-colors text-left text-xs font-semibold text-red-400 cursor-pointer active:scale-98 border border-red-500/20 mt-2"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <Trash2 size={17} />
          </div>
          <div>
            <span className="block font-semibold text-red-400">Delete Repository</span>
            <span className="block text-[11px] text-red-400/70 font-normal">Permanently remove {currentRepo}</span>
          </div>
        </button>
      )}
    </>
  );
};
