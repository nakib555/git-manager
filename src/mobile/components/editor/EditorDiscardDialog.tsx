import React, { useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmationCountdownButton } from '../../../components/ui/ConfirmationCountdownButton';

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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-title"
          className="fixed inset-0 z-[220] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-sm bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-2xl p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] shadow-2xl space-y-4 z-10"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-1 mb-2 sm:hidden shrink-0" />

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
                className="w-1/3 h-11 bg-surface-2 hover:bg-surface-3 text-text-primary font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Keep editing
              </button>
              <div className="flex-1">
                <ConfirmationCountdownButton
                  label="Discard Changes"
                  countdownSeconds={2}
                  onConfirm={onConfirmDiscard}
                  variant="danger"
                  icon={<Trash2 size={13} />}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
