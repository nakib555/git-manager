import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../AppContext';
import { 
  FolderPlus, Download, GitBranchPlus, GitPullRequest, 
  GitCommit, Trash2, X 
} from 'lucide-react';

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileActionSheet: React.FC<MobileActionSheetProps> = ({ isOpen, onClose }) => {
  const { openModal, currentRepo, navigate } = useAppContext();

  if (!isOpen) return null;

  const actions = [
    {
      id: 'new-repo',
      label: 'New Repository',
      description: 'Create a new local or remote repository',
      icon: FolderPlus,
      onClick: () => {
        onClose();
        openModal('repo');
      },
      color: 'text-[#3B82F6] bg-[#3B82F6]/10',
    },
    {
      id: 'clone-repo',
      label: 'Clone Repository',
      description: 'Clone from GitHub, URL, or template',
      icon: Download,
      onClick: () => {
        onClose();
        navigate('clone');
      },
      color: 'text-[#3B82F6] bg-[#3B82F6]/10',
    },
    ...(currentRepo
      ? [
          {
            id: 'create-branch',
            label: 'Create Branch',
            description: `Branch out from active branch in "${currentRepo}"`,
            icon: GitBranchPlus,
            onClick: () => {
              onClose();
              openModal('branch');
            },
            color: 'text-[#3B82F6] bg-[#3B82F6]/10',
          },
          {
            id: 'create-pr',
            label: 'New Pull Request',
            description: 'Open a PR against the default branch',
            icon: GitPullRequest,
            onClick: () => {
              onClose();
              openModal('pr');
            },
            color: 'text-[#22C55E] bg-[#22C55E]/10',
          },
          {
            id: 'commit-changes',
            label: 'Commit Changes',
            description: 'Stage and commit staged modifications',
            icon: GitCommit,
            onClick: () => {
              onClose();
              openModal('commit');
            },
            color: 'text-[#3B82F6] bg-[#3B82F6]/10',
          },
        ]
      : []),
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Sheet Content */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-[#121214] border-t border-x border-[#2A2A2E] rounded-t-[20px] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto no-scrollbar"
        >
          {/* Top Drag Handle */}
          <div className="w-10 h-1 bg-[#2A2A2E] rounded-full mx-auto mb-4" />

          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] mb-3">
            <div>
              <h2 className="text-base font-semibold text-[#F4F4F5]">Actions</h2>
              <p className="text-xs text-[#71717A]">
                {currentRepo ? `Repository: ${currentRepo}` : 'Workspace operations'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1A1A1D] border border-[#2A2A2E] flex items-center justify-center text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors cursor-pointer"
              aria-label="Close action sheet"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action List */}
          <div className="space-y-1.5">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#1A1A1D] border border-transparent hover:border-[#2A2A2E] active:scale-98 transition-all text-left cursor-pointer group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}
                  >
                    <Icon size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#F4F4F5] group-hover:text-[#3B82F6] transition-colors truncate">
                      {action.label}
                    </div>
                    <div className="text-xs text-[#71717A] truncate">
                      {action.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
