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
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6">
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
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative bg-surface-1 border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl z-10 max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="font-bold text-sm text-text-primary leading-tight">Transfer to Mobile</h2>
                <p className="text-[11px] text-text-tertiary mt-0.5">Scan QR code to open or clone this repo</p>
              </div>
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
