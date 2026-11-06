import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditorDiscardDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmDiscard: () => void;
}

export const EditorDiscardDialog: React.FC<EditorDiscardDialogProps> = ({
  isOpen,
  onCancel,
  onConfirmDiscard,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm bg-surface-1 border border-border rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-amber-500">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 id="discard-title" className="text-sm font-bold text-text-primary">
                  Discard unsaved edits?
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  You have uncommitted modifications to this file.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 h-11 bg-surface-2 hover:bg-surface-3 text-text-primary font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={onConfirmDiscard}
                className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Discard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
