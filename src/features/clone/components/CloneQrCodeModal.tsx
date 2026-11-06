import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check } from 'lucide-react';

interface CloneQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const CloneQrCodeModal: React.FC<CloneQrCodeModalProps> = ({
  isOpen,
  onClose,
  url,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[220] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop with tap-to-dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-2xl p-6 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] max-w-sm w-full space-y-4 shadow-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Drag Handle */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-2 mb-2 sm:hidden shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="font-bold text-sm text-text-primary">Transfer to Mobile</span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-tertiary hover:text-text-primary transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-xl shadow-xs">
              <QRCodeSVG value={url} size={180} level="M" />
            </div>

            <p className="text-xs text-text-tertiary text-center leading-relaxed">
              Scan with your mobile camera to open and clone this repository on your device.
            </p>

            <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2">
              <span className="text-xs font-mono text-text-secondary truncate flex-1">{url}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-accent flex items-center gap-1 cursor-pointer shrink-0 hover:underline"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
