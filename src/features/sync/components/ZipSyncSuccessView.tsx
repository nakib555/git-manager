import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ExternalLink, Copy, Check } from 'lucide-react';

interface ZipSyncSuccessViewProps {
  success: {
    commitSha: string;
    branchName: string;
    prNumber?: number;
    prUrl?: string;
    htmlUrl: string;
  };
  onClose: () => void;
}

export const ZipSyncSuccessView: React.FC<ZipSyncSuccessViewProps> = ({
  success,
  onClose,
}) => {
  const [copiedSha, setCopiedSha] = useState(false);

  const handleCopySha = () => {
    navigator.clipboard.writeText(success.commitSha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="py-6 sm:py-8 text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        className="w-14 h-14 rounded-2xl bg-success/15 border border-success/30 text-success flex items-center justify-center mx-auto"
      >
        <CheckCircle2 size={28} />
      </motion.div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-base font-bold text-text-primary text-balance">
          {success.prNumber ? 'Pull Request Opened' : 'Commit Pushed to GitHub'}
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed text-pretty">
          All selected changes from your ZIP archive have been committed cleanly.
        </p>
      </div>

      <div className="border border-border rounded-xl bg-surface-2/35 text-left max-w-md mx-auto divide-y divide-border text-xs">
        <div className="px-4 py-2.5 flex justify-between items-center gap-3">
          <span className="text-text-secondary">Branch</span>
          <span className="font-mono text-text-primary font-semibold truncate">{success.branchName}</span>
        </div>
        <div className="px-4 py-2.5 flex justify-between items-center gap-3">
          <span className="text-text-secondary">Commit SHA</span>
          <button
            type="button"
            onClick={handleCopySha}
            className="inline-flex items-center gap-1.5 font-mono text-accent font-semibold hover:underline cursor-pointer tabular-nums"
            title="Copy full commit SHA"
          >
            <span>{success.commitSha.slice(0, 7)}</span>
            {copiedSha ? <Check size={12} className="text-success" /> : <Copy size={12} />}
          </button>
        </div>
        {success.prNumber && (
          <div className="px-4 py-2.5 flex justify-between items-center gap-3">
            <span className="text-text-secondary">Pull Request</span>
            <span className="font-mono text-text-primary font-semibold tabular-nums">#{success.prNumber}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center flex-wrap gap-3 pt-1">
        {(success.prUrl || success.htmlUrl) && (
          <a
            href={success.prUrl || success.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] px-4 py-2 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-text-primary inline-flex items-center gap-1.5 transition-colors btn-tactile"
          >
            <ExternalLink size={13} />
            <span>View on GitHub</span>
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          className="min-h-[40px] px-5 py-2 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold transition-colors cursor-pointer btn-tactile"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
};
