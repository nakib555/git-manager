import React from 'react';
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

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="font-bold text-sm text-text-main">Transfer to Mobile</span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-hover text-text-muted hover:text-text-main cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-xl">
              <QRCodeSVG value={url} size={180} level="M" />
            </div>

            <p className="text-xs text-text-muted text-center leading-relaxed">
              Scan with your mobile camera to open and clone this repository on your phone.
            </p>

            <div className="flex items-center gap-2 bg-main border border-border rounded-xl px-3 py-2">
              <span className="text-xs font-mono text-text-muted truncate flex-1">{url}</span>
              <button
                onClick={handleCopy}
                className="text-xs font-bold text-primary flex items-center gap-1 cursor-pointer shrink-0"
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
