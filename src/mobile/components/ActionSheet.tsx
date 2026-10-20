import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../AppContext';
import { 
  FolderPlus, Download, GitBranchPlus, GitPullRequest, 
  GitCommit, Trash2, X 
} from 'lucide-react';

export interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({ isOpen, onClose }) => {
  const { openModal, navigate, currentRepo } = useAppContext();

  const handleAction = (cb: () => void) => {
    onClose();
    setTimeout(cb, 150);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          {/* Sheet Body */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full bg-surface-1 border-t border-x border-border rounded-t-xl pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            {/* Grab handle */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text-primary">Quick Actions</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-md hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-2 space-y-1">
              {/* Primary Actions */}
              <button
                onClick={() => handleAction(() => openModal('repo'))}
                className="w-full h-12 px-3 rounded-xl flex items-center gap-3.5 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer active:scale-98"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <FolderPlus size={17} />
                </div>
                <div>
                  <span className="block font-semibold">New Repository</span>
                  <span className="block text-[11px] text-text-tertiary font-normal">Create a new local or GitHub repository</span>
                </div>
              </button>

              <button
                onClick={() => handleAction(() => navigate('clone'))}
                className="w-full h-12 px-3 rounded-xl flex items-center gap-3.5 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer active:scale-98"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-2 text-text-primary flex items-center justify-center shrink-0 border border-border">
                  <Download size={17} />
                </div>
                <div>
                  <span className="block font-semibold">Clone Repository</span>
                  <span className="block text-[11px] text-text-tertiary font-normal">Download remote Git repo to workspace</span>
                </div>
              </button>

              {/* Contextual actions if inside repository */}
              {currentRepo && (
                <>
                  <div className="pt-2 pb-1 border-t border-border mt-2">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-3">
                      Active: {currentRepo}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAction(() => openModal('commit'))}
                    className="w-full h-12 px-3 rounded-xl flex items-center gap-3.5 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
                      <GitCommit size={17} />
                    </div>
                    <div>
                      <span className="block font-semibold">Commit Changes</span>
                      <span className="block text-[11px] text-text-tertiary font-normal">Stage and push changes to branch</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAction(() => openModal('branch'))}
                    className="w-full h-12 px-3 rounded-xl flex items-center gap-3.5 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-2 text-text-primary flex items-center justify-center shrink-0 border border-border">
                      <GitBranchPlus size={17} />
                    </div>
                    <div>
                      <span className="block font-semibold">Create Branch</span>
                      <span className="block text-[11px] text-text-tertiary font-normal">Branch off current HEAD</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAction(() => openModal('pr'))}
                    className="w-full h-12 px-3 rounded-xl flex items-center gap-3.5 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
                      <GitPullRequest size={17} />
                    </div>
                    <div>
                      <span className="block font-semibold">Open Pull Request</span>
                      <span className="block text-[11px] text-text-tertiary font-normal">Submit branch review for merging</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Aliases
export const MobileActionSheet = ActionSheet;
