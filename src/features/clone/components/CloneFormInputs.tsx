import React from 'react';
import { QrCode, Folder, ClipboardPaste } from 'lucide-react';
import { CloneProtocol } from '../types';
import { CloneBranchDepthInputs } from './CloneBranchDepthInputs';

interface CloneFormInputsProps {
  url: string;
  setUrl: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  dest: string;
  setDest: (val: string) => void;
  urlMode: CloneProtocol;
  setUrlMode: (mode: CloneProtocol) => void;
  depth: 'full' | 'shallow';
  setDepth: (depth: 'full' | 'shallow') => void;
  onOpenQr: () => void;
  onSubmit: () => void;
  onPickDirectory?: () => void;
  isSubmitting?: boolean;
}

export const CloneFormInputs: React.FC<CloneFormInputsProps> = ({
  url,
  setUrl,
  branch,
  setBranch,
  dest,
  setDest,
  urlMode,
  setUrlMode,
  depth,
  setDepth,
  onOpenQr,
  onSubmit,
  onPickDirectory,
  isSubmitting = false,
}) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch (_) {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
          Repository URL
        </label>
        <div className="flex bg-main p-0.5 rounded-lg border border-border text-[10px] font-bold">
          {(['https', 'ssh', 'cli'] as CloneProtocol[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setUrlMode(m)}
              className={`px-2.5 py-1 rounded-md uppercase transition-all cursor-pointer ${
                urlMode === m
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-main border border-border rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repository.git"
          className="bg-transparent border-none text-xs text-text-main w-full outline-none font-mono"
        />
        <button
          type="button"
          onClick={handlePaste}
          className="p-1 text-text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
          title="Paste from clipboard"
        >
          <ClipboardPaste size={14} />
        </button>
        <button
          type="button"
          onClick={onOpenQr}
          className="p-1 text-text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
          title="Mobile transfer QR code"
        >
          <QrCode size={14} />
        </button>
      </div>

      <CloneBranchDepthInputs
        branch={branch}
        setBranch={setBranch}
        depth={depth}
        setDepth={setDepth}
      />

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Folder size={12} />
          <span>Local Destination Folder</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="/Documents/Projects/repo"
            className="flex-1 bg-main border border-border rounded-xl px-3 py-2 text-xs text-text-main outline-none focus:border-primary font-mono"
          />
          {onPickDirectory && (
            <button
              type="button"
              onClick={onPickDirectory}
              className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-hover text-xs font-semibold text-text-main cursor-pointer shrink-0"
            >
              Browse...
            </button>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!url.trim() || isSubmitting}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isSubmitting ? 'Starting clone...' : 'Clone Repository'}
        </button>
      </div>
    </div>
  );
};
