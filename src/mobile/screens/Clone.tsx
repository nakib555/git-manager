import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  Download, Copy, Check, Terminal, HardDrive, 
  FolderGit2, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react';
import { InlineErrorCard } from '../components/InlineErrorCard';

export const Clone: React.FC = () => {
  const { githubToken, githubRepos, githubUser, showToast, cloneRepository, navigate } = useAppContext();

  const [repoUrl, setRepoUrl] = useState('https://github.com/owner/repository.git');
  const [destName, setDestName] = useState('my-project');
  const [cloneDepth, setCloneDepth] = useState<number | 'full'>(1);
  const [isCloning, setIsCloning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Auto-fill destination folder name when URL changes
  const handleUrlChange = (url: string) => {
    setRepoUrl(url);
    const parts = url.trim().replace(/\.git$/, '').split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && (!destName || destName === 'my-project')) {
      setDestName(lastPart);
    }
  };

  const selectUserRepo = (owner: string, name: string) => {
    const fullUrl = `https://github.com/${owner}/${name}.git`;
    setRepoUrl(fullUrl);
    setDestName(name);
    showToast(`Selected repository: ${name}`, 'info');
  };

  const getOwnerAndRepo = () => {
    if (!repoUrl) return null;
    const clean = repoUrl.trim().replace(/\.git$/, '');
    const parts = clean.split('/');
    if (parts.length >= 2) {
      return {
        owner: parts[parts.length - 2],
        repo: parts[parts.length - 1],
      };
    }
    return null;
  };

  // Generate dynamic terminal command
  const generatedCommand = `git clone${cloneDepth !== 'full' ? ` --depth ${cloneDepth}` : ''} ${repoUrl || 'https://github.com/owner/repository.git'} ${destName || 'my-project'}`;

  const copyCloneCmd = () => {
    navigator.clipboard.writeText(generatedCommand);
    setIsCopied(true);
    showToast('Terminal command copied!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClone = async () => {
    if (!repoUrl.trim() || repoUrl === 'https://github.com/owner/repository.git') {
      showToast('Please enter a valid Git repository URL', 'warning');
      return;
    }
    setIsCloning(true);
    setCloneError(null);
    try {
      const name = destName || repoUrl.split('/').pop()?.replace('.git', '') || 'cloned-repo';
      await cloneRepository({
        url: repoUrl.trim(),
        destFolder: name,
        branch: 'main',
        shallow: cloneDepth === 1,
        submodules: false,
      });
      navigate('repos');
    } catch (err: any) {
      const msg = err.message || 'Clone failed';
      setCloneError(msg);
      showToast(`Clone error: ${msg}`, 'error');
    } finally {
      setIsCloning(false);
    }
  };

  const handleDownloadZip = async () => {
    const parsed = getOwnerAndRepo();
    if (!parsed || repoUrl.includes('owner/repository')) {
      showToast('Please enter an authentic GitHub repository URL', 'warning');
      return;
    }
    setIsDownloadingZip(true);
    setCloneError(null);
    try {
      const tokenParam = githubToken ? `&token=${encodeURIComponent(githubToken)}` : '';
      const downloadUrl = `/api/github/download?owner=${encodeURIComponent(parsed.owner)}&repo=${encodeURIComponent(parsed.repo)}&ref=main${tokenParam}`;
      
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${parsed.repo}-main.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast(`Repository ${parsed.repo}.zip downloaded!`, 'success');
    } catch (err: any) {
      const msg = err.message || 'ZIP download failed';
      setCloneError(msg);
      showToast(`ZIP Download error: ${msg}`, 'error');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="px-4 py-3.5 space-y-4 pb-12">
      {/* 1. Title Block */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">Clone Repository</h1>
        <p className="text-xs text-text-tertiary mt-0.5">
          Download remote repositories into your local workspace.
        </p>
      </div>

      {/* 2. Quick Pick Carousel */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2.5">
          <FolderGit2 size={13} className="text-accent" />
          <span className="text-[11px]">Your Repositories Quick-Pick</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {githubRepos && githubRepos.length > 0 ? (
            githubRepos.slice(0, 6).map(repo => {
              const ownerLogin = (repo as any).owner?.login || githubUser?.login || 'user';
              const lang = repo.language || 'Code';
              return (
                <div
                  key={repo.name}
                  onClick={() => selectUserRepo(ownerLogin, repo.name)}
                  className="min-w-[160px] p-3.5 bg-surface-1 border border-border/90 rounded-2xl shadow-xs hover:border-amber-400/80 active:scale-95 transition cursor-pointer select-none"
                >
                  <h4 className="text-xs font-bold text-text-primary truncate">{repo.name}</h4>
                  <div className="flex items-center justify-between text-[11px] text-text-tertiary mt-2">
                    <span className="truncate max-w-[85px]">{ownerLogin}</span>
                    <span className="font-medium text-text-secondary">{lang}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <>
              {/* Default Mock Quick Picks matching design attachments */}
              <div 
                onClick={() => selectUserRepo('nakib555', 'git-manager')}
                className="min-w-[160px] p-3.5 bg-surface-1 border border-border/90 rounded-2xl shadow-xs hover:border-amber-400/80 active:scale-95 transition cursor-pointer select-none"
              >
                <h4 className="text-xs font-bold text-text-primary truncate">git-manager</h4>
                <div className="flex items-center justify-between text-[11px] text-text-tertiary mt-2">
                  <span>nakib555</span>
                  <span className="font-medium text-text-secondary">TypeScript</span>
                </div>
              </div>

              <div 
                onClick={() => selectUserRepo('nakib555', 'Excel-grid')}
                className="min-w-[160px] p-3.5 bg-surface-1 border border-border/90 rounded-2xl shadow-xs hover:border-amber-400/80 active:scale-95 transition cursor-pointer select-none"
              >
                <h4 className="text-xs font-bold text-text-primary truncate">Excel-grid</h4>
                <div className="flex items-center justify-between text-[11px] text-text-tertiary mt-2">
                  <span>nakib555</span>
                  <span className="font-medium text-text-secondary">TypeScript</span>
                </div>
              </div>

              <div 
                onClick={() => selectUserRepo('nakib555', 'hyper-term')}
                className="min-w-[160px] p-3.5 bg-surface-1 border border-border/90 rounded-2xl shadow-xs hover:border-amber-400/80 active:scale-95 transition cursor-pointer select-none"
              >
                <h4 className="text-xs font-bold text-text-primary truncate">hyper-term</h4>
                <div className="flex items-center justify-between text-[11px] text-text-tertiary mt-2">
                  <span>nakib555</span>
                  <span className="font-medium text-text-secondary">Rust</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CARD 1: REMOTE SOURCE */}
      <div className="bg-surface-1 border border-border/90 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-surface-2 border border-border text-text-primary flex items-center justify-center text-[10px] font-bold font-mono">
            1
          </span>
          <span className="text-xs font-bold tracking-wider text-text-tertiary uppercase">
            Remote Source
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1.5">
            Git HTTPS / SSH URL
          </label>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full px-3.5 py-3 text-xs font-mono bg-surface-2 border border-border/70 focus:border-accent focus:bg-surface-1 rounded-2xl text-text-primary focus:outline-none transition"
            placeholder="https://github.com/owner/repository.git"
          />
        </div>
      </div>

      {/* CARD 2: TARGET DIRECTORY & DEPTH */}
      <div className="bg-surface-1 border border-border/90 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-surface-2 border border-border text-text-primary flex items-center justify-center text-[10px] font-bold font-mono">
            2
          </span>
          <span className="text-xs font-bold tracking-wider text-text-tertiary uppercase">
            Target Directory &amp; Depth
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Folder Name */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              className="w-full px-3.5 py-3 text-xs font-medium bg-surface-2 border border-border/70 focus:border-accent focus:bg-surface-1 rounded-2xl text-text-primary focus:outline-none transition"
              placeholder="folder-name"
            />
          </div>

          {/* Clone Depth Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Clone Depth
            </label>
            <div className="relative">
              <select
                value={cloneDepth}
                onChange={(e) => {
                  const val = e.target.value;
                  setCloneDepth(val === 'full' ? 'full' : Number(val));
                }}
                className="w-full appearance-none px-3.5 py-3 text-xs font-medium bg-surface-2 border border-border/70 focus:border-accent focus:bg-surface-1 rounded-2xl text-text-primary focus:outline-none transition pr-7 cursor-pointer"
              >
                <option value="1">Shallow (Depth 1)</option>
                <option value="5">Depth 5</option>
                <option value="10">Depth 10</option>
                <option value="full">Full History</option>
              </select>
              <ChevronDown size={14} className="text-text-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: TERMINAL COMMAND PREVIEW */}
      <div className="bg-surface-1 border border-border/90 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-tertiary tracking-wider">
            <span className="font-mono text-text-primary font-bold">&gt;_</span>
            <span className="uppercase">Terminal Command</span>
          </div>

          <button
            type="button"
            onClick={copyCloneCmd}
            className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline active:scale-95 transition cursor-pointer"
          >
            {isCopied ? <Check size={13} /> : <Copy size={13} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Terminal Command Box */}
        <div className="bg-surface-2 rounded-2xl p-3.5 font-mono text-xs text-text-primary break-all leading-relaxed select-all">
          <span className="text-text-tertiary select-none mr-1.5">$</span>
          <span>{generatedCommand}</span>
        </div>
      </div>

      {cloneError && (
        <InlineErrorCard
          title="Clone Operation Failed"
          message={cloneError}
          onRetry={handleClone}
          compact
        />
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1 pb-4">
        {/* Initialize Workspace Clone Button */}
        <button
          type="button"
          onClick={handleClone}
          disabled={isCloning}
          className="w-full py-3.5 bg-text-primary hover:opacity-90 text-background rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          {isCloning ? (
            <span className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
          ) : (
            <HardDrive size={15} />
          )}
          <span>{isCloning ? 'Cloning Repository...' : 'Initialize Local Workspace Clone'}</span>
        </button>

        {/* Download ZIP Button */}
        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={isDownloadingZip}
          className="w-full py-3.5 bg-surface-1 border border-border/90 hover:bg-surface-2 text-text-primary rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isDownloadingZip ? (
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          ) : (
            <Download size={15} className="text-text-tertiary" />
          )}
          <span>{isDownloadingZip ? 'Preparing ZIP...' : 'Download Repository as ZIP Archive'}</span>
        </button>
      </div>
    </div>
  );
};
