import React, { useState } from 'react';
import { GitCommit, Copy, Check, X } from 'lucide-react';

interface CommitDetailHeaderProps {
  commit: any;
  onClose: () => void;
}

export const CommitDetailHeader: React.FC<CommitDetailHeaderProps> = ({ commit, onClose }) => {
  const [copiedSha, setCopiedSha] = useState(false);

  const sha = commit.fullHash || commit.hash;
  const shortSha = commit.hash ? commit.hash.slice(0, 7) : sha ? sha.slice(0, 7) : '';

  const handleCopySha = () => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div className="p-4 border-b border-border flex items-start justify-between gap-3 shrink-0 bg-card">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <GitCommit size={20} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-text-main line-clamp-1">
              {commit.msg || commit.message || 'Commit details'}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleCopySha}
              className="font-mono text-[10px] text-text-muted hover:text-primary flex items-center gap-1 bg-main px-2 py-0.5 rounded border border-border cursor-pointer"
              title="Copy commit SHA"
            >
              <span>{shortSha}</span>
              {copiedSha ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
            </button>
            <span className="text-[10px] text-text-muted font-medium">by {commit.author}</span>
            <span className="text-[10px] text-text-muted hidden sm:inline">&bull; Detailed commit inspection</span>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-hover text-text-muted hover:text-text-main cursor-pointer shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};
