import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Smartphone, GitBranch } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [qrMode, setQrMode] = useState<'app' | 'git'>('app');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute deep link to open app with pre-filled repo
  const targetQrValue = useMemo(() => {
    if (qrMode === 'git') return url;
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return `${origin}/?cloneUrl=${encodeURIComponent(url)}`;
    } catch (_) {
      return url;
    }
  }, [url, qrMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(targetQrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6">
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
                <p className="text-[11px] text-text-tertiary mt-0.5">Scan to open or clone this repository</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-tertiary hover:text-text-primary transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex bg-main p-0.5 rounded-xl border border-border text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setQrMode('app')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  qrMode === 'app' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Smartphone size={13} className={qrMode === 'app' ? 'text-primary' : 'text-text-muted'} />
                <span>Web App Link</span>
              </button>
              <button
                type="button"
                onClick={() => setQrMode('git')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  qrMode === 'git' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
                }`}
              >
                <GitBranch size={13} className={qrMode === 'git' ? 'text-primary' : 'text-text-muted'} />
                <span>Raw Git URL</span>
              </button>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-xl shadow-xs border border-border/40">
              <QRCodeSVG value={targetQrValue} size={180} level="M" />
            </div>

            <p className="text-xs text-text-tertiary text-center leading-relaxed">
              {qrMode === 'app'
                ? 'Scan with your smartphone camera to open this app and load this repo immediately.'
                : 'Scan with your git terminal or mobile git client to copy the repository URL.'}
            </p>

            <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2">
              <span className="text-xs font-mono text-text-secondary truncate flex-1">{targetQrValue}</span>
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
