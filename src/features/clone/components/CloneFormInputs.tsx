import React, { useState } from 'react';
import { QrCode, Folder, ClipboardPaste, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { CloneProtocol } from '../types';
import { CloneBranchDepthInputs } from './CloneBranchDepthInputs';

interface CloneFormInputsProps {
  url: string;
  setUrl: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  availableBranches?: string[];
  isLoadingBranches?: boolean;
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
  availableBranches,
  isLoadingBranches,
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
  const [copied, setCopied] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch (_) {}
  };

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <span>Repository Target & Protocol</span>
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

      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-main border border-border rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
          {urlMode === 'cli' && <Terminal size={14} className="text-primary shrink-0" />}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={
              urlMode === 'cli'
                ? 'gh repo clone owner/repository'
                : urlMode === 'ssh'
                ? 'git@github.com:owner/repository.git'
                : 'https://github.com/owner/repository.git'
            }
            className="bg-transparent border-none text-xs text-text-main w-full outline-none font-mono"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
            title="Copy URL or command"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
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

        {urlMode === 'cli' && (
          <div className="flex items-center justify-between text-[11px] px-2 py-1 bg-primary/5 rounded-lg border border-primary/20 text-text-secondary">
            <span className="font-mono text-[10px] truncate">Run in terminal: <code className="text-text-main font-bold">{url}</code></span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[10px] font-bold text-primary hover:underline cursor-pointer shrink-0 ml-2"
            >
              {copied ? 'Copied!' : 'Copy Command'}
            </button>
          </div>
        )}
      </div>

      <CloneBranchDepthInputs
        branch={branch}
        setBranch={setBranch}
        depth={depth}
        setDepth={setDepth}
        availableBranches={availableBranches}
        isLoadingBranches={isLoadingBranches}
      />

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Folder size={12} />
            <span>Local Destination Folder</span>
          </span>
          <span className="text-[10px] font-normal text-text-muted">Mounted in workspace</span>
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
              className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-hover text-xs font-semibold text-text-main cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors"
              title="Pick folder from filesystem"
            >
              <Folder size={13} className="text-primary" />
              <span>Browse...</span>
            </button>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!url.trim() || isSubmitting}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>{isSubmitting ? 'Starting clone...' : 'Clone Repository to Workspace'}</span>
        </button>
      </div>
    </div>
  );
};
