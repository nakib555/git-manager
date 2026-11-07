import React, { useState } from 'react';
import { Copy, Check, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../AppContext';

interface DeleteRepoConfirmInputProps {
  repoName: string;
  confirmInput: string;
  isMatch: boolean;
  onChange: (val: string) => void;
}

export const DeleteRepoConfirmInput: React.FC<DeleteRepoConfirmInputProps> = ({
  repoName,
  confirmInput,
  isMatch,
  onChange,
}) => {
  const { showToast } = useAppContext();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(repoName);
    setIsCopied(true);
    showToast('Repository name copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-2 pt-0.5 min-w-0">
      <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
        <label htmlFor="confirm-repo-input" className="font-semibold text-text-main flex items-center gap-1.5 flex-wrap min-w-0">
          <span>Type</span>
          <span className="inline-flex items-center gap-1.5 bg-danger/10 border border-danger/25 rounded-lg px-2 py-1 max-w-full">
            <code className="font-mono text-danger font-bold text-xs break-all max-w-[220px] sm:max-w-[280px]">
              {repoName}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 hover:bg-danger/20 rounded text-danger transition-colors cursor-pointer shrink-0"
              title="Copy repository name"
              aria-label="Copy repository name"
            >
              {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
          </span>
        </label>

        {isMatch ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 shrink-0">
            <CheckCircle2 size={12} /> <span>Name matches</span>
          </span>
        ) : (
          <span className="text-[10px] text-text-muted shrink-0">Exact match required</span>
        )}
      </div>

      <input
        id="confirm-repo-input"
        type="text"
        autoFocus
        value={confirmInput}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Type ${repoName} to confirm`}
        className={`w-full bg-main border rounded-xl px-3.5 py-2.5 text-xs text-text-main font-mono outline-none transition-colors break-all ${
          isMatch ? 'border-emerald-500 focus:border-emerald-400' : 'border-border focus:border-danger'
        }`}
      />
    </div>
  );
};
