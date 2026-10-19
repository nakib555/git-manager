import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  Download, Copy, Check, Terminal, ExternalLink, HardDrive, 
  Star, GitFork, ArrowDown, Sparkles 
} from 'lucide-react';

export const Clone: React.FC = () => {
  const { currentRepo, githubUser, githubToken, showToast, cloneRepository, navigate } = useAppContext();

  const [repoUrl, setRepoUrl] = useState('');
  const [destName, setDestName] = useState('');
  const [cloneDepth, setCloneDepth] = useState<number | ''>(1);
  const [isCloning, setIsCloning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const popularRepos = [
    { name: 'react', owner: 'facebook', desc: 'The library for web and native UIs', stars: '224k' },
    { name: 'tailwindcss', owner: 'tailwindlabs', desc: 'A utility-first CSS framework', stars: '81k' },
    { name: 'vscode', owner: 'microsoft', desc: 'Visual Studio Code', stars: '162k' },
    { name: 'next.js', owner: 'vercel', desc: 'The React Framework for Web', stars: '122k' },
    { name: 'bun', owner: 'oven-sh', desc: 'Fast JavaScript runtime and toolchain', stars: '71k' },
  ];

  // Auto-fill destination folder name when URL changes
  const handleUrlChange = (url: string) => {
    setRepoUrl(url);
    const parts = url.trim().replace(/\.git$/, '').split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && !destName) {
      setDestName(lastPart);
    }
  };

  const selectPopularRepo = (owner: string, name: string) => {
    const fullUrl = `https://github.com/${owner}/${name}.git`;
    setRepoUrl(fullUrl);
    setDestName(name);
    showToast(`Loaded ${owner}/${name}`, 'info');
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

  const generatedCommand = `git clone ${cloneDepth ? `--depth ${cloneDepth} ` : ''}${repoUrl || 'https://github.com/owner/repository.git'} ${destName || 'my-project'}`;

  const copyCloneCmd = () => {
    navigator.clipboard.writeText(generatedCommand);
    setIsCopied(true);
    showToast('Clone command copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClone = async () => {
    if (!repoUrl.trim()) {
      showToast('Please enter a Git repository URL', 'warning');
      return;
    }
    setIsCloning(true);
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
      showToast(`Clone error: ${err.message || err}`, 'error');
    } finally {
      setIsCloning(false);
    }
  };

  const handleDownloadZip = async () => {
    const parsed = getOwnerAndRepo();
    if (!parsed) {
      showToast('Please enter a valid GitHub repository URL', 'warning');
      return;
    }
    setIsDownloadingZip(true);
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
      showToast(`ZIP Download error: ${err.message || err}`, 'error');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Title Header */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary tracking-tight">Clone Repository</h2>
        <p className="text-xs text-text-tertiary mt-0.5">
          Download remote repositories into your local workspace.
        </p>
      </div>

      {/* Popular Open Source Repos Quick Pick */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
          <Sparkles size={12} className="text-accent" />
          <span>Popular Repositories Quick-Pick</span>
        </span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {popularRepos.map((pr) => (
            <button
              key={pr.name}
              onClick={() => selectPopularRepo(pr.owner, pr.name)}
              className="p-2.5 rounded-xl bg-surface-1 border border-border hover:border-accent/40 text-left shrink-0 w-36 transition-all active:scale-97 cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-text-primary truncate">
                <span className="truncate">{pr.name}</span>
                <span className="text-[10px] text-amber-500 font-mono font-normal">★{pr.stars}</span>
              </div>
              <span className="text-[10px] text-text-tertiary block truncate mt-0.5">
                {pr.owner}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 1: Remote Repository URL */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
          <span className="w-5 h-5 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[10px]">1</span>
          <span>Remote Source</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Git HTTPS / SSH URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/facebook/react.git"
            value={repoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full h-11 px-3.5 bg-surface-2 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent font-mono transition-colors"
          />
        </div>
      </div>

      {/* Step 2: Destination & Options */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
          <span className="w-5 h-5 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[10px]">2</span>
          <span>Target Directory & Depth</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              placeholder="my-project"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              className="w-full h-11 px-3.5 bg-surface-2 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Clone Depth
            </label>
            <select
              value={cloneDepth}
              onChange={(e) => setCloneDepth(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full h-11 px-3 bg-surface-2 border border-border rounded-xl text-xs text-text-primary outline-none focus:border-accent transition-colors"
            >
              <option value={1}>Shallow (Depth 1 - Fast)</option>
              <option value={5}>Recent (Depth 5)</option>
              <option value={""}>Full History (All commits)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step 3: Terminal Command Preview */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
            <Terminal size={14} className="text-accent" />
            <span>Terminal Command</span>
          </div>
          <button
            onClick={copyCloneCmd}
            className="flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline cursor-pointer"
          >
            {isCopied ? <Check size={13} /> : <Copy size={13} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="p-3 bg-surface-2 rounded-lg border border-border font-mono text-xs text-text-primary break-all">
          {generatedCommand}
        </div>
      </div>

      {/* Action Buttons: Workspace Clone + Download ZIP */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleClone}
          disabled={!repoUrl.trim() || isCloning}
          className="w-full min-h-[44px] h-12 rounded-xl bg-accent hover:opacity-90 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-accent/25 active:scale-98 transition-all cursor-pointer"
        >
          <HardDrive size={16} />
          <span>{isCloning ? 'Cloning into Workspace...' : 'Initialize Local Workspace Clone'}</span>
        </button>

        <button
          onClick={handleDownloadZip}
          disabled={!repoUrl.trim() || isDownloadingZip}
          className="w-full min-h-[44px] h-12 rounded-xl bg-surface-1 border border-border hover:bg-surface-2 disabled:opacity-40 text-text-primary font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <Download size={16} className="text-accent" />
          <span>{isDownloadingZip ? 'Preparing ZIP Archive...' : 'Download Repository as ZIP Archive'}</span>
        </button>
      </div>
    </div>
  );
};

export const MobileClone = Clone;
