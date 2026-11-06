import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface CommitsDeleteHeadDialogProps {
  commit: any | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CommitsDeleteHeadDialog: React.FC<CommitsDeleteHeadDialogProps> = ({
  commit,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !commit) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl"
      >
        <div className="flex items-center gap-3 text-rose-500">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-text-main">Delete HEAD Commit</h4>
            <span className="font-mono text-xs text-rose-500">{commit.hash?.slice(0, 7)}</span>
          </div>
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          Are you sure you want to delete this commit? Head revision will roll back to previous commit in history.
        </p>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text-muted hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-rose-500/20"
          >
            <Trash2 size={13} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Commit'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
