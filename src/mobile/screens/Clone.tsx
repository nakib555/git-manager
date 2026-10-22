import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  Download, Copy, Check, Terminal, HardDrive, 
  FolderGit2
} from 'lucide-react';
import { InlineErrorCard } from '../components/InlineErrorCard';

export const Clone: React.FC = () => {
  const { githubToken, githubRepos, githubUser, showToast, cloneRepository, navigate } = useAppContext();

  const [repoUrl, setRepoUrl] = useState('');
  const [destName, setDestName] = useState('');
  const [cloneDepth, setCloneDepth] = useState<number | ''>(1);
  const [isCloning, setIsCloning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Auto-fill destination folder name when URL changes
  const handleUrlChange = (url: string) => {
    setRepoUrl(url);
    const parts = url.trim().replace(/\.git$/, '').split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && !destName) {
      setDestName(lastPart);
    }
  };

  const selectUserRepo = (owner: string, name: string) => {
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
    if (!parsed) {
      showToast('Please enter a valid GitHub repository URL', 'warning');
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
    <div className="px-4 py-4 space-y-6 pb-6">
      {/* Title Header */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary tracking-tight">Clone Repository</h2>
        <p className="text-xs text-text-tertiary mt-0.5">
          Download remote repositories into your local workspace.
        </p>
      </div>

      {/* Synchronized Repos Quick Pick (Only when authenticated with real repos) */}
      {githubRepos.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
            <FolderGit2 size={13} className="text-accent" />
            <span>Your Repositories Quick-Pick</span>
          </span>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {githubRepos.slice(0, 8).map((repo) => {
              const ownerLogin = (repo as any).owner?.login || githubUser?.login || '';
              return (
                <button
                  key={repo.name}
                  type="button"
                  onClick={() => selectUserRepo(ownerLogin, repo.name)}
                  className="p-3 rounded-2xl bg-surface-1 border border-border hover:border-accent/40 text-left shrink-0 w-40 transition-all active:scale-97 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-text-primary truncate">
                    <span className="truncate">{repo.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-text-tertiary">
                    <span className="truncate">{ownerLogin}</span>
                    {repo.language && <span className="font-mono">{repo.language}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 1: Remote Repository URL */}
      <div className="bg-surface-1 border border-border rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
          <span className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold font-mono">1</span>
          <span>Remote Source</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Git HTTPS / SSH URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/owner/repository.git"
            value={repoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent font-mono transition-colors"
          />
        </div>
      </div>

      {/* Step 2: Destination & Options */}
      <div className="bg-surface-1 border border-border rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
          <span className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold font-mono">2</span>
          <span>Target Directory & Depth</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              placeholder="my-project"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              className="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Clone Depth
            </label>
            <select
              value={cloneDepth}
              onChange={(e) => setCloneDepth(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full h-12 px-3 bg-surface-2 border border-border rounded-xl text-xs text-text-primary outline-none focus:border-accent transition-colors cursor-pointer"
            >
              <option value={1}>Shallow (Depth 1)</option>
              <option value={5}>Recent (Depth 5)</option>
              <option value={""}>Full History (All)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step 3: Terminal Command Preview */}
      <div className="bg-surface-1 border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
            <Terminal size={15} className="text-accent" />
            <span>Terminal Command</span>
          </div>
          <button
            type="button"
            onClick={copyCloneCmd}
            className="flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline cursor-pointer min-h-[44px] px-2 -mr-2"
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="p-4 bg-surface-2 rounded-xl border border-border font-mono text-xs text-text-primary break-all leading-relaxed">
          {generatedCommand}
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

      {/* Action Buttons: Workspace Clone + Download ZIP (min 48px height) */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={handleClone}
          disabled={!repoUrl.trim() || isCloning}
          className="w-full min-h-[48px] h-12 rounded-xl bg-accent hover:opacity-90 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-accent/25 active:scale-98 transition-all cursor-pointer"
        >
          <HardDrive size={17} />
          <span>{isCloning ? 'Cloning into Workspace...' : 'Initialize Local Workspace Clone'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={!repoUrl.trim() || isDownloadingZip}
          className="w-full min-h-[48px] h-12 rounded-xl bg-surface-1 border border-border hover:bg-surface-2 disabled:opacity-40 text-text-primary font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <Download size={17} className="text-accent" />
          <span>{isDownloadingZip ? 'Preparing ZIP Archive...' : 'Download Repository as ZIP Archive'}</span>
        </button>
      </div>
    </div>
  );
};

export const MobileClone = Clone;
