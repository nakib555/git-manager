import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../AppContext';
import { FolderPlus, Download, X } from 'lucide-react';
import { ActionSheetRepoSection } from './actionSheet/ActionSheetRepoSection';

export interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteRepo?: () => void;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({ isOpen, onClose, onDeleteRepo }) => {
  const { openModal, navigate, currentRepo, openZipSync } = useAppContext();

  const handleAction = (cb: () => void) => {
    onClose();
    setTimeout(cb, 150);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full bg-surface-1 border-t border-x border-border rounded-t-3xl pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-4 shadow-2xl z-10 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-border min-h-[44px]">
              <h3 className="text-sm font-semibold text-text-primary headline-balance">Quick Actions</h3>
              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-xl hover:bg-surface-2 transition-colors cursor-pointer btn-tactile"
                aria-label="Close action sheet"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-2 space-y-2">
              <button
                onClick={() => handleAction(() => openModal('repo'))}
                className="w-full min-h-[48px] h-12 px-3 rounded-xl flex items-center gap-4 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer btn-tactile"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-text-primary flex items-center justify-center shrink-0">
                  <FolderPlus size={17} />
                </div>
                <div>
                  <span className="block font-semibold">New Repository</span>
                  <span className="block text-[11px] text-text-tertiary font-normal">Create a new local or GitHub repository</span>
                </div>
              </button>

              <button
                onClick={() => handleAction(() => navigate('clone'))}
                className="w-full min-h-[48px] h-12 px-3 rounded-xl flex items-center gap-4 hover:bg-surface-2 transition-colors text-left text-xs font-semibold text-text-primary cursor-pointer btn-tactile"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-text-primary flex items-center justify-center shrink-0">
                  <Download size={17} />
                </div>
                <div>
                  <span className="block font-semibold">Clone Repository</span>
                  <span className="block text-[11px] text-text-tertiary font-normal">Download remote Git repo to workspace</span>
                </div>
              </button>

              {currentRepo && (
                <ActionSheetRepoSection
                  currentRepo={currentRepo}
                  handleAction={handleAction}
                  openZipSync={openZipSync}
                  openModal={openModal}
                  onDeleteRepo={onDeleteRepo}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const MobileActionSheet = ActionSheet;
