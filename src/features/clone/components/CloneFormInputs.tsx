import React, { useState } from 'react';
import { QrCode, ClipboardPaste, Copy, Check, Terminal, Download, Archive, Loader2 } from 'lucide-react';
import { CloneProtocol } from '../types';
import { CloneBranchDepthInputs } from './CloneBranchDepthInputs';

interface CloneFormInputsProps {
  url: string;
  setUrl: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  availableBranches?: string[];
  isLoadingBranches?: boolean;
  urlMode: CloneProtocol;
  setUrlMode: (mode: CloneProtocol) => void;
  depth: 'full' | 'shallow';
  setDepth: (depth: 'full' | 'shallow') => void;
  archiveFormat: 'zip' | 'tar';
  setArchiveFormat: (format: 'zip' | 'tar') => void;
  onOpenQr: () => void;
  onDownloadArchive: () => void;
  isDownloadingArchive?: boolean;
}

export const CloneFormInputs: React.FC<CloneFormInputsProps> = ({
  url,
  setUrl,
  branch,
  setBranch,
  availableBranches,
  isLoadingBranches,
  urlMode,
  setUrlMode,
  depth,
  setDepth,
  archiveFormat,
  setArchiveFormat,
  onOpenQr,
  onDownloadArchive,
  isDownloadingArchive = false,
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
      {/* Target & Protocol Header */}
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

      {/* URL or CLI Input with Action Buttons */}
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
          <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 bg-primary/5 rounded-lg border border-primary/20 text-text-secondary">
            <span className="font-mono text-[10px] truncate">
              Command: <code className="text-text-main font-bold">{url}</code>
            </span>
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

      {/* Target Branch and Depth Inputs */}
      <CloneBranchDepthInputs
        branch={branch}
        setBranch={setBranch}
        depth={depth}
        setDepth={setDepth}
        availableBranches={availableBranches}
        isLoadingBranches={isLoadingBranches}
      />

      {/* Archive Compression Format Selection */}
      <div className="flex items-center justify-between bg-main border border-border p-2.5 rounded-xl">
        <span className="text-xs font-semibold text-text-main flex items-center gap-1.5">
          <Archive size={14} className="text-primary" />
          <span>Archive Format</span>
        </span>
        <div className="flex bg-card p-0.5 rounded-lg border border-border text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setArchiveFormat('zip')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              archiveFormat === 'zip'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            .ZIP
          </button>
          <button
            type="button"
            onClick={() => setArchiveFormat('tar')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              archiveFormat === 'tar'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            .TAR.GZ
          </button>
        </div>
      </div>

      {/* Primary Actions: Download Archive & Copy Clone Command */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onDownloadArchive}
          disabled={!url.trim() || isDownloadingArchive}
          className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isDownloadingArchive ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Packaging {archiveFormat.toUpperCase()}...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Download Archive (.{archiveFormat.toUpperCase()})</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!url.trim()}
          className="w-full py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-hover text-text-main text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          <span>{copied ? 'Command Copied!' : 'Copy Clone Command'}</span>
        </button>
      </div>
    </div>
  );
};
